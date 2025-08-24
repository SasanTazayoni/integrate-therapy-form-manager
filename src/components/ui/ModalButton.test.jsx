import { render, fireEvent } from "@testing-library/react";
import { describe, test, vi, expect } from "vitest";
import ModalButton from "./ModalButton";

describe("ModalButton", () => {
  test("renders with label", () => {
    const { getByRole } = render(
      <ModalButton modalType="remove" label="Delete" onClick={() => {}} />
    );

    const button = getByRole("button");
    expect(button.textContent).toBe("Delete");
  });

  test("calls onClick with modalType when clicked", () => {
    const onClickMock = vi.fn();
    const { getByRole } = render(
      <ModalButton
        modalType="deactivate"
        label="Deactivate"
        onClick={onClickMock}
      />
    );

    const button = getByRole("button");
    fireEvent.click(button);

    expect(onClickMock).toHaveBeenCalledWith("deactivate");
  });

  test("renders as disabled when disabled prop is true", () => {
    const { getByRole } = render(
      <ModalButton
        modalType="activate"
        label="Activate"
        disabled
        onClick={() => {}}
      />
    );

    const button = getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass("disabled");
  });
});
