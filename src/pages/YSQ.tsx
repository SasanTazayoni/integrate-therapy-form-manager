import QuestionnaireForm from "../components/QuestionnaireForm";

const YSQ = () => (
  <QuestionnaireForm title="YSQ" questionnaire="YSQ">
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
      Score (0–300):
      <input name="result" type="number" min="0" max="300" required />
    </label>
  </QuestionnaireForm>
);

export default YSQ;
