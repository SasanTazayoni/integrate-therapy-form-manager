import { useParams, useNavigate } from "react-router-dom";
import QuestionnaireForm from "../components/QuestionnaireForm";
import FormResetModal from "../components/modals/FormResetModal";
import InvalidTokenModal from "../components/modals/InvalidTokenModal";
import SMIItems from "../data/SMIItems";
import { Item } from "../data/SMICommon";
import useSMIForm from "../hooks/useSMIForm";
import useValidateToken from "../hooks/useValidateToken";
import Question from "../components/SMIQuestions";
import { submitSMIForm } from "../api/formsFrontend";
import { Loader2 } from "lucide-react";
import SMIInstructions from "../components/SMIInstructions";
import {
  smiBoundaries,
  classifyScore,
  categoryKeyMap,
} from "../data/SMIBoundaries";

const SMI = () => {
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
  } = useSMIForm();

  const onValidSubmit = async () => {
    if (!token) {
      setFormError("Token missing");
      return;
    }

    const scoresByCategory: Record<string, number> = {};
    const countsByCategory: Record<string, number> = {};

    SMIItems.forEach((item) => {
      const answerValue = Number(answers[item.id] ?? 0);
      if (!scoresByCategory[item.category]) {
        scoresByCategory[item.category] = 0;
        countsByCategory[item.category] = 0;
      }
      scoresByCategory[item.category] += answerValue;
      countsByCategory[item.category] += 1;
    });

    const results: Record<string, { average: number; label: string }> = {};

    for (const category in scoresByCategory) {
      const avg = Number(
        (scoresByCategory[category] / countsByCategory[category]).toFixed(2)
      );

      const boundaryKey = categoryKeyMap[category];
      const label =
        boundaryKey && smiBoundaries[boundaryKey]
          ? classifyScore(avg, smiBoundaries[boundaryKey])
          : "Unknown";

      results[category] = { average: avg, label };
    }

    const { ok, error, code } = await submitSMIForm({ token, results });

    if (!ok) {
      if (code === "INVALID_TOKEN") {
        setShowInvalidTokenModal(true);
        return;
      }
      setFormError(error ?? "Failed to submit the SMI form.");
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
        title="SMI"
        questionnaire="SMI"
        token={token}
        onError={setFormError}
        onSubmit={handleSubmit(onValidSubmit)}
      >
        <SMIInstructions />

        <div className="border-2 border-gray-400 divide-y divide-gray-400 rounded-lg">
          {SMIItems.map(renderQuestion)}
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

export default SMI;
