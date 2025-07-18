import { useEffect, useState } from "react";
import { useSearchParams, Form, useActionData } from "react-router-dom";

type QuestionnaireFormProps = {
  title: string;
  questionnaire: "SMI" | "YSQ" | "BECKS" | "BURNS";
  children: React.ReactNode;
};

const QuestionnaireForm = ({
  title,
  questionnaire,
  children,
}: QuestionnaireFormProps) => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const actionData = useActionData() as { error?: string; success?: boolean };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Missing token");
      setLoading(false);
      return;
    }

    fetch(`/api/validate-token?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (!(data.valid && data.questionnaire === questionnaire)) {
          throw new Error(data.message || "Invalid token for this form");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token, questionnaire]);

  if (loading) return <p>Checking token…</p>;
  if (error) return <p className="error">{error}</p>;
  if (actionData?.success) return <p>✅ Submitted successfully!</p>;

  return (
    <div>
      <h1>{title}</h1>
      <Form method="post">
        <input type="hidden" name="token" value={token || ""} />
        {children}
        <br />
        <button type="submit">Submit</button>
        {actionData?.error && <p className="error">{actionData.error}</p>}
      </Form>
    </div>
  );
};

export default QuestionnaireForm;
