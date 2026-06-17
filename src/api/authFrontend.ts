import api from "./api";
import axios from "axios";

export const TOKEN_KEY = "integrateTherapyToken";

type LoginResult = { ok: true } | { ok: false; error: string; retryAfter?: number };

export async function login(
  username: string,
  password: string
): Promise<LoginResult> {
  try {
    const response = await api.post<{ token: string }>("/auth/login", {
      username,
      password,
    });
    sessionStorage.setItem(TOKEN_KEY, response.data.token);
    return { ok: true };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 429) {
        return {
          ok: false,
          error: err.response.data?.error ?? "Too many attempts, please wait",
          retryAfter: err.response.data?.retryAfter as number | undefined,
        };
      }
      if (err.response?.status === 401) {
        return { ok: false, error: "Invalid credentials" };
      }
    }
    return { ok: false, error: "Network error. Please try again." };
  }
}
