import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import Modal from "../components/Modal";

export default function RouteError() {
  const err = useRouteError();

  let title = "Something went wrong";
  let message = "An unexpected error occurred. Please try again.";

  if (isRouteErrorResponse(err)) {
    title = `${err.status} ${err.statusText}`;
    if (typeof err.data === "string") {
      message = err.data || message;
    } else if (err.data && typeof (err.data as any).message === "string") {
      message = (err.data as any).message || message;
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
