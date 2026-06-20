import { describe, test, expect, vi, beforeEach } from "vitest";
import { AxiosError, type AxiosResponse } from "axios";
import api from "./api";
import {
  fetchClientStatus,
  addClient,
  deleteClient,
  deactivateClient,
  activateClient,
} from "./clientsFrontend";

vi.mock("./api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockedApi = api as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
};

function makeAxiosError(responseData: unknown): AxiosError {
  const err = new AxiosError("Request failed");
  err.response = { data: responseData } as unknown as AxiosResponse;
  return err;
}

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
    mockedApi.get.mockRejectedValueOnce(
      makeAxiosError({ error: "API fetch failed" })
    );
    const result = await fetchClientStatus("test@example.com");
    expect(result).toEqual({
      ok: false,
      data: { error: "API fetch failed" },
    });
  });

  test("returns ok false with generic error for non-axios error", async () => {
    mockedApi.get.mockRejectedValueOnce(new Error("Unexpected error"));
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
    mockedApi.post.mockRejectedValueOnce(
      makeAxiosError({ error: "API add failed" })
    );
    const result = await addClient("test@example.com");
    expect(result).toEqual({
      ok: false,
      data: { error: "API add failed" },
    });
  });

  test("returns ok false with generic error for non-axios error", async () => {
    mockedApi.post.mockRejectedValueOnce(new Error("Unexpected error"));
    const result = await addClient("test@example.com");
    expect(result).toEqual({
      ok: false,
      data: { error: "An unexpected error occurred while adding client." },
    });
  });
});

describe("deleteClient", () => {
  beforeEach(() => vi.clearAllMocks());
  const mockData = { message: "Client deleted" };

  test("returns ok true when API DELETE succeeds", async () => {
    mockedApi.delete.mockResolvedValueOnce({ data: mockData });
    const result = await deleteClient("test@example.com");
    expect(mockedApi.delete).toHaveBeenCalledWith("/clients/by-email", {
      params: { email: "test@example.com" },
    });
    expect(result).toEqual({ ok: true, data: mockData });
  });

  test("returns ok false with error from real getErrorDisplay for API (Axios) error", async () => {
    mockedApi.delete.mockRejectedValueOnce(
      makeAxiosError({ error: "API delete failed" })
    );
    const result = await deleteClient("test@example.com");
    expect(result).toEqual({
      ok: false,
      data: { error: "API delete failed" },
    });
  });

  test("returns ok false with generic error for non-axios error", async () => {
    mockedApi.delete.mockRejectedValueOnce(new Error("Unexpected error"));
    const result = await deleteClient("test@example.com");
    expect(result).toEqual({
      ok: false,
      data: { error: "An unexpected error occurred while deleting client." },
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
    mockedApi.patch.mockRejectedValueOnce(
      makeAxiosError({ error: "API deactivate failed" })
    );
    const result = await deactivateClient("test@example.com");
    expect(result).toEqual({
      ok: false,
      data: { error: "API deactivate failed" },
    });
  });

  test("returns ok false with generic error for non-axios error", async () => {
    mockedApi.patch.mockRejectedValueOnce(new Error("Unexpected error"));
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
    mockedApi.patch.mockRejectedValueOnce(
      makeAxiosError({ error: "API activate failed" })
    );
    const result = await activateClient("test@example.com");
    expect(result).toEqual({
      ok: false,
      data: { error: "API activate failed" },
    });
  });

  test("returns ok false with generic error for non-axios error", async () => {
    mockedApi.patch.mockRejectedValueOnce(new Error("Unexpected error"));
    const result = await activateClient("test@example.com");
    expect(result).toEqual({
      ok: false,
      data: {
        error: "An unexpected error occurred while activating client.",
      },
    });
  });
});
