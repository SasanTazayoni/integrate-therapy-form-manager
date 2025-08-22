import Button from "../components/ui/Button";

export default function EmailSearchControls({
  onCheck,
  onClear,
  loading,
}: {
  onCheck: () => void;
  onClear: () => void;
  loading: boolean;
}) {
  return (
    <div className="flex justify-center mb-4">
      <Button onClick={onCheck} disabled={loading}>
        Search
      </Button>
      <Button variant="danger" onClick={onClear} disabled={loading}>
        Clear
      </Button>
    </div>
  );
}
