import { useState, useMemo } from "react";
import YSQEmotionalDeprivation from "../data/YSQEmotionalDeprivation";
import YSQAbandonment from "../data/YSQAbandonment";
import YSQMistrustAbuse from "../data/YSQMistrustAbuse";
import YSQSocialIsolation from "../data/YSQSocialIsolation";
import YSQDefectiveness from "../data/YSQDefectiveness";
import YSQFailure from "../data/YSQFailure";
import YSQDependence from "../data/YSQDependence";
import YSQVulnerability from "../data/YSQVulnerability";
import YSQEnmeshment from "../data/YSQEnmeshment";
import YSQSubjugation from "../data/YSQSubjugation";
import YSQSelfSacrifice from "../data/YSQSelfSacrifice";
import YSQEmotionalInhibition from "../data/YSQEmotionalInhibition";
import YSQUnrelentingStandards from "../data/YSQUnrelentingStandards";
import YSQEntitlement from "../data/YSQEntitlement";
import YSQInsufficientSelfControl from "../data/YSQInsufficientSelfControl";
import YSQApprovalSeeking from "../data/YSQApprovalSeeking";
import YSQNegativityPessimism from "../data/YSQNegativityPessimism";
import YSQPunitiveness from "../data/YSQPunitiveness";
import { Item } from "../data/YSQCommon";

const ALL_YSQ_ITEMS: Item[] = [
  ...YSQEmotionalDeprivation,
  ...YSQAbandonment,
  ...YSQMistrustAbuse,
  ...YSQSocialIsolation,
  ...YSQDefectiveness,
  ...YSQFailure,
  ...YSQDependence,
  ...YSQVulnerability,
  ...YSQEnmeshment,
  ...YSQSubjugation,
  ...YSQSelfSacrifice,
  ...YSQEmotionalInhibition,
  ...YSQUnrelentingStandards,
  ...YSQEntitlement,
  ...YSQInsufficientSelfControl,
  ...YSQApprovalSeeking,
  ...YSQNegativityPessimism,
  ...YSQPunitiveness,
];

const useYSQForm = () => {
  const [answers, setAnswers] = useState<Record<number, 1 | 2 | 3 | 4 | 5 | 6>>(
    {}
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [missingIds, setMissingIds] = useState<number[]>([]);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetModalClosing, setResetModalClosing] = useState(false);

  const total = useMemo(() => {
    return ALL_YSQ_ITEMS.reduce(
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
        console.warn(`Invalid YSQ answer value: ${val}`);
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
    const unansweredIds = ALL_YSQ_ITEMS.filter(
      (item) => answers[item.id] === undefined
    ).map((item) => item.id);

    if (unansweredIds.length > 0) {
      setMissingIds(unansweredIds);
      setFormError("Please answer all questions before submitting");
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

export default useYSQForm;
