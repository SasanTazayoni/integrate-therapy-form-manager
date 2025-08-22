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
});
