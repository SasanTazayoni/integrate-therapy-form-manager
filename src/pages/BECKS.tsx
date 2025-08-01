import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QuestionnaireForm from "../components/QuestionnaireForm";
import FormResetConfirmModal from "../components/modals/FormResetConfirmModal";
import InvalidTokenModal from "../components/modals/InvalidTokenModal";
import BECKS_ITEMS from "../data/BECKSItems";
import useBecksForm from "../hooks/useBECKSForm";
import { submitBecksForm, validateFormToken } from "../api/formsFrontend";

const BECKS = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [showInvalidTokenModal, setShowInvalidTokenModal] = useState(false);

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

  useEffect(() => {
    if (!token) {
      setShowInvalidTokenModal(true);
      return;
    }

    const checkToken = async () => {
      const { ok } = await validateFormToken(token);

      if (!ok) {
        setShowInvalidTokenModal(true);
      }
    };

    checkToken();
  }, [token]);

  const onValidSubmit = async () => {
    if (!token) {
      setFormError("Token missing");
      return;
    }

    const totalScore = Object.values(answers).reduce<number>(
      (sum, val) => sum + val,
      0
    );

    const { ok, error } = await submitBecksForm({
      token,
      result: totalScore.toString(),
    });

    if (!ok) {
      if (
        error?.toLowerCase().includes("token") ||
        error?.toLowerCase().includes("invalid") ||
        error?.toLowerCase().includes("revoked")
      ) {
        setShowInvalidTokenModal(true);
        return;
      }
      setFormError(error ?? "Failed to submit the form.");
      return;
    }

    navigate("/submitted");
  };

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
          <fieldset
            key={item.id}
            className={`question ${
              missingIds.includes(item.id) ? "missing" : ""
            }`}
          >
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

export default BECKS;
