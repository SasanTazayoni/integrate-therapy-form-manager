import Modal from "../Modal";

type Props = {
  closing: boolean;
  onCancel: () => void;
  onCloseFinished: () => void;
  onConfirm: () => void;
};

export default function ActivateClientModal({
  closing,
  onCancel,
  onCloseFinished,
  onConfirm,
}: Props) {
  return (
    <Modal
      closing={closing}
      onCloseFinished={onCloseFinished}
      ariaLabelledBy="activate-client-title"
      role="dialog"
      onOverlayClick={onCancel}
    >
      <div>
        <h2 id="activate-client-title" className="text-xl font-bold mb-4">
          Confirm Activation
        </h2>

        <p className="mb-4">
          This client will be <strong>activated</strong>. They will regain
          access to log in and submit forms. Are you sure you want to activate
          this client?
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Activate
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
