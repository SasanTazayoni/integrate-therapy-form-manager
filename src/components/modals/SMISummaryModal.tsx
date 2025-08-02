import { useEffect, useRef, useState } from "react";
import Modal from "../Modal";
import { useOutsideClickAndEscape } from "../../hooks/useOutsideClickAndEscape";

interface SMISummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SMISummaryModal({
  isOpen,
  onClose,
}: SMISummaryModalProps) {
  const [closing, setClosing] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useOutsideClickAndEscape(modalRef, () => setClosing(true));

  useEffect(() => {
    if (!isOpen) {
      setClosing(true);
    } else {
      setClosing(false);
    }
  }, [isOpen]);

  function handleCloseFinished() {
    setClosing(false);
    onClose();
  }

  if (!isOpen && !closing) return null;

  return (
    <Modal
      closing={closing}
      ariaLabelledBy="smi-summary-title"
      onCloseFinished={handleCloseFinished}
      className="wide-modal"
    >
      <div ref={modalRef}>
        <h2 id="smi-summary-title" className="text-xl font-semibold mb-4">
          SMI Summary Sheet
        </h2>

        <div className="text-left mb-4">
          <p>
            <strong>Patient:</strong>
          </p>
          <p>
            <strong>Date:</strong>
          </p>
        </div>

        <section className="mt-4 text-left text-sm space-y-4">
          <div>
            <strong>Child Modes</strong> Very Low - Ave Ave - Mod Mod - High
            High – Very High Very High - Severe
            <ul className="list-disc ml-6 mt-1">
              <li>Vulnerable Child</li>
              <li>Angry Child</li>
              <li>Enraged Child</li>
              <li>Impulsive Child</li>
              <li>Undisciplined Child</li>
              <li>Contented Child *</li>
              <li>Avoidant &amp; Surrender Modes</li>
            </ul>
          </div>

          <div>
            Very Low - Ave Ave - Mod Mod - High High – Very High Very High -
            Severe
            <ul className="list-disc ml-6 mt-1">
              <li>Compliant Surrenderer</li>
              <li>Detached Protector</li>
              <li>Detached Self-Soother</li>
              <li>Overcompensating &amp; Parent Modes</li>
            </ul>
          </div>

          <div>
            Very Low - Ave Ave - Mod Mod - High High – Very High Very High -
            Severe
            <ul className="list-disc ml-6 mt-1">
              <li>Self-Aggrandizer</li>
              <li>Bully and Attack</li>
              <li>Punitive Parent</li>
              <li>Demanding Parent</li>
              <li>Healthy Adult Mode</li>
              <li>
                Very Low - Ave Ave - Mod Mod - High High – Very High Very High -
                Severe
              </li>
              <li>Healthy Adult *</li>
            </ul>
          </div>

          <p className="mt-4 text-xs italic">
            * These 2 modes are scored in reverse: the higher the score, the
            healthier the patient is. The interpretation grid takes this into
            account by reversing the scoring: “high” scores indicate lower
            health. Thus, for all 14 modes, the further to the right a score is
            on the grid, the less healthy the patient is.
          </p>

          <div className="flex justify-center mt-6">
            <button
              type="button"
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white w-[100px] flex justify-center items-center gap-2"
              onClick={() => setClosing(true)}
            >
              Close
            </button>
          </div>
        </section>
      </div>
    </Modal>
  );
}
