import { useState, useCallback } from "react";
import ProtectedAccess from "../components/ProtectedAccess";
import EmailInput from "../components/EmailInput";
import AddClientPrompt from "../components/AddClientPrompt";
import FormButtons from "../components/FormButtons";
import EmailSearchControls from "../components/EmailSearchControls";

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
  const [showAddClientPrompt, setShowAddClientPrompt] = useState(false);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleConfirmAddClient = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const response = await fetch("/clients/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to add client");
        return;
      }

      setError("");
      setShowAddClientPrompt(false);
      setClientFormsStatus(data);
      setSendStatus("✅ Client added successfully");
    } catch {
      setError("Network error, could not add client.");
    }
  };

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
        if (data.error === "Client not found") {
          setClientFormsStatus(null);
          setError("There is no data for this email currently.");
          setShowAddClientPrompt(true);
        } else {
          setError(data.error || "Failed to fetch progress");
          setClientFormsStatus(null);
        }
      } else {
        setClientFormsStatus(data);
        setShowAddClientPrompt(false);
        setSendStatus("");
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

        {sendStatus && (
          <p className="text-center mb-4 font-medium">{sendStatus}</p>
        )}

        {showAddClientPrompt && (
          <AddClientPrompt
            onConfirm={handleConfirmAddClient}
            onCancel={() => {
              setShowAddClientPrompt(false);
              setEmail("");
              setError("");
            }}
          />
        )}

        <EmailSearchControls
          onCheck={handleCheckProgress}
          onClear={handleClear}
          loading={loading}
        />

        <FormButtons
          clientFormsStatus={clientFormsStatus}
          email={email}
          onSend={handleSendForm}
        />
      </div>
    </ProtectedAccess>
  );
}
