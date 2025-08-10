import type { AxiosError } from "axios";

export function getErrorDisplay(
  err: AxiosError<{
    message?: string;
    error?: string;
    requestId?: string;
  }>,
  fallbackMessage = "Something went wrong"
): string {
  const msg =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    fallbackMessage;

  const rid = err?.response?.data?.requestId;
  return rid ? `${msg} (ref: ${rid})` : msg;
}
