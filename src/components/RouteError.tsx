import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import Modal from "../components/Modal";

function isErrorDataObject(data: unknown): data is { message: string } {
  return (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof (data as { message?: unknown }).message === "string"
  );
}

export default function RouteError() {
  const err = useRouteError();

  let title = "Something went wrong";
  let message = "An unexpected error occurred. Please try again.";

  if (isRouteErrorResponse(err)) {
    title = `${err.status} ${err.statusText}`;
    const data = err.data;

    if (typeof data === "string") {
      message = data || message;
    } else if (isErrorDataObject(data)) {
      message = data.message || message;
    }
  }

  return (
    <Modal
      role="alertdialog"
      ariaLabelledBy="route-error-title"
      ariaDescribedBy="route-error-desc"
    >
      <h2 id="route-error-title" className="text-xl font-bold mb-4">
        {title}
      </h2>
      <p id="route-error-desc" className="mb-2 text-left">
        {message}
      </p>
    </Modal>
  );
}
