import { describe, test, expect, vi, beforeEach, type Mock } from "vitest";
import type { Form } from "@prisma/client";
import { sendMultipleFormLinks } from "./sendMultipleFormLinks";

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

describe("sendMultipleFormLinks", () => {
  let sendMock: Mock;

  beforeEach(async () => {
    const resendModule = await import("resend") as unknown as { __sendMock: Mock };
    sendMock = resendModule.__sendMock;
    sendMock.mockReset();
    sendMock.mockResolvedValue({ data: { id: "test-email-id" }, error: null });
  });

  test("sends an email with multiple forms", async () => {
    const forms = [
      { form_type: "YSQ", token: "token1" },
      { form_type: "SMI", token: "token2" },
    ] as unknown as Form[];

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

  test("throws Email delivery failed if Resend returns an error", async () => {
    const forms = [{ form_type: "YSQ", token: "token1" }] as unknown as Form[];
    sendMock.mockResolvedValueOnce({
      data: null,
      error: { message: "API key is invalid", name: "validation_error", statusCode: 401 },
    });

    await expect(
      sendMultipleFormLinks({
        email: "fail@example.com",
        clientName: "Bob",
        forms,
      })
    ).rejects.toThrow("Email delivery failed");
  });

  test("preserves original Resend error as cause", async () => {
    const resendError = { message: "API key is invalid", name: "validation_error", statusCode: 401 };
    const forms = [{ form_type: "SMI", token: "token2" }] as unknown as Form[];
    sendMock.mockResolvedValueOnce({ data: null, error: resendError });

    const err = await sendMultipleFormLinks({
      email: "fail@example.com",
      clientName: "Carol",
      forms,
    }).catch((e) => e);

    expect(err.message).toBe("Email delivery failed");
    expect(err.cause).toBe(resendError);
  });

  test("does nothing if forms array is empty", async () => {
    await sendMultipleFormLinks({
      email: "test@example.com",
      forms: [],
    });

    expect(sendMock).not.toHaveBeenCalled();
  });

  test("uses 'Sir/Madam' if clientName is undefined", async () => {
    const forms = [{ form_type: "YSQ", token: "token1" }] as unknown as Form[];

    await sendMultipleFormLinks({
      email: "test@example.com",
      forms,
    });

    const callArgs = sendMock.mock.calls[0][0];
    expect(callArgs.html).toContain("Dear Sir/Madam");
  });
});
