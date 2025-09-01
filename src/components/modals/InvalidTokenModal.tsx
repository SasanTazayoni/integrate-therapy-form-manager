import { useEffect, useRef } from "react";
import Modal from "../Modal";

export default function InvalidTokenModal() {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <Modal
      ariaLabelledBy="invalid-token-title"
      ariaDescribedBy="invalid-token-desc"
      role="alertdialog"
      data-testid="invalid-modal"
    >
      <h2
        id="invalid-token-title"
        className="text-xl font-bold mb-4 outline-none"
        tabIndex={-1}
        ref={headingRef}
      >
        Invalid Form
      </h2>
      <p id="invalid-token-desc" className="mb-2 text-left">
        This form is not available. Please contact your therapist to receive a
        new form.
      </p>
    </Modal>
  );
}
