import { render } from "@testing-library/react";
import { describe, test, expect, vi, afterEach, beforeEach } from "vitest";
import NotFoundModal from "./NotFoundModal";

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

describe("NotFoundModal", () => {
  test("renders default title and message and focuses heading", () => {
    const { container } = render(<NotFoundModal />, {
      container: document.getElementById("modal-root"),
    });

    const heading = container.querySelector("#not-found-title");
    expect(heading).toBeTruthy();
    expect(heading.textContent).toBe("This page does not exist");

    const description = container.querySelector("#not-found-desc");
    expect(description).toBeTruthy();
    expect(description.textContent).toBe(
      "You seemed to have navigated to an unknown page. Please check your email for a valid form link."
    );

    expect(document.activeElement).toBe(heading);
  });

  test("renders custom title and message", () => {
    const customTitle = "Page Not Found!";
    const customMessage = "Custom message for testing.";

    const { container } = render(
      <NotFoundModal title={customTitle} message={customMessage} />,
      {
        container: document.getElementById("modal-root"),
      }
    );

    const heading = container.querySelector("#not-found-title");
    expect(heading).toBeTruthy();
    expect(heading.textContent).toBe(customTitle);

    const description = container.querySelector("#not-found-desc");
    expect(description).toBeTruthy();
    expect(description.textContent).toBe(customMessage);

    expect(document.activeElement).toBe(heading);
  });
});
