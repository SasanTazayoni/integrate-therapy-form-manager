import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import App from "./App";

describe("App", () => {
  test("renders the password prompt from ProtectedForm", () => {
    const { getByText } = render(<App />);
    expect(getByText("Enter Password")).toBeInTheDocument();
    expect(getByText("Access Form")).toBeInTheDocument();
  });
});
