import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import Dashboard from "./Dashboard";
import { useClientContext } from "../context/ClientContext";
import { MemoryRouter } from "react-router-dom";

vi.mock("../context/ClientContext", () => ({
  useClientContext: vi.fn(),
}));

describe("Dashboard - email input behavior", () => {
  const setEmailMock = vi.fn();
  const setClientFormsStatusMock = vi.fn();

  beforeEach(() => {
    useClientContext.mockReturnValue({
      email: "",
      setEmail: setEmailMock,
      clientFormsStatus: null,
      setClientFormsStatus: setClientFormsStatusMock,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("updates email state and resets other states on change", () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const emailInput = getByTestId("email-input");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    expect(setEmailMock).toHaveBeenCalledWith("test@example.com");
    expect(setClientFormsStatusMock).toHaveBeenCalledWith(null);
  });
});
