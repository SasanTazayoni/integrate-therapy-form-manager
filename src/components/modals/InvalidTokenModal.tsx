import { useEffect, useRef } from "react";
import Modal from "../Modal";

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

  return (
    <Modal
      ariaLabelledBy="invalid-token-title"
      ariaDescribedBy="invalid-token-desc"
      role="alertdialog"
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
    </Modal>
  );
}
