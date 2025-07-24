type AddClientPromptProps = {
  onConfirm: () => void;
  onCancel: () => void;
};

export default function AddClientPrompt({
  onConfirm,
  onCancel,
}: AddClientPromptProps) {
  return (
    <div className="text-center text-sm mt-2">
      <p className="text-red-500 font-medium">
        There is no data for this email currently.
      </p>
      <div className="mt-2 flex justify-center items-center gap-4">
        <span className="text-gray-700">Add to database?</span>
        <button
          onClick={onConfirm}
          className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
        >
          ✅
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-500"
        >
          ❌
        </button>
      </div>
    </div>
  );
}
