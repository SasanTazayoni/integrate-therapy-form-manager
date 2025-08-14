import { FileText } from "lucide-react";

interface SMIModesTableProps {
  openModal: () => void;
}

export default function SMIModesTable({ openModal }: SMIModesTableProps) {
  const smiModes = [
    [
      "Detached Protector",
      "Bully & Attack",
      "Self-Aggrandizer",
      "Impulsive Child",
      "Undisciplined Child",
    ],
    [
      "Vulnerable Child",
      "Angry Child",
      "Enraged Child",
      "Detached Self-Soother",
      "Compliant Surrenderer",
    ],
    [
      "Contented Child",
      "Demanding/Critical",
      "Punitive Parent",
      "Healthy Adult",
      "",
    ],
  ];

  return (
    <section className="mb-12">
      <h2 className="question-title text-[--color-primary] text-center">
        SMI Modes
      </h2>
      <table className="w-full table-fixed text-center text-sm rounded overflow-hidden shadow-sm">
        <tbody>
          {smiModes.map((row, i) => (
            <tr key={i} className="border-b border-gray-300">
              {row.map((cell, idx) => {
                const isLastCell = i === 2 && idx === 4;
                return (
                  <td
                    key={idx}
                    className={`border-r border-gray-300 p-3 align-center ${
                      isLastCell ? "bg-gray-100" : "bg-[--color-block--grey]"
                    }`}
                  >
                    <div className="font-semibold text-sm">{cell}</div>
                    {cell && <div className="mt-6 h-6 border-b"></div>}
                    {isLastCell && (
                      <div
                        className="relative inline-flex justify-center group cursor-pointer"
                        onClick={openModal}
                        title="Open SMI Summary Sheet"
                      >
                        <FileText className="w-10 h-10 text-gray-400 transition-colors duration-200 hover:text-gray-600" />
                        <div className="absolute bottom-full hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-50">
                          SMI score summary sheet
                        </div>
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
