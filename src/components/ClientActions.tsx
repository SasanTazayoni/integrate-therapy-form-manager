import { useState } from "react";
import RemoveClientConfirmModal from "../components/modals/RemoveClientModal";

type ClientActionsProps = {
  disabled?: boolean;
};

export default function ClientActions({
  disabled = false,
}: ClientActionsProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalClosing, setModalClosing] = useState(false);

  const handleRemoveClick = () => {
    if (!disabled) {
      setModalOpen(true);
    }
  };

  const handleCancel = () => {
    setModalClosing(true);
  };

  const handleCloseFinished = () => {
    setModalOpen(false);
    setModalClosing(false);
  };

  return (
    <div className="flex justify-center gap-12 mb-6">
      <button
        className={`link ${disabled ? "disabled" : ""}`}
        onClick={() => console.log("Deactivate client clicked")}
        disabled={disabled}
      >
        Deactivate
      </button>

      <button
        className={`link ${disabled ? "disabled" : ""}`}
        onClick={handleRemoveClick}
        disabled={disabled}
      >
        Remove
      </button>

      {modalOpen && (
        <RemoveClientConfirmModal
          closing={modalClosing}
          onCancel={handleCancel}
          onCloseFinished={handleCloseFinished}
        />
      )}
    </div>
  );
}
