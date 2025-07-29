import { isRouteErrorResponse, useRouteError } from "react-router-dom";

export default function RouteError() {
  const err = useRouteError();

  let title = "Something went wrong";
  let message = "An unexpected error occurred. Please try again.";

  if (isRouteErrorResponse(err)) {
    title = `${err.status} ${err.statusText}`;
    message = (err.data as any)?.message || message;
  }

  return (
    <div className="overlay">
      <div className="modal" role="alertdialog" aria-modal="true">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="mb-2 text-left">{message}</p>
      </div>
    </div>
  );
}
