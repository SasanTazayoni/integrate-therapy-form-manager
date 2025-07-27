import { Loader2 } from "lucide-react";

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
      disabled={disabled || loading}
      onClick={onClick}
      className={`px-4 py-2 rounded text-white w-[100px] flex justify-center items-center gap-2 ${
        disabled || loading
          ? "bg-gray-300 cursor-not-allowed"
          : "bg-blue-500 hover:bg-blue-600"
      }`}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin h-4 w-4" />
          Loading...
        </>
      ) : (
        label
      )}
    </button>
  );
}
