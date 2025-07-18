import { generateTokenForQuestionnaire } from "./generateTokenForQuestionnaire";

export async function generateBURNSToken(email: string) {
  return generateTokenForQuestionnaire(email, "BURNS");
}
