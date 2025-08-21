import Modal from "../Modal";
import Button from "../ui/Button";

type Props = {
  onConfirm: () => void;
  onCancel: () => void;
  closing: boolean;
  onCloseFinished: () => void;
};

export default function FormResetModal({
  onConfirm,
  onCancel,
  closing,
  onCloseFinished,
}: Props) {
  return (
    <Modal
      closing={closing}
      onCloseFinished={onCloseFinished}
      ariaLabelledBy="reset-title"
      role="dialog"
      onOverlayClick={onCancel}
    >
      <div>
        <h2 id="reset-title" className="text-xl font-bold mb-4">
          Confirm Reset
        </h2>

        <p className="mb-4">Are you sure you want to reset your progress?</p>

        <div className="flex justify-center">
          <Button variant="danger" onClick={onConfirm}>
            Reset
          </Button>
          <Button onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </Modal>
  );
}
