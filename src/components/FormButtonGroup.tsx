import FormActionButton from "./FormActionButton";

type Props = {
  sendDisabled: boolean;
  revokeDisabled: boolean;
  retrieveDisabled: boolean;
  onSend: () => void;
  onRevoke: () => void;
  onRetrieve: () => void;
  sendLabel?: string;
  loadingSend?: boolean;
  loadingRevoke?: boolean;
};

export default function FormButtonGroup({
  sendDisabled,
  revokeDisabled,
  retrieveDisabled,
  onSend,
  onRevoke,
  onRetrieve,
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
      <FormActionButton
        label="Retrieve"
        disabled={retrieveDisabled}
        onClick={onRetrieve}
      />
    </div>
  );
}
