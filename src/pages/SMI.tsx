import { useParams, useNavigate } from "react-router-dom";
import { useRef } from "react";
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
import Button from "../components/ui/Button";
import { computeSMIScores } from "../utils/SMIHelpers";
import { smiBoundaries, categoryKeyMap } from "../data/SMIBoundaries";
import RatingScaleTooltip from "../components/RatingScaleTooltip";

const SMI_RATING_SCALE = [
  "1 = Never or Almost Never",
  "2 = Rarely",
  "3 = Occasionally",
  "4 = Frequently",
  "5 = Most of the time",
  "6 = All of the time",
];

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

  const questionRefs = useRef<HTMLInputElement[]>([]);

  const registerRef = (input: HTMLInputElement | null) => {
    if (input && !questionRefs.current.includes(input)) {
      questionRefs.current.push(input);
    }
  };

  const focusQuestion = (index: number) => {
    const input = questionRefs.current[index];
    input?.focus();
  };

  const renderQuestion = (item: Item, index: number) => (
    <Question
      key={item.id}
      item={item}
      value={answers[item.id]}
      onChange={(value) => handleChange(item.id, value)}
      showError={missingIds.includes(item.id)}
      ref={registerRef}
      onArrowDown={() => focusQuestion(index + 1)}
      onArrowUp={() => focusQuestion(index - 1)}
    />
  );

  const onValidSubmit = async () => {
    if (!token) {
      setFormError("Token missing");
      return;
    }

    const results = computeSMIScores(
      answers,
      SMIItems,
      categoryKeyMap,
      smiBoundaries
    );

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

  return (
    <>
      <RatingScaleTooltip
        title="SMI Frequency Scale"
        items={SMI_RATING_SCALE}
      />

      <QuestionnaireForm
        title="SMI"
        questionnaire="SMI"
        token={token}
        onError={setFormError}
        onSubmit={handleSubmit(onValidSubmit)}
      >
        <SMIInstructions />

        <div className="border-2 border-gray-400 divide-y divide-gray-400 rounded-lg">
          {SMIItems.map((item, index) => renderQuestion(item, index))}
        </div>

        <div className="min-h-[1.5rem] text-center mt-4">
          {formError && <p className="text-red-600 font-bold">{formError}</p>}
        </div>

        <div className="flex justify-center mt-2 space-x-4">
          <Button type="submit">Submit</Button>

          <Button type="button" variant="danger" onClick={handleResetClick}>
            Reset
          </Button>
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
