import { generateTokenForQuestionnaire } from "./generateTokenForQuestionnaire";

export async function generateBECKSToken(email: string) {
  return generateTokenForQuestionnaire(email, "BECKS");
}
