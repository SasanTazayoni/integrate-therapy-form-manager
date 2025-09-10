import axios from "axios";
import {
  fetchClientStatus,
  addClient,
  deleteClient,
  deleteClientByEmail,
  deactivateClient,
  activateClient,
} from "./clientsFrontend";
import * as getErrorDisplayModule from "../utils/getErrorDisplay";
import { describe, test, expect, vi, beforeEach } from "vitest";

vi.mock("axios");
const mockedAxios = axios;

describe("fetchClientStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns ok true with data when axios request succeeds", async () => {
    const mockData = { form1: "completed", form2: "pending" };
    mockedAxios.get.mockResolvedValueOnce({ data: mockData });

    const result = await fetchClientStatus("test@example.com");

    expect(mockedAxios.get).toHaveBeenCalledWith("/clients/form-status", {
      params: { email: "test@example.com" },
    });
    expect(result).toEqual({ ok: true, data: mockData });
  });

  test("returns ok false with error from getErrorDisplay for axios error", async () => {
    const mockError = new Error("Network error");
    axios.isAxiosError = vi.fn().mockReturnValue(true);
    mockedAxios.get.mockRejectedValueOnce(mockError);

    vi.spyOn(getErrorDisplayModule, "getErrorDisplay").mockReturnValue(
      "Mocked error display"
    );

    const result = await fetchClientStatus("test@example.com");

    expect(result).toEqual({
      ok: false,
      data: { error: "Mocked error display" },
    });
  });

  test("returns ok false with generic error for non-axios error", async () => {
    const nonAxiosError = "Unexpected error";
    axios.isAxiosError = vi.fn().mockReturnValue(false);
    mockedAxios.get.mockRejectedValueOnce(nonAxiosError);
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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns ok true with data when axios POST succeeds", async () => {
    const mockData = { form1: "completed", form2: "pending" };
    mockedAxios.post.mockResolvedValueOnce({ data: mockData });

    const result = await addClient("test@example.com");

    expect(mockedAxios.post).toHaveBeenCalledWith("/clients/add", {
      email: "test@example.com",
    });
    expect(result).toEqual({ ok: true, data: mockData });
  });

  test("returns ok false with error from getErrorDisplay for axios error", async () => {
    const mockError = new Error("Network error");

    mockedAxios.post.mockRejectedValueOnce(mockError);
    axios.isAxiosError = vi.fn().mockReturnValue(true);

    vi.spyOn(getErrorDisplayModule, "getErrorDisplay").mockReturnValue(
      "Mocked error display"
    );

    const result = await addClient("test@example.com");

    expect(result).toEqual({
      ok: false,
      data: { error: "Mocked error display" },
    });
  });

  test("returns ok false with generic error for non-axios error", async () => {
    const nonAxiosError = "Unexpected error";

    mockedAxios.post.mockRejectedValueOnce(nonAxiosError);
    axios.isAxiosError = vi.fn().mockReturnValue(false);

    const result = await addClient("test@example.com");

    expect(result).toEqual({
      ok: false,
      data: {
        error: "An unexpected error occurred while adding client.",
      },
    });
  });
});

describe("deleteClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns ok true with message when axios DELETE succeeds", async () => {
    const mockData = { message: "Client deleted" };
    mockedAxios.delete.mockResolvedValueOnce({ data: mockData });

    const result = await deleteClient("test@example.com");

    expect(mockedAxios.delete).toHaveBeenCalledWith("/clients/by-email", {
      params: { email: "test@example.com" },
    });
    expect(result).toEqual({ ok: true, data: mockData });
  });

  test("returns ok false with error from getErrorDisplay for axios error", async () => {
    const mockError = new Error("Network error");
    mockedAxios.delete.mockRejectedValueOnce(mockError);
    axios.isAxiosError = vi.fn().mockReturnValue(true);
    vi.spyOn(getErrorDisplayModule, "getErrorDisplay").mockReturnValue(
      "Mocked delete error"
    );

    const result = await deleteClient("test@example.com");

    expect(result).toEqual({
      ok: false,
      data: { error: "Mocked delete error" },
    });
  });

  test("returns ok false with generic error for non-axios error", async () => {
    const nonAxiosError = "Unexpected error";
    mockedAxios.delete.mockRejectedValueOnce(nonAxiosError);
    axios.isAxiosError = vi.fn().mockReturnValue(false);

    const result = await deleteClient("test@example.com");

    expect(result).toEqual({
      ok: false,
      data: { error: "An unexpected error occurred while deleting client." },
    });
  });
});

