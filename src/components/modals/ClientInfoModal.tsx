type Props = {
  name: string;
  dob: string;
  error?: string;
  onNameChange: (val: string) => void;
  onDobChange: (val: string) => void;
  onSubmit: () => void;
};

export default function ClientInfoModal({
  name,
  dob,
  onNameChange,
  onDobChange,
  onSubmit,
  error,
}: Props & { error?: string }) {
  return (
    <div className="overlay">
      <dialog open className="modal">
        <h2 className="text-xl font-bold mb-6">Your information</h2>

        <div className="mb-1">
          <label className="block font-medium text-left ml-1">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium text-left ml-1">
            Date of Birth
          </label>
          <input
            type="date"
            value={dob}
            onChange={(e) => onDobChange(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="min-h-[2.5rem] mb-2">
          {error && (
            <p className="text-red-600 font-bold text-center">{error}</p>
          )}
        </div>

        <button
          onClick={onSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </dialog>
    </div>
  );
}
