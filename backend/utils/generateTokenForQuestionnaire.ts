import { nanoid } from "nanoid";
import pool from "../db";
import { createTokenGenerationError } from "../errors";

export async function generateTokenForQuestionnaire(
  email: string,
  questionnaire: "SMI" | "YSQ" | "BECKS" | "BURNS"
): Promise<{ questionnaire: typeof questionnaire; token: string }> {
  const token = nanoid(32);
  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(
      `
      INSERT INTO access_tokens (email, questionnaire, token, expires_at)
      VALUES ($1, $2, $3, $4)
      `,
      [email, questionnaire, token, expiresAt]
    );
    await client.query("COMMIT");

    return { questionnaire, token };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(`${questionnaire} token generation failed:`, error);
    throw createTokenGenerationError(
      error instanceof Error ? error.message : undefined
    );
  } finally {
    try {
      client.release();
    } catch (err) {
      console.error("Error releasing client:", err);
    }
  }
}
