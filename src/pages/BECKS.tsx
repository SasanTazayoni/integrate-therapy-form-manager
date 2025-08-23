import { useParams, useNavigate } from "react-router-dom";
import QuestionnaireForm from "../components/QuestionnaireForm";
import FormResetModal from "../components/modals/FormResetModal";
import InvalidTokenModal from "../components/modals/InvalidTokenModal";
import BECKS_ITEMS from "../data/BECKSItems";
import useBecksForm from "../hooks/useBECKSForm";
import { submitBecksForm } from "../api/formsFrontend";
import useValidateToken from "../hooks/useValidateToken";
import BecksQuestions from "../components/BecksQuestions";
import { Loader2 } from "lucide-react";

const BECKS = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isValid, showInvalidTokenModal, setShowInvalidTokenModal } =
    useValidateToken(token);

  const {
    answers,
    total,
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

  const onValidSubmit = async () => {
    if (!token) {
      setFormError("Token missing");
      return;
    }

    const totalScore = Object.values(answers).reduce<number>(
      (sum, val) => sum + val,
      0
    );

    const { ok, error, code } = await submitBecksForm({
      token,
      result: totalScore.toString(),
    });

    if (!ok) {
      if (code === "INVALID_TOKEN") {
        setShowInvalidTokenModal(true);
        return;
      }

      setFormError(error ?? "Failed to submit the form.");
      return;
    }

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
    <QuestionnaireForm
      title="BECKS"
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

      <input type="hidden" name="result" value={total} />

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
