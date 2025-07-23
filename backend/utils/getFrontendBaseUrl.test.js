import { describe, expect, test, vi } from "vitest";
import { getFrontendBaseUrl } from "./getFrontendBaseUrl";

vi.mock("./requiredEnv", () => ({
  getEnvVar: vi.fn(),
}));

const { getEnvVar } = await import("./requiredEnv");

describe("getFrontendBaseUrl", () => {
  test("trims trailing slashes from FRONTEND_BASE_URL", () => {
    getEnvVar.mockReturnValue("http://example.com///");
    const url = getFrontendBaseUrl();
    expect(url).toBe("http://example.com");
  });

  test("returns fallback URL when FRONTEND_BASE_URL is undefined", () => {
    getEnvVar.mockReturnValue(undefined);
    const url = getFrontendBaseUrl();
    expect(url).toBe("http://localhost:5173/integrate-therapy-form-manager");
  });

  test("returns as-is if no trailing slash", () => {
    getEnvVar.mockReturnValue("https://my.site/app");
    const url = getFrontendBaseUrl();
    expect(url).toBe("https://my.site/app");
  });
});
