import { useEffect, useRef } from "react";
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
  onRequestClose: () => void;
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
  onRequestClose,
}: Props) {
  const modalRef = useRef<HTMLDialogElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (e: MouseEvent) => {
    if (
      modalRef.current &&
      !modalRef.current.contains(e.target as Node) &&
      overlayRef.current?.contains(e.target as Node)
    ) {
      onRequestClose();
    }
  };

  const handleEscapeKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onRequestClose();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  const modal = (
    <div className={`overlay ${closing ? "fade-out" : ""}`} ref={overlayRef}>
      <dialog
        className="modal"
        ref={modalRef}
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
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            required
          />

          <div className="flex justify-center gap-4 mt-2">
            <button type="submit">Login</button>
            <button type="button" onClick={onClear}>
              Clear
            </button>
          </div>

          <p
            className="mt-4 text-red-600 font-semibold text-center transition-opacity duration-500"
            style={{
              minHeight: "1.25rem",
              opacity: error && !errorFading ? 1 : 0,
            }}
          >
            {error || "\u00A0"}
          </p>
        </form>
      </dialog>
    </div>
  );

  return ReactDOM.createPortal(modal, document.getElementById("modal-root")!);
}
