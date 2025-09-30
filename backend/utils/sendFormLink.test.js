import { describe, test, expect, vi, beforeEach } from "vitest";
import { sendFormLink } from "./sendFormLink";

vi.mock("./requiredEnv", () => ({
  getEnvVar: vi.fn((key) => {
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
  let sendMock;

  beforeEach(async () => {
    const resendModule = await import("resend");
    sendMock = resendModule.__sendMock;
    sendMock.mockReset();
    sendMock.mockResolvedValue({ id: "test-email-id" });
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
  });

  test("throws an error if formType is invalid", async () => {
    await expect(
      sendFormLink({
        to: "test@example.com",
        token: "abc123",
        formType: "INVALID",
      })
    ).rejects.toThrow("Invalid form type: INVALID");
  });

  test("throws an error if sending fails", async () => {
    sendMock.mockRejectedValueOnce(new Error("SMTP failure"));

    await expect(
      sendFormLink({
        to: "fail@example.com",
        token: "abc123",
        formType: "YSQ",
      })
    ).rejects.toThrow("Email sending failed");
  });

  test("logs error message when sending fails with Error", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    sendMock.mockRejectedValueOnce(new Error("Network error"));

    await expect(
      sendFormLink({
        to: "fail2@example.com",
        token: "abc123",
        formType: "SMI",
      })
    ).rejects.toThrow("Email sending failed");

    expect(consoleSpy).toHaveBeenCalledWith(
      "❌ Failed to send email:",
      "Network error"
    );
    consoleSpy.mockRestore();
  });

  test("logs error message when sending fails with non-Error", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    sendMock.mockRejectedValueOnce("some string error");

    await expect(
      sendFormLink({
        to: "fail3@example.com",
        token: "abc123",
        formType: "BECKS",
      })
    ).rejects.toThrow("Email sending failed");

    expect(consoleSpy).toHaveBeenCalledWith(
      "❌ Failed to send email:",
      "some string error"
    );
    consoleSpy.mockRestore();
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
