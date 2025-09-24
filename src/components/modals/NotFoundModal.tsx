import { useEffect, useRef } from "react";
import Modal from "../Modal";

type Props = {
  title?: string;
  message?: string;
};

export default function NotFoundModal({
  title = "This page does not exist",
  message = "You seemed to have navigated to an unknown page. Please check your email for a valid form link.",
}: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <Modal
      ariaLabelledBy="not-found-title"
      ariaDescribedBy="not-found-desc"
      role="alertdialog"
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
    </Modal>
  );
}
