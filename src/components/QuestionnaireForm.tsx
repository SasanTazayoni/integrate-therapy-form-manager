import { useEffect, useReducer } from "react";
import { Form, useActionData } from "react-router-dom";
import axios from "axios";

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

  useEffect(() => {
    if (!token) {
      dispatch({ type: "INVALID", payload: "Missing token" });
      return;
    }

    axios
      .get(`/forms/validate-token`, { params: { token } })
      .then((response) => {
        const data = response.data;

        if (!(data.valid && data.questionnaire === questionnaire)) {
          throw new Error(data.message || "Invalid token for this form");
        }

        dispatch({ type: "VALID" });
      })
      .catch((err) =>
        dispatch({
          type: "INVALID",
          payload:
            err.response?.data?.message ||
            err.message ||
            "Unknown error validating token",
        })
      );
  }, [token, questionnaire]);

  if (state.status === "loading") return <p>Checking token…</p>;
  if (state.status === "error") return <p className="error">{state.message}</p>;
  if (actionData?.success) return <p>Submitted successfully!</p>;

  return (
    <div>
      <h1>{title}</h1>
      <Form method="post">
        <input type="hidden" name="token" value={token} />
        {children}
        <br />
        <button type="submit">Submit</button>
        {actionData?.error && <p className="error">{actionData.error}</p>}
      </Form>
    </div>
  );
}
