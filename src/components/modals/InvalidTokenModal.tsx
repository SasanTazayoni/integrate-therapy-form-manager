import { useEffect, useRef } from "react";
import ReactDOM from "react-dom";

type Props = {
  title?: string;
  message: string;
};

export default function InvalidTokenModal({
  title = "Invalid form token",
  message,
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
        aria-labelledby="invalid-token-title"
        aria-describedby="invalid-token-desc"
      >
        <h2
          id="invalid-token-title"
          className="text-xl font-bold mb-4 outline-none"
          tabIndex={-1}
          ref={headingRef}
        >
          {title}
        </h2>
        <p id="invalid-token-desc" className="mb-2 text-left">
          {message}
        </p>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.getElementById("modal-root")!);
}
