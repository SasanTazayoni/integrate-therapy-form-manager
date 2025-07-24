import FormButtonStatus from "./FormButtonStatus";

type FormStatus = {
  submitted: boolean;
  activeToken: boolean;
};

type ClientFormsStatus = {
  exists: boolean;
  forms: Record<string, FormStatus>;
};

type FormButtonsProps = {
  clientFormsStatus: ClientFormsStatus | null;
  onSend: (formType: string) => void;
};

export default function FormButtons({
  clientFormsStatus,
  onSend,
}: FormButtonsProps) {
  const formTypes = ["YSQ", "SMI", "BECKS", "BURNS"];

  return (
    <div className="grid gap-2">
      {formTypes.map((formType) => {
        const status = clientFormsStatus?.forms?.[formType];
        const disabled = Boolean(
          !clientFormsStatus?.exists ||
            (formType !== "SMI" && (status?.submitted || status?.activeToken))
        );

        const title = !clientFormsStatus?.exists
          ? "Client not found"
          : status?.submitted
          ? "Form already submitted"
          : status?.activeToken
          ? "Active token already sent"
          : "";

        return (
          <FormButtonStatus
            key={formType}
            formType={formType}
            disabled={disabled}
            title={title}
            onSend={onSend}
          />
        );
      })}
    </div>
  );
}
