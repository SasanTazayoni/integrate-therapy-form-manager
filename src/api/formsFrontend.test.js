import api from "./api";
import * as getErrorDisplayModule from "../utils/getErrorDisplay";
import {
  sendFormToken,
  sendMultipleFormTokens,
  validateFormToken,
  revokeFormToken,
  submitBecksForm,
  submitBurnsForm,
  submitYSQForm,
  submitSMIForm,
  updateClientInfo,
  fetchAllSmiForms,
} from "./formsFrontend";
import { describe, test, expect, vi, beforeEach } from "vitest";

vi.mock("./api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockedApi = api;

describe("sendFormToken", () => {
  const email = "test@example.com";
  const formType = "ysq";

  beforeEach(() => vi.clearAllMocks());

  test("returns ok true on success", async () => {
    const mockData = { token: "12345" };
    mockedApi.post.mockResolvedValueOnce({ data: mockData });

    const result = await sendFormToken(email, formType);

    expect(mockedApi.post).toHaveBeenCalledWith(
      `/forms/send-token/${formType}`,
      { email }
    );
    expect(result).toEqual({ ok: true, data: mockData });
  });

  test("returns ok false with getErrorDisplay on axios error", async () => {
    const err = { isAxiosError: true, response: { data: {} } };
    mockedApi.post.mockRejectedValueOnce(err);
    vi.spyOn(getErrorDisplayModule, "getErrorDisplay").mockReturnValue(
      "Mocked error display"
    );

    const result = await sendFormToken(email, formType);
    expect(result).toEqual({
      ok: false,
      data: { error: "Mocked error display" },
    });
  });

  test("returns ok false with generic error for non-axios error", async () => {
    mockedApi.post.mockRejectedValueOnce("Unexpected error");
    const result = await sendFormToken(email, formType);
    expect(result).toEqual({
      ok: false,
      data: { error: "Unexpected error occurred." },
    });
  });
});

describe("validateFormToken", () => {
  const token = "12345";

  beforeEach(() => vi.clearAllMocks());

  test("returns ok true on success", async () => {
    const mockData = { valid: true };
    mockedApi.get.mockResolvedValueOnce({ data: mockData });

    const result = await validateFormToken(token);
    expect(mockedApi.get).toHaveBeenCalledWith("/forms/validate-token", {
      params: { token },
    });
    expect(result).toEqual({ ok: true, data: mockData });
  });

  test("returns ok false with getErrorDisplay on axios error", async () => {
    const err = { isAxiosError: true, response: { data: {} } };
    mockedApi.get.mockRejectedValueOnce(err);
    vi.spyOn(getErrorDisplayModule, "getErrorDisplay").mockReturnValue(
      "Mocked error display"
    );

    const result = await validateFormToken(token);
    expect(result).toEqual({ ok: false, error: "Mocked error display" });
  });

  test("returns ok false with generic error for non-axios error", async () => {
    mockedApi.get.mockRejectedValueOnce("Unexpected error");
    const result = await validateFormToken(token);
    expect(result).toEqual({ ok: false, error: "Unexpected error occurred." });
  });
});

describe("revokeFormToken", () => {
  const email = "test@example.com";
  const formType = "ysq";

  beforeEach(() => vi.clearAllMocks());

  test("returns ok true on success", async () => {
    const mockData = { revoked: true };
    mockedApi.post.mockResolvedValueOnce({ data: mockData });

    const result = await revokeFormToken(email, formType);
    expect(mockedApi.post).toHaveBeenCalledWith(
      `/forms/revoke-token/${formType}`,
      { email }
    );
    expect(result).toEqual({ ok: true, data: mockData });
  });

  test("returns ok false with getErrorDisplay on axios error", async () => {
    const err = { isAxiosError: true, response: { data: {} } };
    mockedApi.post.mockRejectedValueOnce(err);
    vi.spyOn(getErrorDisplayModule, "getErrorDisplay").mockReturnValue(
      "Mocked revoke error"
    );

    const result = await revokeFormToken(email, formType);
    expect(result).toEqual({
      ok: false,
      data: { error: "Mocked revoke error" },
    });
  });

  test("returns ok false with generic error for non-axios error", async () => {
    mockedApi.post.mockRejectedValueOnce("Unexpected error");
    const result = await revokeFormToken(email, formType);
    expect(result).toEqual({
      ok: false,
      data: { error: "Unexpected error occurred." },
    });
  });
});

describe.each([
  {
    fn: submitBecksForm,
    path: "/forms/submit/becks",
    args: { token: "t", result: "r" },
    name: "Becks",
  },
  {
    fn: submitBurnsForm,
    path: "/forms/submit/burns",
    args: { token: "t", result: "r" },
    name: "Burns",
  },
  {
    fn: submitYSQForm,
    path: "/forms/submit/ysq",
    args: { token: "t", scores: { ysq_ed_answers: [1] } },
    name: "YSQ",
  },
  {
    fn: submitSMIForm,
    path: "/forms/submit/smi",
    args: { token: "t", results: { d: { average: 1, label: "L" } } },
    name: "SMI",
  },
])("$name form submission", ({ fn, path, args }) => {
  beforeEach(() => vi.clearAllMocks());

  test("returns ok true on success", async () => {
    const mockData = { submitted: true };
    mockedApi.post.mockResolvedValueOnce({ data: mockData });

    const res = await fn(args);
    expect(mockedApi.post).toHaveBeenCalledWith(path, args);
    expect(res).toEqual({ ok: true, data: mockData });
  });

  test("returns ok false with code and error on axios error", async () => {
    const err = { response: { data: { code: 400 } }, isAxiosError: true };
    mockedApi.post.mockRejectedValueOnce(err);
    vi.spyOn(getErrorDisplayModule, "getErrorDisplay").mockReturnValue(
      "Mocked submit error"
    );

    const res = await fn(args);
    expect(res).toEqual({ ok: false, error: "Mocked submit error", code: 400 });
  });

  test("returns ok false with generic error for non-axios error", async () => {
    mockedApi.post.mockRejectedValueOnce("Unexpected error");

    const res = await fn(args);
    expect(res.ok).toBe(false);
  });
});

describe("updateClientInfo", () => {
  const args = { token: "t", name: "John", dob: "2000-01-01" };

  beforeEach(() => vi.clearAllMocks());

  test("returns ok true on success", async () => {
    mockedApi.post.mockResolvedValueOnce({});
    const res = await updateClientInfo(args);
    expect(mockedApi.post).toHaveBeenCalledWith(
      "/forms/update-client-info",
      args
    );
    expect(res).toEqual({ ok: true });
  });

  test("returns ok false with getErrorDisplay on axios error", async () => {
    const err = { isAxiosError: true, response: { data: {} } };
    mockedApi.post.mockRejectedValueOnce(err);
    vi.spyOn(getErrorDisplayModule, "getErrorDisplay").mockReturnValue(
      "Mocked update error"
    );

    const res = await updateClientInfo(args);
    expect(res).toEqual({ ok: false, error: "Mocked update error" });
  });

  test("returns ok false with generic error for non-axios error", async () => {
    mockedApi.post.mockRejectedValueOnce("Unexpected error");
    const res = await updateClientInfo(args);
    expect(res).toEqual({ ok: false, error: "Unexpected error occurred." });
  });
});

describe("sendMultipleFormTokens", () => {
  const email = "test@example.com";

  beforeEach(() => vi.clearAllMocks());

  test("returns ok true on success", async () => {
    const data = { sent: ["YSQ", "SMI"] };
    mockedApi.post.mockResolvedValueOnce({ data });

    const res = await sendMultipleFormTokens(email);
    expect(mockedApi.post).toHaveBeenCalledWith("/forms/send-multiple", {
      email,
    });
    expect(res).toEqual({ ok: true, data });
  });

  test("returns ok false with getErrorDisplay on axios error", async () => {
    const err = { isAxiosError: true, response: { data: {} } };
    mockedApi.post.mockRejectedValueOnce(err);
    vi.spyOn(getErrorDisplayModule, "getErrorDisplay").mockReturnValue(
      "Mocked multiple send"
    );

    const res = await sendMultipleFormTokens(email);
    expect(res).toEqual({ ok: false, data: { error: "Mocked multiple send" } });
  });

  test("returns ok false with generic error for non-axios error", async () => {
    mockedApi.post.mockRejectedValueOnce("Unexpected error");
    const res = await sendMultipleFormTokens(email);
    expect(res).toEqual({
      ok: false,
      data: { error: "Unexpected error occurred." },
    });
  });
});

describe("fetchAllSmiForms", () => {
  const email = "test@example.com";

  beforeEach(() => vi.clearAllMocks());

  test("returns ok true on success", async () => {
    const data = { clientName: "John", smiForms: [] };
    mockedApi.get.mockResolvedValueOnce({ data });

    const res = await fetchAllSmiForms(email);
    expect(mockedApi.get).toHaveBeenCalledWith("/forms/smi/all", {
      params: { email },
    });
    expect(res).toEqual({ ok: true, data });
  });

  test("returns ok false with getErrorDisplay on axios error", async () => {
    const err = { isAxiosError: true, response: { data: {} } };
    mockedApi.get.mockRejectedValueOnce(err);
    vi.spyOn(getErrorDisplayModule, "getErrorDisplay").mockReturnValue(
      "Mocked fetch SMI"
    );

    const res = await fetchAllSmiForms(email);
    expect(res).toEqual({ ok: false, data: { error: "Mocked fetch SMI" } });
  });

  test("returns ok false with generic error for non-axios error", async () => {
    mockedApi.get.mockRejectedValueOnce("Unexpected error");
    const res = await fetchAllSmiForms(email);
    expect(res).toEqual({
      ok: false,
      data: { error: "An unexpected error occurred while fetching SMI forms." },
    });
  });
});
