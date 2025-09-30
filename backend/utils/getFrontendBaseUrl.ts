import { getEnvVar } from "./requiredEnv";

export function getFrontendBaseUrl(): string {
  const raw = getEnvVar("FRONTEND_BASE_URL", "http://localhost:5173");

  try {
    const url = new URL(raw);

    return `${url.protocol}//${url.host}`;
  } catch {
    console.warn(
      `Invalid FRONTEND_BASE_URL: ${raw}, using fallback http://localhost:5173`
    );
    return "http://localhost:5173";
  }
}
