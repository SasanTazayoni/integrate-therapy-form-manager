import { describe, test, expect, vi, beforeEach } from "vitest";
import { sendMultipleFormLinks } from "./sendMultipleFormLinks";

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

describe("sendMultipleFormLinks", () => {
  let sendMock;

  beforeEach(async () => {
    const resendModule = await import("resend");
    sendMock = resendModule.__sendMock;
    sendMock.mockReset();
    sendMock.mockResolvedValue({ id: "test-email-id" });
  });

  test("sends an email with multiple forms", async () => {
    const forms = [
      { form_type: "YSQ", token: "token1" },
      { form_type: "SMI", token: "token2" },
    ];

    await sendMultipleFormLinks({
      email: "test@example.com",
      clientName: "Alice",
      forms,
    });

    expect(sendMock).toHaveBeenCalledTimes(1);
    const callArgs = sendMock.mock.calls[0][0];
    expect(callArgs.to).toBe("test@example.com");
    expect(callArgs.from).toBe("from@test.com");
    expect(callArgs.subject).toContain("Your forms from Integrate Therapy");
    expect(callArgs.html).toContain("Dear Alice");
    expect(callArgs.html).toContain("YSQ");
    expect(callArgs.html).toContain("SMI");
    expect(callArgs.html).toContain("https://test.com/YSQ/token1");
    expect(callArgs.html).toContain("https://test.com/SMI/token2");
  });

  test("throws an error if sending email fails", async () => {
    const forms = [{ form_type: "YSQ", token: "token1" }];
    sendMock.mockRejectedValueOnce(new Error("SMTP failure"));

    await expect(
      sendMultipleFormLinks({
        email: "fail@example.com",
        clientName: "Bob",
        forms,
      })
    ).rejects.toThrow("Email sending failed");
  });

  test("logs the error message when email send fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const forms = [{ form_type: "SMI", token: "token2" }];
    sendMock.mockRejectedValueOnce(new Error("Network error"));

    await expect(
      sendMultipleFormLinks({
        email: "fail2@example.com",
        clientName: "Carol",
        forms,
      })
    ).rejects.toThrow("Email sending failed");

    expect(consoleSpy).toHaveBeenCalledWith(
      "❌ Failed to send multiple forms email:",
      "Network error"
    );

    consoleSpy.mockRestore();
  });

  test("logs non-Error rejection values", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const forms = [{ form_type: "YSQ", token: "token1" }];

    sendMock.mockRejectedValueOnce("some string error");

    await expect(
      sendMultipleFormLinks({
        email: "fail3@example.com",
        clientName: "Dan",
        forms,
      })
    ).rejects.toThrow("Email sending failed");

    expect(consoleSpy).toHaveBeenCalledWith(
      "❌ Failed to send multiple forms email:",
      "some string error"
    );

    consoleSpy.mockRestore();
  });

  test("does nothing if forms array is empty", async () => {
    await sendMultipleFormLinks({
      email: "test@example.com",
      forms: [],
    });

    expect(sendMock).not.toHaveBeenCalled();
  });

  test("uses 'Sir/Madam' if clientName is undefined", async () => {
    const forms = [{ form_type: "YSQ", token: "token1" }];

    await sendMultipleFormLinks({
      email: "test@example.com",
      forms,
    });

    const callArgs = sendMock.mock.calls[0][0];
    expect(callArgs.html).toContain("Dear Sir/Madam");
  });
});
