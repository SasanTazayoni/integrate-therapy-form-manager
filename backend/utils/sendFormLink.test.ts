import { describe, test, expect, vi, beforeEach, type Mock } from "vitest";
import { sendFormLink } from "./sendFormLink";
import { THERAPIST_SIGNATURE } from "./therapistSignature";
import type { FormType } from "../data/formTypes";

vi.mock("./requiredEnv", () => ({
  getEnvVar: vi.fn((key: string) => {
    if (key === "RESEND_API_KEY") return "test-api-key";
    if (key === "FROM_EMAIL") return "from@test.com";
  }),
}));

vi.mock("./getFrontendBaseUrl", () => ({
  getFrontendBaseUrl: vi.fn(() => "https://test.com"),
}));

vi.mock("resend", () => {
  const sendMock = vi.fn();
  return {
    Resend: vi.fn().mockImplementation(() => ({
      emails: { send: sendMock },
    })),
    __sendMock: sendMock,
  };
});

describe("sendFormLink", () => {
  let sendMock: Mock;

  beforeEach(async () => {
    const resendModule = await import("resend") as unknown as { __sendMock: Mock };
    sendMock = resendModule.__sendMock;
    sendMock.mockReset();
    sendMock.mockResolvedValue({ data: { id: "test-email-id" }, error: null });
  });

  test("sends a single form email correctly", async () => {
    await sendFormLink({
      to: "test@example.com",
      token: "abc123",
      formType: "YSQ",
      clientName: "Alice",
    });

    expect(sendMock).toHaveBeenCalledTimes(1);
    const callArgs = sendMock.mock.calls[0][0];
    expect(callArgs.to).toBe("test@example.com");
    expect(callArgs.from).toBe("from@test.com");
    expect(callArgs.subject).toContain("Your Young Schema Questionnaire (YSQ)");
    expect(callArgs.html).toContain("Dear Alice");
    expect(callArgs.html).toContain("YSQ");
    expect(callArgs.html).toContain("https://test.com/YSQ/abc123");
    expect(callArgs.html).toContain(THERAPIST_SIGNATURE);
  });

  test("throws an error if formType is invalid", async () => {
    await expect(
      sendFormLink({
        to: "test@example.com",
        token: "abc123",
        formType: "INVALID" as unknown as FormType,
      })
    ).rejects.toThrow("Invalid form type: INVALID");
  });

  test("throws Email delivery failed if Resend returns an error", async () => {
    sendMock.mockResolvedValueOnce({
      data: null,
      error: { message: "API key is invalid", name: "validation_error", statusCode: 401 },
    });

    await expect(
      sendFormLink({
        to: "fail@example.com",
        token: "abc123",
        formType: "YSQ",
      })
    ).rejects.toThrow("Email delivery failed");
  });

  test("preserves original Resend error as cause", async () => {
    const resendError = { message: "API key is invalid", name: "validation_error", statusCode: 401 };
    sendMock.mockResolvedValueOnce({ data: null, error: resendError });

    const err = await sendFormLink({
      to: "fail@example.com",
      token: "abc123",
      formType: "YSQ",
    }).catch((e) => e);

    expect(err.message).toBe("Email delivery failed");
    expect(err.cause).toBe(resendError);
  });

  test("uses 'Sir/Madam' if clientName is undefined", async () => {
    await sendFormLink({
      to: "test@example.com",
      token: "abc123",
      formType: "SMI",
    });

    const callArgs = sendMock.mock.calls[0][0];
    expect(callArgs.html).toContain("Dear Sir/Madam");
  });
});
