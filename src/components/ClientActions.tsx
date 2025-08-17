import { useState } from "react";
import RemoveClientModal from "../components/modals/RemoveClientModal";

type ClientActionsProps = {
  disabled?: boolean;
  onDeleteClient: () => void;
  onDeactivateClient?: () => void;
};

export default function ClientActions({
  disabled = false,
  onDeleteClient,
  onDeactivateClient,
}: ClientActionsProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalClosing, setModalClosing] = useState(false);
  const [modalType, setModalType] = useState<"delete" | "deactivate" | null>(
    null
  );

  const openModal = (type: "delete" | "deactivate") => {
    if (!disabled) {
      setModalType(type);
      setModalOpen(true);
      setModalClosing(false);
    }
  };

  const handleCancel = () => setModalClosing(true);

  const handleCloseFinished = () => {
    setModalOpen(false);
    setModalClosing(false);
    setModalType(null);
  };

  const handleConfirm = () => {
    if (modalType === "delete") {
      onDeleteClient();
    } else if (modalType === "deactivate" && onDeactivateClient) {
      onDeactivateClient();
    }
    setModalClosing(true);
  };

  return (
    <div className="flex justify-center gap-12 mb-6">
      <button
        className={`link ${disabled ? "disabled" : ""}`}
        onClick={() => openModal("deactivate")}
        disabled={disabled}
      >
        Deactivate
      </button>

      <button
        className={`link ${disabled ? "disabled" : ""}`}
        onClick={() => openModal("delete")}
        disabled={disabled}
      >
        Remove
      </button>

      {modalOpen && modalType && (
        <RemoveClientModal
          closing={modalClosing}
          onCancel={handleCancel}
          onCloseFinished={handleCloseFinished}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
