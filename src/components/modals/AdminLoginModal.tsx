import Modal from "../Modal";
import Button from "../ui/Button";

type Props = {
  username: string;
  password: string;
  error: string;
  closing: boolean;
  errorFading: boolean;
  onUsernameChange: (val: string) => void;
  onPasswordChange: (val: string) => void;
  onSubmit: () => void;
  onClear: () => void;
};

export default function AdminLoginModal({
  username,
  password,
  error,
  closing,
  errorFading,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
  onClear,
}: Props) {
  function handleUsernameChange(e: React.ChangeEvent<HTMLInputElement>) {
    onUsernameChange(e.target.value);
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    onPasswordChange(e.target.value);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <Modal ariaLabelledBy="login-title" role="dialog" closing={closing}>
      <h2 id="login-title" className="text-xl font-bold mb-4 sm:mb-2">
        Admin Login
      </h2>

      <form onSubmit={handleSubmit} className="space-y-2">
        <label htmlFor="admin-username" className="sr-only">
          Username
        </label>
        <input
          id="admin-username"
          type="text"
          placeholder="Username"
          value={username}
          onChange={handleUsernameChange}
          className="w-full p-2 border rounded"
        />

        <label htmlFor="admin-password" className="sr-only">
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={handlePasswordChange}
          className="w-full p-2 border rounded"
        />

        <p
          id="admin-login-error"
          className={`mt-4 sm:mt-2 text-red-600 font-semibold text-center transition-opacity duration-500 ${
            error && !errorFading ? "opacity-100" : "opacity-0"
          }`}
          style={{ minHeight: "1.25rem" }}
          aria-live="polite"
        >
          {error ? error : <span aria-hidden="true">&nbsp;</span>}
        </p>

        <div className="flex justify-center mt-4 sm:mt-2 gap-x-2">
          <Button type="submit">Login</Button>
          <Button type="button" variant="danger" onClick={onClear}>
            Clear
          </Button>
        </div>
      </form>
    </Modal>
  );
}
