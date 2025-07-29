export type ModalState = {
  name: string;
  dob: string;
  error: string;
  errorFading: boolean;
};

export type ModalAction =
  | { type: "SET_NAME"; payload: string }
  | { type: "SET_DOB"; payload: string }
  | { type: "SET_ERROR"; payload: string }
  | { type: "CLEAR_ERROR" }
  | { type: "BEGIN_ERROR_FADE_OUT" };

export const modalInitialState: ModalState = {
  name: "",
  dob: "",
  error: "",
  errorFading: false,
};

export function clientInfoReducer(
  state: ModalState,
  action: ModalAction
): ModalState {
  switch (action.type) {
    case "SET_NAME":
      return { ...state, name: action.payload };
    case "SET_DOB":
      return { ...state, dob: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, errorFading: false };
    case "BEGIN_ERROR_FADE_OUT":
      return { ...state, errorFading: true };
    case "CLEAR_ERROR":
      return { ...state, error: "", errorFading: false };
    default:
      return state;
  }
}
