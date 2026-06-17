import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QuestionnaireForm from "../components/QuestionnaireForm";
import FormResetModal from "../components/modals/FormResetModal";
import InvalidTokenModal from "../components/modals/InvalidTokenModal";
import BECKS_ITEMS from "../data/BECKSItems";
import useBecksForm from "../hooks/useBECKSForm";
import { submitBecksForm } from "../api/formsFrontend";
import BecksQuestions from "../components/BecksQuestions";
import Button from "../components/Button";
import { submitFormWithToken } from "../utils/becksBurnsHelpers";

const BECKS = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [showInvalidTokenModal, setShowInvalidTokenModal] = useState(false);

  const {
    answers,
    formError,
    resetModalOpen,
    resetModalClosing,
    handleChange,
    handleSubmit,
    handleResetClick,
    confirmReset,
    cancelReset,
    handleModalCloseFinished,
    setFormError,
    missingIds,
  } = useBecksForm();

  const totalScore = Object.values(answers).reduce<number>(
    (sum, val) => sum + val,
    0
  );

  const onValidSubmit = () =>
    submitFormWithToken({
      token,
      result: totalScore.toString(),
      submitFn: submitBecksForm,
      setFormError,
      setShowInvalidTokenModal,
      navigate,
    });

  if (showInvalidTokenModal) {
    return <InvalidTokenModal />;
  }

  return (
    <QuestionnaireForm
      questionnaire="BECKS"
      token={token}
      onError={setFormError}
      onSubmit={handleSubmit(onValidSubmit)}
    >
      <div className="questionnaire">
        {BECKS_ITEMS.map((item) => (
          <BecksQuestions
            key={item.id}
            item={item}
            answers={answers}
            handleChange={handleChange}
            missingIds={missingIds}
          />
        ))}
      </div>

      <input type="hidden" name="result" value={totalScore} />

      <div className="min-h-[1.5rem] text-center mt-4">
        {formError && <p className="text-red-600 font-bold">{formError}</p>}
      </div>

      <div className="flex justify-center mt-2 space-x-4">
        <Button type="submit" variant="primary">
          Submit
        </Button>

        <Button type="button" variant="danger" onClick={handleResetClick}>
          Reset
        </Button>
      </div>

      {resetModalOpen && (
        <FormResetModal
          onConfirm={confirmReset}
          onCancel={cancelReset}
          closing={resetModalClosing}
          onCloseFinished={handleModalCloseFinished}
        />
      )}
    </QuestionnaireForm>
  );
};

export default BECKS;
