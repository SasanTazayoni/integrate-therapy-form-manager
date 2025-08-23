import { useState, useMemo } from "react";
import BECKS_ITEMS from "../data/BECKSItems";

const useBecksForm = () => {
  const [answers, setAnswers] = useState<Record<number, 0 | 1 | 2 | 3>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetModalClosing, setResetModalClosing] = useState(false);
  const [missingIds, setMissingIds] = useState<number[]>([]);

  const total = useMemo(
    () => BECKS_ITEMS.reduce((sum, item) => sum + (answers[item.id] ?? 0), 0),
    [answers]
  );

  const handleChange = (qId: number, val: number | undefined) => {
    if (val === undefined) {
      setAnswers((prev) => {
        const { [qId]: _, ...rest } = prev;
        return rest;
      });
    } else {
      if (![0, 1, 2, 3].includes(val)) {
        console.warn(`Invalid answer value: ${val}`);
        return;
      }

      setAnswers((prev) => ({
        ...prev,
        [qId]: val as 0 | 1 | 2 | 3,
      }));

      setMissingIds((prev) => prev.filter((id) => id !== qId));
    }
  };

  const handleSubmit = (onValidSubmit: () => void) => (e: React.FormEvent) => {
    e.preventDefault();
    const unansweredIds = BECKS_ITEMS.filter(
      (item) => answers[item.id] === undefined
    ).map((item) => item.id);

    if (unansweredIds.length > 0) {
      setMissingIds(unansweredIds);
      setFormError("Please answer all questions");
      return;
    }

    setFormError(null);
    setMissingIds([]);
    onValidSubmit();
  };

  const handleResetClick = () => setResetModalOpen(true);

  const confirmReset = () => {
    setAnswers({});
    setFormError(null);
    setMissingIds([]);
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
    missingIds,
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
