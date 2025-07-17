import { nanoid } from "nanoid";
import pool from "../db";

type TokenData = {
  questionnaire: "SMI" | "YSQ" | "BECKS" | "BURNS";
  token: string;
};

export async function generateTokens(email: string): Promise<TokenData[]> {
  const questionnaires = ["SMI", "YSQ", "BECKS", "BURNS"] as const;
  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days from now

  const tokens: TokenData[] = questionnaires.map((questionnaire) => ({
    questionnaire,
    token: nanoid(32),
  }));

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const { questionnaire, token } of tokens) {
      await client.query(
        `
        INSERT INTO access_tokens (email, questionnaire, token, expires_at)
        VALUES ($1, $2, $3, $4)
        `,
        [email, questionnaire, token, expiresAt]
      );
    }

    await client.query("COMMIT");
    return tokens;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Token generation failed:", error);
    throw new Error("Failed to generate tokens");
  } finally {
    try {
      client.release();
    } catch (err) {
      console.error("Error releasing client:", err);
    }
  }
}
