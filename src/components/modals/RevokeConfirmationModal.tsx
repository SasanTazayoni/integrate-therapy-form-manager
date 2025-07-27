import { useEffect, useRef } from "react";
import ReactDOM from "react-dom";

type Props = {
  onConfirm: () => void;
  onCancel: () => void;
  closing: boolean;
  revokeReason?: string;
  onRevokeReasonChange?: (val: string) => void;
};

export default function RevokeConfirmModal({
  onConfirm,
  onCancel,
  closing,
  revokeReason = "",
  onRevokeReasonChange,
}: Props) {
  const modalRef = useRef<HTMLDialogElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (e: MouseEvent) => {
    if (
      modalRef.current &&
      !modalRef.current.contains(e.target as Node) &&
      overlayRef.current?.contains(e.target as Node)
    ) {
      onCancel();
    }
  };

  const handleEscapeKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onCancel();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  const modal = (
    <div className={`overlay ${closing ? "fade-out" : ""}`} ref={overlayRef}>
      <dialog
        className="modal"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="revoke-title"
        open
      >
        <h2 id="revoke-title" className="text-xl font-bold mb-4">
          Confirm Revoke
        </h2>

        <p className="mb-4">Are you sure you want to revoke this form?</p>

        {onRevokeReasonChange && (
          <textarea
            placeholder="Optional reason for revoking..."
            value={revokeReason}
            onChange={(e) => onRevokeReasonChange(e.target.value)}
            className="mb-4 w-full p-2 border rounded resize-none"
          />
        )}

        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Revoke
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </dialog>
    </div>
  );

  return ReactDOM.createPortal(modal, document.getElementById("modal-root")!);
}
