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
  loading: boolean;
};

type ModalType = "remove" | "deactivate" | "activate" | null;

export default function ClientActions({
  disabled = false,
  isInactive = false,
  onDeleteClient,
  onDeactivateClient,
  onActivateClient,
  loading,
}: ClientActionsProps) {
  const [modal, setModal] = useState<{ type: ModalType; closing: boolean }>({
    type: null,
    closing: false,
  });

  const openModal = (type: Exclude<ModalType, null>) =>
    setModal({ type, closing: false });
  const cancelModal = () => {
    let result = false;
    setModal((prev) => {
      if (prev.type) {
        result = true;
        return { ...prev, closing: true };
      }
      return prev;
    });
    return result;
  };
  const closeModalFinished = () => setModal({ type: null, closing: false });
  const confirmModal = () => {
    let result = false;

    if (modal.type === "remove") onDeleteClient();
    if (modal.type === "deactivate") onDeactivateClient?.();
    if (modal.type === "activate") onActivateClient?.();

    setModal((prev) => {
      if (prev.type) {
        result = true;
        return { ...prev, closing: true };
      }
      return prev;
    });

    return result;
  };

  const modalMap = {
    remove: RemoveClientModal,
    deactivate: DeactivateClientModal,
    activate: ActivateClientModal,
  } as const;

  const ActiveModal = modal.type ? modalMap[modal.type] : null;

  const ModalButton = ({
    modalType,
    label,
  }: {
    modalType: Exclude<ModalType, null>;
    label: string;
  }) => (
    <button
      className={`link ${disabled ? "disabled" : ""}`}
      onClick={() => openModal(modalType)}
      disabled={disabled || loading}
      data-testid={`modal-button-${modalType}`}
    >
      {label}
    </button>
  );

  return (
    <div
      data-testid="client-actions-wrapper"
      className="flex justify-center gap-4"
      data-modal-type={modal.type ?? ""}
      data-modal-closing={modal.closing.toString()}
    >
      <div className="flex justify-center gap-4">
        {!isInactive && (
          <ModalButton modalType="deactivate" label="Deactivate" />
        )}
        {isInactive && <ModalButton modalType="activate" label="Activate" />}
        <ModalButton modalType="remove" label="Delete" />

        {ActiveModal && (
          <ActiveModal
            closing={modal.closing}
            onCancel={cancelModal}
            onCloseFinished={closeModalFinished}
            onConfirm={confirmModal}
          />
        )}
      </div>
    </div>
  );
}
