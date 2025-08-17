import Modal from "../Modal";

type Props = {
  closing: boolean;
  onCancel: () => void;
  onCloseFinished: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

export default function RemoveClientModal({
  closing,
  onCancel,
  onCloseFinished,
  onConfirm,
  title = "Confirm Removal",
  message = "This client and all their details will be permanently removed. Are you absolutely sure you want to delete this client data?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
}: Props) {
  return (
    <Modal
      closing={closing}
      onCloseFinished={onCloseFinished}
      ariaLabelledBy="remove-client-title"
      role="dialog"
      onOverlayClick={onCancel}
    >
      <div>
        <h2 id="remove-client-title" className="text-xl font-bold mb-4">
          {title}
        </h2>

        <p className="mb-4">{message}</p>

        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
