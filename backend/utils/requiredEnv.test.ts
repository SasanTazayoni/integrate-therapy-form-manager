import { describe, test, expect, beforeEach, afterEach } from "vitest";
import { getEnvVar } from "./requiredEnv";

describe("getEnvVar", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  test("returns the environment variable if set", () => {
    process.env.TEST_VAR = "value123";
    expect(getEnvVar("TEST_VAR")).toBe("value123");
  });

  test("returns the default value if env var is missing", () => {
    delete process.env.TEST_VAR;
    expect(getEnvVar("TEST_VAR", "defaultValue")).toBe("defaultValue");
  });

  test("throws an error if required and missing", () => {
    delete process.env.TEST_VAR;
    expect(() => getEnvVar("TEST_VAR")).toThrow(
      "Missing required environment variable: TEST_VAR"
    );
  });
});
