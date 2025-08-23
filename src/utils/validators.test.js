import { describe, test, expect } from "vitest";
import validateEmail from "./validators";

describe("validateEmail", () => {
  test("returns true for valid emails", () => {
    expect(validateEmail("test@example.com")).toBe(true);
    expect(validateEmail("user.name+tag+sorting@example.co.uk")).toBe(true);
    expect(validateEmail("user_name@example.io")).toBe(true);
  });

  test("returns false for invalid emails", () => {
    expect(validateEmail("plainaddress")).toBe(false);
    expect(validateEmail("@missingusername.com")).toBe(false);
    expect(validateEmail("username@.com")).toBe(false);
    expect(validateEmail("username@com")).toBe(false);
    expect(validateEmail("username@com.")).toBe(false);
    expect(validateEmail("username@.com.")).toBe(false);
    expect(validateEmail("")).toBe(false);
    expect(validateEmail(" ")).toBe(false);
  });

  test("handles emails with special characters", () => {
    expect(validateEmail("user+mailbox/department=shipping@example.com")).toBe(
      true
    );
    expect(validateEmail("!#$%&'*+-/=?^_`{}|~@example.org")).toBe(true);
  });
});
