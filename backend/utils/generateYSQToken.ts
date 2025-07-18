import { generateTokenForQuestionnaire } from "./generateTokenForQuestionnaire";

export async function generateYSQToken(email: string) {
  return generateTokenForQuestionnaire(email, "YSQ");
}
