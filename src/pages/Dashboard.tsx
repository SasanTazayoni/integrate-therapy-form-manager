import { useState, useCallback } from "react";
import ProtectedAccess from "../components/ProtectedAccess";
import EmailInput from "../components/EmailInput";
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
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [clientFormsStatus, setClientFormsStatus] =
    useState<ClientFormsStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddClientPrompt, setShowAddClientPrompt] = useState(false);
  const [confirmedEmail, setConfirmedEmail] = useState<string | null>(null);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setError("");
    setShowAddClientPrompt(false);
  };

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
        setSuccessMessage("");
        return;
      }

      setError("");
      setSuccessMessage("Client added successfully");
      setShowAddClientPrompt(false);
      setClientFormsStatus(data);
    } catch {
      setError("Network error, could not add client.");
      setSuccessMessage("");
    }
  };

  const handleCheckProgress = useCallback(async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Input cannot be empty");
      setSuccessMessage("");
      setShowAddClientPrompt(false);
      return;
    }

    if (!validateEmail(normalizedEmail)) {
      setError("This email is not valid");
      setSuccessMessage("");
      setShowAddClientPrompt(false);
      return;
    }

    if (confirmedEmail !== normalizedEmail) {
      setSuccessMessage("");
      setConfirmedEmail(null);
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `/clients/form-status?email=${encodeURIComponent(normalizedEmail)}`
      );
      const data = await response.json();

      if (!response.ok) {
        if (data.error === "Client not found") {
          setError("No data for this email - add to database?");
          setSuccessMessage("");
          setConfirmedEmail(null);
          setShowAddClientPrompt(true);
          setClientFormsStatus(null);
        } else {
          setError(data.error || "Failed to fetch progress");
          setSuccessMessage("");
          setConfirmedEmail(null);
          setShowAddClientPrompt(false);
          setClientFormsStatus(null);
        }
      } else {
        setClientFormsStatus(data);
        setShowAddClientPrompt(false);
        setError("");
        setSuccessMessage(`Retrieved data successfully for ${normalizedEmail}`);
        setConfirmedEmail(normalizedEmail);
      }
    } catch {
      setError("Network error, please try again");
      setSuccessMessage("");
      setConfirmedEmail(null);
      setClientFormsStatus(null);
      setShowAddClientPrompt(false);
    } finally {
      setLoading(false);
    }
  }, [email, confirmedEmail]);

  const handleClear = () => {
    setEmail("");
    setClientFormsStatus(null);
    setError("");
    setSuccessMessage("");
    setConfirmedEmail(null);
    setShowAddClientPrompt(false);
  };

  const handleSendForm = useCallback(
    async (formType: string) => {
      if (loading) return;

      try {
        const response = await fetch(`/forms/send-token/${formType}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(`${data.error || `Failed to send ${formType} form`}`);
          setSuccessMessage("");
        } else {
          setError("");
          setSuccessMessage(`${formType} form sent successfully!`);
          await handleCheckProgress();
        }
      } catch {
        setError(`Network error while sending ${formType} form.`);
        setSuccessMessage("");
      }
    },
    [email, handleCheckProgress, loading]
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
          setEmail={handleEmailChange}
          successMessage={successMessage}
          setSuccessMessage={setSuccessMessage}
          error={error}
          setError={setError}
          loading={loading}
          showAddClientPrompt={showAddClientPrompt}
          setShowAddClientPrompt={setShowAddClientPrompt}
          onConfirmAddClient={handleConfirmAddClient}
        />

        <EmailSearchControls
          onCheck={handleCheckProgress}
          onClear={handleClear}
          loading={loading}
        />

        <FormButtons
          clientFormsStatus={clientFormsStatus}
          onSend={handleSendForm}
        />
      </div>
    </ProtectedAccess>
  );
}
