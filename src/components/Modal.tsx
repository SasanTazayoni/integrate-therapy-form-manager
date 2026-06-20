import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { FocusTrap } from "focus-trap-react";

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
  const modalRef = useRef<HTMLDivElement>(null);

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

  const modalRoot = document.getElementById("modal-root");
  if (!modalRoot) {
    throw new Error("Modal requires a #modal-root element in the DOM");
  }

  return ReactDOM.createPortal(
    <FocusTrap focusTrapOptions={{ fallbackFocus: () => modalRef.current! }}>
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
          ref={modalRef}
          tabIndex={-1}
          className={`modal ${className}`}
          role={role}
          aria-modal="true"
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </FocusTrap>,
    modalRoot
  );
}
