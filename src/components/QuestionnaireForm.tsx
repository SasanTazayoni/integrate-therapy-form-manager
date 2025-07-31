import { useEffect, useReducer, useState, useRef } from "react";
import { Form, useActionData } from "react-router-dom";
import { validateFormToken, updateClientInfo } from "../api/formsFrontend";
import ClientInfoModal from "./modals/ClientInfoModal";
import InvalidTokenModal from "./modals/InvalidTokenModal";
import {
  clientInfoReducer,
  modalInitialState,
} from "../utils/clientInfoReducer";
import { Loader2 } from "lucide-react";
import { FORM_TITLES, type FormType } from "../constants/formTypes";

const DEFAULT_INVALID_MSG =
  "This form is not available. Please contact your therapist to receive a new form.";
const logoUrl = `${import.meta.env.BASE_URL}logo.png`;

type QuestionnaireFormProps = {
  title: string;
  questionnaire: FormType;
  token?: string;
  children: React.ReactNode;
  onError?: (error: string) => void;
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
}: QuestionnaireFormProps) {
  const actionData = useActionData() as { error?: string; success?: boolean };
  const [state, dispatch] = useReducer(reducer, { status: "loading" });
  const [modalState, modalDispatch] = useReducer(
    clientInfoReducer,
    modalInitialState
  );
  const [showModal, setShowModal] = useState(false);
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

      errorFadeTimer.current = window.setTimeout(() => {
        modalDispatch({ type: "BEGIN_ERROR_FADE_OUT" });
        errorFadeTimer.current = null;
      }, 2500);

      errorClearTimer.current = window.setTimeout(() => {
        modalDispatch({ type: "CLEAR_ERROR" });
        errorClearTimer.current = null;
      }, 3000);

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

      errorFadeTimer.current = window.setTimeout(() => {
        modalDispatch({ type: "BEGIN_ERROR_FADE_OUT" });
        errorFadeTimer.current = null;
      }, 2500);

      errorClearTimer.current = window.setTimeout(() => {
        modalDispatch({ type: "CLEAR_ERROR" });
        errorClearTimer.current = null;
      }, 3000);

      return;
    }

    setShowModal(false);
  };

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, []);

  if (state.status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen" aria-busy>
        <Loader2 className="animate-spin text-blue-600" size={200} />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="relative min-h-screen">
        <div className="blurred">
          <h1>{title}</h1>
        </div>
        <InvalidTokenModal message={DEFAULT_INVALID_MSG} />
      </div>
    );
  }

  if (actionData?.success) return <p>Submitted successfully!</p>;

  return (
    <div className="relative min-h-screen">
      <div className={showModal ? "blurred" : ""}>
        <div className="outer-container">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img
              src={logoUrl}
              alt="Integrate Therapy logo"
              aria-hidden="true"
              className="inline-block w-7 h-7 md:w-8 md:h-8 mb-8 shrink-0 select-none"
              draggable="false"
            />
            <h1 className="title">{FORM_TITLES.BECKS}</h1>
            <img
              src={logoUrl}
              alt="Integrate Therapy logo"
              aria-hidden="true"
              className="inline-block w-7 h-7 md:w-8 md:h-8 mb-8 shrink-0 select-none"
              draggable="false"
            />
          </div>

          <Form method="post">
            <input type="hidden" name="token" value={token} />
            {children}
          </Form>
        </div>
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
