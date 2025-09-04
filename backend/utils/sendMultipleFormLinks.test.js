import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import * as frontendUtils from "./getFrontendBaseUrl";
import * as envUtils from "./requiredEnv";
import nodemailer from "nodemailer";
import { sendMultipleFormLinks } from "./sendMultipleFormLinks";

describe("sendMultipleFormLinks", () => {
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

  const forms = [
    { id: 1, form_type: "SMI", token: "token1" },
    { id: 2, form_type: "YSQ", token: "token2" },
  ];

  test("does nothing if forms array is empty", async () => {
    await sendMultipleFormLinks({ email: "test@example.com", forms: [] });
    expect(nodemailer.createTransport).not.toHaveBeenCalled();
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  test("sends an email to the correct address", async () => {
    sendMailMock.mockResolvedValue({ messageId: "123" });

    await sendMultipleFormLinks({ email: "user@example.com", forms });

    const mailOptions = sendMailMock.mock.calls[0][0];
    expect(mailOptions.to).toBe("user@example.com");
  });

  test("includes the clientName if provided", async () => {
    sendMailMock.mockResolvedValue({ messageId: "456" });

    await sendMultipleFormLinks({
      email: "user@example.com",
      clientName: "Alice",
      forms,
    });

    const mailOptions = sendMailMock.mock.calls[0][0];
    expect(mailOptions.html).toContain("Dear Alice");
  });

  test("falls back to 'Sir/Madam' if clientName is not provided", async () => {
    sendMailMock.mockResolvedValue({ messageId: "789" });

    await sendMultipleFormLinks({ email: "user@example.com", forms });

    const mailOptions = sendMailMock.mock.calls[0][0];
    expect(mailOptions.html).toContain("Dear Sir/Madam");
  });

  test("includes links for each form in the email body", async () => {
    sendMailMock.mockResolvedValue({ messageId: "101112" });

    await sendMultipleFormLinks({ email: "user@example.com", forms });

    const mailOptions = sendMailMock.mock.calls[0][0];
    expect(mailOptions.html).toContain("/SMI/token1");
    expect(mailOptions.html).toContain("/YSQ/token2");
  });

  test("logs success message when email is sent", async () => {
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    sendMailMock.mockResolvedValue({ messageId: "131415" });

    await sendMultipleFormLinks({ email: "user@example.com", forms });

    expect(consoleLogSpy).toHaveBeenCalledWith(
      "✅ Email sent with multiple forms:",
      "131415"
    );

    consoleLogSpy.mockRestore();
  });

  test("logs error and throws when sendMail fails with Error instance", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    sendMailMock.mockRejectedValue(new Error("SMTP fail"));

    await expect(
      sendMultipleFormLinks({ email: "fail@example.com", forms })
    ).rejects.toThrow("Email sending failed");

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "❌ Failed to send multiple forms email:",
      "SMTP fail"
    );

    consoleErrorSpy.mockRestore();
  });

  test("logs error and throws when sendMail fails with non-Error rejection", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    sendMailMock.mockRejectedValue("Unexpected string error");

    await expect(
      sendMultipleFormLinks({ email: "fail2@example.com", forms })
    ).rejects.toThrow("Email sending failed");

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "❌ Failed to send multiple forms email:",
      "Unexpected string error"
    );

    consoleErrorSpy.mockRestore();
  });
});
