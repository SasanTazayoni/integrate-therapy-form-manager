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
  return (
    <Modal ariaLabelledBy="login-title" role="dialog" closing={closing}>
      <h2 id="login-title" className="text-xl font-bold mb-4 sm:mb-2">
        Admin Login
      </h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <label htmlFor="admin-username" className="sr-only">
          Username
        </label>
        <input
          id="admin-username"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
        />

        <label htmlFor="admin-password" className="sr-only">
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
        />

        <p
          id="admin-login-error"
          className="mt-4 sm:mt-2 text-red-600 font-semibold text-center transition-opacity duration-500"
          style={{
            minHeight: "1.25rem",
            opacity: error && !errorFading ? 1 : 0,
          }}
          aria-live="polite"
        >
          {error ? error : <span aria-hidden="true">&nbsp;</span>}
        </p>

        <div className="flex justify-center mt-4 sm:mt-2">
          <Button type="submit">Login</Button>
          <Button type="button" variant="danger" onClick={onClear}>
            Clear
          </Button>
        </div>
      </form>
    </Modal>
  );
}
