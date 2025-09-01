import { render, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import Modal from "./Modal";

beforeEach(() => {
  // Ensure modal-root exists in DOM
  const modalRoot = document.createElement("div");
  modalRoot.setAttribute("id", "modal-root");
  document.body.appendChild(modalRoot);
});

afterEach(() => {
  const modalRoot = document.getElementById("modal-root");
  modalRoot?.remove();
  vi.useRealTimers();
});

describe("Modal", () => {
  test("renders inside the portal", () => {
    render(
      <Modal ariaLabelledBy="modal-title">
        <div>Content</div>
      </Modal>
    );

    const portalRoot = document.getElementById("modal-root");
    const modal = portalRoot.querySelector(".modal");

    expect(modal).toBeInTheDocument();
    expect(modal).toHaveTextContent("Content");
  });

  test("calls onOverlayClick when clicking on overlay", () => {
    const onOverlayClick = vi.fn();

    render(
      <Modal ariaLabelledBy="modal-title" onOverlayClick={onOverlayClick}>
        <div>Content</div>
      </Modal>
    );

    const portalRoot = document.getElementById("modal-root");
    const overlay = portalRoot.querySelector(".overlay");

    fireEvent.click(overlay);
    expect(onOverlayClick).toHaveBeenCalled();
  });

  test("does not call onOverlayClick when clicking inside modal content", () => {
    const onOverlayClick = vi.fn();

    render(
      <Modal ariaLabelledBy="modal-title" onOverlayClick={onOverlayClick}>
        <div data-testid="modal-content">Content</div>
      </Modal>
    );

    const portalRoot = document.getElementById("modal-root");
    const content = portalRoot.querySelector("[data-testid='modal-content']");

    fireEvent.click(content);
    expect(onOverlayClick).not.toHaveBeenCalled();
  });

  test("calls onCloseFinished after closing timeout", () => {
    vi.useFakeTimers();
    const onCloseFinished = vi.fn();

    render(
      <Modal
        ariaLabelledBy="modal-title"
        closing
        onCloseFinished={onCloseFinished}
      >
        <div>Content</div>
      </Modal>
    );

    vi.advanceTimersByTime(500);
    expect(onCloseFinished).toHaveBeenCalled();
  });

  test("applies fade-in and fade-out classes correctly", () => {
    const { rerender } = render(
      <Modal ariaLabelledBy="modal-title">
        <div>Content</div>
      </Modal>
    );

    const portalRoot = document.getElementById("modal-root");
    const overlay = portalRoot.querySelector(".overlay");

    expect(overlay).toHaveClass("overlay fade-in");

    // Rerender with closing
    rerender(
      <Modal ariaLabelledBy="modal-title" closing>
        <div>Content</div>
      </Modal>
    );

    expect(overlay).toHaveClass("overlay fade-out");
  });

  test("sets correct ARIA attributes", () => {
    render(
      <Modal
        ariaLabelledBy="modal-title"
        ariaDescribedBy="modal-desc"
        role="alertdialog"
      >
        <div>Content</div>
      </Modal>
    );

    const portalRoot = document.getElementById("modal-root");
    const modal = portalRoot.querySelector(".modal");

    expect(modal).toHaveAttribute("role", "alertdialog");
    expect(modal).toHaveAttribute("aria-labelledby", "modal-title");
    expect(modal).toHaveAttribute("aria-describedby", "modal-desc");
  });
});
