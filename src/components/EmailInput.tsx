import { Loader2 } from "lucide-react";

type Props = {
  email: string;
  setEmail: (email: string) => void;
  successMessage?: string;
  error: string;
  setError: (error: string) => void;
  showAddClientPrompt?: boolean;
  setShowAddClientPrompt: (show: boolean) => void;
  onConfirmAddClient?: () => void;
  loading: boolean;
};

export default function EmailInput({
  email,
  setEmail,
  successMessage,
  error,
  setError,
  showAddClientPrompt = false,
  setShowAddClientPrompt,
  onConfirmAddClient,
  loading,
}: Props) {
  return (
    <>
      <input
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setError("");
          setShowAddClientPrompt(false);
        }}
        placeholder="Enter client email"
        className={`w-full p-2 border rounded mb-2 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />

      <div className="min-h-[2.5rem] text-center text-sm font-bold">
        {loading && !error && !successMessage && (
          <div className="text-blue-600 flex justify-center items-center gap-2">
            <Loader2 className="animate-spin h-4 w-4" />
            <span>Loading...</span>
          </div>
        )}

        {error && <p className="text-red-600 inline">{error}</p>}

        {!error && successMessage && (
          <p className="text-green-600 inline">{successMessage}</p>
        )}

        {!loading && showAddClientPrompt && onConfirmAddClient && (
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
