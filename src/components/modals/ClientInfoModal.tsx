type Props = {
  name: string;
  dob: string;
  error: string;
  errorFading: boolean;
  onNameChange: (val: string) => void;
  onDobChange: (val: string) => void;
  onSubmit: () => void;
};

export default function ClientInfoModal({
  name,
  dob,
  error,
  errorFading,
  onNameChange,
  onDobChange,
  onSubmit,
}: Props) {
  return (
    <div className="overlay">
      <dialog open className="modal">
        <h2 className="text-xl font-bold mb-4">Your information</h2>

        <div className="mb-2">
          <label className="block font-medium text-left ml-1">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-2">
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

        {/* Reserve space and fade error */}
        <p
          className={`mt-2 min-h-[2rem] text-red-600 font-bold text-center transition-opacity duration-500 ${
            error ? (errorFading ? "opacity-0" : "opacity-100") : "opacity-0"
          }`}
        >
          {error || "\u00A0"}
        </p>

        <button
          onClick={onSubmit}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </dialog>
    </div>
  );
}
