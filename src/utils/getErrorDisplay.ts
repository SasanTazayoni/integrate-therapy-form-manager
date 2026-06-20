import type { AxiosError } from "axios";

export function getErrorDisplay(
  err: AxiosError<{ error?: string }>,
  fallbackMessage = "Something went wrong"
): string {
  return (
    err?.response?.data?.error ||
    err?.message ||
    fallbackMessage
  );
}
