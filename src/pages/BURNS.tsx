import QuestionnaireForm from "../components/QuestionnaireForm";

const BURNS = () => (
  <QuestionnaireForm title="BURNS" questionnaire="BURNS">
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

export default BURNS;
