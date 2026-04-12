import { render, act } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { ClientProvider, useClientContext } from "./ClientContext";
import type { ClientFormsStatus } from "../types/formStatusTypes";

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
    let contextValues: ReturnType<typeof useClientContext> | null = null;

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
    expect(typeof (contextValues as unknown as ReturnType<typeof useClientContext>).setEmail).toBe("function");
    expect(contextValues).toHaveProperty("clientFormsStatus", null);
    expect(contextValues).toHaveProperty("successMessage", "");
    expect(contextValues).toHaveProperty("error", "");
  });

  test("setters update context values", () => {
    let contextValues: ReturnType<typeof useClientContext> | null = null;

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
      (contextValues as unknown as ReturnType<typeof useClientContext>).setEmail("test@example.com");
      (contextValues as unknown as ReturnType<typeof useClientContext>).setError("Some error");
      (contextValues as unknown as ReturnType<typeof useClientContext>).setSuccessMessage("Success!");
      (contextValues as unknown as ReturnType<typeof useClientContext>).setClientFormsStatus(
        { YSQ: true, BECKS: false } as unknown as ClientFormsStatus
      );
    });

    const updated = contextValues as unknown as ReturnType<typeof useClientContext>;
    expect(updated.email).toBe("test@example.com");
    expect(updated.error).toBe("Some error");
    expect(updated.successMessage).toBe("Success!");
    expect(updated.clientFormsStatus).toEqual({
      YSQ: true,
      BECKS: false,
    });
  });
});
