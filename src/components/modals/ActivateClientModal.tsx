import Modal from "../Modal";
import Button from "../ui/Button";

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
  function handleConfirm() {
    onConfirm();
  }

  function handleCancel() {
    onCancel();
  }

  return (
    <Modal
      closing={closing}
      onCloseFinished={onCloseFinished}
      ariaLabelledBy="activate-client-title"
      role="dialog"
      onOverlayClick={handleCancel}
    >
      <div>
        <h2 id="activate-client-title" className="text-xl font-bold mb-4">
          Confirm Activation
        </h2>

        <p className="mb-4">
          This client will be <strong>activated</strong>. They will regain
          access to forms and will no longer be pending deletion. Are you sure
          you want to activate this client?
        </p>

        <div className="flex justify-center">
          <Button onClick={handleConfirm}>Activate</Button>
          <Button variant="danger" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
