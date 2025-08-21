import Modal from "../Modal";
import Button from "../ui/Button";

type Props = {
  closing: boolean;
  onCancel: () => void;
  onCloseFinished: () => void;
  onConfirm: () => void;
};

export default function RemoveClientModal({
  closing,
  onCancel,
  onCloseFinished,
  onConfirm,
}: Props) {
  return (
    <Modal
      closing={closing}
      onCloseFinished={onCloseFinished}
      ariaLabelledBy="remove-client-title"
      ariaDescribedBy="remove-client-desc"
      role="dialog"
      onOverlayClick={onCancel}
    >
      <div>
        <h2 id="remove-client-title" className="text-xl font-bold mb-4">
          Confirm Deletion
        </h2>

        <p id="remove-client-desc" className="mb-4">
          This client and all their details will be <strong>permanently</strong>{" "}
          removed. Are you absolutely sure you want to delete the data?
        </p>

        <div className="flex justify-center">
          <Button variant="danger" onClick={onConfirm}>
            Confirm
          </Button>
          <Button onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </Modal>
  );
}
