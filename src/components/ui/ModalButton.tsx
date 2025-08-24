type ModalType = "remove" | "deactivate" | "activate";

type ModalButtonProps = {
  modalType: ModalType;
  label: string;
  disabled?: boolean;
  onClick: (type: ModalType) => void;
};

export default function ModalButton({
  modalType,
  label,
  disabled = false,
  onClick,
}: ModalButtonProps) {
  return (
    <button
      className={`link ${disabled ? "disabled" : ""}`}
      onClick={() => onClick(modalType)}
      disabled={disabled}
    >
      {label}
    </button>
  );
}
