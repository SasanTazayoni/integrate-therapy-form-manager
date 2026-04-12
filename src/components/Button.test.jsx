import { describe, test, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import Button from "./Button";
import * as rippleModule from "../../utils/ripple";

describe("Button component", () => {
  test("renders children correctly", () => {
    const { getByText } = render(<Button>Click me</Button>);
    expect(getByText("Click me")).toBeInTheDocument();
  });

  test("applies primary variant by default", () => {
    const { container } = render(<Button>Primary</Button>);
    expect(container.firstChild).toHaveClass("button");
    expect(container.firstChild).not.toHaveClass("button--red");
  });

  test("applies danger variant correctly", () => {
    const { container } = render(<Button variant="danger">Danger</Button>);
    expect(container.firstChild).toHaveClass("button button--red");
  });

  test("calls the onClick handler when clicked", () => {
    const onClick = vi.fn();
    const { getByText } = render(<Button onClick={onClick}>Click</Button>);

    fireEvent.click(getByText("Click"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("initializes ripple effect on mount", () => {
    const rippleSpy = vi.spyOn(rippleModule, "initializeRippleEffect");
    render(<Button>Ripple Test</Button>);
    expect(rippleSpy).toHaveBeenCalledTimes(1);
    expect(rippleSpy.mock.calls[0][0]).toBeInstanceOf(HTMLButtonElement);
    rippleSpy.mockRestore();
  });

  test("applies disabled styles correctly", () => {
    const { getByText } = render(<Button disabled>Disabled</Button>);
    const btn = getByText("Disabled");

    expect(btn).toBeDisabled();

    expect(btn).toHaveClass("bg-gray-300");
    expect(btn).toHaveClass("text-gray-600");
    expect(btn).toHaveClass("cursor-not-allowed");

    const onClick = vi.fn();
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  test("shows loading state when loading prop is true", () => {
    const { getByText } = render(<Button loading>Click me</Button>);

    expect(getByText("Loading...")).toBeInTheDocument();

    const btn = getByText("Loading...");
    expect(btn).toBeDisabled();
  });
});
