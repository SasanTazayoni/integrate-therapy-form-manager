import FormActionButton from "./FormActionButton";

type Props = {
  sendDisabled: boolean;
  revokeDisabled: boolean;
  retrieveDisabled: boolean;
  onSend: () => void;
  onRevoke: () => void;
  onRetrieve: () => void;
  sendLabel?: string;
};

export default function FormButtonGroup({
  sendDisabled,
  revokeDisabled,
  retrieveDisabled,
  onSend,
  onRevoke,
  onRetrieve,
  sendLabel = "Send",
}: Props) {
  return (
    <div className="flex space-x-3 justify-center w-full">
      <FormActionButton
        label={sendLabel}
        disabled={sendDisabled}
        onClick={onSend}
      />
      <FormActionButton
        label="Revoke"
        disabled={revokeDisabled}
        onClick={onRevoke}
      />
      <FormActionButton
        label="Retrieve"
        disabled={retrieveDisabled}
        onClick={onRetrieve}
      />
    </div>
  );
}
