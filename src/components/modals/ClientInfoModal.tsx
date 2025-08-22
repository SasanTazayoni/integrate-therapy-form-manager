import Modal from "../../components/Modal";
import Button from "../ui/Button";

type Props = {
  name: string;
  dob: string;
  error: string;
  errorFading: boolean;
  closing: boolean;
  onNameChange: (val: string) => void;
  onDobChange: (val: string) => void;
  onSubmit: () => void;
  onClear?: () => void;
  onCloseFinished?: () => void;
};

export default function ClientInfoModal({
  name,
  dob,
  error,
  errorFading,
  closing,
  onNameChange,
  onDobChange,
  onSubmit,
  onClear,
  onCloseFinished,
}: Props) {
  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    onNameChange(e.target.value);
  }

  function handleDobChange(e: React.ChangeEvent<HTMLInputElement>) {
    onDobChange(e.target.value);
  }

  function handleClear() {
    if (onClear) return onClear();
    onNameChange("");
    onDobChange("");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <Modal
      ariaLabelledBy="client-info-title"
      closing={closing}
      onCloseFinished={onCloseFinished}
      role="dialog"
    >
      <h2 id="client-info-title" className="text-xl font-bold mb-4 sm:mb-2">
        Your information
      </h2>

      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <label htmlFor="name" className="block font-medium text-left ml-1">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={handleNameChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="dob" className="block font-medium text-left ml-1">
            Date of Birth
          </label>
          <input
            id="dob"
            type="date"
            value={dob}
            onChange={handleDobChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <p
          id="client-info-error"
          className={`mt-2 text-red-600 font-bold text-center transition-opacity duration-500 ${
            error && !errorFading ? "opacity-100" : "opacity-0"
          }`}
          aria-live="polite"
        >
          {error ? error : <span aria-hidden="true">&nbsp;</span>}
        </p>

        <div className="flex justify-center mt-2 gap-x-2">
          <Button type="submit">Submit</Button>
          <Button type="button" variant="danger" onClick={handleClear}>
            Clear
          </Button>
        </div>
      </form>
    </Modal>
  );
}
