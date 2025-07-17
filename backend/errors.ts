export interface TypedError extends Error {
  type?: string;
}

export function createTokenGenerationError(message?: string): Error {
  const error = new Error(message ?? "Token generation failed") as TypedError;
  error.type = "TokenGenerationError";
  return error;
}

export function createMagicLinkSendingError(message?: string): Error {
  const error = new Error(message ?? "Magic link sending failed") as TypedError;
  error.type = "MagicLinkSendingError";
  return error;
}

export function isTypedError(err: unknown): err is TypedError {
  return typeof err === "object" && err !== null && "type" in err;
}
