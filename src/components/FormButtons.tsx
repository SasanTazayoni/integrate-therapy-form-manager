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

const formMeta = {
  YSQ: "Young Schema Questionnaire (YSQ) Forms",
  SMI: "Schema Mode Inventory (SMI) Forms",
  BECKS: "Beck's Depression Inventory (BDI) Forms",
  BURNS: "Burn's Anxiety Inventory (BAI) Forms",
};

export default function FormButtons({
  clientFormsStatus,
  onSend,
}: FormButtonsProps) {
  const clientSearched = clientFormsStatus !== null;
  const clientExists = clientFormsStatus?.exists ?? false;

  const formTypes = ["YSQ", "SMI", "BECKS", "BURNS"];

  return (
    <div className="grid gap-6">
      {formTypes.map((formType) => {
        const status = clientFormsStatus?.forms?.[formType];

        const disabled = !clientSearched || !clientExists;

        const message = !status ? (
          clientSearched ? (
            "No data found for this client"
          ) : (
            ""
          )
        ) : status.submitted ? (
          <>
            Form submitted on <strong>{formatDate(status.submittedAt)}</strong>
          </>
        ) : status.tokenExpiresAt &&
          new Date(status.tokenExpiresAt) < new Date() ? (
          <>
            Form expired on <strong>{formatDate(status.tokenExpiresAt)}</strong>
          </>
        ) : status.activeToken ? (
          <>
            Form sent on <strong>{formatDate(status.tokenCreatedAt)}</strong>{" "}
            pending response...
          </>
        ) : (
          "Form not yet sent"
        );

        return (
          <div key={formType} className="flex flex-col gap-2">
            <h2 className="font-semibold text-center">
              {formMeta[formType as keyof typeof formMeta]}
            </h2>

            <div className="grid grid-cols-3 gap-2">
              <FormButtonStatus
                label="Send"
                disabled={disabled}
                onClick={() => onSend(formType)}
              />
              <FormButtonStatus
                label="Revoke"
                disabled={true}
                onClick={() => {}}
              />
              <FormButtonStatus
                label="Retrieve"
                disabled={true}
                onClick={() => {}}
              />
            </div>

            <div className="text-sm font-semibold text-gray-700 text-center min-h-[1.5rem]">
              {message}
            </div>
          </div>
        );
      })}
    </div>
  );
}
