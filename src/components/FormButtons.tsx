import FormButtonStatus from "./FormButtonStatus";

type FormStatus = {
  submitted: boolean;
  activeToken: boolean;
  submittedAt?: string;
  tokenCreatedAt?: string;
  tokenExpiresAt?: string;
};

type ClientFormsStatus = {
  exists: boolean;
  forms: Record<string, FormStatus>;
};

type FormButtonsProps = {
  clientFormsStatus: ClientFormsStatus | null;
  onSend: (formType: string) => void;
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

export default function FormButtons({
  clientFormsStatus,
  onSend,
}: FormButtonsProps) {
  const clientSearched = clientFormsStatus !== null;
  const clientExists = clientFormsStatus?.exists ?? false;

  const formTypes = ["YSQ", "SMI", "BECKS", "BURNS"];

  return (
    <div className="grid gap-4">
      {formTypes.map((formType) => {
        const status = clientFormsStatus?.forms?.[formType];

        let disabled = false;
        if (!clientSearched || !clientExists) {
          disabled = true;
        } else if (formType === "SMI") {
          disabled = status?.activeToken || false;
        } else {
          disabled = status?.submitted || status?.activeToken || false;
        }

        let message: React.ReactNode = "";
        if (!clientSearched) {
          message = "";
        } else if (!status) {
          message = "No data found for this client";
        } else if (status.submitted) {
          message = (
            <>
              Form submitted on{" "}
              <strong>{formatDate(status.submittedAt)}</strong>
            </>
          );
        } else if (
          status.tokenExpiresAt &&
          new Date(status.tokenExpiresAt) < new Date()
        ) {
          message = (
            <>
              Form expired on{" "}
              <strong>{formatDate(status.tokenExpiresAt)}</strong>
            </>
          );
        } else if (status.activeToken) {
          message = (
            <>
              Form sent on <strong>{formatDate(status.tokenCreatedAt)}</strong>{" "}
              pending response...
            </>
          );
        } else {
          message = "Form not yet sent";
        }

        return (
          <div key={formType} className="flex flex-col items-center">
            <FormButtonStatus
              formType={formType}
              disabled={disabled}
              onSend={onSend}
            />
            <div className="text-sm font-semibold text-gray-700 mt-2 text-center min-h-[1.5rem]">
              {message}
            </div>
          </div>
        );
      })}
    </div>
  );
}
