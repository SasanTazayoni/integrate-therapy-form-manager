import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getEnvVar } from "../utils/requiredEnv";

export const loginHandler = (req: Request, res: Response) => {
  const { username, password } = req.body;

  const expectedUsername = getEnvVar("THERAPIST_USERNAME");
  const expectedPassword = getEnvVar("THERAPIST_PASSWORD");

  if (username === expectedUsername && password === expectedPassword) {
    const token = jwt.sign(
      { authenticated: true },
      getEnvVar("JWT_SECRET"),
      { expiresIn: "8h" }
    );
    return res.json({ token });
  }

  return res.status(401).json({ error: "Invalid credentials" });
};
