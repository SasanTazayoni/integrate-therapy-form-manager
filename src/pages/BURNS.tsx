import { useParams } from "react-router-dom";
import QuestionnaireForm from "../components/QuestionnaireForm";
import FormResetConfirmModal from "../components/modals/FormResetConfirmModal";
import InvalidTokenModal from "../components/modals/InvalidTokenModal";
import useBurnsForm from "../hooks/useBURNSForm";
import useValidateToken from "../hooks/useValidateToken";
// import { submitBurnsForm } from "../api/formsFrontend";
import BurnsQuestions from "../components/BurnsQuestions";
import BURNS_ITEMS from "../data/BURNSItems";
import { Loader2 } from "lucide-react";

const BURNS = () => {
  const { token } = useParams<{ token: string }>();
  const { isValid, showInvalidTokenModal, setShowInvalidTokenModal } =
    useValidateToken(token);

  const {
    answers,
    formError,
    setFormError,
    missingIds,
    handleChange,
    handleSubmit,
    resetModalOpen,
    resetModalClosing,
    handleResetClick,
    confirmReset,
    cancelReset,
    handleModalCloseFinished,
  } = useBurnsForm();

  const onValidSubmit = async () => {
    if (!token) {
      setFormError("Token missing");
      return;
    }

    const unanswered = BURNS_ITEMS.filter((item) => !(item.id in answers)).map(
      (item) => item.id
    );

    if (unanswered.length > 0) {
      setFormError("Please answer all questions before submitting.");
      return;
    }

    setFormError("");
    const isFakeInvalidToken = token === "invalid"; // replace with whatever you want

    if (isFakeInvalidToken) {
      setShowInvalidTokenModal(true);
      return;
    }

    console.log("Form ready to submit:", answers);
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

  const subtitle = BURNS_ITEMS[0]?.category || "";

  return (
    <QuestionnaireForm
      title="Burns Anxiety Inventory"
      subtitle={subtitle}
      questionnaire="BURNS"
      token={token}
      onError={setFormError}
      onSubmit={handleSubmit(onValidSubmit)}
    >
      <div className="questionnaire">
        {BURNS_ITEMS.map((item) => (
          <BurnsQuestions
            key={item.id}
            item={item}
            answers={answers}
            handleChange={handleChange}
            missingIds={missingIds}
          />
        ))}
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

      {resetModalOpen && (
        <FormResetConfirmModal
          onConfirm={confirmReset}
          onCancel={cancelReset}
          closing={resetModalClosing}
          onCloseFinished={handleModalCloseFinished}
        />
      )}
    </QuestionnaireForm>
  );
};

export default BURNS;
