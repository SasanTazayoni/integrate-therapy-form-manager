import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db";
import { generateAllTokens } from "./utils/generateAllTokens";
import { sendMagicLinksEmail } from "./utils/email";
import { TypedError } from "./errors";
import { tokenValidator } from "./utils/tokenValidator";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

async function handleSendMagicLinks(
  email: string,
  res: express.Response,
  options?: { forceNewSMI?: boolean }
) {
  try {
    const tokens = await generateAllTokens(email, options);
    const magicLinks = tokens.map(({ questionnaire, token }) => ({
      questionnaire,
      url: `${
        process.env.CLIENT_BASE_URL || "http://localhost:3000"
      }/${questionnaire.toLowerCase()}?token=${token}`,
    }));

    await sendMagicLinksEmail(email, magicLinks);
    res.status(200).json({ message: "Magic links sent", email, magicLinks });
  } catch (err: unknown) {
    const error = err as TypedError;

    if (error.type === "TokenGenerationError") {
      console.error("Token generation failed:", error);
      return res
        .status(500)
        .json({ error: "Failed to generate tokens", details: error.message });
    }

    if (error.type === "MagicLinkSendingError") {
      console.error("Magic link sending failed:", error);
      return res
        .status(500)
        .json({ error: "Failed to send magic links", details: error.message });
    }

    console.error("Unexpected error:", error);
    return res
      .status(500)
      .json({ error: "Unknown error", details: String(error) });
  }
}

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
  if (!email) return res.status(400).json({ error: "Email is required" });

  console.log(`📩 Sending questionnaire pack (dev) to ${email}`);
  await handleSendMagicLinks(email, res);
});

app.post("/api/send-pack", async (req, res) => {
  const { email, forceNewSMI } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  console.log(`📩 Sending questionnaire pack to ${email}`);
  await handleSendMagicLinks(email, res, { forceNewSMI });
});

app.post("/api/validate-token", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Token is required" });

  try {
    const validationResult = await tokenValidator(token);
    if (!validationResult.valid) {
      return res
        .status(401)
        .json({ valid: false, message: validationResult.message });
    }

    return res.status(200).json({
      valid: true,
      email: validationResult.email,
      questionnaire: validationResult.questionnaire,
    });
  } catch (err) {
    console.error("Validation error:", err);
    return res
      .status(500)
      .json({ valid: false, message: "Internal server error" });
  }
});

export default app;
