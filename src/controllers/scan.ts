import { Request, Response } from "express";
import User from "../models/User";
import { decryptKey } from "../util/crypto";

const DEFAULT_MAX_BYTES = 10 * 1024 * 1024;
const DEFAULT_DAILY_LIMIT = 10;
const DEFAULT_MONTHLY_LIMIT = 100;
const MAX_RESPONSE_BYTES = 64 * 1024;
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

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

interface ScanUsage {
  day: string;
  dayCount: number;
  month: string;
  monthCount: number;
  lastScanAt: Date | null;
}

interface QuotaSnapshot {
  usedDay: number;
  limitDay: number;
  usedMonth: number;
  limitMonth: number;
  resetsAt: string;
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

const parseIntEnv = (key: string, fallback: number): number => {
  const raw = process.env[key];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseFloatEnv = (key: string, fallback: number): number => {
  const raw = process.env[key];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const todayKey = (now: Date = new Date()): string => {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const monthKey = (now: Date = new Date()): string => {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

const endOfUtcDay = (now: Date = new Date()): Date => {
  const next = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
  );
  return next;
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

const getQuotaLimits = () => ({
  daily: parseIntEnv("SCAN_DAILY_LIMIT", DEFAULT_DAILY_LIMIT),
  monthly: parseIntEnv("SCAN_MONTHLY_LIMIT", DEFAULT_MONTHLY_LIMIT),
});

const buildQuotaSnapshot = (
  usage: ScanUsage,
  limits: { daily: number; monthly: number }
): QuotaSnapshot => ({
  usedDay: usage.dayCount,
  limitDay: limits.daily,
  usedMonth: usage.monthCount,
  limitMonth: limits.monthly,
  resetsAt: endOfUtcDay().toISOString(),
});

const ensureFreshUsage = (
  usage: ScanUsage | undefined,
  now: Date
): ScanUsage => {
  const t = todayKey(now);
  const m = monthKey(now);
  const base: ScanUsage = usage ?? {
    day: "",
    dayCount: 0,
    month: "",
    monthCount: 0,
    lastScanAt: null,
  };
  return {
    day: base.day === t ? t : t,
    dayCount: base.day === t ? base.dayCount : 0,
    month: base.month === m ? m : m,
    monthCount: base.month === m ? base.monthCount : 0,
    lastScanAt: base.lastScanAt ?? null,
  };
};

const resolveProviderKey = async (
  userId: string,
  useMyKey: boolean
): Promise<{ apiKey: string; base: string; model: string } | null> => {
  const base = process.env.VISION_API_BASE;
  const model = process.env.VISION_MODEL;
  if (!base || !model) return null;

  if (useMyKey) {
    const user = await User.findById(userId).select("visionApiKeyEnc");
    if (user?.visionApiKeyEnc?.ciphertext) {
      try {
        const apiKey = decryptKey({
          ciphertext: user.visionApiKeyEnc.ciphertext,
          iv: user.visionApiKeyEnc.iv ?? "",
          authTag: user.visionApiKeyEnc.authTag ?? "",
        });
        return { apiKey, base, model };
      } catch (err) {
        console.error("Failed to decrypt BYOK:", err);
        return null;
      }
    }
  }

  const apiKey = process.env.VISION_API_KEY;
  if (!apiKey) return null;
  return { apiKey, base, model };
};

const callVision = async (
  dataUrl: string,
  existingCategories: string[],
  provider: { apiKey: string; base: string; model: string }
): Promise<ScanResult> => {
  const endpoint = provider.base.replace(/\/$/, "") + "/chat/completions";

  const payload = {
    model: provider.model,
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
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Vision API error ${response.status}: ${text.slice(0, 300) || response.statusText}`
    );
  }

  if (!response.body) {
    throw new Error("Vision API returned no body.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let received = 0;
  let raw = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > MAX_RESPONSE_BYTES) {
      try {
        await reader.cancel();
      } catch {
        // ignore
      }
      throw new Error("Vision API response exceeded size limit.");
    }
    raw += decoder.decode(value, { stream: true });
  }
  raw += decoder.decode();

  let envelope: { choices?: Array<{ message?: { content?: unknown } }> };
  try {
    envelope = JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Vision API returned non-JSON content.");
    envelope = JSON.parse(match[0]);
  }

  const content = envelope?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.length) {
    throw new Error("Vision API returned no content.");
  }

  if (content.length > MAX_RESPONSE_BYTES) {
    throw new Error("Vision API content exceeded size limit.");
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

    if (!ALLOWED_MIME.has(file.mimetype)) {
      return res.status(415).json({
        success: false,
        error: `Unsupported file type: ${file.mimetype || "unknown"}. Use JPEG, PNG, or WebP.`,
      });
    }

    const maxBytes = parseFloatEnv("VISION_API_MAX_BYTES", DEFAULT_MAX_BYTES);
    if (file.size > maxBytes) {
      return res.status(413).json({
        success: false,
        error: `Image too large. Limit is ${Math.round(maxBytes / 1024 / 1024)} MB.`,
      });
    }

    const userId = req.params.userId as string;
    const useMyKey = req.body?.useMyKey === "true" || req.body?.useMyKey === true;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    const limits = getQuotaLimits();

    if (!useMyKey) {
      const usage = ensureFreshUsage(
        user.scanUsage as ScanUsage | undefined,
        new Date()
      );
      if (usage.dayCount >= limits.daily || usage.monthCount >= limits.monthly) {
        return res.status(429).json({
          success: false,
          error: "Daily scan limit reached.",
          quota: {
            ...buildQuotaSnapshot(usage, limits),
            reason: usage.dayCount >= limits.daily ? "daily" : "monthly",
          },
        });
      }
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
      const populated = await User.findById(userId).populate("categories");
      if (populated) {
        existingNames = (populated.categories as Array<{ name?: string }>)
          .map((c) => c?.name)
          .filter((n): n is string => typeof n === "string");
      }
    }

    const provider = await resolveProviderKey(userId, useMyKey);
    if (!provider) {
      return res.status(503).json({
        success: false,
        error:
          "Vision provider not configured. Add a key in Account or set VISION_API_KEY on the server.",
      });
    }

    const dataUrl = toDataUrl(file);
    const result = await callVision(dataUrl, existingNames, provider);

    const updated = ensureFreshUsage(
      user.scanUsage as ScanUsage | undefined,
      new Date()
    );
    updated.dayCount += 1;
    updated.monthCount += 1;
    updated.lastScanAt = new Date();
    await User.updateOne(
      { _id: userId },
      { $set: { scanUsage: updated, updatedAt: new Date() } }
    );

    return res.status(200).json({
      success: true,
      date: result.date,
      transactions: result.transactions,
      quota: buildQuotaSnapshot(updated, limits),
      byok: useMyKey,
    });
  } catch (err) {
    console.error("Scan error:", err);
    const message =
      err instanceof Error ? err.message : "Server Error during scan.";
    return res.status(500).json({ success: false, error: message });
  }
};

const getScanQuota = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }
    const usage = ensureFreshUsage(
      user.scanUsage as ScanUsage | undefined,
      new Date()
    );
    return res.status(200).json({
      success: true,
      quota: buildQuotaSnapshot(usage, getQuotaLimits()),
      byok: Boolean(user.visionApiKeyEnc?.ciphertext),
    });
  } catch (err) {
    console.error("Scan quota error:", err);
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

export { scanInvoice, getScanQuota };
export type { ScanResult, ScanDraft, QuotaSnapshot, ScanUsage };
