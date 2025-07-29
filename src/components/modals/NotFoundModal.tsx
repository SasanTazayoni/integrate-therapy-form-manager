import { useEffect, useRef } from "react";
import ReactDOM from "react-dom";

type Props = {
  title?: string;
  message?: string;
};

export default function NotFoundModal({
  title = "This page does not exist",
  message = "You seemed to have navigated to an unknown address. Please check your email for a valid form link.",
}: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const modal = (
    <div className="overlay" aria-hidden={false}>
      <div
        className="modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="not-found-title"
        aria-describedby="not-found-desc"
      >
        <h2
          id="not-found-title"
          className="text-xl font-bold mb-4 outline-none"
          tabIndex={-1}
          ref={headingRef}
        >
          {title}
        </h2>

        <p id="not-found-desc" className="mb-2 text-left">
          {message}
        </p>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.getElementById("modal-root")!);
}
