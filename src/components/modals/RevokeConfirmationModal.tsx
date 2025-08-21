import Modal from "../Modal";
import Button from "../ui/Button";

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
      ariaDescribedBy="revoke-desc"
      role="dialog"
      onOverlayClick={onCancel}
    >
      <div>
        <h2 id="revoke-title" className="text-xl font-bold mb-4">
          Confirm Revoke
        </h2>

        <p id="revoke-desc" className="mb-4">
          This action will deactivate the form sent to the client. Are you sure
          you want to revoke it?
        </p>

        <div className="flex justify-center">
          <Button variant="danger" onClick={onConfirm}>
            Revoke
          </Button>
          <Button onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </Modal>
  );
}
