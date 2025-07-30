import ReactDOM from "react-dom";

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
  const modalRoot = document.getElementById("modal-root");
  if (!modalRoot) return null;

  const modal = (
    <div className={`overlay ${closing ? "fade-out" : ""}`}>
      <dialog
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        open
      >
        <h2 id="login-title" className="text-xl font-bold mb-4">
          Admin Login
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
          />

          <p
            className="mt-4 text-red-600 font-semibold text-center transition-opacity duration-500"
            style={{
              minHeight: "1.25rem",
              opacity: error && !errorFading ? 1 : 0,
            }}
            aria-live="polite"
          >
            {error || "\u00A0"}
          </p>

          <div className="flex justify-center gap-4 mt-4">
            <button type="submit">Login</button>
            <button type="button" onClick={onClear}>
              Clear
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );

  return ReactDOM.createPortal(modal, modalRoot);
}
