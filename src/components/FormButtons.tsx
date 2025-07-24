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
  email: string;
  onSend: (formType: string) => void;
};

export default function FormButtons({
  clientFormsStatus,
  email,
  onSend,
}: FormButtonsProps) {
  const normalizedEmail = email.trim().toLowerCase();
  const noEmail = normalizedEmail === "";
  const clientExists = clientFormsStatus?.exists ?? false;

  const formTypes = ["YSQ", "SMI", "BECKS", "BURNS"];

  return (
    <div className="grid gap-2">
      {formTypes.map((formType) => {
        const status = clientFormsStatus?.forms?.[formType];

        let disabled = false;

        if (noEmail) {
          disabled = true;
        } else if (!clientExists) {
          disabled = false;
        } else if (status?.activeToken) {
          disabled = true;
        } else if (formType === "SMI") {
          disabled = !status?.submitted;
        } else {
          disabled = !!status?.submitted;
        }

        let title = "";
        if (!clientExists) {
          title = "Client not found";
        } else if (status?.submitted) {
          title = "Form already submitted";
        } else if (status?.activeToken) {
          title = "Active token already sent";
        }

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
