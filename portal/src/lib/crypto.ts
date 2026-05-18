import { createHash, randomBytes, timingSafeEqual } from "crypto";

export function hashValue(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function generateOtp(length: number): string {
  const max = 10 ** length;
  const num = randomBytes(4).readUInt32BE(0) % max;
  return num.toString().padStart(length, "0");
}

export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
