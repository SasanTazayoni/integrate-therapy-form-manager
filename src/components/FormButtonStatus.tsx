type Props = {
  formType: string;
  disabled: boolean;
  title: string;
  onSend: (formType: string) => void;
};

export default function FormButtonStatus({
  formType,
  disabled,
  title,
  onSend,
}: Props) {
  return (
    <button
      disabled={disabled}
      title={title}
      className={`px-4 py-2 rounded ${
        disabled
          ? "bg-gray-300 cursor-not-allowed"
          : "bg-blue-500 hover:bg-blue-600 text-white"
      }`}
      onClick={() => onSend(formType)}
    >
      Send {formType} Form
    </button>
  );
}
