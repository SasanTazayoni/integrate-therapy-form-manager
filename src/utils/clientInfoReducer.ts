export type ModalState = {
  name: string;
  dob: string;
  error: string;
};

export type ModalAction =
  | { type: "SET_NAME"; payload: string }
  | { type: "SET_DOB"; payload: string }
  | { type: "SET_ERROR"; payload: string }
  | { type: "CLEAR_ERROR" };

export const modalInitialState: ModalState = {
  name: "",
  dob: "",
  error: "",
};

export function modalReducer(
  state: ModalState,
  action: ModalAction
): ModalState {
  switch (action.type) {
    case "SET_NAME":
      return { ...state, name: action.payload };
    case "SET_DOB":
      return { ...state, dob: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "CLEAR_ERROR":
      return { ...state, error: "" };
    default:
      return state;
  }
}
