import { describe, test, expect, vi, beforeEach } from "vitest";
import { AxiosError, type AxiosResponse } from "axios";
import api from "./api";
import { login } from "./authFrontend";

vi.mock("./api", () => ({
  default: {
    post: vi.fn(),
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
  beforeEach(() => vi.clearAllMocks());

  test("returns ok: true when the request succeeds", async () => {
    mockedApi.post.mockResolvedValueOnce({ data: { ok: true } });

    const result = await login("admin", "secret");

    expect(mockedApi.post).toHaveBeenCalledWith("/auth/login", {
      username: "admin",
      password: "secret",
    });
    expect(result).toEqual({ ok: true });
  });

  test("returns ok: false with 'Invalid credentials' on a 401 response", async () => {
    mockedApi.post.mockRejectedValueOnce(makeAxiosError(401));

    const result = await login("admin", "wrong");

    expect(result).toEqual({ ok: false, error: "Invalid credentials" });
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
