import { formatDate } from "../utils/formatDate";
import { FormStatus } from "./FormButtons";

export default function FormStatusMessage({
  status,
}: {
  status?: FormStatus | null;
}) {
  if (!status) return <span>No data found for this client</span>;

  if (status.activeToken) {
    return (
      <>
        Form sent on <strong>{formatDate(status.tokenCreatedAt)}</strong>{" "}
        pending response...
      </>
    );
  }

  const revokedTime = status.revokedAt
    ? new Date(status.revokedAt).getTime()
    : 0;
  const tokenCreatedTime = status.tokenCreatedAt
    ? new Date(status.tokenCreatedAt).getTime()
    : 0;

  if (revokedTime > tokenCreatedTime) {
    return (
      <>
        Form revoked on <strong>{formatDate(status.revokedAt)}</strong>
      </>
    );
  }

  if (status.submitted) {
    return (
      <>
        Form submitted on <strong>{formatDate(status.submittedAt)}</strong>
      </>
    );
  }

  if (status.tokenExpiresAt && new Date(status.tokenExpiresAt) < new Date()) {
    return (
      <>
        Form expired on <strong>{formatDate(status.tokenExpiresAt)}</strong>
      </>
    );
  }

  return <>Form not yet sent</>;
}
