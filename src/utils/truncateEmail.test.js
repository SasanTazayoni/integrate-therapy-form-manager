import { describe, test, expect } from "vitest";
import truncateEmail from "./truncateEmail";

describe("truncateEmail", () => {
  test("returns the email as-is if shorter than maxLength", () => {
    const email = "short@example.com";
    expect(truncateEmail(email, 20)).toBe(email);
  });

  test("returns the email as-is if exactly maxLength", () => {
    const email = "1234567890123456";
    expect(truncateEmail(email)).toBe(email);
  });

  test("truncates and adds ellipsis if longer than maxLength", () => {
    const email = "verylongemailaddress@example.com";
    expect(truncateEmail(email)).toBe("verylongemailad…");
  });

  test("respects custom maxLength parameter", () => {
    const email = "anotherlongemail@example.com";
    expect(truncateEmail(email, 10)).toBe("anotherlo…");
  });

  test("handles empty string", () => {
    expect(truncateEmail("")).toBe("");
  });
});
