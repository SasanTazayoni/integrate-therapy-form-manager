import {
  describe,
  test,
  expect,
  vi,
  beforeEach,
  beforeAll,
  afterAll,
} from "vitest";
import { render, fireEvent } from "@testing-library/react";
import Dashboard from "./Dashboard";
import { useClientContext } from "../context/ClientContext";
import { MemoryRouter } from "react-router-dom";
import { useNavigate } from "react-router-dom";

vi.mock("../context/ClientContext", () => ({
  useClientContext: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

beforeAll(() => {
  const modalRoot = document.createElement("div");
  modalRoot.setAttribute("id", "modal-root");
  document.body.appendChild(modalRoot);
});

afterAll(() => {
  const modalRoot = document.getElementById("modal-root");
  if (modalRoot) document.body.removeChild(modalRoot);
});

describe("Dashboard - render checks", () => {
  beforeEach(() => {
    useClientContext.mockReturnValue({
      email: "",
      setEmail: vi.fn(),
      clientFormsStatus: null,
      setClientFormsStatus: vi.fn(),
    });
  });

  test("renders the dashboard title", () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    expect(getByTestId("dashboard-title")).toBeInTheDocument();
  });

  test("renders the email input field", () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    expect(getByTestId("email-input")).toBeInTheDocument();
  });

  test("renders the Summary button", () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    expect(getByTestId("summary-button")).toBeInTheDocument();
  });

  test("Summary button triggers navigate call", () => {
    const navigateMock = vi.fn();
    useNavigate.mockReturnValue(navigateMock);

    const { getByTestId } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    fireEvent.click(getByTestId("summary-button"));
    expect(navigateMock).toHaveBeenCalledWith("/summary");
  });
});
