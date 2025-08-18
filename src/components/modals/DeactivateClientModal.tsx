import Modal from "../Modal";

type Props = {
  closing: boolean;
  onCancel: () => void;
  onCloseFinished: () => void;
  onConfirm: () => void;
};

export default function DeactivateClientModal({
  closing,
  onCancel,
  onCloseFinished,
  onConfirm,
}: Props) {
  return (
    <Modal
      closing={closing}
      onCloseFinished={onCloseFinished}
      ariaLabelledBy="deactivate-client-title"
      role="dialog"
      onOverlayClick={onCancel}
    >
      <div>
        <h2 id="deactivate-client-title" className="text-xl font-bold mb-4">
          Confirm Deactivation
        </h2>

        <p className="mb-4">
          This client will be <strong>deactivated</strong>. They will no longer
          be able to log in or submit forms, but their data will remain in the
          system for 1 year. Are you sure you want to deactivate this client?
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
          >
            Deactivate
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
