import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db";
import { generateTokens } from "./utils/generateTokens";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.send(`Database time: ${result.rows[0].now}`);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/api/dev/generate-tokens", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const tokens = await generateTokens(email);
    res.json({ email, tokens });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error generating tokens:", err.message);
      res
        .status(500)
        .json({ error: "Failed to generate tokens", details: err.message });
    } else {
      console.error("Unknown error generating tokens:", err);
      res
        .status(500)
        .json({ error: "Failed to generate tokens", details: String(err) });
    }
  }
});

export default app;
