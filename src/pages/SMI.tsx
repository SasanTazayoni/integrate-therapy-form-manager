import { useParams } from "react-router-dom";
import QuestionnaireForm from "../components/QuestionnaireForm";

const SMI = () => {
  const { token } = useParams<{ token: string }>();

  return (
    <QuestionnaireForm title="SMI" questionnaire="SMI" token={token}>
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
        Score (1–6):
        <input name="result" type="number" min="1" max="6" required />
      </label>
    </QuestionnaireForm>
  );
};

export default SMI;
