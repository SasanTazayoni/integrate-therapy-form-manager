import { useState, useMemo } from "react";
import { Item } from "../data/SMICommon";
import SMIItems from "../data/SMIItems";

const ALL_SMI_ITEMS: Item[] = SMIItems;

const useSMIForm = () => {
  const [answers, setAnswers] = useState<Record<number, 1 | 2 | 3 | 4 | 5 | 6>>(
    {}
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [missingIds, setMissingIds] = useState<number[]>([]);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetModalClosing, setResetModalClosing] = useState(false);

  const total = useMemo(() => {
    return ALL_SMI_ITEMS.reduce(
      (sum, item) => sum + (answers[item.id] ?? 0),
      0
    );
  }, [answers]);

  const handleChange = (id: number, val: number | undefined) => {
    if (val === undefined) {
      const { [id]: _, ...rest } = answers;
      setAnswers(rest);
    } else {
      if (![1, 2, 3, 4, 5, 6].includes(val)) {
        console.warn(`Invalid SMI answer value: ${val}`);
        return;
      }

      setAnswers((prev) => ({
        ...prev,
        [id]: val as 1 | 2 | 3 | 4 | 5 | 6,
      }));

      setMissingIds((prev) => prev.filter((mid) => mid !== id));
    }
  };

  const handleSubmit = (onValidSubmit: () => void) => (e: React.FormEvent) => {
    e.preventDefault();

    const unansweredIds = ALL_SMI_ITEMS.filter(
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

export default useSMIForm;
