import { describe, test, expect, vi, beforeEach } from "vitest";
import { AxiosError, type AxiosResponse } from "axios";
import api from "./api";
import { login, TOKEN_KEY } from "./authFrontend";

vi.mock("./api", () => ({
  default: {
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
    },
  },
}));

const mockedApi = api as unknown as {
  post: ReturnType<typeof vi.fn>;
};

function makeAxiosError(status: number): AxiosError {
  const err = new AxiosError("Request failed");
  err.response = { status } as unknown as AxiosResponse;
  return err;
}

describe("login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  test("returns ok: true and stores token when the request succeeds", async () => {
    mockedApi.post.mockResolvedValueOnce({ data: { token: "jwt.token.here" } });

    const result = await login("admin", "secret");

    expect(mockedApi.post).toHaveBeenCalledWith("/auth/login", {
      username: "admin",
      password: "secret",
    });
    expect(result).toEqual({ ok: true });
    expect(sessionStorage.getItem(TOKEN_KEY)).toBe("jwt.token.here");
  });

  test("returns ok: false with 'Invalid credentials' on a 401 response", async () => {
    mockedApi.post.mockRejectedValueOnce(makeAxiosError(401));

    const result = await login("admin", "wrong");

    expect(result).toEqual({ ok: false, error: "Invalid credentials" });
    expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  test("returns ok: false with network error message on a non-401 Axios error", async () => {
    mockedApi.post.mockRejectedValueOnce(makeAxiosError(500));

    const result = await login("admin", "secret");

    expect(result).toEqual({ ok: false, error: "Network error. Please try again." });
  });

  test("returns ok: false with network error message on a non-Axios error", async () => {
    mockedApi.post.mockRejectedValueOnce(new Error("Connection refused"));

    const result = await login("admin", "secret");

    expect(result).toEqual({ ok: false, error: "Network error. Please try again." });
  });
});
