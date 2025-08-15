import Modal from "../Modal";

type Props = {
  onConfirm: () => void;
  onCancel: () => void;
  closing: boolean;
  onCloseFinished: () => void;
};

export default function RevokeConfirmModal({
  onConfirm,
  onCancel,
  closing,
  onCloseFinished,
}: Props) {
  return (
    <Modal
      closing={closing}
      onCloseFinished={onCloseFinished}
      ariaLabelledBy="revoke-title"
      role="dialog"
      onOverlayClick={onCancel}
    >
      <div>
        <h2 id="revoke-title" className="text-xl font-bold mb-4">
          Confirm Revoke
        </h2>

        <p className="mb-4">Are you sure you want to revoke this form?</p>

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
      </div>
    </Modal>
  );
}
