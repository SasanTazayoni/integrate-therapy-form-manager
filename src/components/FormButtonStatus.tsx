type Props = {
  label: string;
  disabled: boolean;
  onClick: () => void;
};

export default function FormButtonStatus({ label, disabled, onClick }: Props) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`w-full px-4 py-2 rounded text-white font-medium transition-colors duration-200 ${
        disabled
          ? "bg-gray-300 cursor-not-allowed"
          : "bg-blue-500 hover:bg-blue-600"
      }`}
    >
      {label}
    </button>
  );
}
