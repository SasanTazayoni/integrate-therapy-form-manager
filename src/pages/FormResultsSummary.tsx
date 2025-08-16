import SMISummaryModal from "../components/modals/SMISummaryModal";
import ScoreCard from "../components/BecksBurnsScoreCard";
import SMIModesTable from "../tables/SMIModesTable";
import YSQSchemasTable from "../tables/YSQSchemasTable";
import { Printer } from "lucide-react";
import { useState, useEffect } from "react";
import ProtectedAccess from "../components/ProtectedAccess";
import { useNavigate } from "react-router-dom";
import { useClientContext } from "../context/ClientContext";
import type { ClientFormsStatus } from "../types/formStatusTypes";
import { parseScore } from "../utils/parseScores";

type ClientFormsStatusDetails = ClientFormsStatus & {
  clientName?: string;
  smiScores?: Record<string, string | null>;
};

const FormResultsSummary = () => {
  const [grayedOutCol, setGrayedOutCol] = useState<"raw" | "456" | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { clientFormsStatus } = useClientContext() as {
    clientFormsStatus: ClientFormsStatusDetails | null;
  };

  const navigate = useNavigate();

  const onHeaderClick = (col: "raw" | "456") => setGrayedOutCol(col);

  const onHeaderRightClick = (
    e: React.MouseEvent<HTMLElement>,
    col: "raw" | "456"
  ) => {
    e.preventDefault();
    if (grayedOutCol === col) setGrayedOutCol(null);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const smiSubmittedAt = clientFormsStatus?.forms?.SMI?.submittedAt;
  const ysqSubmittedAt = clientFormsStatus?.forms?.YSQ?.submittedAt;

  const { score: bdiScore, label: bdiLabel } = parseScore(
    clientFormsStatus?.scores?.bdi?.bdi_score ?? null
  );
  const { score: baiScore, label: baiLabel } = parseScore(
    clientFormsStatus?.scores?.bai?.bai_score ?? null
  );

  useEffect(() => {
    if (clientFormsStatus?.scores?.smi) {
      console.log("Client SMI Scores:", clientFormsStatus.scores.smi);
    }
  }, [clientFormsStatus]);

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
            <strong>Client:</strong> {clientFormsStatus?.clientName ?? ""}
          </div>
          <div>
            <strong>Date of Birth:</strong>{" "}
            {clientFormsStatus?.clientDob
              ? new Date(clientFormsStatus.clientDob).toLocaleDateString()
              : ""}
          </div>
        </div>

        <SMIModesTable
          openModal={openModal}
          submittedAt={
            smiSubmittedAt ? new Date(smiSubmittedAt).toISOString() : undefined
          }
        />
        <YSQSchemasTable
          grayedOutCol={grayedOutCol}
          onHeaderClick={onHeaderClick}
          onHeaderRightClick={onHeaderRightClick}
          ysqSubmittedAt={
            ysqSubmittedAt ? new Date(ysqSubmittedAt).toISOString() : undefined
          }
        />

        <section className="flex flex-wrap justify-center gap-8 max-w-2xl mx-auto">
          {[
            {
              title: "BAI",
              value: baiScore !== null ? `${baiScore} (${baiLabel})` : "___",
              submittedAt: clientFormsStatus?.forms.BURNS?.submittedAt,
              highlight: baiScore !== null && baiScore >= 31,
            },
            {
              title: "BDI",
              value: bdiScore !== null ? `${bdiScore} (${bdiLabel})` : "___",
              submittedAt: clientFormsStatus?.forms.BECKS?.submittedAt,
              highlight: bdiScore !== null && bdiScore >= 31,
            },
          ].map(({ title, value, submittedAt, highlight }) => (
            <ScoreCard
              key={title}
              title={title}
              value={value}
              submittedAt={submittedAt}
              highlight={highlight}
            />
          ))}
        </section>

        <SMISummaryModal isOpen={isModalOpen} onClose={closeModal} />
      </div>
    </ProtectedAccess>
  );
};

export default FormResultsSummary;
