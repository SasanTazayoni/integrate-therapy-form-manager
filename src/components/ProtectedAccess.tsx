import React, { useReducer, useRef, useEffect } from "react";
import AdminLoginModal from "./modals/AdminLoginModal";
import { authReducer, AuthState } from "../utils/authReducer";
import setErrorTimers from "../utils/startErrorFadeTimers";
import { login } from "../api/authFrontend";

const initialState: AuthState = {
  username: "",
  password: "",
  authenticated: false,
  error: "",
  closing: false,
  errorFading: false,
};

const SESSION_KEY = "integrateTherapyAuthenticated";

export const MODAL_CLOSE_DURATION_MS = 500;
export const ERROR_FADE_START_MS = 2500;
export const ERROR_FADE_END_MS = ERROR_FADE_START_MS + 500;

type Props = {
  children: React.ReactNode;
};

export default function ProtectedAccess({ children }: Props) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const fadeOutTimeoutRef = useRef<number | null>(null);
  const clearErrorTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (fadeOutTimeoutRef.current) clearTimeout(fadeOutTimeoutRef.current);
      if (clearErrorTimeoutRef.current)
        clearTimeout(clearErrorTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const savedAuth = sessionStorage.getItem(SESSION_KEY);
    if (savedAuth === "true") {
      dispatch({ type: "LOGIN_SUCCESS" });
    }
  }, []);

  useEffect(() => {
    if (state.authenticated) {
      sessionStorage.setItem(SESSION_KEY, "true");
    }
  }, [state.authenticated]);

  const handleUsernameChange = (val: string) =>
    dispatch({ type: "SET_USERNAME", payload: val });
  const handlePasswordChange = (val: string) =>
    dispatch({ type: "SET_PASSWORD", payload: val });
  const handleClearForm = () => dispatch({ type: "CLEAR_FORM" });

  const handleSubmit = async () => {
    const result = await login(state.username.trim(), state.password.trim());

    if (result.ok) {
      if (fadeOutTimeoutRef.current) {
        clearTimeout(fadeOutTimeoutRef.current);
        fadeOutTimeoutRef.current = null;
      }
      if (clearErrorTimeoutRef.current) {
        clearTimeout(clearErrorTimeoutRef.current);
        clearErrorTimeoutRef.current = null;
      }

      dispatch({ type: "BEGIN_MODAL_CLOSE" });

      fadeOutTimeoutRef.current = window.setTimeout(() => {
        dispatch({ type: "LOGIN_SUCCESS" });
      }, MODAL_CLOSE_DURATION_MS);
    } else {
      dispatch({ type: "SET_ERROR", payload: result.error });

      setErrorTimers(
        dispatch,
        "BEGIN_ERROR_FADE_OUT",
        "CLEAR_ERROR",
        ERROR_FADE_START_MS,
        ERROR_FADE_END_MS,
        fadeOutTimeoutRef,
        clearErrorTimeoutRef
      );
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className={state.authenticated ? "" : "blurred"}>{children}</div>

      {!state.authenticated && (
        <AdminLoginModal
          username={state.username}
          password={state.password}
          error={state.error}
          closing={state.closing}
          errorFading={state.errorFading}
          onUsernameChange={handleUsernameChange}
          onPasswordChange={handlePasswordChange}
          onSubmit={handleSubmit}
          onClear={handleClearForm}
        />
      )}
    </div>
  );
}
