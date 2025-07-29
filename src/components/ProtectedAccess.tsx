import { useReducer } from "react";
import AdminLoginModal from "./modals/AdminLoginModal";
import { authReducer, AuthState } from "../utils/authReducer";

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

type Props = {
  children: React.ReactNode;
};

export default function ProtectedAccess({ children }: Props) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const handleSubmit = () => {
    if (
      state.username.trim() === expectedUsername &&
      state.password.trim() === expectedPassword
    ) {
      dispatch({ type: "LOGIN_SUCCESS" });
    } else {
      dispatch({ type: "SET_ERROR", payload: "Invalid credentials" });

      setTimeout(() => {
        dispatch({ type: "BEGIN_ERROR_FADE_OUT" });
      }, 2500);

      setTimeout(() => {
        dispatch({ type: "CLEAR_ERROR" });
      }, 3000);
    }
  };

  const handleCloseWithFade = () => {
    dispatch({ type: "BEGIN_MODAL_CLOSE" });
    setTimeout(() => {
      dispatch({ type: "CLEAR_FORM" });
    }, 500);
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
          onRequestClose={handleCloseWithFade}
        />
      )}
    </div>
  );
}
