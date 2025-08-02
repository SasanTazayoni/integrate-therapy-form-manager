import SMISummaryModal from "../components/modals/SMISummaryModal";
import ScoreCard from "../components/BecksBurnsScoreCard";
import SMIModesTable from "../components/tables/SMIModesTable";
import YSQSchemasTable from "../components/tables/YSQSchemasTable";
import { Printer } from "lucide-react";
import { useState } from "react";
import ProtectedAccess from "../components/ProtectedAccess";
import { useNavigate } from "react-router-dom";

const FormResultsSummary = () => {
  const [grayedOutCol, setGrayedOutCol] = useState<"raw" | "456" | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  const onHeaderClick = (col: "raw" | "456") => {
    setGrayedOutCol(col);
  };

  const onHeaderRightClick = (
    e: React.MouseEvent<HTMLElement>,
    col: "raw" | "456"
  ) => {
    e.preventDefault();
    if (grayedOutCol === col) {
      setGrayedOutCol(null);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <ProtectedAccess>
      <div className="relative outer-container bg-[var(--color-block--white)] text-[--color-link] font-sans">
        <div className="absolute top-6 left-4 no-print">
          <button
            onClick={() => navigate("/")}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm cursor-pointer"
            aria-label="Go to Dashboard"
          >
            Dashboard
          </button>
        </div>

        <div className="absolute top-4 right-4 no-print group">
          <button
            onClick={() => window.print()}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 cursor-pointer"
            aria-label="Print page"
          >
            <Printer className="w-10 h-10" />
          </button>
          <span className="absolute top-full right-0 mt-1 w-36 p-2 bg-gray-700 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-300 z-50">
            Tip: If multiple pages, try scaling to 60%
          </span>
        </div>

        <h1 className="title">SMI/YSQ/BAI/BDI Summary Sheet</h1>

        <div className="mb-10 text-lg font-medium space-y-2 text-[--color-link]">
          <div>
            <strong>Client:</strong>
          </div>
          <div>
            <strong>Date:</strong>
          </div>
        </div>

        <SMIModesTable openModal={openModal} />
        <YSQSchemasTable
          grayedOutCol={grayedOutCol}
          onHeaderClick={onHeaderClick}
          onHeaderRightClick={onHeaderRightClick}
        />

        <section className="flex flex-wrap justify-center gap-8 max-w-2xl mx-auto">
          {[
            { title: "BAI", value: "___" },
            { title: "BDI", value: "___" },
          ].map(({ title, value }) => (
            <ScoreCard key={title} title={title} value={value} />
          ))}
        </section>

        <SMISummaryModal isOpen={isModalOpen} onClose={closeModal} />
      </div>
    </ProtectedAccess>
  );
};

export default FormResultsSummary;
