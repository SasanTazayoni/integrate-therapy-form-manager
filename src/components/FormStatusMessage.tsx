import { Loader2 } from "lucide-react";
import type { FormStatus } from "../types/formStatusTypes";

type Props = {
  status?: FormStatus;
  formType: string;
  formActionLoading: Record<string, boolean>;
};

const formatDate = (iso?: string) => {
  if (!iso) return "";
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, {
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
        <Loader2 className="animate-spin h-4 w-4" />
        Loading...
      </span>
    );
  }

  if (!status) {
    return <span className="text-gray-500">No data found</span>;
  }

  const revokedTime = status.revokedAt
    ? new Date(status.revokedAt).getTime()
    : 0;
  const tokenCreatedTime = status.tokenCreatedAt
    ? new Date(status.tokenCreatedAt).getTime()
    : 0;

  if (status.activeToken) {
    return (
      <span className="text-gray-500">
        Form sent on <strong>{formatDate(status.tokenCreatedAt)}</strong>{" "}
        pending response...
      </span>
    );
  } else if (revokedTime > tokenCreatedTime) {
    return (
      <span className="text-gray-500">
        Form revoked on <strong>{formatDate(status.revokedAt)}</strong>
      </span>
    );
  } else if (status.submitted) {
    return (
      <span className="text-gray-500">
        Form submitted on <strong>{formatDate(status.submittedAt)}</strong>
      </span>
    );
  } else if (
    status.tokenExpiresAt &&
    new Date(status.tokenExpiresAt) < new Date()
  ) {
    return (
      <span className="text-gray-500">
        Form expired on <strong>{formatDate(status.tokenExpiresAt)}</strong>
      </span>
    );
  } else {
    return <span className="text-gray-500">Form not yet sent</span>;
  }
}
