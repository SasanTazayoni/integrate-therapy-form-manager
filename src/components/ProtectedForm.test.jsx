import { fireEvent, render, waitFor } from "@testing-library/react";
import ProtectedForm from "./ProtectedForm";
import { beforeAll, describe, expect, test, vi } from "vitest";

describe("ProtectedForm", () => {
  beforeAll(() => {
    global.alert = vi.fn();
  });

  test("renders password prompt initially", () => {
    const { getByText } = render(
      <ProtectedForm>
        <div>Protected Content</div>
      </ProtectedForm>
    );
    expect(getByText("Enter Password")).toBeInTheDocument();
  });

  test("shows alert on incorrect password", () => {
    const { getByText, getByPlaceholderText } = render(
      <ProtectedForm>
        <div>Protected Content</div>
      </ProtectedForm>
    );
    fireEvent.change(getByPlaceholderText("Password"), {
      target: { value: "wrong" },
    });
    fireEvent.click(getByText("Access Form"));
    expect(global.alert).toHaveBeenCalledWith("Incorrect password");
  });

  test("shows children and removes overlay on correct password", async () => {
    const correctPassword = import.meta.env.VITE_FORM_PASSWORD;
    const { getByText, getByPlaceholderText, queryByText } = render(
      <ProtectedForm>
        <div>Protected Content</div>
      </ProtectedForm>
    );

    fireEvent.change(getByPlaceholderText("Password"), {
      target: { value: correctPassword },
    });
    fireEvent.click(getByText("Access Form"));

    await waitFor(() => {
      expect(queryByText("Enter Password")).not.toBeInTheDocument();
    });

    expect(getByText("Protected Content")).toBeInTheDocument();
  });
});
