export type AuthState = {
  username: string;
  password: string;
  authenticated: boolean;
  error: string;
  closing: boolean;
  errorFading: boolean;
};

export type Action =
  | { type: "SET_USERNAME"; payload: string }
  | { type: "SET_PASSWORD"; payload: string }
  | { type: "LOGIN_SUCCESS" }
  | { type: "SET_ERROR"; payload?: string }
  | { type: "CLEAR_ERROR" }
  | { type: "BEGIN_ERROR_FADE_OUT" }
  | { type: "BEGIN_MODAL_CLOSE" }
  | { type: "CLEAR_FORM" };

export function authReducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case "SET_USERNAME":
      return { ...state, username: action.payload };
    case "SET_PASSWORD":
      return { ...state, password: action.payload };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        authenticated: true,
        error: "",
        closing: false,
        errorFading: false,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload ?? "Invalid credentials",
        errorFading: false,
      };
    case "BEGIN_ERROR_FADE_OUT":
      return { ...state, errorFading: true };
    case "BEGIN_MODAL_CLOSE":
      return { ...state, closing: true };
    case "CLEAR_FORM":
      return {
        ...state,
        username: "",
        password: "",
        error: "",
        closing: false,
        errorFading: false,
      };
    case "CLEAR_ERROR":
      return { ...state, error: "", errorFading: false };
    default:
      return state;
  }
}
