import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import ProtectedAccess from "../components/ProtectedAccess";
import EmailInput from "../components/EmailInput";
import FormButtons from "../components/FormButtons";
import EmailSearchControls from "../components/EmailSearchControls";
import RevokeConfirmModal from "../components/modals/RevokeConfirmationModal";
import { fetchClientStatus, addClient } from "../api/clientsFrontend";
import { sendFormToken, revokeFormToken } from "../api/formsFrontend";
import validateEmail from "../utils/validators";
import truncateEmail from "../utils/truncateEmail";
import normalizeEmail from "../utils/normalizeEmail";
import type { FormType } from "../constants/formTypes";
import type { ClientFormsStatus } from "../types/formStatusTypes";
import { useClientContext } from "../context/ClientContext";

export default function Dashboard() {
  const {
    email: contextEmail,
    setEmail: setContextEmail,
    clientFormsStatus: contextClientFormsStatus,
    setClientFormsStatus: setContextClientFormsStatus,
  } = useClientContext();

  const [email, setEmail] = useState(contextEmail || "");
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [clientFormsStatus, setClientFormsStatus] =
    useState<ClientFormsStatus | null>(contextClientFormsStatus || null);
  const [loading, setLoading] = useState(false);
  const [showAddClientPrompt, setShowAddClientPrompt] = useState(false);
  const [confirmedEmail, setConfirmedEmail] = useState<string | null>(null);
  const [formActionLoading, setFormActionLoading] = useState<
    Record<FormType, boolean>
  >({} as Record<FormType, boolean>);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [closingRevokeModal, setClosingRevokeModal] = useState(false);
  const [revokeFormType, setRevokeFormType] = useState<FormType | null>(null);

  const logoUrl = `${import.meta.env.BASE_URL}logo.png`;

  useEffect(() => {
    setContextEmail(email);
  }, [email]);

  useEffect(() => {
    setContextClientFormsStatus(clientFormsStatus);
  }, [clientFormsStatus]);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setError("");
    setShowAddClientPrompt(false);
  };

  const handleConfirmAddClient = async () => {
    const normalizedEmail = normalizeEmail(email);

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
    const normalizedEmail = normalizeEmail(email);

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
    async (formType: FormType) => {
      if (!clientFormsStatus) return;

      const normalizedEmail = normalizeEmail(email);

      if (formActionLoading[formType]) return;

      setFormActionLoading((prev) => ({ ...prev, [formType]: true }));
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

      setFormActionLoading((prev) => ({ ...prev, [formType]: false }));
    },
    [email, clientFormsStatus, formActionLoading]
  );

  const openRevokeModal = (formType: FormType) => {
    setRevokeFormType(formType);
    setShowRevokeModal(true);
    setClosingRevokeModal(false);
  };

  const closeRevokeModal = () => {
    setClosingRevokeModal(true);
  };

  const handleCloseFinished = () => {
    setShowRevokeModal(false);
    setRevokeFormType(null);
    setClosingRevokeModal(false);
  };

  const handleConfirmRevoke = async () => {
    if (!revokeFormType) return;
    await handleRevokeForm(revokeFormType);
    closeRevokeModal();
  };

  const handleRevokeForm = useCallback(
    async (formType: FormType) => {
      if (!clientFormsStatus) return;

      const normalizedEmail = normalizeEmail(email);

      if (formActionLoading[formType]) return;

      setFormActionLoading((prev) => ({ ...prev, [formType]: true }));
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

      setFormActionLoading((prev) => ({ ...prev, [formType]: false }));
    },
    [email, clientFormsStatus, formActionLoading]
  );

  return (
    <ProtectedAccess>
      <div className="p-6 max-w-xl mx-auto">
        <div className="flex items-center justify-center gap-3">
          <img
            src={logoUrl}
            alt="Integrate Therapy logo"
            aria-hidden="true"
            className="inline-block w-7 h-7 md:w-8 md:h-8 shrink-0 select-none"
            draggable="false"
          />
          <h1 className="text-2xl font-bold text-center">
            Integrate Therapy Form Manager
          </h1>
          <img
            src={logoUrl}
            alt="Integrate Therapy logo"
            aria-hidden="true"
            className="inline-block w-7 h-7 md:w-8 md:h-8 shrink-0 select-none"
            draggable="false"
          />
        </div>

        <label className="block mb-2 mt-4 text-sm font-medium text-center">
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
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <FormButtons
          clientFormsStatus={clientFormsStatus}
          onSend={handleSendForm}
          onRevoke={openRevokeModal}
          onRetrieve={(formType) => console.log("Retrieve", formType)}
          formActionLoading={formActionLoading}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-10 flex justify-center">
        <Link
          to="/summary"
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded transition"
        >
          Summary
        </Link>
      </div>

      {showRevokeModal && revokeFormType && (
        <RevokeConfirmModal
          closing={closingRevokeModal}
          onConfirm={handleConfirmRevoke}
          onCancel={closeRevokeModal}
          onCloseFinished={handleCloseFinished}
        />
      )}
    </ProtectedAccess>
  );
}
