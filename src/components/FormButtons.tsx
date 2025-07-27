import FormStatusMessage from "./FormStatusMessage";
import FormButtonGroup from "./FormButtonGroup";

export type FormStatus = {
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
};

type FormButtonsProps = {
  clientFormsStatus: ClientFormsStatus | null;
  onSend: (formType: string) => void;
  onRevoke: (formType: string) => void;
  onRetrieve: (formType: string) => void;
  formActionLoading: Record<string, boolean>; // <- added here
};

const formTitles: Record<string, string> = {
  YSQ: "Young Schema Questionnaire (YSQ) Form",
  SMI: "Schema Mode Inventory (SMI) Form",
  BECKS: "Beck's Depression Inventory (BDI) Form",
  BURNS: "Burn's Anxiety Inventory (BAI) Form",
};

export default function FormButtons({
  clientFormsStatus,
  onSend,
  onRevoke,
  onRetrieve,
  formActionLoading,
}: FormButtonsProps) {
  const clientSearched = clientFormsStatus !== null;
  const clientExists = clientFormsStatus?.exists ?? false;
  const formTypes = ["YSQ", "SMI", "BECKS", "BURNS"];

  return (
    <div className="grid gap-2">
      {formTypes.map((formType) => {
        const status = clientFormsStatus?.forms?.[formType];

        const sendDisabled =
          !clientSearched ||
          !clientExists ||
          (status
            ? status.activeToken || (status.submitted && formType !== "SMI")
            : false) ||
          formActionLoading[formType];
        const revokeDisabled =
          !clientSearched ||
          !clientExists ||
          !(status ? status.activeToken : false) ||
          formActionLoading[formType];

        const retrieveDisabled =
          !clientSearched || !clientExists || formActionLoading[formType];

        const sendLabel =
          formType === "SMI" && status?.submitted ? "Resend" : "Send";

        return (
          <div
            key={formType}
            className="flex flex-col items-center border p-4 rounded"
          >
            <h2 className="text-lg font-semibold mb-3">
              {formTitles[formType]}
            </h2>

            <div className="flex space-x-3 w-full justify-center">
              <FormButtonGroup
                sendDisabled={sendDisabled}
                revokeDisabled={revokeDisabled}
                retrieveDisabled={retrieveDisabled}
                onSend={() => onSend(formType)}
                onRevoke={() => onRevoke(formType)}
                onRetrieve={() => onRetrieve(formType)}
                sendLabel={sendLabel}
                loadingSend={formActionLoading[formType]}
                loadingRevoke={formActionLoading[formType]}
              />
            </div>

            <div className="text-sm font-semibold text-gray-700 mt-3 text-center min-h-[1.5rem]">
              <FormStatusMessage
                status={status}
                formType={formType}
                formActionLoading={formActionLoading}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
