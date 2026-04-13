import api from "./api";
import axios from "axios";

type LoginResult = { ok: true } | { ok: false; error: string };

export async function login(
  username: string,
  password: string
): Promise<LoginResult> {
  try {
    await api.post("/auth/login", { username, password });
    return { ok: true };
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      return { ok: false, error: "Invalid credentials" };
    }
    return { ok: false, error: "Network error. Please try again." };
  }
}
