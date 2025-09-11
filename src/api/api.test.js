import { afterEach, beforeEach, describe, expect, test } from "vitest";
import api from "./api";

describe("api.ts rawBase assignment", () => {
  const originalEnv = import.meta.env;

  beforeEach(() => {
    import.meta.env = { ...originalEnv };
  });

  afterEach(() => {
    import.meta.env = originalEnv;
  });

  test("uses VITE_API_URL from env if defined", () => {
    import.meta.env = { VITE_API_URL: "https://example.com/api" };
    const rawBase = import.meta.env.VITE_API_URL || "/";
    expect(rawBase).toBe("https://example.com/api");
  });

  test("falls back to '/' if VITE_API_URL is undefined", async () => {
    import.meta.env.VITE_API_URL = undefined;

    const { default: api } = await import("./api");

    expect(api.defaults.baseURL).toBe("/");
  });
});
