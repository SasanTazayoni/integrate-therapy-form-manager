import React from "react";
import ReactDOM from "react-dom";

type Props = {
  children: React.ReactNode;
  closing?: boolean;
  ariaLabelledBy: string;
  ariaDescribedBy?: string;
  role?: React.AriaRole;
};

export default function Modal({
  children,
  closing = false,
  ariaLabelledBy,
  ariaDescribedBy,
  role = "dialog",
}: Props) {
  const modal = (
    <div className={`overlay ${closing ? "fade-out" : ""}`} aria-hidden={false}>
      <div
        className="modal"
        role={role}
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
      >
        {children}
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.getElementById("modal-root")!);
}
