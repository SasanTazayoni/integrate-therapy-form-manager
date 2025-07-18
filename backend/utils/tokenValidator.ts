import pool from "../db";

interface TokenValidationResult {
  valid: boolean;
  email?: string;
  questionnaire?: string;
  message?: string;
}

export async function tokenValidator(
  token: string
): Promise<TokenValidationResult> {
  try {
    const query = `
      SELECT email, questionnaire, expires_at, used, revoked
      FROM access_tokens
      WHERE token = $1
    `;

    const { rows } = await pool.query(query, [token]);

    if (rows.length === 0) {
      return { valid: false, message: "Token not found" };
    }

    const tokenData = rows[0];
    const now = new Date();

    if (tokenData.used) {
      return { valid: false, message: "Token has already been used" };
    }

    if (tokenData.revoked) {
      return { valid: false, message: "Token access revoked" };
    }

    if (new Date(tokenData.expires_at) < now) {
      return { valid: false, message: "Token expired" };
    }

    return {
      valid: true,
      email: tokenData.email,
      questionnaire: tokenData.questionnaire,
    };
  } catch (err) {
    console.error("Validator error:", err);
    return { valid: false, message: "Internal server error" };
  }
}
