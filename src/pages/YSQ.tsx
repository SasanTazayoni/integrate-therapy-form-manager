import { useParams } from "react-router-dom";
import QuestionnaireForm from "../components/QuestionnaireForm";
import FormResetConfirmModal from "../components/modals/FormResetConfirmModal";
import InvalidTokenModal from "../components/modals/InvalidTokenModal";
import YSQEmotionalDeprivation from "../data/YSQEmotionalDeprivation";
import YSQAbandonment from "../data/YSQAbandonment";
// import YSQMistrustAbuse from "../data/YSQMistrustAbuse";
// import YSQSocialIsolation from "../data/YSQSocialIsolation";
// import YSQDefectiveness from "../data/YSQDefectiveness";
// import YSQFailure from "../data/YSQFailure";
// import YSQDependence from "../data/YSQDependence";
// import YSQVulnerability from "../data/YSQVulnerability";
// import YSQEnmeshment from "../data/YSQEnmeshment";
// import YSQSubjugation from "../data/YSQSubjugation";
// import YSQSelfSacrifice from "../data/YSQSelfSacrifice";
// import YSQEmotionalInhibition from "../data/YSQEmotionalInhibition";
// import YSQUnrelentingStandards from "../data/YSQUnrelentingStandards";
// import YSQEntitlement from "../data/YSQEntitlement";
// import YSQInsufficientSelfControl from "../data/YSQInsufficientSelfControl";
// import YSQApprovalSeeking from "../data/YSQApprovalSeeking";
// import YSQNegativityPessimism from "../data/YSQNegativityPessimism";
// import YSQPunitiveness from "../data/YSQPunitiveness";
import useYSQForm from "../hooks/useYSQForm";
import useValidateToken from "../hooks/useValidateToken";
import Question from "../components/YSQQuestions";
import { Loader2 } from "lucide-react";
import { submitYSQForm } from "../api/formsFrontend";

const YSQ = () => {
  const { token } = useParams<{ token: string }>();

  const { isValid, showInvalidTokenModal, setShowInvalidTokenModal } =
    useValidateToken(token);

  const {
    answers,
    total,
    formError,
    missingIds,
    resetModalOpen,
    resetModalClosing,
    handleChange,
    handleSubmit,
    handleResetClick,
    confirmReset,
    cancelReset,
    handleModalCloseFinished,
    setFormError,
  } = useYSQForm();

  const onValidSubmit = async () => {
    if (!token) {
      setFormError("Token missing");
      return;
    }

    const emotionalDeprivationTotal = YSQEmotionalDeprivation.reduce(
      (sum, item) => {
        const val = answers[item.id] ?? 0;
        return sum + val;
      },
      0
    );

    const abandonmentTotal = YSQAbandonment.reduce((sum, item) => {
      const val = answers[item.id] ?? 0;
      return sum + val;
    }, 0);

    console.log("Emotional Deprivation Total:", emotionalDeprivationTotal);
    console.log("Abandonment Total:", abandonmentTotal);

    // No submission or navigation for now
  };

  if (isValid === null) {
    return (
      <div className="flex justify-center items-center min-h-screen" aria-busy>
        <Loader2 className="animate-spin text-blue-600" size={120} />
      </div>
    );
  }

  if (showInvalidTokenModal) {
    return <InvalidTokenModal />;
  }

  const renderQuestion = (item: {
    id: number;
    prompt: string;
    options: any;
  }) => (
    <Question
      key={item.id}
      item={item}
      value={answers[item.id]}
      onChange={(value) => handleChange(item.id, value)}
      showError={missingIds.includes(item.id)}
    />
  );

  return (
    <>
      <QuestionnaireForm
        title="YSQ"
        questionnaire="YSQ"
        token={token}
        onError={setFormError}
        onSubmit={handleSubmit(onValidSubmit)}
      >
        <section>
          <h3>Emotional Deprivation (Items 1–9)</h3>
          {YSQEmotionalDeprivation.map(renderQuestion)}
        </section>

        <section>
          <h3>Abandonment (Items 10–26)</h3>
          {YSQAbandonment.map(renderQuestion)}
        </section>

        {/* <section>
    <h3>Mistrust / Abuse (Items 27–43)</h3>
    {YSQMistrustAbuse.map(renderQuestion)}
  </section>

  <section>
    <h3>Social Isolation (Items 44–53)</h3>
    {YSQSocialIsolation.map(renderQuestion)}
  </section>

  <section>
    <h3>Defectiveness (Items 54–68)</h3>
    {YSQDefectiveness.map(renderQuestion)}
  </section>

  <section>
    <h3>Failure (Items 69–77)</h3>
    {YSQFailure.map(renderQuestion)}
  </section>

  <section>
    <h3>Dependence (Items 78–92)</h3>
    {YSQDependence.map(renderQuestion)}
  </section>

  <section>
    <h3>Vulnerability (Items 93–104)</h3>
    {YSQVulnerability.map(renderQuestion)}
  </section>

  <section>
    <h3>Enmeshment (Items 105–115)</h3>
    {YSQEnmeshment.map(renderQuestion)}
  </section>

  <section>
    <h3>Subjugation (Items 116–125)</h3>
    {YSQSubjugation.map(renderQuestion)}
  </section>

  <section>
    <h3>Self-Sacrifice (Items 126–142)</h3>
    {YSQSelfSacrifice.map(renderQuestion)}
  </section>

  <section>
    <h3>Emotional Inhibition (Items 143–151)</h3>
    {YSQEmotionalInhibition.map(renderQuestion)}
  </section>

  <section>
    <h3>Unrelenting Standards (Items 152–167)</h3>
    {YSQUnrelentingStandards.map(renderQuestion)}
  </section>

  <section>
    <h3>Entitlement (Items 168-178)</h3>
    {YSQEntitlement.map(renderQuestion)}
  </section>

  <section>
    <h3>Insufficient Self-Control (Items 179–193)</h3>
    {YSQInsufficientSelfControl.map(renderQuestion)}
  </section>

  <section>
    <h3>Approval Seeking (Items 194–207)</h3>
    {YSQApprovalSeeking.map(renderQuestion)}
  </section>

  <section>
    <h3>Negativity/Pessimism (Items 208–218)</h3>
    {YSQNegativityPessimism.map(renderQuestion)}
  </section>

  <section>
    <h3>Punitiveness (Items 219–232)</h3>
    {YSQPunitiveness.map(renderQuestion)}
  </section> */}

        <input type="hidden" name="result" value={total} />

        <div className="min-h-[1.5rem] text-center mt-4">
          {formError && <p className="text-red-600 font-bold">{formError}</p>}
        </div>

        <div className="flex justify-center mt-6 space-x-4">
          <button
            type="submit"
            className="bg-blue-500 text-white px-8 py-2 rounded hover:bg-blue-600 transition"
          >
            Submit
          </button>

          <button
            type="button"
            className="bg-gray-500 text-white px-8 py-2 rounded hover:bg-gray-600 transition"
            onClick={handleResetClick}
          >
            Reset
          </button>
        </div>
      </QuestionnaireForm>

      {resetModalOpen && (
        <FormResetConfirmModal
          onConfirm={confirmReset}
          onCancel={cancelReset}
          closing={resetModalClosing}
          onCloseFinished={handleModalCloseFinished}
        />
      )}
    </>
  );
};

export default YSQ;
