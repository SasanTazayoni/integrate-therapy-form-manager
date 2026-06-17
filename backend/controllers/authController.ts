import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { timingSafeEqual } from "crypto";
import { getEnvVar } from "../utils/requiredEnv";

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60_000;

type AttemptRecord = { count: number; lockedUntil?: number };
const failedAttempts = new Map<string, AttemptRecord>();

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export const _resetRateLimitForTesting = () => failedAttempts.clear();

export const loginHandler = (req: Request, res: Response) => {
  const ip = req.ip ?? "unknown";
  const record = failedAttempts.get(ip) ?? { count: 0 };

  if (record.lockedUntil && Date.now() < record.lockedUntil) {
    const secondsRemaining = Math.ceil((record.lockedUntil - Date.now()) / 1000);
    return res.status(429).json({
      error: "Too many incorrect attempts",
      retryAfter: secondsRemaining,
    });
  }

  const { username, password } = req.body;

  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const expectedUsername = getEnvVar("THERAPIST_USERNAME");
  const expectedPassword = getEnvVar("THERAPIST_PASSWORD");

  if (safeCompare(username, expectedUsername) && safeCompare(password, expectedPassword)) {
    failedAttempts.delete(ip);
    const token = jwt.sign(
      { authenticated: true },
      getEnvVar("JWT_SECRET"),
      { expiresIn: "8h" }
    );
    return res.json({ token });
  }

  record.count++;
  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    record.count = 0;
  }
  failedAttempts.set(ip, record);

  return res.status(401).json({ error: "Invalid credentials" });
};
