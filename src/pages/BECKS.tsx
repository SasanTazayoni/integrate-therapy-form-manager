import QuestionnaireForm from "../components/QuestionnaireForm";

const BECKS = () => (
  <QuestionnaireForm title="BECKS" questionnaire="BECKS">
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
      Score (0–63):
      <input name="result" type="number" min="0" max="63" required />
    </label>
  </QuestionnaireForm>
);

export default BECKS;
