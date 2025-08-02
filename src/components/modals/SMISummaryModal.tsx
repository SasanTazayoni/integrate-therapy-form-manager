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
      <div
        ref={modalRef}
        className="max-h-[80vh] overflow-y-auto p-6 text-gray-800"
      >
        <h2 id="smi-summary-title" className="text-xl font-bold mb-6">
          SMI Score Summary Sheet
        </h2>

        <div className="text-left mb-4 space-y-2">
          <p className="text-sm">
            <strong>Patient:</strong>
          </p>
          <p className="text-sm">
            <strong>Date:</strong>
          </p>
        </div>

        <section className="mt-4 text-sm text-left space-y-8">
          {[
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
                "Overcompensating Parent",
              ],
            },
            {
              label: "Parent Modes",
              items: [
                "Self-Aggrandizer",
                "Bully and Attack",
                "Punitive Parent",
                "Demanding Parent",
              ],
            },
            {
              label: "Healthy Adult Mode",
              items: ["Healthy Adult *"],
            },
          ].map(({ label, items }) => (
            <div
              key={label}
              className="overflow-hidden rounded-lg border border-gray-500"
            >
              <table className="w-full table-fixed">
                <thead className="bg-gray-100 text-sm font-semibold text-gray-800">
                  <tr>
                    <th className="w-1/4 px-4 py-2 text-center">{label}</th>
                    <th className="w-1/8 px-2 py-2 text-center border-l border-gray-500">
                      Very Low - Ave
                    </th>
                    <th className="w-1/8 px-2 py-2 text-center border-l border-gray-500">
                      Ave - Mod
                    </th>
                    <th className="w-1/8 px-2 py-2 text-center border-l border-gray-500">
                      Mod - High
                    </th>
                    <th className="w-1/8 px-2 py-2 text-center border-l border-gray-500">
                      High – Very
                    </th>
                    <th className="w-1/8 px-2 py-2 text-center border-l border-gray-500">
                      High Very
                    </th>
                    <th className="w-1/8 px-2 py-2 text-center border-l border-gray-500">
                      High - Severe
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((mode) => (
                    <tr key={mode} className="border-t border-gray-400">
                      <td className="px-4 py-2 font-normal">{mode}</td>
                      {[...Array(6)].map((_, i) => (
                        <td
                          key={i}
                          className="px-2 py-2 border-l border-gray-400"
                        />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          <p className="mt-4 text-xs italic text-gray-600">
            * These 2 modes are scored in reverse: the higher the score, the
            healthier the patient is. The interpretation grid takes this into
            account by reversing the scoring: “high” scores indicate lower
            health. Thus, for all 14 modes, the further to the right a score is
            on the grid, the less healthy the patient is.
          </p>

          <div className="flex justify-center">
            <button
              type="button"
              className="px-4 py-2 rounded text-white w-[100px] flex justify-center items-center bg-blue-500 hover:bg-blue-600"
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
