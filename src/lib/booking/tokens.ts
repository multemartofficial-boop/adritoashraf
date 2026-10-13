import { createHash, randomBytes, randomInt, timingSafeEqual } from "crypto";

// The raw manage token is a bearer secret: it only ever travels in the client's
// email/URL. The database stores its SHA-256 hash, so a database leak does not
// expose working links.
export function generateManageToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashManageToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

// Avoid ambiguous characters (0/O, 1/I/L) so clients can read codes aloud.
const REF_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateReferenceCode(): string {
  let out = "";
  for (let i = 0; i < 6; i++) out += REF_ALPHABET[randomInt(REF_ALPHABET.length)];
  return `ADR-${out}`;
}

/** Constant-time comparison for secrets like CRON_SECRET. */
export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}
