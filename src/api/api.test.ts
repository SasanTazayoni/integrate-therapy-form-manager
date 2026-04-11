import { beforeEach, afterEach, describe, expect, test, vi } from "vitest";

describe("api.ts baseURL", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("uses VITE_API_URL when defined", async () => {
    vi.stubEnv("VITE_API_URL", "https://example.com/api");
    const { default: api } = await import("./api");
    expect(api.defaults.baseURL).toBe("https://example.com/api");
  });

  test("falls back to '/' when VITE_API_URL is not set", async () => {
    vi.stubEnv("VITE_API_URL", "");
    const { default: api } = await import("./api");
    expect(api.defaults.baseURL).toBe("/");
  });
});
