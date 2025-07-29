import { useEffect, useReducer, useState } from "react";
import { Form, useActionData } from "react-router-dom";
import { validateFormToken, updateClientInfo } from "../api/formsFrontend";
import ClientInfoModal from "./modals/ClientInfoModal";
import {
  clientInfoReducer,
  modalInitialState,
} from "../utils/clientInfoReducer";

type QuestionnaireFormProps = {
  title: string;
  questionnaire: "SMI" | "YSQ" | "BECKS" | "BURNS";
  token?: string;
  children: React.ReactNode;
};

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "valid" };

type Action = { type: "INVALID"; payload: string } | { type: "VALID" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "INVALID":
      return { status: "error", message: action.payload };
    case "VALID":
      return { status: "valid" };
    default:
      return state;
  }
}

export default function QuestionnaireForm({
  title,
  questionnaire,
  children,
  token,
}: QuestionnaireFormProps) {
  const actionData = useActionData() as { error?: string; success?: boolean };

  const [state, dispatch] = useReducer(reducer, { status: "loading" });
  const [modalState, modalDispatch] = useReducer(
    clientInfoReducer,
    modalInitialState
  );
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!token) {
      dispatch({ type: "INVALID", payload: "Missing token" });
      return;
    }

    validateFormToken(token)
      .then(({ ok, data, error }) => {
        if (!ok || !data) throw new Error(error || "Invalid token response");

        if (!(data.valid && data.questionnaire === questionnaire)) {
          throw new Error(data.message || "Invalid token for this form");
        }

        const missingName = !data.client?.name?.trim();
        const missingDob = !data.client?.dob;

        if (missingName || missingDob) {
          modalDispatch({ type: "SET_NAME", payload: data.client?.name || "" });
          modalDispatch({ type: "SET_DOB", payload: data.client?.dob || "" });
          setShowModal(true);
        }

        dispatch({ type: "VALID" });
      })
      .catch((err) => {
        dispatch({
          type: "INVALID",
          payload: err.message || "Unknown error validating token",
        });
      });
  }, [token, questionnaire]);

  const handleClientInfoSubmit = async () => {
    if (!token) return;

    // simple validation -> one bold message
    let errorMessage = "";
    const trimmedName = modalState.name.trim();
    const hasName = trimmedName.length > 0;
    const hasDob = !!modalState.dob;

    if (!hasName && !hasDob) errorMessage = "Inputs cannot be empty";
    else if (!hasName) errorMessage = "Please enter your full name";
    else if (!hasDob) errorMessage = "Please enter your date of birth";

    if (errorMessage) {
      modalDispatch({ type: "SET_ERROR", payload: errorMessage });
      setTimeout(() => modalDispatch({ type: "BEGIN_ERROR_FADE_OUT" }), 2500);
      setTimeout(() => modalDispatch({ type: "CLEAR_ERROR" }), 3000);
      return;
    }

    const { ok, error } = await updateClientInfo({
      token,
      name: trimmedName,
      dob: modalState.dob,
    });

    if (!ok) {
      modalDispatch({
        type: "SET_ERROR",
        payload: error || "Failed to update info",
      });
      setTimeout(() => modalDispatch({ type: "BEGIN_ERROR_FADE_OUT" }), 2500);
      setTimeout(() => modalDispatch({ type: "CLEAR_ERROR" }), 3000);
      return;
    }

    setShowModal(false);
  };

  if (state.status === "loading") return <p>Checking token…</p>;
  if (state.status === "error") return <p className="error">{state.message}</p>;
  if (actionData?.success) return <p>Submitted successfully!</p>;

  return (
    <div className="relative min-h-screen">
      <div className={showModal ? "blurred" : ""}>
        <h1>{title}</h1>
        <Form method="post">
          <input type="hidden" name="token" value={token} />
          {children}
          <br />
          <button type="submit">Submit</button>
          {actionData?.error && <p className="error">{actionData.error}</p>}
        </Form>
      </div>

      {showModal && (
        <ClientInfoModal
          name={modalState.name}
          dob={modalState.dob}
          error={modalState.error}
          errorFading={modalState.errorFading}
          onNameChange={(val) =>
            modalDispatch({ type: "SET_NAME", payload: val })
          }
          onDobChange={(val) =>
            modalDispatch({ type: "SET_DOB", payload: val })
          }
          onSubmit={handleClientInfoSubmit}
        />
      )}
    </div>
  );
}
