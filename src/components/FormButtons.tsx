import FormStatusMessage from "./FormStatusMessage";
import FormButtonGroup from "./FormButtonGroup";
import type { FormStatus } from "../types/formStatusTypes";
import { FORM_TYPES, FORM_TITLES, FormType } from "../constants/formTypes";

type ClientFormsStatus = {
  exists: boolean;
  forms: Record<FormType, FormStatus>;
};

type FormButtonsProps = {
  clientFormsStatus: ClientFormsStatus | null;
  onSend: (formType: FormType) => void;
  onRevoke: (formType: FormType) => void;
  formActionLoading: Record<FormType, boolean>;
  clientInactive: boolean;
  searchLoading?: boolean;
};

export default function FormButtons({
  clientFormsStatus,
  onSend,
  onRevoke,
  formActionLoading,
  clientInactive,
  searchLoading = false,
}: FormButtonsProps) {
  const clientSearched = clientFormsStatus !== null;
  const clientExists = clientFormsStatus?.exists ?? false;
  const formTypes = FORM_TYPES;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full justify-items-center">
      {formTypes.map((formType: FormType) => {
        const status = clientFormsStatus?.forms?.[formType];

        const sendDisabled =
          !clientSearched ||
          !clientExists ||
          clientInactive ||
          (status
            ? status.activeToken || (status.submitted && formType !== "SMI")
            : false) ||
          formActionLoading[formType] ||
          searchLoading;

        const revokeDisabled =
          !clientSearched ||
          !clientExists ||
          clientInactive ||
          !(status ? status.activeToken : false) ||
          formActionLoading[formType] ||
          searchLoading;

        const sendLabel =
          formType === "SMI" && status?.submitted ? "Resend" : "Send";

        return (
          <div
            key={formType}
            className="form-card flex flex-col items-center justify-center border-[4px] border-[var(--color-border)] py-4 px-2 rounded-xl min-h-[150px]"
          >
            <h2 className="card-title text-lg font-semibold mb-3 text-center">
              {FORM_TITLES[formType]}
            </h2>

            <div className="flex space-x-3 w-full justify-center">
              <FormButtonGroup
                sendDisabled={sendDisabled}
                revokeDisabled={revokeDisabled}
                onSend={() => onSend(formType)}
                onRevoke={() => onRevoke(formType)}
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
                clientInactive={clientInactive}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
