import { useParams, useNavigate } from "react-router-dom";
import QuestionnaireForm from "../components/QuestionnaireForm";
import FormResetModal from "../components/modals/FormResetModal";
import InvalidTokenModal from "../components/modals/InvalidTokenModal";
import BURNS_ITEMS from "../data/BURNSItems";
import useBurnsForm from "../hooks/useBURNSForm";
import useValidateToken from "../hooks/useValidateToken";
import BurnsQuestions from "../components/BurnsQuestions";
import { submitBurnsForm } from "../api/formsFrontend";
import { Loader2 } from "lucide-react";
import Button from "../components/ui/Button";
import { submitFormWithToken } from "../utils/burnsHelpers";

const BURNS = () => {
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
  } = useBurnsForm();

  const onValidSubmit = () =>
    submitFormWithToken({
      token,
      result: total.toString(),
      submitFn: submitBurnsForm,
      setFormError,
      setShowInvalidTokenModal,
      navigate,
    });

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
      title="Burns Anxiety Inventory"
      questionnaire="BURNS"
      token={token}
      onError={setFormError}
      onSubmit={handleSubmit(onValidSubmit)}
    >
      <div className="questionnaire">
        {BURNS_ITEMS.map((item, index) => {
          const isFirstOfCategory =
            index === 0 || BURNS_ITEMS[index - 1].category !== item.category;

          return (
            <div key={item.id} className="mb-2 md:mb-6 sm:mb-4">
              {isFirstOfCategory && (
                <h2 className="text-gray-600 text-base md:text-2xl mt-5 mb-6 font-semibold text-center">
                  {item.category}
                </h2>
              )}

              <BurnsQuestions
                item={item}
                answers={answers}
                handleChange={handleChange}
                missingIds={missingIds}
              />
            </div>
          );
        })}
      </div>

      <input type="hidden" name="result" value={total} />

      <div className="min-h-[1.5rem] text-center mt-4">
        {formError && <p className="text-red-600 font-bold">{formError}</p>}
      </div>

      <div className="flex justify-center mt-2 space-x-4">
        <Button type="submit" variant="primary">
          Submit
        </Button>

        <Button type="button" variant="primary" onClick={handleResetClick}>
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

export default BURNS;
