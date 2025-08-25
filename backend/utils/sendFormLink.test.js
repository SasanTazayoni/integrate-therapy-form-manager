import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import * as frontendUtils from "./getFrontendBaseUrl";
import * as envUtils from "./requiredEnv";
import nodemailer from "nodemailer";
import { sendFormLink } from "./sendFormLink";

describe("sendFormLink", () => {
  const sendMailMock = vi.fn();

  beforeEach(() => {
    vi.spyOn(frontendUtils, "getFrontendBaseUrl").mockReturnValue(
      "http://localhost:5173/integrate-therapy-form-manager"
    );

    vi.spyOn(envUtils, "getEnvVar").mockImplementation((name) => {
      switch (name) {
        case "FROM_EMAIL":
          return "from@example.com";
        case "SMTP_HOST":
          return "smtp.example.com";
        case "SMTP_PORT":
          return "587";
        case "SMTP_SECURE":
          return "false";
        case "SMTP_USER":
          return "user";
        case "SMTP_PASS":
          return "pass";
        default:
          throw new Error(`Unexpected env var: ${name}`);
      }
    });

    vi.spyOn(nodemailer, "createTransport").mockReturnValue({
      sendMail: sendMailMock,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    sendMailMock.mockReset();
  });

  test("sends an email with correct content and clientName", async () => {
    sendMailMock.mockResolvedValue({ messageId: "12345" });

    await sendFormLink({
      to: "recipient@example.com",
      token: "token123",
      formType: "YSQ",
      clientName: "John Doe",
    });

    expect(sendMailMock).toHaveBeenCalledTimes(1);

    const mailOptions = sendMailMock.mock.calls[0][0];
    expect(mailOptions.from).toBe("from@example.com");
    expect(mailOptions.to).toBe("recipient@example.com");
    expect(mailOptions.subject).toBe("Your Young Schema Questionnaire (YSQ)");
    expect(mailOptions.html).toContain("Dear John Doe");
    expect(mailOptions.html).toContain(
      "http://localhost:5173/integrate-therapy-form-manager/YSQ/token123"
    );
  });

  test("falls back to Sir/Madam if clientName is not provided", async () => {
    sendMailMock.mockResolvedValue({ messageId: "67890" });

    await sendFormLink({
      to: "someone@example.com",
      token: "abc123",
      formType: "SMI",
    });

    const mailOptions = sendMailMock.mock.calls[0][0];
    expect(mailOptions.html).toContain("Dear Sir/Madam");
  });

  test("throws if formType is invalid", async () => {
    await expect(
      sendFormLink({ to: "x@y.com", token: "t", formType: "INVALID" })
    ).rejects.toThrow("Invalid form type: INVALID");
  });

  test("logs success when email is sent", async () => {
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    sendMailMock.mockResolvedValue({ messageId: "abc123" });

    await sendFormLink({
      to: "ok@example.com",
      token: "tok",
      formType: "BECKS",
    });

    expect(consoleLogSpy).toHaveBeenCalledWith("✅ Email sent:", "abc123");
    consoleLogSpy.mockRestore();
  });

  test("logs error and throws when sending fails with Error instance", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    sendMailMock.mockRejectedValue(new Error("SMTP fail"));

    await expect(
      sendFormLink({
        to: "fail@example.com",
        token: "tok",
        formType: "BURNS",
      })
    ).rejects.toThrow("Email sending failed");

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "❌ Failed to send email:",
      "SMTP fail"
    );

    consoleErrorSpy.mockRestore();
  });

  test("logs error and throws when sending fails with non-Error rejection", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    sendMailMock.mockRejectedValue("Unexpected string error");

    await expect(
      sendFormLink({
        to: "fail2@example.com",
        token: "tok2",
        formType: "BURNS",
      })
    ).rejects.toThrow("Email sending failed");

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "❌ Failed to send email:",
      "Unexpected string error"
    );

    consoleErrorSpy.mockRestore();
  });
});
