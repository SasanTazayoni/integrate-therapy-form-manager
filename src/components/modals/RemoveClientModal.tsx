import Modal from "../Modal";

type Props = {
  closing: boolean;
  onCancel: () => void;
  onCloseFinished: () => void;
};

export default function RemoveClientModal({
  closing,
  onCancel,
  onCloseFinished,
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
          Confirm Removal
        </h2>

        <p className="mb-4">
          This client and all their details will be permanently removed. Are you
          absolutely sure you want to delete this client data?
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => {}}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Confirm
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
