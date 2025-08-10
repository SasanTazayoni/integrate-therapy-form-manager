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
import { Item } from "../data/YSQCommon";
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
      (sum, item) => sum + (answers[item.id] ?? 0),
      0
    );

    const abandonmentTotal = YSQAbandonment.reduce(
      (sum, item) => sum + (answers[item.id] ?? 0),
      0
    );

    const scores = {
      ysq_ed_score: emotionalDeprivationTotal.toString(),
      ysq_ab_score: abandonmentTotal.toString(),
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
    console.log("YSQ form submitted successfully");
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
        <div className="border-2 border-gray-400 divide-y divide-gray-400 rounded-lg">
          <section>{YSQEmotionalDeprivation.map(renderQuestion)}</section>
          <section>{YSQAbandonment.map(renderQuestion)}</section>
        </div>

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
