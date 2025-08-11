import { useParams, useNavigate } from "react-router-dom";
import QuestionnaireForm from "../components/QuestionnaireForm";
import FormResetConfirmModal from "../components/modals/FormResetConfirmModal";
import InvalidTokenModal from "../components/modals/InvalidTokenModal";
import YSQEmotionalDeprivation from "../data/YSQEmotionalDeprivation";
// import YSQAbandonment from "../data/YSQAbandonment";
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
import { Item } from "../data/YSQCommon";
import useYSQForm from "../hooks/useYSQForm";
import useValidateToken from "../hooks/useValidateToken";
import Question from "../components/YSQQuestions";
import { Loader2 } from "lucide-react";
import { submitYSQForm } from "../api/formsFrontend";

const YSQ = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const { isValid, showInvalidTokenModal, setShowInvalidTokenModal } =
    useValidateToken(token);

  const {
    answers,
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

    const emotionalDeprivationAnswers = YSQEmotionalDeprivation.map((item) =>
      Number(answers[item.id] ?? 0)
    );

    const scores = {
      ysq_ed_answers: emotionalDeprivationAnswers,
    };

    const { ok, error, code } = await submitYSQForm({
      token,
      scores,
    });

    if (!ok) {
      if (code === "INVALID_TOKEN") {
        setShowInvalidTokenModal(true);
        return;
      }
      setFormError(error ?? "Failed to submit the YSQ form.");
      return;
    }

    setFormError("");
    navigate("/submitted");
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

  const renderQuestion = (item: Item) => (
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
        <div className="mb-6 p-4 border-2 border-gray-400 divide-gray-400 rounded-lg">
          <p className="font-bold mb-2">INSTRUCTIONS:</p>
          <p className="mb-4 text-gray-900">
            Listed below are statements that you might use to describe yourself.
            Please read each statement and decide how well it describes you.
            When you are not sure, base your answer on what you emotionally
            feel, not on what you think to be true. If you desire, reword the
            statement so that it would be even more accurate in describing you
            (but do not change the basic meaning of the question). Then choose
            the highest rating from 1 to 6 that best describes you (including
            your revisions) and write the number on the line before each
            statement.
          </p>

          <p className="font-bold mb-1">Rating Scale:</p>
          <ul className="list-none space-y-1">
            <li>1 – Completely untrue of me</li>
            <li>2 – Mostly untrue of me</li>
            <li>3 – Slightly more true than untrue</li>
            <li>4 – Moderately true of me</li>
            <li>5 – Mostly true of me</li>
            <li>6 – Describes me perfectly</li>
          </ul>
        </div>

        <div className="mb-6 p-4 border-2 border-gray-400 divide-gray-400 rounded-lg">
          <p className="font-bold">Example:</p>
          <p className="text-gray-900">
            I worry that people{" "}
            <em className="text-blue-600 font-bold">I care about</em> will not
            like me.
          </p>
        </div>

        <div className="border-2 border-gray-400 divide-y divide-gray-400 rounded-lg">
          <section>{YSQEmotionalDeprivation.map(renderQuestion)}</section>
        </div>

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
