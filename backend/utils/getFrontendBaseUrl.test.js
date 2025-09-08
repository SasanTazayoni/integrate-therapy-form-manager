import { describe, test, expect, vi, afterEach } from "vitest";
import * as envUtils from "./requiredEnv";
import { getFrontendBaseUrl } from "./getFrontendBaseUrl";

describe("getFrontendBaseUrl", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("returns env var origin without path or trailing slashes", () => {
    vi.spyOn(envUtils, "getEnvVar").mockReturnValue(
      "https://example.com///path"
    );

    const result = getFrontendBaseUrl();
    expect(result).toBe("https://example.com");
  });

  test("returns default origin if env var is missing or invalid", () => {
    vi.spyOn(envUtils, "getEnvVar").mockReturnValue(
      "http://localhost:5173/integrate-therapy-form-manager///"
    );

    const result = getFrontendBaseUrl();
    expect(result).toBe("http://localhost:5173");
  });

  test("returns origin for a valid URL without trailing slashes", () => {
    vi.spyOn(envUtils, "getEnvVar").mockReturnValue("https://example.com/path");

    const result = getFrontendBaseUrl();
    expect(result).toBe("https://example.com");
  });

  test("falls back to localhost if env var is invalid URL", () => {
    vi.spyOn(envUtils, "getEnvVar").mockReturnValue("not-a-valid-url");

    const result = getFrontendBaseUrl();
    expect(result).toBe("http://localhost:5173");
  });
});
