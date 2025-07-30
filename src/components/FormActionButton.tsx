type Props = {
  label: string;
  disabled: boolean;
  onClick: () => void;
  loading?: boolean;
};

export default function FormActionButton({
  label,
  disabled,
  onClick,
  loading = false,
}: Props) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      className={`px-4 py-2 rounded text-white w-[100px] flex justify-center items-center gap-2 ${
        disabled || loading
          ? "bg-gray-300 cursor-not-allowed"
          : "bg-blue-500 hover:bg-blue-600"
      }`}
      aria-disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {label}
    </button>
  );
}
