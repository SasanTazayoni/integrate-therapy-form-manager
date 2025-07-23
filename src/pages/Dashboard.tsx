import { useState, useCallback } from "react";
import ProtectedAccess from "../components/ProtectedAccess";
import EmailInput from "../components/EmailInput";
import FormStatusButton from "../components/FormStatusButton";

type FormStatus = {
  submitted: boolean;
  activeToken: boolean;
};

type ClientFormsStatus = {
  exists: boolean;
  forms: Record<string, FormStatus>;
  formsCompleted?: number;
};

export default function Dashboard() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [errorFadingOut, setErrorFadingOut] = useState(false);
  const [clientFormsStatus, setClientFormsStatus] =
    useState<ClientFormsStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [sendStatus, setSendStatus] = useState("");

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleCheckProgress = useCallback(async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Input cannot be empty");
      setErrorFadingOut(false);
      return;
    }

    if (!validateEmail(normalizedEmail)) {
      setError("This email is not valid");
      setErrorFadingOut(false);
      return;
    }

    setError("");
    setSendStatus("");
    setErrorFadingOut(false);
    setLoading(true);

    try {
      const response = await fetch(
        `/clients/form-status?email=${encodeURIComponent(normalizedEmail)}`
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to fetch progress");
        setClientFormsStatus(null);
      } else {
        setClientFormsStatus(data);
      }
    } catch {
      setError("Network error, please try again");
      setClientFormsStatus(null);
    } finally {
      setLoading(false);
    }
  }, [email]);

  const handleClear = () => {
    setEmail("");
    setClientFormsStatus(null);
    setSendStatus("");

    if (error) {
      setErrorFadingOut(true);
      setTimeout(() => {
        setError("");
        setErrorFadingOut(false);
      }, 500);
    }
  };

  const handleSendForm = useCallback(
    async (formType: string) => {
      setSendStatus("");

      try {
        const response = await fetch(`/forms/send-token/${formType}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        });

        const data = await response.json();

        if (!response.ok) {
          setSendStatus(
            `❌ ${data.error || `Failed to send ${formType} form`}`
          );
        } else {
          setSendStatus(`✅ ${formType} form sent successfully!`);
          await handleCheckProgress();
        }
      } catch {
        setSendStatus(`❌ Network error while sending ${formType} form.`);
      }
    },
    [email, handleCheckProgress]
  );

  return (
    <ProtectedAccess>
      <div className="p-6 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Integrate Therapy Form Manager
        </h1>

        <label className="block mb-2 text-sm font-medium text-center">
          {clientFormsStatus
            ? `Client Email — Forms completed: ${
                clientFormsStatus.formsCompleted ?? 0
              } / 4`
            : "Please enter client email to check the progress"}
        </label>

        <EmailInput
          email={email}
          setEmail={setEmail}
          error={error}
          errorFadingOut={errorFadingOut}
          setError={setError}
          setSendStatus={setSendStatus}
          setErrorFadingOut={setErrorFadingOut}
        />

        <p
          className="text-red-600 text-sm mb-4 text-center font-bold min-h-[1.25rem] transition-opacity duration-500"
          style={{ opacity: error && !errorFadingOut ? 1 : 0 }}
        >
          {error || "\u00A0"}
        </p>

        {sendStatus && (
          <p className="text-center mb-4 font-medium">{sendStatus}</p>
        )}

        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={handleCheckProgress}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "Checking..." : "Check"}
          </button>
          <button
            onClick={handleClear}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            disabled={loading}
          >
            Clear
          </button>
        </div>

        <div className="grid gap-2">
          {["YSQ", "SMI", "BECKS", "BURNS"].map((formType) => {
            const status = clientFormsStatus?.forms?.[formType];
            const disabled = Boolean(
              !clientFormsStatus?.exists ||
                status?.submitted ||
                status?.activeToken
            );

            const title = !clientFormsStatus?.exists
              ? "Client not found"
              : status?.submitted
              ? "Form already submitted"
              : status?.activeToken
              ? "Active token already sent"
              : "";

            return (
              <FormStatusButton
                key={formType}
                formType={formType}
                disabled={disabled}
                title={title}
                onSend={handleSendForm}
              />
            );
          })}
        </div>
      </div>
    </ProtectedAccess>
  );
}
