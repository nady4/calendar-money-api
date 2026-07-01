import { Request, Response } from "express";
import User from "../models/User";
import { encryptKey, maskKey } from "../util/crypto";

const validateProviderKey = async (
  apiKey: string
): Promise<{ ok: boolean; base?: string; reason?: string }> => {
  const base = process.env.VISION_API_BASE;
  if (!base) {
    return { ok: false, reason: "Server has no VISION_API_BASE configured." };
  }
  const endpoint = base.replace(/\/$/, "") + "/models";
  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (response.ok) return { ok: true, base };
    if (response.status === 401 || response.status === 403) {
      return { ok: false, reason: "The key was rejected by the vision provider." };
    }
    return {
      ok: false,
      reason: `Provider responded with ${response.status}.`,
    };
  } catch (err) {
    return {
      ok: false,
      reason:
        err instanceof Error
          ? `Could not reach the vision provider: ${err.message}`
          : "Could not reach the vision provider.",
    };
  }
};

const setVisionKey = async (req: Request, res: Response) => {
  try {
    const { key } = req.body ?? {};
    if (typeof key !== "string" || key.trim().length < 8) {
      return res.status(400).json({
        success: false,
        error: "Provide a vision API key (string, at least 8 chars).",
      });
    }

    const validation = await validateProviderKey(key.trim());
    if (!validation.ok) {
      return res.status(400).json({
        success: false,
        error: validation.reason || "Invalid vision key.",
      });
    }

    const enc = encryptKey(key.trim());
    await User.updateOne(
      { _id: req.params.userId },
      { $set: { visionApiKeyEnc: enc, updatedAt: new Date() } }
    );

    return res.status(200).json({
      success: true,
      status: { hasKey: true, lastFour: maskKey(key) },
    });
  } catch (err) {
    console.error("Set vision key error:", err);
    const message =
      err instanceof Error ? err.message : "Server Error while saving key.";
    if (message.includes("BYOK_ENCRYPTION_KEY")) {
      return res.status(500).json({ success: false, error: message });
    }
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

const removeVisionKey = async (req: Request, res: Response) => {
  try {
    await User.updateOne(
      { _id: req.params.userId },
      {
        $set: {
          visionApiKeyEnc: { ciphertext: null, iv: null, authTag: null },
          updatedAt: new Date(),
        },
      }
    );
    return res.status(200).json({
      success: true,
      status: { hasKey: false, lastFour: null },
    });
  } catch (err) {
    console.error("Remove vision key error:", err);
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

const getVisionKeyStatus = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.userId).select(
      "visionApiKeyEnc"
    );
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }
    return res.status(200).json({
      success: true,
      status: {
        hasKey: Boolean(user.visionApiKeyEnc?.ciphertext),
        lastFour: null,
      },
    });
  } catch (err) {
    console.error("Get vision key status error:", err);
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

export { setVisionKey, removeVisionKey, getVisionKeyStatus };
