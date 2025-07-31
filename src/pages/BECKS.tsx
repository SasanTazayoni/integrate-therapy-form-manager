import { useParams } from "react-router-dom";
import QuestionnaireForm from "../components/QuestionnaireForm";
import FormResetConfirmModal from "../components/modals/FormResetConfirmModal";
import BECKS_ITEMS from "../data/BECKSItems";
import useBecksForm from "../hooks/useBECKSForm";

const BECKS = () => {
  const { token } = useParams<{ token: string }>();
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
  } = useBecksForm();

  return (
    <QuestionnaireForm
      title="BECKS"
      questionnaire="BECKS"
      token={token}
      onError={setFormError}
      onSubmit={handleSubmit(() => {
        // Handle successful submission logic here
      })}
    >
      <div className="questionnaire">
        {BECKS_ITEMS.map((item) => (
          <fieldset key={item.id} className="question">
            <legend className="question-title">{item.prompt}</legend>
            <div className="options">
              {item.options.map((opt) => {
                const inputId = `q${item.id}-${opt.value}`;
                const name = `q${item.id}`;
                const checked = answers[item.id] === opt.value;
                return (
                  <div
                    className="option"
                    key={opt.value}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      if (checked) {
                        const updated = { ...answers };
                        delete updated[item.id];
                        handleChange(item.id, updated[item.id]);
                      }
                    }}
                  >
                    <input
                      id={inputId}
                      className="option-input"
                      type="radio"
                      name={name}
                      value={opt.value}
                      checked={checked || false}
                      onChange={() => handleChange(item.id, opt.value)}
                    />
                    <label htmlFor={inputId} className="option-label">
                      <span className="badge">{opt.value}</span>
                      <span>{opt.text}</span>
                    </label>
                  </div>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <input type="hidden" name="result" value={total} />

      {formError && (
        <p className="text-red-600 text-center mt-4 font-bold">{formError}</p>
      )}

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

export default BECKS;
