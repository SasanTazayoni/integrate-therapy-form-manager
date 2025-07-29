import { getEnvVar } from "./requiredEnv";

export function getFrontendBaseUrl(): string {
  const raw = getEnvVar(
    "FRONTEND_BASE_URL",
    "http://localhost:5173/integrate-therapy-form-manager"
  );
  return raw.replace(/\/+$/, "");
}
