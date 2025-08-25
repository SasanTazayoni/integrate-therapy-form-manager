import { describe, test, expect, vi, afterEach } from "vitest";
import * as formUtils from "./formUtils";
import prisma from "../prisma/client";

describe("isTokenExpired", () => {
  test("returns true if the token is before now", () => {
    const expiredDate = new Date(Date.now() - 1000);
    expect(formUtils.isTokenExpired(expiredDate)).toBe(true);
  });

  test("returns false if the token is in the future", () => {
    const futureDate = new Date(Date.now() + 1000);
    expect(formUtils.isTokenExpired(futureDate)).toBe(false);
  });
});

describe("isFormTokenUsable", () => {
  test("returns false if form is inactive", () => {
    const form = {
      is_active: false,
      token_expires_at: new Date(Date.now() + 1000),
      submitted_at: null,
    };
    expect(formUtils.isFormTokenUsable(form)).toBe(false);
  });

  test("returns false if form is already submitted", () => {
    const form = {
      is_active: true,
      token_expires_at: new Date(Date.now() + 1000),
      submitted_at: new Date(),
    };
    expect(formUtils.isFormTokenUsable(form)).toBe(false);
  });

  test("returns false if token is expired", () => {
    const form = {
      is_active: true,
      token_expires_at: new Date(Date.now() - 1000),
      submitted_at: null,
    };
    expect(formUtils.isFormTokenUsable(form)).toBe(false);
  });

  test("returns true if active, not submitted, and token not expired", () => {
    const form = {
      is_active: true,
      token_expires_at: new Date(Date.now() + 1000),
      submitted_at: null,
    };
    expect(formUtils.isFormTokenUsable(form)).toBe(true);
  });
});

describe("deactivateInvalidActiveForms", () => {
  const mockUpdateMany = vi.spyOn(prisma.form, "updateMany");

  afterEach(() => {
    mockUpdateMany.mockReset();
  });

  test("calls prisma.updateMany with correct params", async () => {
    mockUpdateMany.mockResolvedValue({ count: 2 });

    const clientId = "client123";
    const formType = "SOME_FORM_TYPE";

    const result = await formUtils.deactivateInvalidActiveForms(
      clientId,
      formType
    );

    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: {
        clientId,
        form_type: formType,
        is_active: true,
        OR: [
          { token_expires_at: { lt: expect.any(Date) } },
          { submitted_at: { not: null } },
          { revoked_at: { not: null } },
        ],
      },
      data: { is_active: false },
    });

    expect(result).toEqual({ count: 2 });
  });
});
