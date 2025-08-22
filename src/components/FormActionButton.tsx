import Button from "../components/ui/Button";

type Props = {
  label: string;
  disabled: boolean;
  onClick: () => void;
  loading?: boolean;
};

export default function FormActionButton({
  label,
  disabled,
  onClick,
  loading = false,
}: Props) {
  return (
    <Button onClick={onClick} disabled={disabled || loading} loading={loading}>
      {label}
    </Button>
  );
}
