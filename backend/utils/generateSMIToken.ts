import { generateTokenForQuestionnaire } from "./generateTokenForQuestionnaire";

export async function generateSMIToken(email: string, forceNewSMI?: boolean) {
  return generateTokenForQuestionnaire(email, "SMI");
}
