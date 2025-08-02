import React, { useReducer, useRef, useEffect } from "react";
import AdminLoginModal from "./modals/AdminLoginModal";
import { authReducer, AuthState } from "../utils/authReducer";
import setErrorTimers from "../utils/startErrorFadeTimers";

const initialState: AuthState = {
  username: "",
  password: "",
  authenticated: false,
  error: "",
  closing: false,
  errorFading: false,
};

const expectedUsername = import.meta.env.VITE_THERAPIST_USERNAME;
const expectedPassword = import.meta.env.VITE_THERAPIST_PASSWORD;

const SESSION_KEY = "integrateTherapyAuthenticated";

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
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }, [state.authenticated]);

  const handleSubmit = () => {
    if (
      state.username.trim() === expectedUsername &&
      state.password.trim() === expectedPassword
    ) {
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
      }, 500);
    } else {
      dispatch({ type: "SET_ERROR", payload: "Invalid credentials" });

      setErrorTimers(
        dispatch,
        "BEGIN_ERROR_FADE_OUT",
        "CLEAR_ERROR",
        2500,
        3000,
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
          onUsernameChange={(val) =>
            dispatch({ type: "SET_USERNAME", payload: val })
          }
          onPasswordChange={(val) =>
            dispatch({ type: "SET_PASSWORD", payload: val })
          }
          onSubmit={handleSubmit}
          onClear={() => dispatch({ type: "CLEAR_FORM" })}
        />
      )}
    </div>
  );
}
