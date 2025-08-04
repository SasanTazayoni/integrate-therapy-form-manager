import { useState, useMemo } from "react";
import BURNS_ITEMS from "../data/BURNSItems";

type Answers = Record<string, 0 | 1 | 2 | 3>;

const useBurnsForm = () => {
  const [answers, setAnswers] = useState<Answers>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetModalClosing, setResetModalClosing] = useState(false);
  const [missingIds, setMissingIds] = useState<string[]>([]);

  const total = useMemo(
    () =>
      BURNS_ITEMS.reduce((sum, item) => {
        return sum + (answers[item.id] ?? 0);
      }, 0),
    [answers]
  );

  const handleChange = (id: string, value: number | undefined) => {
    if (value === undefined) {
      setAnswers((prev) => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
    } else {
      if (![0, 1, 2, 3].includes(value)) {
        console.warn(`Invalid answer value: ${value}`);
        return;
      }

      setAnswers((prev) => ({
        ...prev,
        [id]: value as 0 | 1 | 2 | 3,
      }));

      setMissingIds((prev) => prev.filter((mid) => mid !== id));
    }
  };

  const handleSubmit = (onValidSubmit: () => void) => (e: React.FormEvent) => {
    e.preventDefault();

    const unansweredIds = BURNS_ITEMS.filter(
      (item) => answers[item.id] === undefined
    ).map((item) => item.id);

    if (unansweredIds.length > 0) {
      setMissingIds(unansweredIds);
      setFormError("Please answer all questions before submitting.");
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

export default useBurnsForm;
