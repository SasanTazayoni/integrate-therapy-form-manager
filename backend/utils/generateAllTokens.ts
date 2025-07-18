import { generateSMIToken } from "./generateSMIToken";
import { generateYSQToken } from "./generateYSQToken";
import { generateBECKSToken } from "./generateBECKSToken";
import { generateBURNSToken } from "./generateBURNSToken";

type TokenData = {
  questionnaire: "SMI" | "YSQ" | "BECKS" | "BURNS";
  token: string;
};

type GenerateAllTokensOptions = {
  forceNewSMI?: boolean;
};

export async function generateAllTokens(
  email: string,
  options?: GenerateAllTokensOptions
): Promise<TokenData[]> {
  const results = await Promise.all([
    generateSMIToken(email, options?.forceNewSMI),
    generateYSQToken(email),
    generateBECKSToken(email),
    generateBURNSToken(email),
  ]);

  return results;
}
