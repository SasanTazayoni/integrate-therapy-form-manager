import { useEffect, useReducer, useState, useRef } from "react";
import { useActionData } from "react-router-dom";
import { validateFormToken, updateClientInfo } from "../api/formsFrontend";
import ClientInfoModal from "./modals/ClientInfoModal";
import InvalidTokenModal from "./modals/InvalidTokenModal";
import {
  clientInfoReducer,
  modalInitialState,
} from "../utils/clientInfoReducer";
import { FORM_TITLES, type FormType } from "../constants/formTypes";
import setErrorTimers from "../utils/startErrorFadeTimers";
import { Loader2 } from "lucide-react";

const DEFAULT_INVALID_MSG =
  "This form is not available. Please contact your therapist to receive a new form.";

type QuestionnaireFormProps = {
  title: string;
  questionnaire: FormType;
  token?: string;
  children: React.ReactNode;
  onError?: (error: string) => void;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
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
  onError,
  onSubmit,
}: QuestionnaireFormProps) {
  const actionData = useActionData() as { error?: string; success?: boolean };
  const [state, dispatch] = useReducer(reducer, { status: "loading" });
  const [modalState, modalDispatch] = useReducer(
    clientInfoReducer,
    modalInitialState
  );
  const [showModal, setShowModal] = useState(false);
  const [closing, setClosing] = useState(false);
  const errorFadeTimer = useRef<number | null>(null);
  const errorClearTimer = useRef<number | null>(null);

  const clearTimers = () => {
    if (errorFadeTimer.current != null) {
      clearTimeout(errorFadeTimer.current);
      errorFadeTimer.current = null;
    }
    if (errorClearTimer.current != null) {
      clearTimeout(errorClearTimer.current);
      errorClearTimer.current = null;
    }
  };

  useEffect(() => {
    let active = true;

    if (!token) {
      dispatch({ type: "INVALID", payload: DEFAULT_INVALID_MSG });
      return () => {
        active = false;
      };
    }

    validateFormToken(token)
      .then(({ ok, data, error }) => {
        if (!active) return;

        if (!ok || !data) {
          throw new Error(error || DEFAULT_INVALID_MSG);
        }
        if (!(data.valid && data.questionnaire === questionnaire)) {
          throw new Error(data.message || DEFAULT_INVALID_MSG);
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
        if (!active) return;
        dispatch({
          type: "INVALID",
          payload: err.message || DEFAULT_INVALID_MSG,
        });
      });

    return () => {
      active = false;
    };
  }, [token, questionnaire]);

  useEffect(() => {
    if (actionData?.error && onError) {
      onError(actionData.error);
    }
  }, [actionData?.error, onError]);

  const handleClientInfoSubmit = async () => {
    if (!token) return;

    clearTimers();

    let errorMessage = "";
    const trimmedName = modalState.name.trim();
    const hasName = trimmedName.length > 0;
    const hasDob = !!modalState.dob;

    if (!hasName && !hasDob) errorMessage = "Inputs cannot be empty";
    else if (!hasName) errorMessage = "Please enter your full name";
    else if (!hasDob) errorMessage = "Please enter your date of birth";

    if (errorMessage) {
      modalDispatch({ type: "SET_ERROR", payload: errorMessage });

      setErrorTimers(
        modalDispatch,
        "BEGIN_ERROR_FADE_OUT",
        "CLEAR_ERROR",
        2500,
        3000,
        errorFadeTimer,
        errorClearTimer
      );

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

      setErrorTimers(
        modalDispatch,
        "BEGIN_ERROR_FADE_OUT",
        "CLEAR_ERROR",
        2500,
        3000,
        errorFadeTimer,
        errorClearTimer
      );

      return;
    }

    setClosing(true);

    setTimeout(() => {
      setShowModal(false);
      setClosing(false);
    }, 500);
  };

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, []);

  if (state.status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen" aria-busy>
        <Loader2 className="animate-spin text-blue-600" size={120} />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="relative min-h-screen">
        <div className="blurred">
          <h1>{title}</h1>
        </div>
        <InvalidTokenModal />
      </div>
    );
  }

  if (actionData?.success) return <p>Submitted successfully!</p>;

  return (
    <div className="relative min-h-screen">
      <div className={showModal ? "blurred" : ""}>
        <div className="outer-container">
          <div className="flex flex-col items-center justify-center mb-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <h1 className="title">{FORM_TITLES[questionnaire]}</h1>
            </div>
          </div>

          <form onSubmit={onSubmit}>
            <input type="hidden" name="token" value={token} />
            {children}
          </form>
        </div>
      </div>

      {showModal && (
        <ClientInfoModal
          name={modalState.name}
          dob={modalState.dob}
          error={modalState.error}
          errorFading={modalState.errorFading}
          closing={closing}
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
