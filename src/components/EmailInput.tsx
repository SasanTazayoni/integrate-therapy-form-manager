type Props = {
  email: string;
  setEmail: (email: string) => void;
  error: string;
  errorFadingOut: boolean;
  setError: (error: string) => void;
  setErrorFadingOut: (val: boolean) => void;
  showAddClientPrompt?: boolean;
  onConfirmAddClient?: () => void;
};

export default function EmailInput({
  email,
  setEmail,
  error,
  errorFadingOut,
  setError,
  setErrorFadingOut,
  showAddClientPrompt = false,
  onConfirmAddClient,
}: Props) {
  return (
    <>
      <input
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setError("");
          setErrorFadingOut(false);
        }}
        placeholder="Enter client email"
        className={`w-full p-2 border rounded mb-2 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />

      <div
        className={`min-h-[2.5rem] text-center text-sm transition-opacity duration-500 ${
          error && !errorFadingOut ? "opacity-100" : "opacity-0"
        }`}
      >
        {error ? (
          <p className="text-red-600 font-bold inline">{error}</p>
        ) : showAddClientPrompt && onConfirmAddClient ? (
          <p className="text-green-600 font-medium inline">
            ✅ Client added successfully
          </p>
        ) : (
          <span className="inline-block">&nbsp;</span>
        )}

        {showAddClientPrompt && onConfirmAddClient && error && (
          <button
            onClick={onConfirmAddClient}
            className="ml-3 w-7 h-7 inline-flex items-center justify-center bg-green-500 text-white rounded hover:bg-green-600 shadow-sm"
            title="Add client"
          >
            ✓
          </button>
        )}
      </div>
    </>
  );
}
