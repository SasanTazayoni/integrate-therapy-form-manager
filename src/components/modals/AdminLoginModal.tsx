import { useEffect, useRef } from "react";
import Modal from "../Modal";
import { initializeRippleEffect } from "../../utils/ripple";

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
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const applyRipples = () => {
      if (modalRef.current) {
        const buttons =
          modalRef.current.querySelectorAll<HTMLButtonElement>("button");
        buttons.forEach((btn) => {
          btn.classList.add("button");
          initializeRippleEffect(btn);
        });
      }
    };

    const timeout = setTimeout(applyRipples, 0);
    return () => clearTimeout(timeout);
  }, [closing]);

  return (
    <Modal ariaLabelledBy="login-title" role="dialog" closing={closing}>
      <div ref={modalRef}>
        <h2 id="login-title" className="text-xl font-bold mb-4 sm:mb-2">
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
            className="mt-4 sm:mt-2 text-red-600 font-semibold text-center transition-opacity duration-500"
            style={{
              minHeight: "1.25rem",
              opacity: error && !errorFading ? 1 : 0,
            }}
            aria-live="polite"
          >
            {error || "\u00A0"}
          </p>

          <div className="flex justify-center mt-4 sm:mt-2">
            <button type="submit" className="button">
              Login
            </button>
            <button type="button" className="button--red" onClick={onClear}>
              Clear
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
