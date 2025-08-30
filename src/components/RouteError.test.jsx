import { render } from "@testing-library/react";
import RouteError from "./RouteError";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useRouteError: vi.fn(),
    isRouteErrorResponse: (err) =>
      typeof err?.status === "number" && typeof err?.statusText === "string",
  };
});

vi.mock("../components/Modal", () => ({
  default: ({ children, ...props }) => (
    <div data-testid="modal" {...props}>
      {children}
    </div>
  ),
}));

const { useRouteError } = await import("react-router-dom");

describe("RouteError", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("falls back to default when not a RouteErrorResponse", () => {
    useRouteError.mockReturnValue(new Error("Boom"));
    const { getByText } = render(<RouteError />);
    expect(getByText("Something went wrong")).toBeInTheDocument();
    expect(
      getByText("An unexpected error occurred. Please try again.")
    ).toBeInTheDocument();
  });

  test("uses data string", () => {
    useRouteError.mockReturnValue({
      status: 400,
      statusText: "Bad Request",
      data: "Custom string",
    });
    const { getByText } = render(<RouteError />);
    expect(getByText("400 Bad Request")).toBeInTheDocument();
    expect(getByText("Custom string")).toBeInTheDocument();
  });

  test("uses data.message from object", () => {
    useRouteError.mockReturnValue({
      status: 404,
      statusText: "Not Found",
      data: { message: "Not found msg" },
    });
    const { getByText } = render(<RouteError />);
    expect(getByText("404 Not Found")).toBeInTheDocument();
    expect(getByText("Not found msg")).toBeInTheDocument();
  });

  test("falls back if data is empty object", () => {
    useRouteError.mockReturnValue({
      status: 500,
      statusText: "Internal Server Error",
      data: {},
    });
    const { getByText } = render(<RouteError />);
    expect(getByText("500 Internal Server Error")).toBeInTheDocument();
    expect(
      getByText("An unexpected error occurred. Please try again.")
    ).toBeInTheDocument();
  });

  test("falls back if data is null", () => {
    useRouteError.mockReturnValue({
      status: 418,
      statusText: "I'm a teapot",
      data: null,
    });
    const { getByText } = render(<RouteError />);
    expect(getByText("418 I'm a teapot")).toBeInTheDocument();
    expect(
      getByText("An unexpected error occurred. Please try again.")
    ).toBeInTheDocument();
  });

  test("falls back to default if data.message is empty string", () => {
    useRouteError.mockReturnValue({
      status: 422,
      statusText: "Unprocessable Entity",
      data: { message: "" },
    });
    const { getByText } = render(<RouteError />);
    expect(getByText("422 Unprocessable Entity")).toBeInTheDocument();
    expect(
      getByText("An unexpected error occurred. Please try again.")
    ).toBeInTheDocument();
  });

  test("falls back to default if RouteErrorResponse data is an empty string", () => {
    useRouteError.mockReturnValue({
      status: 500,
      statusText: "Server Error",
      data: "",
    });
    const { getByText } = render(<RouteError />);
    expect(getByText("500 Server Error")).toBeInTheDocument();
    expect(
      getByText("An unexpected error occurred. Please try again.")
    ).toBeInTheDocument();
  });
});
