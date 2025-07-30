import crypto from "crypto";

export const TOKEN_TTL_DAYS = 14;

export function generateToken(): string {
  return crypto.randomUUID();
}

export function computeExpiry(now = new Date(), days = TOKEN_TTL_DAYS): Date {
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
}
