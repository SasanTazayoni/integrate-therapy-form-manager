import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProtectedAccess from "../components/ProtectedAccess";
import EmailInput from "../components/EmailInput";
import FormButtons from "../components/FormButtons";
import EmailSearchControls from "../components/EmailSearchControls";
import RevokeConfirmModal from "../components/modals/RevokeConfirmModal";
import Button from "../components/ui/Button";
import {
  fetchClientStatus,
  addClient,
  deleteClient,
  deactivateClient,
  activateClient,
} from "../api/clientsFrontend";
import {
  sendFormToken,
  revokeFormToken,
  sendMultipleFormTokens,
} from "../api/formsFrontend";
import validateEmail from "../utils/validators";
import truncateEmail from "../utils/truncateEmail";
import normalizeEmail from "../utils/normalizeEmail";
import type { FormType } from "../constants/formTypes";
import type { ClientFormsStatus } from "../types/formStatusTypes";
import { useClientContext } from "../context/ClientContext";
import ClientActions from "../components/ClientActions";

export default function Dashboard() {
  const navigate = useNavigate();
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

  const initialFormActionLoading: Record<FormType, boolean> = {
    YSQ: false,
    SMI: false,
    BECKS: false,
    BURNS: false,
  };

  const [formActionLoading, setFormActionLoading] = useState(
    initialFormActionLoading
  );
  const [loading, setLoading] = useState(false);
  const [showAddClientPrompt, setShowAddClientPrompt] = useState(false);
  const [confirmedEmail, setConfirmedEmail] = useState<string | null>(null);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [closingRevokeModal, setClosingRevokeModal] = useState(false);
  const [revokeFormType, setRevokeFormType] = useState<FormType | null>(null);

  const logoUrl = `${import.meta.env.BASE_URL}logo.png`;
  const isInactive = clientFormsStatus?.inactive ?? false;
  const isFormActionInProgress = Object.values(formActionLoading).some(Boolean);

  useEffect(() => setContextEmail(email), [email, setContextEmail]);
  useEffect(
    () => setContextClientFormsStatus(clientFormsStatus),
    [clientFormsStatus, setContextClientFormsStatus]
  );

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setError("");
    setShowAddClientPrompt(false);
    setClientFormsStatus(null);
    setConfirmedEmail(null);
    setSuccessMessage("");
  };

  const handleConfirmAddClient = async () => {
    const normalizedEmail = normalizeEmail(email);
    const { ok, data } = await addClient(normalizedEmail);
    if (!ok) return setError(data.error || "Failed to add client");

    setError("");
    setShowAddClientPrompt(false);
    await handleCheckProgress();
  };

  const handleCheckProgress = useCallback(async () => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) return setError("Input cannot be empty");

    if (!validateEmail(normalizedEmail))
      return setError("This email is not valid");

    if (confirmedEmail !== normalizedEmail) setConfirmedEmail(null);

    setError("");
    setLoading(true);

    const { ok, data } = await fetchClientStatus(normalizedEmail);
    if (!ok) {
      if (data.error === "Client not found") {
        setError("No data for this email - add to database?");
        setShowAddClientPrompt(true);
        setClientFormsStatus(null);
      } else {
        setError(data.error || "Failed to fetch progress");
        setClientFormsStatus(null);
      }
    } else {
      setClientFormsStatus(data);
      setShowAddClientPrompt(false);
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
    setShowAddClientPrompt(false);
    setFormActionLoading(initialFormActionLoading);
    setConfirmedEmail(null);
  };

  const handleSendForm = useCallback(
    async (formType: FormType) => {
      if (!clientFormsStatus || !confirmedEmail) return;

      const normalizedEmail = normalizeEmail(confirmedEmail);
      if (formActionLoading[formType]) return;

      setFormActionLoading((prev) => ({ ...prev, [formType]: true }));
      setClientFormsStatus((prev) => ({
        ...prev!,
        forms: {
          ...prev!.forms,
          [formType]: { ...prev!.forms[formType], activeToken: true },
        },
      }));

      const { ok, data } = await sendFormToken(normalizedEmail, formType);

      if (!ok) {
        setClientFormsStatus((prev) => ({
          ...prev!,
          forms: {
            ...prev!.forms,
            [formType]: { ...prev!.forms[formType], activeToken: false },
          },
        }));
        setError(data.error || `Failed to send ${formType} form`);
      } else {
        const { ok: fetchOk, data: updatedStatus } = await fetchClientStatus(
          normalizedEmail
        );
        if (fetchOk) setClientFormsStatus(updatedStatus);
      }

      setFormActionLoading((prev) => ({ ...prev, [formType]: false }));
    },
    [clientFormsStatus, confirmedEmail, formActionLoading]
  );

  const handleSendAllForms = useCallback(
    async (formTypes: FormType[]) => {
      if (!clientFormsStatus || !confirmedEmail) return;

      const normalizedEmail = normalizeEmail(confirmedEmail);

      setFormActionLoading((prev) => {
        const updated = { ...prev };
        formTypes.forEach((type) => (updated[type] = true));
        return updated;
      });

      try {
        const { ok, data } = await sendMultipleFormTokens(normalizedEmail);

        if (!ok) {
          setError(data.error || "Failed to send multiple forms");
          setSuccessMessage("");
          return;
        }

        const { ok: fetchOk, data: updatedStatus } = await fetchClientStatus(
          normalizedEmail
        );
        if (fetchOk) setClientFormsStatus(updatedStatus);

        setSuccessMessage("All eligible forms have been sent successfully");
        setError("");
      } catch (err) {
        setError("Unexpected error occurred while sending all forms");
        setSuccessMessage("");
      } finally {
        setFormActionLoading((prev) => {
          const updated = { ...prev };
          formTypes.forEach((type) => (updated[type] = false));
          return updated;
        });
      }
    },
    [clientFormsStatus, confirmedEmail]
  );

  const openRevokeModal = (formType: FormType) => {
    setRevokeFormType(formType);
    setShowRevokeModal(true);
    setClosingRevokeModal(false);
  };

  const closeRevokeModal = () => setClosingRevokeModal(true);

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
      if (!confirmedEmail || formActionLoading[formType]) return;

      const normalizedEmail = normalizeEmail(confirmedEmail);

      setFormActionLoading((prev) => ({ ...prev, [formType]: true }));
      setClientFormsStatus((prev) => ({
        ...prev!,
        forms: {
          ...prev!.forms,
          [formType]: { ...prev!.forms[formType], activeToken: false },
        },
      }));

      const { ok, data } = await revokeFormToken(normalizedEmail, formType);

      if (!ok) {
        setClientFormsStatus((prev) => ({
          ...prev!,
          forms: {
            ...prev!.forms,
            [formType]: { ...prev!.forms[formType], activeToken: true },
          },
        }));
        setError(data.error || `Failed to revoke ${formType} form`);
      } else {
        setClientFormsStatus((prev) => ({
          ...prev!,
          forms: {
            ...prev!.forms,
            [formType]: {
              ...prev!.forms[formType],
              activeToken: false,
              revokedAt: data.revokedAt ?? null,
            },
          },
        }));
      }

      setFormActionLoading((prev) => ({ ...prev, [formType]: false }));
    },
    [confirmedEmail, formActionLoading]
  );

  const handleDeleteClient = async () => {
    if (loading) return;
    if (!confirmedEmail) return setError("No confirmed email found!");

    setLoading(true);
    try {
      const { ok, data } = await deleteClient(confirmedEmail);
      if (!ok) {
        setError(data.error || "Failed to delete client");
        setSuccessMessage("");
        return;
      }
      setSuccessMessage(`Client ${confirmedEmail} deleted successfully`);
      setError("");
      handleClear();
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateClient = async () => {
    if (loading) return;
    if (!confirmedEmail) {
      setError("No confirmed email found!");
      return;
    }

    setLoading(true);
    try {
      const { ok, data } = await deactivateClient(confirmedEmail);

      if (!ok) {
        setError(data.error || "Failed to deactivate client");
        setSuccessMessage("");
        return;
      }

      setSuccessMessage(`Client ${confirmedEmail} deactivated successfully`);
      setError("");

      const { ok: fetchOk, data: updatedStatus } = await fetchClientStatus(
        confirmedEmail
      );
      if (fetchOk) setClientFormsStatus(updatedStatus);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateClient = async () => {
    if (loading) return;
    if (!confirmedEmail) {
      setError("No confirmed email found!");
      return;
    }

    setLoading(true);
    try {
      const { ok, data } = await activateClient(confirmedEmail);

      if (!ok) {
        setError(data.error || "Failed to activate client");
        setSuccessMessage("");
        return;
      }

      setSuccessMessage(`Client ${confirmedEmail} activated successfully`);
      setError("");

      const { ok: fetchOk, data: updatedStatus } = await fetchClientStatus(
        confirmedEmail
      );
      if (fetchOk) setClientFormsStatus(updatedStatus);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedAccess>
      <div className="p-4 pt-6 max-w-xl mx-auto">
        <div className="flex items-center justify-center gap-3">
          <img
            src={logoUrl}
            alt="Integrate Therapy logo"
            aria-hidden="true"
            className="hidden md:inline-block w-7 h-7 md:w-8 md:h-8 shrink-0 select-none"
            draggable="false"
          />
          <h1
            className="dashboard text-2xl font-bold text-center"
            data-testid="dashboard-title"
          >
            Integrate Therapy Form Manager
          </h1>
          <img
            src={logoUrl}
            alt="Integrate Therapy logo"
            aria-hidden="true"
            className="hidden md:inline-block w-7 h-7 md:w-8 md:h-8 shrink-0 select-none"
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
          loading={loading || isFormActionInProgress}
          showAddClientPrompt={showAddClientPrompt}
          setShowAddClientPrompt={setShowAddClientPrompt}
          onConfirmAddClient={handleConfirmAddClient}
        />

        <EmailSearchControls
          onCheck={handleCheckProgress}
          onClear={handleClear}
          loading={loading || isFormActionInProgress}
        />

        <ClientActions
          disabled={!clientFormsStatus || !clientFormsStatus.exists}
          isInactive={isInactive}
          onDeleteClient={handleDeleteClient}
          onDeactivateClient={handleDeactivateClient}
          onActivateClient={handleActivateClient}
          loading={loading || isFormActionInProgress}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <FormButtons
          clientFormsStatus={clientFormsStatus}
          onSend={handleSendForm}
          onRevoke={openRevokeModal}
          formActionLoading={formActionLoading}
          clientInactive={isInactive}
          searchLoading={loading}
          onSendAll={handleSendAllForms}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6 flex justify-center">
        <Button
          onClick={() => navigate("/summary")}
          disabled={loading || isFormActionInProgress}
          data-testid="summary-button"
        >
          Summary
        </Button>
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
