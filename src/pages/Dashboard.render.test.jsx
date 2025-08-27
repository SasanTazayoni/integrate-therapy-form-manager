import {
  describe,
  test,
  expect,
  vi,
  beforeEach,
  beforeAll,
  afterAll,
} from "vitest";
import { render } from "@testing-library/react";
import Dashboard from "./Dashboard";
import { useClientContext } from "../context/ClientContext";
import { MemoryRouter } from "react-router-dom";

vi.mock("../context/ClientContext", () => ({
  useClientContext: vi.fn(),
}));

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
});
