import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getEnvVar } from "../utils/requiredEnv";

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorised" });
    return;
  }

  try {
    jwt.verify(authHeader.slice(7), getEnvVar("JWT_SECRET"));
    next();
  } catch {
    res.status(401).json({ error: "Unauthorised" });
  }
}
