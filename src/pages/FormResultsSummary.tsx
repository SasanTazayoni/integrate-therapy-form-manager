import SMISummaryModal from "../components/modals/SMISummaryModal";
import ScoreCard from "../components/BecksBurnsScoreCard";
import SMIModesTable from "../tables/SMIModesTable";
import YSQSchemasTable from "../tables/YSQSchemasTable";
import { Printer } from "lucide-react";
import { useState } from "react";
import ProtectedAccess from "../components/ProtectedAccess";
import { useNavigate } from "react-router-dom";
import { useClientContext } from "../context/ClientContext";
import type { ClientFormsStatus } from "../types/formStatusTypes";
import { parseScore } from "../utils/parseScores";
import Button from "../components/ui/Button";

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

  return (
    <ProtectedAccess>
      <div className="outer-container bg-[var(--color-block--white)] text-[--color-link] font-sans">
        <div className="flex items-center justify-between p-2 no-print">
          <Button
            className="button button--small"
            onClick={() => navigate("/")}
            aria-label="Go to Dashboard"
          >
            Dashboard
          </Button>
          <div className="relative group">
            <Button
              onClick={() => window.print()}
              aria-label="Print page"
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200 cursor-pointer"
            >
              <Printer className="w-8 h-8" />
            </Button>
            <span className="absolute top-full right-0 mt-1 w-36 p-2 bg-gray-700 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-300 z-50">
              Tip: If multiple pages, try scaling to 60%
            </span>
          </div>
        </div>

        <h1 className="title text-center p-4 pt-0 max-w-2xl mx-auto">
          SMI/YSQ/BAI/BDI Summary Sheet
        </h1>

        <div className="client-info mb-6 font-medium text-[--color-link] text-base md:text-lg">
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
          smiScores={clientFormsStatus?.scores?.smi ?? {}}
        />

        <YSQSchemasTable
          grayedOutCol={grayedOutCol}
          onHeaderClick={onHeaderClick}
          onHeaderRightClick={onHeaderRightClick}
          ysqSubmittedAt={
            ysqSubmittedAt ? new Date(ysqSubmittedAt).toISOString() : undefined
          }
          ysqScores={clientFormsStatus?.scores?.ysq}
          ysq456Scores={clientFormsStatus?.scores?.ysq456}
        />

        <section className="flex flex-wrap flex-col md:flex-row justify-center items-center gap-4 max-w-xl lg:max-w-2xl mx-auto">
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
