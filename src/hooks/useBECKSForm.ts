import { useState, useMemo } from "react";
import BECKS_ITEMS from "../data/BECKSItems";

const useBecksForm = () => {
  const [answers, setAnswers] = useState<Record<number, 0 | 1 | 2 | 3>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetModalClosing, setResetModalClosing] = useState(false);

  const total = useMemo(
    () => BECKS_ITEMS.reduce((sum, item) => sum + (answers[item.id] ?? 0), 0),
    [answers]
  );

  const handleChange = (qId: number, val: 0 | 1 | 2 | 3) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const handleSubmit = (onValidSubmit: () => void) => (e: React.FormEvent) => {
    e.preventDefault();
    const allAnswered = BECKS_ITEMS.every(
      (item) => answers[item.id] !== undefined
    );

    if (!allAnswered) {
      setFormError("Please answer all questions before submitting");
      return;
    }

    setFormError(null);
    onValidSubmit();
  };

  const handleResetClick = () => setResetModalOpen(true);

  const confirmReset = () => {
    setAnswers({});
    setFormError(null);
    setResetModalClosing(true);
  };

  const cancelReset = () => setResetModalClosing(true);

  const handleModalCloseFinished = () => {
    setResetModalOpen(false);
    setResetModalClosing(false);
  };

  return {
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
  };
};

export default useBecksForm;
