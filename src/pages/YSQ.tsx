import { useParams, useNavigate } from "react-router-dom";
import QuestionnaireForm from "../components/QuestionnaireForm";
import FormResetModal from "../components/modals/FormResetModal";
import InvalidTokenModal from "../components/modals/InvalidTokenModal";
import YSQEmotionalDeprivation from "../data/YSQEmotionalDeprivation";
import YSQAbandonment from "../data/YSQAbandonment";
import YSQMistrustAbuse from "../data/YSQMistrustAbuse";
import YSQSocialIsolation from "../data/YSQSocialIsolation";
import YSQDefectiveness from "../data/YSQDefectiveness";
import YSQFailure from "../data/YSQFailure";
import YSQDependence from "../data/YSQDependence";
import YSQVulnerability from "../data/YSQVulnerability";
import YSQEnmeshment from "../data/YSQEnmeshment";
import YSQSubjugation from "../data/YSQSubjugation";
import YSQSelfSacrifice from "../data/YSQSelfSacrifice";
import YSQEmotionalInhibition from "../data/YSQEmotionalInhibition";
import YSQUnrelentingStandards from "../data/YSQUnrelentingStandards";
import YSQEntitlement from "../data/YSQEntitlement";
import YSQInsufficientSelfControl from "../data/YSQInsufficientSelfControl";
import YSQApprovalSeeking from "../data/YSQApprovalSeeking";
import YSQNegativityPessimism from "../data/YSQNegativityPessimism";
import YSQPunitiveness from "../data/YSQPunitiveness";
import { Item } from "../data/YSQCommon";
import useYSQForm from "../hooks/useYSQForm";
import useValidateToken from "../hooks/useValidateToken";
import Question from "../components/YSQQuestions";
import { Loader2 } from "lucide-react";
import { submitYSQForm } from "../api/formsFrontend";
import YSQInstructions from "../components/YSQInstructions";

const YSQ_SCHEMAS = [
  { key: "ed", label: "Emotional Deprivation", data: YSQEmotionalDeprivation },
  { key: "ab", label: "Abandonment", data: YSQAbandonment },
  { key: "ma", label: "Mistrust/Abuse", data: YSQMistrustAbuse },
  { key: "si", label: "Social Isolation", data: YSQSocialIsolation },
  { key: "ds", label: "Defectiveness", data: YSQDefectiveness },
  { key: "fa", label: "Failure", data: YSQFailure },
  { key: "di", label: "Dependence", data: YSQDependence },
  { key: "vu", label: "Vulnerability", data: YSQVulnerability },
  { key: "eu", label: "Enmeshment", data: YSQEnmeshment },
  { key: "sb", label: "Subjugation", data: YSQSubjugation },
  { key: "ss", label: "Self Sacrifice", data: YSQSelfSacrifice },
  { key: "ei", label: "Emotional Inhibition", data: YSQEmotionalInhibition },
  { key: "us", label: "Unrelenting Standards", data: YSQUnrelentingStandards },
  { key: "et", label: "Entitlement", data: YSQEntitlement },
  {
    key: "is",
    label: "Insufficient Self Control",
    data: YSQInsufficientSelfControl,
  },
  { key: "as", label: "Approval Seeking", data: YSQApprovalSeeking },
  { key: "np", label: "Negativity/Pessimism", data: YSQNegativityPessimism },
  { key: "pu", label: "Punitiveness", data: YSQPunitiveness },
];

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

    const scores = YSQ_SCHEMAS.reduce((acc, schema) => {
      acc[`ysq_${schema.key}_answers`] = schema.data.map((item) =>
        Number(answers[item.id] ?? 0)
      );
      return acc;
    }, {} as Record<string, number[]>);

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
        <YSQInstructions />

        <div className="border-2 border-gray-400 divide-y divide-gray-400 rounded-lg">
          {YSQ_SCHEMAS.map((schema) => (
            <section key={schema.key} aria-label={schema.label}>
              {schema.data.map(renderQuestion)}
            </section>
          ))}
        </div>

        <div className="min-h-[1.5rem] text-center mt-4">
          {formError && <p className="text-red-600 font-bold">{formError}</p>}
        </div>

        <div className="flex justify-center mt-2 space-x-4">
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
        <FormResetModal
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
