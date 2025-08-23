import { FileText } from "lucide-react";
import { smiBoundaries, categoryKeyMap } from "../data/SMIBoundaries";
import { classifyScore } from "../utils/SMIUtils";

type SMIModesTableProps = {
  openModal: () => void;
  submittedAt?: string;
  smiScores: Record<string, string | null>;
};

export default function SMIModesTable({
  openModal,
  submittedAt,
  smiScores,
}: SMIModesTableProps) {
  const smiModes = [
    "Detached Protector",
    "Bully and Attack",
    "Self-Aggrandizer",
    "Impulsive Child",
    "Undisciplined Child",
    "Vulnerable Child",
    "Angry Child",
    "Enraged Child",
    "Detached Self-Soother",
    "Compliant Surrenderer",
    "Contented Child *",
    "Demanding Parent",
    "Punitive Parent",
    "Healthy Adult *",
  ];

  const getCellData = (mode: string) => {
    const key = categoryKeyMap[mode];
    if (!key) return null;

    const raw = smiScores?.[key];
    if (!raw) return null;

    const score = parseFloat(raw);
    if (isNaN(score)) return null;

    const rating = classifyScore(score, smiBoundaries[key]);
    return { score, rating, display: `${score} (${rating})` };
  };

  const shouldHighlight = (rating: string) =>
    ["high", "very high", "severe"].some((r) =>
      rating.toLowerCase().includes(r)
    );

  return (
    <section className="mb-12">
      <h2 className="question-title text-[--color-primary] text-center text-2xl md:text-[18px]">
        SMI Modes{" "}
        {submittedAt && (
          <span className="text-gray-400">
            ({new Date(submittedAt).toLocaleDateString()})
          </span>
        )}
      </h2>

      <table className="hidden lg:table w-full table-fixed text-center text-sm rounded overflow-hidden shadow-sm">
        <tbody>
          {[
            [
              "Detached Protector",
              "Bully and Attack",
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
              "Contented Child *",
              "Demanding Parent",
              "Punitive Parent",
              "Healthy Adult *",
              "",
            ],
          ].map((row, i) => (
            <tr key={i} className="border-b border-gray-300">
              {row.map((cell, idx) => {
                const isLastCell = i === 2 && idx === 4;
                const data = cell ? getCellData(cell) : null;
                const highlight = data?.rating
                  ? shouldHighlight(data.rating)
                  : false;

                return (
                  <td
                    key={idx}
                    className={`border-r p-3 align-center ${
                      isLastCell
                        ? "bg-gray-100 border-gray-300"
                        : highlight
                        ? "bg-yellow-200 border-yellow-400"
                        : "bg-[--color-block--grey] border-gray-300"
                    }`}
                  >
                    <div className="font-semibold text-sm text-gray-600">
                      {cell}
                    </div>
                    {cell && (
                      <div className="mt-4 text-[--color-secondary] font-bold">
                        {data?.display ?? "—"}
                      </div>
                    )}
                    {isLastCell && (
                      <div
                        className="relative inline-flex justify-center group cursor-pointer mt-4"
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

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:hidden text-center grid-cols-1-xs">
        {smiModes.map((cell, idx) => {
          const data = cell ? getCellData(cell) : null;
          const highlight = data?.rating ? shouldHighlight(data.rating) : false;

          return (
            <div
              key={idx}
              className={`p-4 rounded ${
                highlight
                  ? "bg-yellow-200 border border-yellow-400"
                  : "bg-[--color-block--grey] border border-gray-300"
              }`}
            >
              <div className="font-semibold text-sm text-gray-600">{cell}</div>
              {cell && (
                <div className="mt-2 text-[--color-secondary] font-bold">
                  {data?.display ?? "—"}
                </div>
              )}
            </div>
          );
        })}

        <div className="p-4 rounded bg-gray-100 border border-gray-300 flex flex-col items-center justify-center">
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
        </div>
      </div>
    </section>
  );
}
