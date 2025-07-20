import { useParams } from "react-router-dom";
import QuestionnaireForm from "../components/QuestionnaireForm";

const BURNS = () => {
  const { token } = useParams<{ token: string }>();

  return (
    <QuestionnaireForm title="BURNS" questionnaire="BURNS" token={token}>
      <label>
        Full Name:
        <input name="fullName" type="text" required />
      </label>
      <br />
      <label>
        Date of Birth:
        <input name="dob" type="date" required />
      </label>
      <br />
      <label>
        Score (0–100):
        <input name="result" type="number" min="0" max="100" required />
      </label>
    </QuestionnaireForm>
  );
};

export default BURNS;
