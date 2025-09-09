import api from "./api";
import {
  fetchClientStatus,
  addClient,
  deleteClient,
  deleteClientByEmail,
  deactivateClient,
  activateClient,
} from "./clientsFrontend";
import { describe, test, expect, vi, beforeEach } from "vitest";

vi.mock("./api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockedApi = api;

describe("fetchClientStatus", () => {
  beforeEach(() => vi.clearAllMocks());

  test("returns ok true with data when api request succeeds", async () => {
    const mockData = { form1: "completed", form2: "pending" };
    mockedApi.get.mockResolvedValueOnce({ data: mockData });
    const result = await fetchClientStatus("test@example.com");
    expect(mockedApi.get).toHaveBeenCalledWith("/clients/form-status", {
      params: { email: "test@example.com" },
    });
    expect(result).toEqual({ ok: true, data: mockData });
  });

  test("returns ok false with error from real getErrorDisplay for API (Axios) error", async () => {
    const axiosError = {
      isAxiosError: true,
      response: {
        data: { message: "API fetch failed", requestId: "req-1" },
      },
      message: "Request failed",
    };
    mockedApi.get.mockRejectedValueOnce(axiosError);
    const result = await fetchClientStatus("test@example.com");
    expect(result).toEqual({
      ok: false,
      data: { error: "API fetch failed (ref: req-1)" },
    });
  });

  test("returns ok false with generic error for non-axios error", async () => {
    mockedApi.get.mockRejectedValueOnce("Unexpected error");
    const result = await fetchClientStatus("test@example.com");
    expect(result).toEqual({
      ok: false,
      data: {
        error: "An unexpected error occurred while fetching client status.",
      },
    });
  });
});

describe("addClient", () => {
  beforeEach(() => vi.clearAllMocks());

  test("returns ok true with data when api POST succeeds", async () => {
    const mockData = { form1: "completed", form2: "pending" };
    mockedApi.post.mockResolvedValueOnce({ data: mockData });
    const result = await addClient("test@example.com");
    expect(mockedApi.post).toHaveBeenCalledWith("/clients/add", {
      email: "test@example.com",
    });
    expect(result).toEqual({ ok: true, data: mockData });
  });

  test("returns ok false with error from real getErrorDisplay for API (Axios) error", async () => {
    const axiosError = {
      isAxiosError: true,
      response: {
        data: { error: "API add failed", requestId: "req-2" },
      },
      message: "Request failed",
    };
    mockedApi.post.mockRejectedValueOnce(axiosError);
    const result = await addClient("test@example.com");
    expect(result).toEqual({
      ok: false,
      data: { error: "API add failed (ref: req-2)" },
    });
  });

  test("returns ok false with generic error for non-axios error", async () => {
    mockedApi.post.mockRejectedValueOnce("Unexpected error");
    const result = await addClient("test@example.com");
    expect(result).toEqual({
      ok: false,
      data: { error: "An unexpected error occurred while adding client." },
    });
  });
});

describe("deleteClient & deleteClientByEmail", () => {
  beforeEach(() => vi.clearAllMocks());
  const mockData = { message: "Client deleted" };

  [deleteClient, deleteClientByEmail].forEach((fn) => {
    test(`${fn.name} returns ok true when API DELETE succeeds`, async () => {
      mockedApi.delete.mockResolvedValueOnce({ data: mockData });
      const result = await fn("test@example.com");
      expect(mockedApi.delete).toHaveBeenCalledWith("/clients/by-email", {
        params: { email: "test@example.com" },
      });
      expect(result).toEqual({ ok: true, data: mockData });
    });

    test(`${fn.name} returns ok false with error from real getErrorDisplay for API (Axios) error`, async () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          data: { message: "API delete failed", requestId: "req-3" },
        },
        message: "Request failed",
      };
      mockedApi.delete.mockRejectedValueOnce(axiosError);
      const result = await fn("test@example.com");
      expect(result).toEqual({
        ok: false,
        data: { error: "API delete failed (ref: req-3)" },
      });
    });

    test(`${fn.name} returns ok false with generic error for non-axios error`, async () => {
      mockedApi.delete.mockRejectedValueOnce("Unexpected error");
      const result = await fn("test@example.com");
      expect(result).toEqual({
        ok: false,
        data: { error: "An unexpected error occurred while deleting client." },
      });
    });
  });
});

describe("deactivateClient", () => {
  beforeEach(() => vi.clearAllMocks());
  const deactivateResponseMock = {
    message: "Client deactivated",
    client: {
      id: "1",
      email: "test@example.com",
      name: "Test Client",
      status: "inactive",
      inactivated_at: "2025-08-25",
      delete_inactive: null,
    },
  };

  test("returns ok true with data when API PATCH succeeds", async () => {
    mockedApi.patch.mockResolvedValueOnce({ data: deactivateResponseMock });
    const result = await deactivateClient("test@example.com");
    expect(mockedApi.patch).toHaveBeenCalledWith("/clients/deactivate", null, {
      params: { email: "test@example.com" },
    });
    expect(result).toEqual({ ok: true, data: deactivateResponseMock });
  });

  test("returns ok false with error from real getErrorDisplay for API (Axios) error", async () => {
    const axiosError = {
      isAxiosError: true,
      response: {
        data: { error: "API deactivate failed", requestId: "req-4" },
      },
      message: "Request failed",
    };
    mockedApi.patch.mockRejectedValueOnce(axiosError);
    const result = await deactivateClient("test@example.com");
    expect(result).toEqual({
      ok: false,
      data: { error: "API deactivate failed (ref: req-4)" },
    });
  });

  test("returns ok false with generic error for non-axios error", async () => {
    mockedApi.patch.mockRejectedValueOnce("Unexpected error");
    const result = await deactivateClient("test@example.com");
    expect(result).toEqual({
      ok: false,
      data: {
        error: "An unexpected error occurred while deactivating client.",
      },
    });
  });
});

describe("activateClient", () => {
  beforeEach(() => vi.clearAllMocks());
  const activateResponseMock = {
    message: "Client activated",
    client: {
      id: "1",
      email: "test@example.com",
      name: "Test Client",
      status: "active",
      inactivated_at: null,
      delete_inactive: null,
    },
  };

  test("returns ok true with data when API PATCH succeeds", async () => {
    mockedApi.patch.mockResolvedValueOnce({ data: activateResponseMock });
    const result = await activateClient("test@example.com");
    expect(mockedApi.patch).toHaveBeenCalledWith("/clients/activate", null, {
      params: { email: "test@example.com" },
    });
    expect(result).toEqual({ ok: true, data: activateResponseMock });
  });

  test("returns ok false with error from real getErrorDisplay for API (Axios) error", async () => {
    const axiosError = {
      isAxiosError: true,
      response: {
        data: { message: "API activate failed", requestId: "req-5" },
      },
      message: "Request failed",
    };
    mockedApi.patch.mockRejectedValueOnce(axiosError);
    const result = await activateClient("test@example.com");
    expect(result).toEqual({
      ok: false,
      data: { error: "API activate failed (ref: req-5)" },
    });
  });

  test("returns ok false with generic error for non-axios error", async () => {
    mockedApi.patch.mockRejectedValueOnce("Unexpected error");
    const result = await activateClient("test@example.com");
    expect(result).toEqual({
      ok: false,
      data: {
        error: "An unexpected error occurred while activating client.",
      },
    });
  });
});
