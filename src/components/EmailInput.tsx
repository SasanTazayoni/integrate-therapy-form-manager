type Props = {
  email: string;
  setEmail: (email: string) => void;
  error: string;
  errorFadingOut: boolean;
  setError: (error: string) => void;
  setSendStatus: (status: string) => void;
  setErrorFadingOut: (val: boolean) => void;
  status?: string;
  addClientPrompt?: React.ReactNode;
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
  addClientPrompt,
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
        className={`w-full p-2 border rounded mb-1 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />
      <p
        className={`text-red-600 text-sm mb-4 text-center font-bold min-h-[1.25rem] transition-opacity duration-500`}
        style={{ opacity: error && !errorFadingOut ? 1 : 0 }}
      >
        {error || "\u00A0"}
      </p>
      {status && !error && (
        <p className="text-green-600 text-sm mb-4 text-center font-medium"></p>
      )}
      {addClientPrompt && <div className="mt-2">{addClientPrompt}</div>}
    </>
  );
}
