import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { timingSafeEqual } from "crypto";
import { getEnvVar } from "../utils/requiredEnv";

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export const loginHandler = (req: Request, res: Response) => {
  const { username, password } = req.body;

  const expectedUsername = getEnvVar("THERAPIST_USERNAME");
  const expectedPassword = getEnvVar("THERAPIST_PASSWORD");

  if (safeCompare(username, expectedUsername) && safeCompare(password, expectedPassword)) {
    const token = jwt.sign(
      { authenticated: true },
      getEnvVar("JWT_SECRET"),
      { expiresIn: "8h" }
    );
    return res.json({ token });
  }

  return res.status(401).json({ error: "Invalid credentials" });
};
