import { useState, useMemo, useEffect, useRef } from "react";
import BECKS_ITEMS from "../data/BECKSItems";

const useBecksForm = () => {
  const [answers, setAnswers] = useState<Record<number, 0 | 1 | 2 | 3>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [formErrorFade, setFormErrorFade] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetModalClosing, setResetModalClosing] = useState(false);

  const fadeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clearTimerRef = useRef<NodeJS.Timeout | null>(null);

  const total = useMemo(
    () => BECKS_ITEMS.reduce((sum, item) => sum + (answers[item.id] ?? 0), 0),
    [answers]
  );

  useEffect(() => {
    if (formError) {
      setFormErrorFade(false);

      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);

      fadeTimerRef.current = setTimeout(() => setFormErrorFade(true), 2500);

      clearTimerRef.current = setTimeout(() => setFormError(null), 3000);
    } else {
      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current);
        fadeTimerRef.current = null;
      }
      if (clearTimerRef.current) {
        clearTimeout(clearTimerRef.current);
        clearTimerRef.current = null;
      }
      setFormErrorFade(false);
    }
    return () => {
      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current);
        fadeTimerRef.current = null;
      }
      if (clearTimerRef.current) {
        clearTimeout(clearTimerRef.current);
        clearTimerRef.current = null;
      }
    };
  }, [formError]);

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
    formErrorFade,
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