describe("deleteClientByEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns ok true with message when axios DELETE succeeds", async () => {
    const mockData = { message: "Client deleted" };
    mockedAxios.delete.mockResolvedValueOnce({ data: mockData });

    const result = await deleteClientByEmail("test@example.com");

    expect(mockedAxios.delete).toHaveBeenCalledWith("/clients/by-email", {
      params: { email: "test@example.com" },
    });
    expect(result).toEqual({ ok: true, data: mockData });
  });

  test("returns ok false with error from getErrorDisplay for axios error", async () => {
    const mockError = new Error("Network error");
    mockedAxios.delete.mockRejectedValueOnce(mockError);
    axios.isAxiosError = vi.fn().mockReturnValue(true);
    vi.spyOn(getErrorDisplayModule, "getErrorDisplay").mockReturnValue(
      "Mocked delete error"
    );

    const result = await deleteClientByEmail("test@example.com");

    expect(result).toEqual({
      ok: false,
      data: { error: "Mocked delete error" },
    });
  });

  test("returns ok false with generic error for non-axios error", async () => {
    const nonAxiosError = "Unexpected error";
    mockedAxios.delete.mockRejectedValueOnce(nonAxiosError);
    axios.isAxiosError = vi.fn().mockReturnValue(false);

    const result = await deleteClientByEmail("test@example.com");

    expect(result).toEqual({
      ok: false,
      data: { error: "An unexpected error occurred while deleting client." },
    });
  });
});

describe("deactivateClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  test("returns ok true with data when axios PATCH succeeds", async () => {
    mockedAxios.patch.mockResolvedValueOnce({ data: deactivateResponseMock });

    const result = await deactivateClient("test@example.com");

    expect(mockedAxios.patch).toHaveBeenCalledWith(
      "/clients/deactivate",
      null,
      { params: { email: "test@example.com" } }
    );
    expect(result).toEqual({ ok: true, data: deactivateResponseMock });
  });

  test("returns ok false with error from getErrorDisplay for axios error", async () => {
    const mockError = new Error("Network error");
    mockedAxios.patch.mockRejectedValueOnce(mockError);
    axios.isAxiosError = vi.fn().mockReturnValue(true);
    vi.spyOn(getErrorDisplayModule, "getErrorDisplay").mockReturnValue(
      "Mocked deactivate error"
    );

    const result = await deactivateClient("test@example.com");

    expect(result).toEqual({
      ok: false,
      data: { error: "Mocked deactivate error" },
    });
  });

  test("returns ok false with generic error for non-axios error", async () => {
    const nonAxiosError = "Unexpected error";
    mockedAxios.patch.mockRejectedValueOnce(nonAxiosError);
    axios.isAxiosError = vi.fn().mockReturnValue(false);

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
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  test("returns ok true with data when axios PATCH succeeds", async () => {
    mockedAxios.patch.mockResolvedValueOnce({ data: activateResponseMock });

    const result = await activateClient("test@example.com");

    expect(mockedAxios.patch).toHaveBeenCalledWith("/clients/activate", null, {
      params: { email: "test@example.com" },
    });
    expect(result).toEqual({ ok: true, data: activateResponseMock });
  });

  test("returns ok false with error from getErrorDisplay for axios error", async () => {
    const mockError = new Error("Network error");
    mockedAxios.patch.mockRejectedValueOnce(mockError);
    axios.isAxiosError = vi.fn().mockReturnValue(true);
    vi.spyOn(getErrorDisplayModule, "getErrorDisplay").mockReturnValue(
      "Mocked activate error"
    );

    const result = await activateClient("test@example.com");

    expect(result).toEqual({
      ok: false,
      data: { error: "Mocked activate error" },
    });
  });

  test("returns ok false with generic error for non-axios error", async () => {
    const nonAxiosError = "Unexpected error";
    mockedAxios.patch.mockRejectedValueOnce(nonAxiosError);
    axios.isAxiosError = vi.fn().mockReturnValue(false);

    const result = await activateClient("test@example.com");

    expect(result).toEqual({
      ok: false,
      data: {
        error: "An unexpected error occurred while activating client.",
      },
    });
  });
});
