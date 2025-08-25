import { describe, test, expect, vi, afterEach } from "vitest";
import * as envUtils from "./requiredEnv";
import { getFrontendBaseUrl } from "./getFrontendBaseUrl";

describe("getFrontendBaseUrl", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("returns env var without trailing slashes", () => {
    vi.spyOn(envUtils, "getEnvVar").mockReturnValue("https://example.com///");

    const result = getFrontendBaseUrl();
    expect(result).toBe("https://example.com");
  });

  test("returns default value if env var is missing, without trailing slashes", () => {
    vi.spyOn(envUtils, "getEnvVar").mockReturnValue(
      "http://localhost:5173/integrate-therapy-form-manager///"
    );

    const result = getFrontendBaseUrl();
    expect(result).toBe("http://localhost:5173/integrate-therapy-form-manager");
  });

  test("does nothing if there are no trailing slashes", () => {
    vi.spyOn(envUtils, "getEnvVar").mockReturnValue("https://example.com/path");

    const result = getFrontendBaseUrl();
    expect(result).toBe("https://example.com/path");
  });
});
