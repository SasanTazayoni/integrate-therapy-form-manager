import { useEffect, useRef, useState } from "react";
import Modal from "../Modal";
import Button from "../ui/Button";
import { useClientContext } from "../../context/ClientContext";
import { categoryKeyMap } from "../../data/SMIBoundaries";
import { classifyBoundaryAndAlignment } from "../../utils/SMIUtils";
import SMIModesScoreSummaryTable from "../../tables/SMIModesTableScores";
import SMIModesScoreSummaryCards from "../../tables/SMIModesScoreSummaryCards";

type SMISummaryModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SMISummaryModal({
  isOpen,
  onClose,
}: SMISummaryModalProps) {
  const [closing, setClosing] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const { clientFormsStatus } = useClientContext();
  const clientName = clientFormsStatus?.clientName ?? "";
  const clientDob = clientFormsStatus?.clientDob ?? "";
  const submittedAt = clientFormsStatus?.forms?.SMI?.submittedAt ?? "";

  const formattedDob = clientDob
    ? new Date(clientDob).toLocaleDateString()
    : "";
  const formattedSubmittedAt = submittedAt
    ? `(${new Date(submittedAt).toLocaleDateString()})`
    : "";

  useEffect(() => {
    if (!isOpen) setClosing(true);
    else setClosing(false);
  }, [isOpen]);

  function handleCloseFinished() {
    setClosing(false);
    onClose();
  }

  function handleOverlayClick() {
    setClosing(true);
  }

  function handleCloseButtonClick() {
    setClosing(true);
  }

  if (!isOpen) return null;

  const smiScores = clientFormsStatus?.scores?.smi || {};

  const smiTableData: Record<
    string,
    { column: string | null; alignment: "left" | "center" | "right" | null }
  > = Object.fromEntries(
    Object.entries(categoryKeyMap).map(([mode, key]) => [
      mode,
      classifyBoundaryAndAlignment(smiScores[key], key),
    ])
  );

  const modeGroups = [
    {
      label: "Child Modes",
      items: [
        "Vulnerable Child",
        "Angry Child",
        "Enraged Child",
        "Impulsive Child",
        "Undisciplined Child",
        "Contented Child *",
      ],
    },
    {
      label: "Coping Modes",
      items: [
        "Compliant Surrenderer",
        "Detached Protector",
        "Detached Self-Soother",
      ],
    },
    {
      label: "Overcompensating Modes",
      items: ["Self-Aggrandizer", "Bully and Attack"],
    },
    {
      label: "Parent Modes",
      items: ["Punitive Parent", "Demanding Parent"],
    },
    {
      label: "Healthy Adult Mode",
      items: ["Healthy Adult *"],
    },
  ];

  return (
    <Modal
      closing={closing}
      ariaLabelledBy="smi-summary-title"
      onCloseFinished={handleCloseFinished}
      className="wide-modal"
      onOverlayClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        data-testid="smi-modal"
        className="max-h-[80vh] overflow-y-auto p-4 pt-0 text-gray-800"
      >
        <h2 className="title p-4" id="smi-summary-title">
          SMI Score Summary Sheet{" "}
          {formattedSubmittedAt && (
            <span className="text-gray-400 text-[1.5rem] smi-completion-date">
              {formattedSubmittedAt}
            </span>
          )}
        </h2>

        <div className="text-left mb-4 space-y-2">
          <p className="text-sm">
            <strong>Client:</strong> {clientName}
          </p>
          <p className="text-sm">
            <strong>Date of Birth:</strong> {formattedDob}
          </p>
        </div>

        <section className="mt-4 text-sm text-left space-y-8">
          {modeGroups.map(({ label, items }) => (
            <SMIModesScoreSummaryTable
              key={label}
              label={label}
              items={items}
              smiTableData={smiTableData}
            />
          ))}

          <SMIModesScoreSummaryCards
            modeGroups={modeGroups}
            smiTableData={smiTableData}
          />

          <p className="mt-4 text-xs italic text-gray-600">
            * These 2 modes are scored in reverse: the higher the score, the
            healthier the patient is. The interpretation grid takes this into
            account by reversing the scoring: “high” scores indicate lower
            health. Thus, for all 14 modes, the further to the right a score is
            on the grid, the less healthy the patient is.
          </p>

          <div className="flex justify-center">
            <Button onClick={handleCloseButtonClick}>Close</Button>
          </div>
        </section>
      </div>
    </Modal>
  );
}
