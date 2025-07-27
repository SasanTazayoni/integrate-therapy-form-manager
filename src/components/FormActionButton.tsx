type Props = {
  label: string;
  disabled: boolean;
  onClick: () => void;
};

export default function FormActionButton({ label, disabled, onClick }: Props) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`px-4 py-2 rounded text-white w-[100px] ${
        disabled
          ? "bg-gray-300 cursor-not-allowed"
          : "bg-blue-500 hover:bg-blue-600"
      }`}
    >
      {label}
    </button>
  );
}
