type Props = {
  email: string;
  setEmail: (email: string) => void;
  error: string;
  errorFadingOut: boolean;
  setError: (error: string) => void;
  setSendStatus: (status: string) => void;
  setErrorFadingOut: (val: boolean) => void;
  status?: string;
  showAddClientPrompt?: boolean;
  onConfirmAddClient?: () => void;
};

export default function EmailInput({
  email,
  setEmail,
  error,
  errorFadingOut,
  setError,
  setSendStatus,
  setErrorFadingOut,
  status,
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
          setSendStatus("");
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
        <p className="text-red-600 font-bold inline">{error || "\u00A0"}</p>

        {showAddClientPrompt && onConfirmAddClient && (
          <button
            onClick={onConfirmAddClient}
            className="ml-3 w-7 h-7 inline-flex items-center justify-center bg-green-500 text-white rounded hover:bg-green-600 shadow-sm"
            title="Add client"
          >
            ✓
          </button>
        )}
      </div>

      {status && !error && (
        <p className="text-green-600 text-sm mb-4 text-center font-medium">
          {status}
        </p>
      )}
    </>
  );
}
