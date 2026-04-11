import { getEnvVar } from "./requiredEnv";

const LOCALHOST_FALLBACK = "http://localhost:5173";

export function getFrontendBaseUrl(): string {
  const isDevelopment = process.env.NODE_ENV !== "production";

  if (!isDevelopment && !process.env.FRONTEND_BASE_URL) {
    throw new Error(
      "FRONTEND_BASE_URL is not set. Set it to your deployed frontend URL (e.g. https://your-app.onrender.com) in your environment variables."
    );
  }

  const raw = getEnvVar("FRONTEND_BASE_URL", isDevelopment ? LOCALHOST_FALLBACK : undefined);

  try {
    const url = new URL(raw);

    return `${url.protocol}//${url.host}`;
  } catch {
    console.warn(
      `Invalid FRONTEND_BASE_URL: ${raw}, using fallback ${LOCALHOST_FALLBACK}`
    );
    return LOCALHOST_FALLBACK;
  }
}
