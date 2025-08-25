import axios from "axios";
import {
  sendFormToken,
  validateFormToken,
  revokeFormToken,
  submitBecksForm,
  submitBurnsForm,
  submitSMIForm,
  submitYSQForm,
  updateClientInfo,
} from "./formsFrontend";
import * as getErrorDisplayModule from "../utils/getErrorDisplay";
import { describe, test, expect, vi, beforeEach } from "vitest";

vi.mock("axios");
const mockedAxios = axios;

describe("sendFormToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const email = "test@example.com";
  const formType = "ysq";

  test("returns ok true with data when axios POST succeeds", async () => {
    const mockData = { token: "12345" };
    mockedAxios.post.mockResolvedValueOnce({ data: mockData });

    const result = await sendFormToken(email, formType);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      `/forms/send-token/${formType}`,
      { email }
    );
    expect(result).toEqual({ ok: true, data: mockData });
  });

  test("returns ok false with error from getErrorDisplay for axios error", async () => {
    const mockError = new Error("Network error");
    mockedAxios.post.mockRejectedValueOnce(mockError);
    axios.isAxiosError = vi.fn().mockReturnValue(true);

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
    const nonAxiosError = "Unexpected error";
    mockedAxios.post.mockRejectedValueOnce(nonAxiosError);
    axios.isAxiosError = vi.fn().mockReturnValue(false);

    const result = await sendFormToken(email, formType);

    expect(result).toEqual({
      ok: false,
      data: { error: "Unexpected error occurred." },
    });
  });
});

describe("validateFormToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const token = "12345";

  test("returns ok true with data when axios GET succeeds", async () => {
    const mockData = { valid: true };
    mockedAxios.get.mockResolvedValueOnce({ data: mockData });

    const result = await validateFormToken(token);

    expect(mockedAxios.get).toHaveBeenCalledWith("/forms/validate-token", {
      params: { token },
    });
    expect(result).toEqual({ ok: true, data: mockData });
  });

  test("returns ok false with error from getErrorDisplay for axios error", async () => {
    const mockError = new Error("Network error");
    mockedAxios.get.mockRejectedValueOnce(mockError);
    axios.isAxiosError = vi.fn().mockReturnValue(true);

    vi.spyOn(getErrorDisplayModule, "getErrorDisplay").mockReturnValue(
      "Mocked error display"
    );

    const result = await validateFormToken(token);

    expect(result).toEqual({
      ok: false,
      error: "Mocked error display",
    });
  });

  test("returns ok false with generic error for non-axios error", async () => {
    const nonAxiosError = "Unexpected error";
    mockedAxios.get.mockRejectedValueOnce(nonAxiosError);
    axios.isAxiosError = vi.fn().mockReturnValue(false);

    const result = await validateFormToken(token);

    expect(result).toEqual({
      ok: false,
      error: "Unexpected error occurred.",
    });
  });
});

describe("revokeFormToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const email = "test@example.com";
  const formType = "ysq";

  test("returns ok true with data when axios POST succeeds", async () => {
    const mockData = { revoked: true };
    mockedAxios.post.mockResolvedValueOnce({ data: mockData });

    const result = await revokeFormToken(email, formType);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      `/forms/revoke-token/${formType}`,
      { email }
    );
    expect(result).toEqual({ ok: true, data: mockData });
  });

  test("returns ok false with error from getErrorDisplay for axios error", async () => {
    const mockError = new Error("Network error");
    mockedAxios.post.mockRejectedValueOnce(mockError);
    axios.isAxiosError = vi.fn().mockReturnValue(true);

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
    const nonAxiosError = "Unexpected error";
    mockedAxios.post.mockRejectedValueOnce(nonAxiosError);
    axios.isAxiosError = vi.fn().mockReturnValue(false);

    const result = await revokeFormToken(email, formType);

    expect(result).toEqual({
      ok: false,
      data: { error: "Unexpected error occurred." },
    });
  });
});

describe("submitBecksForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const token = "token123";
  const result = "some_result";

  test("returns ok true with data when axios POST succeeds", async () => {
    const mockData = { submitted: true };
    mockedAxios.post.mockResolvedValueOnce({ data: mockData });

    const response = await submitBecksForm({ token, result });

    expect(mockedAxios.post).toHaveBeenCalledWith("/forms/submit/becks", {
      token,
      result,
    });
    expect(response).toEqual({ ok: true, data: mockData });
  });

  test("returns ok false with code and error from getErrorDisplay for axios error", async () => {
    const mockError = {
      response: { data: { code: 400 } },
      message: "Network error",
    };
    mockedAxios.post.mockRejectedValueOnce(mockError);
    axios.isAxiosError = vi.fn().mockReturnValue(true);

    vi.spyOn(getErrorDisplayModule, "getErrorDisplay").mockReturnValue(
      "Mocked submit error"
    );

    const response = await submitBecksForm({ token, result });

    expect(response).toEqual({
      ok: false,
      error: "Mocked submit error",
      code: 400,
    });
  });

  test("returns ok false with generic error for non-axios error", async () => {
    const nonAxiosError = "Unexpected error";
    mockedAxios.post.mockRejectedValueOnce(nonAxiosError);
    axios.isAxiosError = vi.fn().mockReturnValue(false);

    const response = await submitBecksForm({ token, result });

    expect(response).toEqual({
      ok: false,
      error: "Unexpected error occurred.",
    });
  });
});

