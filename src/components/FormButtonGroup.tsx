import FormActionButton from "./FormActionButton";

type Props = {
  sendDisabled: boolean;
  revokeDisabled: boolean;
  onSend: () => void;
  onRevoke: () => void;
  sendLabel?: string;
  loadingSend?: boolean;
  loadingRevoke?: boolean;
};

export default function FormButtonGroup({
  sendDisabled,
  revokeDisabled,
  onSend,
  onRevoke,
  sendLabel = "Send",
  loadingSend = false,
  loadingRevoke = false,
}: Props) {
  return (
    <div className="flex space-x-3 justify-center w-full">
      <FormActionButton
        label={sendLabel}
        disabled={sendDisabled}
        onClick={onSend}
        loading={loadingSend}
      />
      <FormActionButton
        label="Revoke"
        disabled={revokeDisabled}
        onClick={onRevoke}
        loading={loadingRevoke}
      />
    </div>
  );
}
