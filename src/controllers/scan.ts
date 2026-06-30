import { Request, Response } from "express";
import User from "../models/User";

const DEFAULT_MAX_BYTES = 10 * 1024 * 1024;

interface ScanDraft {
  date?: string;
  amount: number;
  description: string;
  categoryName: string;
  categoryType: "Income" | "Expense";
  color: string;
}

interface ScanResult {
  date: string | null;
  transactions: ScanDraft[];
}

const SYSTEM_PROMPT = `You extract transactions from invoice/receipt images.
Return strict JSON with this exact shape:
{ "date": "YYYY-MM-DD" | null, "transactions": [ { "date": "YYYY-MM-DD"?, "amount": number, "description": string, "categoryName": string, "categoryType": "Income" | "Expense", "color": string } ] }
Rules:
- "date" is the receipt-level date if visible anywhere on the document, else null.
- Line "date" only if explicitly printed on that line; otherwise omit it so the frontend applies the receipt-level date.
- Infer "categoryName" per line item. Default "categoryType" to "Expense" for invoice line items; use "Income" only for refunds or payments-to-you.
- "amount" is always a positive number.
- "color" is a hex string like "#5b8cff".
- Prefer reusing category names from the provided list when a good fit exists.
Return only JSON, no prose.`;

const buildUserPrompt = (existingCategories: string[]): string => {
  const list = existingCategories.length
    ? `Existing category names to prefer: ${JSON.stringify(existingCategories)}.`
    : "No existing categories.";
  return `${list}\nExtract the transactions from this image.`;
};

const toDataUrl = (file: Express.Multer.File): string => {
  const mime = file.mimetype || "image/jpeg";
  const base64 = file.buffer.toString("base64");
  return `data:${mime};base64,${base64}`;
};

const parseFloatEnv = (key: string, fallback: number): number => {
  const raw = process.env[key];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const sanitizeDraft = (raw: unknown): ScanDraft | null => {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const amount =
    typeof r.amount === "number"
      ? r.amount
      : Number(r.amount);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const description =
    typeof r.description === "string" ? r.description.trim() : "";
  const categoryName =
    typeof r.categoryName === "string" ? r.categoryName.trim() : "";
  if (!description || !categoryName) return null;

  const categoryType: "Income" | "Expense" =
    r.categoryType === "Income" || r.categoryType === "Expense"
      ? r.categoryType
      : "Expense";

  const color =
    typeof r.color === "string" && /^#?[0-9a-fA-F]{3,8}$/.test(r.color)
      ? r.color.startsWith("#")
        ? r.color
        : `#${r.color}`
      : "#5b8cff";

  const date =
    typeof r.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(r.date)
      ? r.date
      : undefined;

  return { date, amount, description, categoryName, categoryType, color };
};

const sanitizeResult = (parsed: unknown): ScanResult => {
  if (!parsed || typeof parsed !== "object") {
    return { date: null, transactions: [] };
  }
  const obj = parsed as Record<string, unknown>;
  const date =
    typeof obj.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(obj.date)
      ? obj.date
      : null;

  const rawTxs = Array.isArray(obj.transactions) ? obj.transactions : [];
  const transactions = rawTxs
    .map(sanitizeDraft)
    .filter((t): t is ScanDraft => t !== null);

  return { date, transactions };
};

const callVision = async (
  dataUrl: string,
  existingCategories: string[]
): Promise<ScanResult> => {
  const base = process.env.VISION_API_BASE;
  const key = process.env.VISION_API_KEY;
  const model = process.env.VISION_MODEL;

  if (!base || !key || !model) {
    throw new Error(
      "Vision provider not configured (VISION_API_BASE / VISION_API_KEY / VISION_MODEL)."
    );
  }

  const endpoint = base.replace(/\/$/, "") + "/chat/completions";

  const payload = {
    model,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: buildUserPrompt(existingCategories) },
          { type: "image_url", image_url: { url: dataUrl } },
        ],
      },
    ],
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Vision API error ${response.status}: ${text.slice(0, 300) || response.statusText}`
    );
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("Vision API returned no content.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Vision API returned non-JSON content.");
    parsed = JSON.parse(match[0]);
  }

  return sanitizeResult(parsed);
};

const scanInvoice = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: "No image provided." });
    }

    const maxBytes = parseFloatEnv("VISION_API_MAX_BYTES", DEFAULT_MAX_BYTES);
    if (file.size > maxBytes) {
      return res.status(413).json({
        success: false,
        error: `Image too large. Limit is ${maxBytes} bytes.`,
      });
    }

    let existingNames: string[] = [];
    const raw = req.body?.existingCategories;
    if (typeof raw === "string" && raw.length) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          existingNames = parsed.filter((x): x is string => typeof x === "string");
        }
      } catch {
        // ignore malformed payload
      }
    }

    if (!existingNames.length) {
      const user = await User.findById(req.params.userId).populate("categories");
      if (user) {
        existingNames = (user.categories as Array<{ name?: string }>)
          .map((c) => c?.name)
          .filter((n): n is string => typeof n === "string");
      }
    }

    const dataUrl = toDataUrl(file);
    const result = await callVision(dataUrl, existingNames);

    return res.status(200).json({
      success: true,
      date: result.date,
      transactions: result.transactions,
    });
  } catch (err) {
    console.error("Scan error:", err);
    const message =
      err instanceof Error ? err.message : "Server Error during scan.";
    return res.status(500).json({ success: false, error: message });
  }
};

export { scanInvoice };
export type { ScanResult, ScanDraft };