describe("submitBurnsForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const token = "token123";
  const result = "some_result";

  test("returns ok true with data when axios POST succeeds", async () => {
    const mockData = { submitted: true };
    mockedAxios.post.mockResolvedValueOnce({ data: mockData });

    const response = await submitBurnsForm({ token, result });

    expect(mockedAxios.post).toHaveBeenCalledWith("/forms/submit/burns", {
      token,
      result,
    });
    expect(response).toEqual({ ok: true, data: mockData });
  });

  test("returns ok false with code and error from getErrorDisplay for axios error", async () => {
    const mockError = {
      response: { data: { code: 400 } },
      message: "Network error",
    };
    mockedAxios.post.mockRejectedValueOnce(mockError);
    axios.isAxiosError = vi.fn().mockReturnValue(true);

    vi.spyOn(getErrorDisplayModule, "getErrorDisplay").mockReturnValue(
      "Mocked submit error"
    );

    const response = await submitBurnsForm({ token, result });

    expect(response).toEqual({
      ok: false,
      error: "Mocked submit error",
      code: 400,
    });
  });

  test("returns ok false with generic error for non-axios error", async () => {
    const nonAxiosError = "Unexpected error";
    mockedAxios.post.mockRejectedValueOnce(nonAxiosError);
    axios.isAxiosError = vi.fn().mockReturnValue(false);

    const response = await submitBurnsForm({ token, result });

    expect(response).toEqual({
      ok: false,
      error: "Unexpected error occurred.",
    });
  });
});

describe("submitYSQForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const token = "token123";
  const scores = {
    ysq_ed_answers: [1, 2, 3],
    ysq_ab_answers: [0, 1],
  };

  test("returns ok true with data when axios POST succeeds", async () => {
    const mockData = { submitted: true };
    mockedAxios.post.mockResolvedValueOnce({ data: mockData });

    const response = await submitYSQForm({ token, scores });

    expect(mockedAxios.post).toHaveBeenCalledWith("/forms/submit/ysq", {
      token,
      scores,
    });
    expect(response).toEqual({ ok: true, data: mockData });
  });

  test("returns ok false with code and error from getErrorDisplay for axios error", async () => {
    const mockError = {
      response: { data: { code: 400 } },
      message: "Network error",
    };
    mockedAxios.post.mockRejectedValueOnce(mockError);
    axios.isAxiosError = vi.fn().mockReturnValue(true);

    vi.spyOn(getErrorDisplayModule, "getErrorDisplay").mockReturnValue(
      "Mocked YSQ error"
    );

    const response = await submitYSQForm({ token, scores });

    expect(response).toEqual({
      ok: false,
      error: "Mocked YSQ error",
      code: 400,
    });
  });

  test("returns ok false with generic error for non-axios error", async () => {
    const nonAxiosError = "Unexpected error";
    mockedAxios.post.mockRejectedValueOnce(nonAxiosError);
    axios.isAxiosError = vi.fn().mockReturnValue(false);

    const response = await submitYSQForm({ token, scores });

    expect(response).toEqual({
      ok: false,
      error: "Unexpected error occurred.",
    });
  });
});

describe("submitSMIForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const token = "token123";
  const results = {
    domain1: { average: 2.5, label: "Low" },
    domain2: { average: 4.0, label: "High" },
  };

  test("returns ok true with data when axios POST succeeds", async () => {
    const mockData = { submitted: true };
    mockedAxios.post.mockResolvedValueOnce({ data: mockData });

    const response = await submitSMIForm({ token, results });

    expect(mockedAxios.post).toHaveBeenCalledWith("/forms/submit/smi", {
      token,
      results,
    });
    expect(response).toEqual({ ok: true, data: mockData });
  });

  test("returns ok false with code and error from getErrorDisplay for axios error", async () => {
    const mockError = {
      response: { data: { code: 400 } },
      message: "Network error",
    };
    mockedAxios.post.mockRejectedValueOnce(mockError);
    axios.isAxiosError = vi.fn().mockReturnValue(true);

    vi.spyOn(getErrorDisplayModule, "getErrorDisplay").mockReturnValue(
      "Mocked SMI error"
    );

    const response = await submitSMIForm({ token, results });

    expect(response).toEqual({
      ok: false,
      error: "Mocked SMI error",
      code: 400,
    });
  });

  test("returns ok false with generic error for non-axios error", async () => {
    const nonAxiosError = "Unexpected error";
    mockedAxios.post.mockRejectedValueOnce(nonAxiosError);
    axios.isAxiosError = vi.fn().mockReturnValue(false);

    const response = await submitSMIForm({ token, results });

    expect(response).toEqual({
      ok: false,
      error: "Unexpected error occurred.",
    });
  });
});

describe("updateClientInfo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const token = "token123";
  const name = "John Doe";
  const dob = "1990-01-01";

  test("returns ok true when axios POST succeeds", async () => {
    mockedAxios.post.mockResolvedValueOnce({});

    const result = await updateClientInfo({ token, name, dob });

    expect(mockedAxios.post).toHaveBeenCalledWith("/forms/update-client-info", {
      token,
      name,
      dob,
    });
    expect(result).toEqual({ ok: true });
  });

  test("returns ok false with error from getErrorDisplay for axios error", async () => {
    const mockError = new Error("Network error");
    mockedAxios.post.mockRejectedValueOnce(mockError);
    axios.isAxiosError = vi.fn().mockReturnValue(true);

    vi.spyOn(getErrorDisplayModule, "getErrorDisplay").mockReturnValue(
      "Mocked update error"
    );

    const result = await updateClientInfo({ token, name, dob });

    expect(result).toEqual({
      ok: false,
      error: "Mocked update error",
    });
  });

  test("returns ok false with generic error for non-axios error", async () => {
    const nonAxiosError = "Unexpected error";
    mockedAxios.post.mockRejectedValueOnce(nonAxiosError);
    axios.isAxiosError = vi.fn().mockReturnValue(false);

    const result = await updateClientInfo({ token, name, dob });

    expect(result).toEqual({
      ok: false,
      error: "Unexpected error occurred.",
    });
  });
});
