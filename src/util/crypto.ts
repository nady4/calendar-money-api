import crypto from "crypto";

const ALG = "aes-256-gcm";
const IV_BYTES = 12;
const KEY_BYTES = 32;

const getKey = (): Buffer => {
  const raw = process.env.BYOK_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error("BYOK_ENCRYPTION_KEY is not configured");
  }
  const key =
    raw.length === KEY_BYTES * 2 && /^[0-9a-fA-F]+$/.test(raw)
      ? Buffer.from(raw, "hex")
      : Buffer.from(raw, "utf8");
  if (key.length !== KEY_BYTES) {
    throw new Error(
      `BYOK_ENCRYPTION_KEY must decode to ${KEY_BYTES} bytes (got ${key.length})`
    );
  }
  return key;
};

interface EncryptedKey {
  ciphertext: string;
  iv: string;
  authTag: string;
}

const encryptKey = (plaintext: string): EncryptedKey => {
  const key = getKey();
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALG, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return {
    ciphertext: ciphertext.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
  };
};

const decryptKey = (payload: EncryptedKey): string => {
  const key = getKey();
  const iv = Buffer.from(payload.iv, "base64");
  const authTag = Buffer.from(payload.authTag, "base64");
  const ciphertext = Buffer.from(payload.ciphertext, "base64");
  const decipher = crypto.createDecipheriv(ALG, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString("utf8");
};

const maskKey = (plaintext: string): string => {
  const trimmed = plaintext.trim();
  if (trimmed.length <= 4) return "••••";
  return `••••${trimmed.slice(-4)}`;
};

export { encryptKey, decryptKey, maskKey };
export type { EncryptedKey };
