import { Loader2 } from "lucide-react";
import type { FormStatus } from "../types/formStatusTypes";
import type { FormType } from "../constants/formTypes";

type Props = {
  status?: FormStatus;
  formType: FormType;
  formActionLoading: Record<FormType, boolean>;
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function FormStatusMessage({
  status,
  formType,
  formActionLoading,
}: Props) {
  if (formActionLoading[formType]) {
    return (
      <span className="text-blue-600 flex justify-center items-center gap-2">
        <Loader2 className="animate-spin h-5 w-5" />
        Loading...
      </span>
    );
  }

  if (!status) {
    return <span className="text-gray-500">No data found</span>;
  }

  if (status.revokedAt) {
    return (
      <span className="text-gray-500">
        Form revoked on <strong>{formatDate(status.revokedAt)}</strong>
      </span>
    );
  }

  if (status.activeToken) {
    return (
      <span className="text-gray-500">
        Form sent on <strong>{formatDate(status.tokenCreatedAt)}</strong>{" "}
        pending response...
      </span>
    );
  }

  if (status.submitted) {
    return (
      <span className="text-gray-500">
        Form submitted on <strong>{formatDate(status.submittedAt)}</strong>
      </span>
    );
  }

  const expired =
    !!status.tokenExpiresAt && new Date(status.tokenExpiresAt) < new Date();

  if (expired) {
    return (
      <span className="text-gray-500">
        Form expired on <strong>{formatDate(status.tokenExpiresAt)}</strong>
      </span>
    );
  }

  return <span className="text-gray-500">Form not yet sent</span>;
}
