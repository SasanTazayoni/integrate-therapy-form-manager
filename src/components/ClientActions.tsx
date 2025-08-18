import { useState } from "react";
import RemoveClientModal from "../components/modals/RemoveClientModal";
import DeactivateClientModal from "../components/modals/DeactivateClientModal";
import ActivateClientModal from "../components/modals/ActivateClientModal";

type ClientActionsProps = {
  disabled?: boolean;
  isInactive?: boolean;
  onDeleteClient: () => void;
  onDeactivateClient?: () => void;
  onActivateClient?: () => void;
};

export default function ClientActions({
  disabled = false,
  isInactive = false,
  onDeleteClient,
  onDeactivateClient,
  onActivateClient,
}: ClientActionsProps) {
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [removeModalClosing, setRemoveModalClosing] = useState(false);

  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [deactivateModalClosing, setDeactivateModalClosing] = useState(false);

  const [activateModalOpen, setActivateModalOpen] = useState(false);
  const [activateModalClosing, setActivateModalClosing] = useState(false);

  const handleRemoveCancel = () => setRemoveModalClosing(true);
  const handleRemoveCloseFinished = () => {
    setRemoveModalOpen(false);
    setRemoveModalClosing(false);
  };
  const handleRemoveConfirm = () => {
    onDeleteClient();
    setRemoveModalClosing(true);
  };

  const handleDeactivateCancel = () => setDeactivateModalClosing(true);
  const handleDeactivateCloseFinished = () => {
    setDeactivateModalOpen(false);
    setDeactivateModalClosing(false);
  };
  const handleDeactivateConfirm = () => {
    onDeactivateClient?.();
    setDeactivateModalClosing(true);
  };

  const handleActivateCancel = () => setActivateModalClosing(true);
  const handleActivateCloseFinished = () => {
    setActivateModalOpen(false);
    setActivateModalClosing(false);
  };
  const handleActivateConfirm = () => {
    onActivateClient?.();
    setActivateModalClosing(true);
  };

  return (
    <div className="flex justify-center gap-12 mb-6">
      {!isInactive && (
        <button
          className={`link ${disabled ? "disabled" : ""}`}
          onClick={() => setDeactivateModalOpen(true)}
          disabled={disabled}
        >
          Deactivate
        </button>
      )}

      {isInactive && (
        <button
          className={`link ${disabled ? "disabled" : ""}`}
          onClick={() => setActivateModalOpen(true)}
          disabled={disabled}
        >
          Activate
        </button>
      )}

      <button
        className={`link ${disabled ? "disabled" : ""}`}
        onClick={() => setRemoveModalOpen(true)}
        disabled={disabled}
      >
        Remove
      </button>

      {removeModalOpen && (
        <RemoveClientModal
          closing={removeModalClosing}
          onCancel={handleRemoveCancel}
          onCloseFinished={handleRemoveCloseFinished}
          onConfirm={handleRemoveConfirm}
        />
      )}

      {deactivateModalOpen && (
        <DeactivateClientModal
          closing={deactivateModalClosing}
          onCancel={handleDeactivateCancel}
          onCloseFinished={handleDeactivateCloseFinished}
          onConfirm={handleDeactivateConfirm}
        />
      )}

      {activateModalOpen && (
        <ActivateClientModal
          closing={activateModalClosing}
          onCancel={handleActivateCancel}
          onCloseFinished={handleActivateCloseFinished}
          onConfirm={handleActivateConfirm}
        />
      )}
    </div>
  );
}
