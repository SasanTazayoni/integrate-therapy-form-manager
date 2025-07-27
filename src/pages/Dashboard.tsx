import { useState, useCallback } from "react";
import ProtectedAccess from "../components/ProtectedAccess";
import EmailInput from "../components/EmailInput";
import FormButtons from "../components/FormButtons";
import EmailSearchControls from "../components/EmailSearchControls";
import { fetchClientStatus, addClient } from "../api/clientsFrontend";
import { sendFormToken, revokeFormToken } from "../api/formsFrontend";
import validateEmail from "../utils/validators";
import truncateEmail from "../utils/truncateEmail";

type FormStatus = {
  submitted: boolean;
  activeToken: boolean;
  submittedAt?: string;
  tokenCreatedAt?: string;
  tokenExpiresAt?: string;
  revokedAt?: string;
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

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setError("");
    setShowAddClientPrompt(false);
  };

  const handleConfirmAddClient = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    const { ok, data } = await addClient(normalizedEmail);

    if (!ok) {
      setError(data.error || "Failed to add client");
      setSuccessMessage("");
      return;
    }

    setError("");
    setSuccessMessage("Client added successfully");
    setShowAddClientPrompt(false);
    await handleCheckProgress();
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

    const { ok, data } = await fetchClientStatus(normalizedEmail);

    if (!ok) {
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
      setSuccessMessage(
        `Retrieved data successfully for ${truncateEmail(normalizedEmail)}`
      );
      setConfirmedEmail(normalizedEmail);
    }

    setLoading(false);
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
      if (!clientFormsStatus) return;

      const normalizedEmail = email.trim().toLowerCase();

      setClientFormsStatus((prev) => ({
        ...prev!,
        forms: {
          ...prev!.forms,
          [formType]: {
            ...prev!.forms[formType],
            activeToken: true,
          },
        },
      }));

      const { ok, data } = await sendFormToken(normalizedEmail, formType);

      if (!ok) {
        setClientFormsStatus((prev) => ({
          ...prev!,
          forms: {
            ...prev!.forms,
            [formType]: {
              ...prev!.forms[formType],
              activeToken: false,
            },
          },
        }));
        setError(data.error || `Failed to send ${formType} form`);
        setSuccessMessage("");
      } else {
        const { ok: fetchOk, data: updatedStatus } = await fetchClientStatus(
          normalizedEmail
        );
        if (fetchOk) {
          setClientFormsStatus(updatedStatus);
        } else {
          console.warn("Form sent, but failed to refresh client status");
        }
      }
    },
    [email, clientFormsStatus]
  );

  const handleRevokeForm = useCallback(
    async (formType: string) => {
      if (!clientFormsStatus) return;

      const normalizedEmail = email.trim().toLowerCase();

      setClientFormsStatus((prev) => ({
        ...prev!,
        forms: {
          ...prev!.forms,
          [formType]: {
            ...prev!.forms[formType],
            activeToken: false,
          },
        },
      }));

      const { ok, data } = await revokeFormToken(normalizedEmail, formType);

      if (!ok) {
        setClientFormsStatus((prev) => ({
          ...prev!,
          forms: {
            ...prev!.forms,
            [formType]: {
              ...prev!.forms[formType],
              activeToken: true,
            },
          },
        }));
        setError(data.error || `Failed to revoke ${formType} form`);
        setSuccessMessage("");
      } else {
        setClientFormsStatus((prev) => ({
          ...prev!,
          forms: {
            ...prev!.forms,
            [formType]: {
              ...prev!.forms[formType],
              revokedAt: data.revokedAt ?? null,
              activeToken: false,
            },
          },
        }));
      }
    },
    [email, clientFormsStatus]
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
          onRevoke={handleRevokeForm}
          onRetrieve={(formType) => console.log("Retrieve", formType)}
        />
      </div>
    </ProtectedAccess>
  );
}
