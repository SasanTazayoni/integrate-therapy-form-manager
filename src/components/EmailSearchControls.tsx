export default function EmailSearchControls({
  onCheck,
  onClear,
  loading,
}: {
  onCheck: () => void;
  onClear: () => void;
  loading: boolean;
}) {
  return (
    <div className="flex justify-center gap-4 mb-6">
      <button
        onClick={onCheck}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? "Checking..." : "Check"}
      </button>
      <button
        onClick={onClear}
        className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
        disabled={loading}
      >
        Clear
      </button>
    </div>
  );
}
