import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

type Props = {
  children: React.ReactNode;
  closing?: boolean;
  ariaLabelledBy: string;
  ariaDescribedBy?: string;
  role?: React.AriaRole;
  onCloseFinished?: () => void;
  onOverlayClick?: () => void;
  className?: string;
};

export default function Modal({
  children,
  closing = false,
  ariaLabelledBy,
  ariaDescribedBy,
  role = "dialog",
  onCloseFinished,
  onOverlayClick,
  className,
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
    <div
      className={overlayClass}
      aria-hidden={false}
      onClick={(e) => {
        if ((e.target as HTMLElement).classList.contains("overlay")) {
          onOverlayClick?.();
        }
      }}
    >
      <div
        className={`modal ${className}`}
        role={role}
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.getElementById("modal-root")!
  );
}
