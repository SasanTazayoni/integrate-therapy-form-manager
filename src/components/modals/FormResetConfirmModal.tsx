import { useRef } from "react";
import Modal from "../Modal";
import { useOutsideClickAndEscape } from "../../hooks/useOutsideClickAndEscape";

type Props = {
  onConfirm: () => void;
  onCancel: () => void;
  closing: boolean;
  onCloseFinished: () => void;
};

export default function FormResetConfirmModal({
  onConfirm,
  onCancel,
  closing,
  onCloseFinished,
}: Props) {
  const modalRef = useRef<HTMLDivElement>(null);

  useOutsideClickAndEscape(modalRef, onCancel);

  return (
    <Modal
      closing={closing}
      onCloseFinished={onCloseFinished}
      ariaLabelledBy="reset-title"
      role="dialog"
    >
      <div ref={modalRef}>
        <h2 id="reset-title" className="text-xl font-bold mb-4">
          Confirm Reset
        </h2>

        <p className="mb-4">Are you sure you want to erase your progress?</p>

        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Reset
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
