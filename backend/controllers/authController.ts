import { Request, Response } from "express";
import { getEnvVar } from "../utils/requiredEnv";

export const loginHandler = (req: Request, res: Response) => {
  const { username, password } = req.body;

  const expectedUsername = getEnvVar("THERAPIST_USERNAME");
  const expectedPassword = getEnvVar("THERAPIST_PASSWORD");

  if (username === expectedUsername && password === expectedPassword) {
    return res.json({ ok: true });
  }

  return res.status(401).json({ error: "Invalid credentials" });
};
