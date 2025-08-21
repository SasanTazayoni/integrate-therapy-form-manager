import Modal from "../Modal";
import Button from "../ui/Button";

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

        <div className="flex justify-center">
          <Button onClick={onConfirm}>Deactivate</Button>
          <Button variant="danger" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
