import { useEffect, useReducer } from "react";
import { useSearchParams, Form, useActionData } from "react-router-dom";

type QuestionnaireFormProps = {
  title: string;
  questionnaire: "SMI" | "YSQ" | "BECKS" | "BURNS";
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
}: QuestionnaireFormProps) {
  const [searchParams] = useSearchParams();
  const actionData = useActionData() as { error?: string; success?: boolean };
  const token = searchParams.get("token") ?? "";

  const [state, dispatch] = useReducer(reducer, { status: "loading" });

  useEffect(() => {
    if (!token) {
      dispatch({ type: "INVALID", payload: "Missing token" });
      return;
    }

    fetch(`/api/validate-token?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (!(data.valid && data.questionnaire === questionnaire)) {
          throw new Error(data.message || "Invalid token for this form");
        }
        dispatch({ type: "VALID" });
      })
      .catch((err) =>
        dispatch({ type: "INVALID", payload: err.message || "Unknown error" })
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
