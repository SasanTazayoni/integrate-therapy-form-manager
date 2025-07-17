import nodemailer from "nodemailer";
import { sendMagicLinksEmail } from "./email";
import { createMagicLinkSendingError } from "../errors";
import { describe, test, expect, vi, beforeEach, beforeAll } from "vitest";

vi.mock("nodemailer");

describe("sendMagicLinksEmail", () => {
  const sendMailMock = vi.fn();

  beforeAll(() => {
    nodemailer.createTransport.mockReturnValue({
      sendMail: sendMailMock,
    });
  });

  beforeEach(() => {
    sendMailMock.mockClear();
  });

  test("sends email with correct mail options", async () => {
    sendMailMock.mockResolvedValueOnce({});
    const email = "test@example.com";
    const links = [
      { questionnaire: "SMI", url: "http://test.com/smi?token=abc" },
    ];

    await sendMagicLinksEmail(email, links);

    expect(sendMailMock).toHaveBeenCalledTimes(1);
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: email,
        subject: expect.stringContaining("Magic Links"),
        html: expect.stringContaining("SMI"),
      })
    );
  });

  test("throws createMagicLinkSendingError when sendMail fails", async () => {
    const errorMessage = "SMTP error";
    sendMailMock.mockRejectedValueOnce(new Error(errorMessage));
    const email = "test@example.com";
    const links = [
      { questionnaire: "SMI", url: "http://test.com/smi?token=abc" },
    ];

    await expect(sendMagicLinksEmail(email, links)).rejects.toThrowError(
      createMagicLinkSendingError(errorMessage)
    );
  });

  test("throws createMagicLinkSendingError when sendMail rejects with non-Error", async () => {
    sendMailMock.mockRejectedValueOnce("some string error");

    const email = "test@example.com";
    const links = [
      { questionnaire: "SMI", url: "http://test.com/smi?token=abc" },
    ];

    await expect(sendMagicLinksEmail(email, links)).rejects.toThrowError(
      createMagicLinkSendingError(undefined)
    );
  });
});
