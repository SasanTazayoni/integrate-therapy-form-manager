import { render } from "@testing-library/react";
import { describe, test, expect, vi, afterEach, beforeEach } from "vitest";
import InvalidTokenModal from "./InvalidTokenModal";

beforeEach(() => {
  let modalRoot = document.getElementById("modal-root");
  if (!modalRoot) {
    modalRoot = document.createElement("div");
    modalRoot.setAttribute("id", "modal-root");
    document.body.appendChild(modalRoot);
  }
  modalRoot.innerHTML = "";
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("InvalidTokenModal", () => {
  test("renders heading and description, and focuses heading", () => {
    const { container } = render(<InvalidTokenModal />, {
      container: document.getElementById("modal-root"),
    });

    const heading = container.querySelector("#invalid-token-title");
    expect(heading).toBeTruthy();
    expect(heading.textContent).toBe("Invalid Form");

    const description = container.querySelector("#invalid-token-desc");
    expect(description).toBeTruthy();
    expect(description.textContent).toBe(
      "This form is not available. Please contact your therapist to receive a new form."
    );

    expect(document.activeElement).toBe(heading);
  });
});
