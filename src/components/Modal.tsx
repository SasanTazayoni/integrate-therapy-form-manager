import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

type Props = {
  children: React.ReactNode;
  closing?: boolean;
  ariaLabelledBy: string;
  ariaDescribedBy?: string;
  role?: React.AriaRole;
  onCloseFinished?: () => void;
};

export default function Modal({
  children,
  closing = false,
  ariaLabelledBy,
  ariaDescribedBy,
  role = "dialog",
  onCloseFinished,
}: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  useEffect(() => {
    if (closing) {
      const timeout = setTimeout(() => {
        onCloseFinished?.();
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [closing, onCloseFinished]);

  const overlayClass =
    visible && !closing ? "overlay fade-in" : "overlay fade-out";

  return ReactDOM.createPortal(
    <div className={overlayClass} aria-hidden={false}>
      <div
        className="modal"
        role={role}
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
      >
        {children}
      </div>
    </div>,
    document.getElementById("modal-root")!
  );
}
