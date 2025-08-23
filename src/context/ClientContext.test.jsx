import { render, act } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { ClientProvider, useClientContext } from "./ClientContext";

describe("ClientContext", () => {
  test("throws error if used outside provider", () => {
    const TestComponent = () => {
      useClientContext();
      return null;
    };

    expect(() => render(<TestComponent />)).toThrow(
      "useClientContext must be used within ClientProvider"
    );
  });

  test("provides default state and setters", () => {
    let contextValues = null;

    const TestComponent = () => {
      contextValues = useClientContext();
      return null;
    };

    render(
      <ClientProvider>
        <TestComponent />
      </ClientProvider>
    );

    expect(contextValues).toHaveProperty("email", "");
    expect(typeof contextValues.setEmail).toBe("function");
    expect(contextValues).toHaveProperty("clientFormsStatus", null);
    expect(contextValues).toHaveProperty("successMessage", "");
    expect(contextValues).toHaveProperty("error", "");
  });

  test("setters update context values", () => {
    let contextValues = null;

    const TestComponent = () => {
      contextValues = useClientContext();
      return null;
    };

    render(
      <ClientProvider>
        <TestComponent />
      </ClientProvider>
    );

    act(() => {
      contextValues.setEmail("test@example.com");
      contextValues.setError("Some error");
      contextValues.setSuccessMessage("Success!");
      contextValues.setClientFormsStatus({ YSQ: true, BECKS: false });
    });

    expect(contextValues.email).toBe("test@example.com");
    expect(contextValues.error).toBe("Some error");
    expect(contextValues.successMessage).toBe("Success!");
    expect(contextValues.clientFormsStatus).toEqual({
      YSQ: true,
      BECKS: false,
    });
  });
});
