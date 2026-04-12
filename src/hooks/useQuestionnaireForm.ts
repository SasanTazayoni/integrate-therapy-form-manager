import { useState, useMemo } from "react";

export default function useQuestionnaireForm<
  ItemId extends string | number,
  AnswerValue extends number
>(items: { id: ItemId }[], validValues: readonly AnswerValue[]) {
  const [answers, setAnswers] = useState({} as Record<ItemId, AnswerValue>);
  const [formError, setFormError] = useState<string | null>(null);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetModalClosing, setResetModalClosing] = useState(false);
  const [missingIds, setMissingIds] = useState<ItemId[]>([]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + (answers[item.id] ?? 0), 0),
    [answers, items]
  );

  const handleChange = (id: ItemId, val: number | undefined) => {
    if (val === undefined) {
      setAnswers((prev) => {
        const { [id]: _, ...rest } = prev;
        return rest as Record<ItemId, AnswerValue>;
      });
    } else {
      if (!(validValues as readonly number[]).includes(val)) {
        console.warn(`Invalid answer value: ${val}`);
        return;
      }
      setAnswers((prev) => ({ ...prev, [id]: val as AnswerValue }));
      setMissingIds((prev) => prev.filter((mid) => mid !== id));
    }
  };

  const handleSubmit = (onValidSubmit: () => void) => (e: React.FormEvent) => {
    e.preventDefault();
    const unansweredIds = items
      .filter((item) => answers[item.id] === undefined)
      .map((item) => item.id);

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
    setAnswers({} as Record<ItemId, AnswerValue>);
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
}
