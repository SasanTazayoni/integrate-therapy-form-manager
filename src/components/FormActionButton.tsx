import Button from "../components/ui/Button";

type Props = {
  label: string;
  disabled: boolean;
  onClick: () => void;
  loading?: boolean;
  testId?: string;
};

export default function FormActionButton({
  label,
  disabled,
  onClick,
  loading = false,
  testId,
}: Props) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      loading={loading}
      data-testid={testId}
    >
      {label}
    </Button>
  );
}
