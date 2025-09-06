import { FileText, Database } from "lucide-react";
import { useState } from "react";
import { getCellData } from "../utils/SMIHelpers";
import SMISubmissionsModal from "../components/modals/SMISubmissionsModal";

type SMIModesTableProps = {
  openModal: () => void;
  submittedAt?: string;
  smiScores: Record<string, string | null>;
  setLocalSmiScores: React.Dispatch<
    React.SetStateAction<Record<string, string | null>>
  >;
  setLocalSmiSubmittedAt: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
};

type CellData = {
  score: number;
  rating: string;
  display: string;
  highlightLevel: "none" | "highlight" | "severe";
};

export default function SMIModesTable({
  openModal,
  submittedAt,
  smiScores,
  setLocalSmiScores,
  setLocalSmiSubmittedAt,
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

  const [isSmiModalOpen, setIsSmiModalOpen] = useState(false);

  const handleOpenSmiModal = () => setIsSmiModalOpen(true);
  const handleCloseSmiModal = () => setIsSmiModalOpen(false);
  const handleOpenSummarySheet = () => openModal();

  const renderTableCell = (cell: string, isLastCell: boolean) => {
    const data = getCellData(cell, smiScores) as CellData | null;
    const highlightLevel = data?.highlightLevel ?? "none";

    const bgClass =
      highlightLevel === "severe"
        ? "bg-red-300 border-red-500"
        : highlightLevel === "highlight"
        ? "bg-yellow-200 border-yellow-400"
        : "bg-[--color-block--grey] border-gray-300";

    return (
      <td
        key={cell}
        className={`border-r p-3 align-center ${
          isLastCell ? "bg-gray-100 border-gray-300" : bgClass
        }`}
      >
        <div className="font-semibold text-sm text-gray-600">{cell}</div>
        {cell && (
          <div className="mt-4 text-[--color-secondary] font-bold">
            {data?.display ?? "—"}
          </div>
        )}

        {isLastCell && (
          <div className="flex justify-center gap-4 mt-4">
            <div
              className="relative inline-flex justify-center group cursor-pointer"
              onClick={handleOpenSummarySheet}
            >
              <FileText className="w-10 h-10 text-gray-400 transition-colors duration-200 hover:text-gray-600" />
              <div className="absolute bottom-full hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-50">
                SMI score summary sheet
              </div>
            </div>

            <div
              data-testid="db-icon-desktop"
              className="relative inline-flex justify-center group cursor-pointer"
              onClick={handleOpenSmiModal}
            >
              <Database className="w-10 h-10 text-gray-400 transition-colors duration-200 hover:text-gray-600" />
              <div className="absolute bottom-full hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-50">
                Previous SMI Submissions
              </div>
            </div>
          </div>
        )}
      </td>
    );
  };

  const renderMobileCell = (cell: string) => {
    const data = getCellData(cell, smiScores) as CellData | null;
    const highlightLevel = data?.highlightLevel ?? "none";

    const bgClass =
      highlightLevel === "severe"
        ? "bg-red-300 border-red-500"
        : highlightLevel === "highlight"
        ? "bg-yellow-200 border-yellow-400"
        : "bg-[--color-block--grey] border-gray-300";

    return (
      <div key={cell} className={`p-4 rounded ${bgClass}`}>
        <div className="font-semibold text-sm text-gray-600">{cell}</div>
        {cell && (
          <div className="mt-2 text-[--color-secondary] font-bold">
            {data?.display ?? "—"}
          </div>
        )}
      </div>
    );
  };

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

      {/* Desktop Table */}
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
              {row.map((cell, idx) =>
                renderTableCell(cell, i === 2 && idx === 4)
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:hidden text-center gap-2 mt-4">
        {smiModes.map(renderMobileCell)}

        <div className="p-4 rounded bg-gray-100 border border-gray-300 flex flex-col items-center justify-center col-span-2 sm:col-span-1 gap-4">
          <div
            className="relative inline-flex justify-center group cursor-pointer"
            onClick={handleOpenSummarySheet}
          >
            <FileText className="w-10 h-10 text-gray-400 transition-colors duration-200 hover:text-gray-600" />
            <div className="absolute bottom-full hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-50">
              SMI score summary sheet
            </div>
          </div>

          <div
            data-testid="db-icon-mobile"
            className="relative inline-flex justify-center group cursor-pointer"
            onClick={handleOpenSmiModal}
          >
            <Database className="w-10 h-10 text-gray-400 transition-colors duration-200 hover:text-gray-600" />
            <div className="absolute bottom-full hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-50">
              Previous SMI Submissions
            </div>
          </div>
        </div>
      </div>

      <SMISubmissionsModal
        isOpen={isSmiModalOpen}
        onClose={handleCloseSmiModal}
        setLocalSmiScores={setLocalSmiScores}
        setLocalSmiSubmittedAt={setLocalSmiSubmittedAt}
      />
    </section>
  );
}
