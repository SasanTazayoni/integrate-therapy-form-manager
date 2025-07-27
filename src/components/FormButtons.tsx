import React from "react";
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
  onRevoke: (formType: string) => void;
  onRetrieve: (formType: string) => void;
};

const formTitles: Record<string, string> = {
  YSQ: "Young Schema Questionnaire (YSQ) Forms",
  SMI: "Schema Mode Inventory (SMI) Forms",
  BECKS: "Beck's Depression Inventory (BDI) Forms",
  BURNS: "Burn's Anxiety Inventory (BAI) Forms",
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
  onRevoke,
  onRetrieve,
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
          (status ? status.activeToken : false);
        const revokeDisabled =
          !clientSearched ||
          !clientExists ||
          !(status ? status.activeToken : false);
        const retrieveDisabled = !clientSearched || !clientExists;

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
          <div
            key={formType}
            className="flex flex-col items-center border p-4 rounded"
          >
            <h2 className="font-semibold mb-3">{formTitles[formType]}</h2>

            <div className="flex space-x-3 w-full justify-center">
              <FormButtonStatus
                label="Send"
                disabled={sendDisabled}
                onClick={() => onSend(formType)}
              />
              <FormButtonStatus
                label="Revoke"
                disabled={revokeDisabled}
                onClick={() => onRevoke(formType)}
              />
              <FormButtonStatus
                label="Retrieve"
                disabled={retrieveDisabled}
                onClick={() => onRetrieve(formType)}
              />
            </div>

            <div className="text-sm font-semibold text-gray-700 mt-3 text-center min-h-[1.5rem]">
              {message}
            </div>
          </div>
        );
      })}
    </div>
  );
}
