import { FileText, Database, X, Loader } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { getCellData, shouldHighlight } from "../utils/SMIHelpers";
import { fetchAllSmiForms } from "../api/formsFrontend";
import { formatDate } from "../utils/formatDate";
import { useClientContext } from "../context/ClientContext";

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
  const { email } = useClientContext();
  const [allSmiForms, setAllSmiForms] = useState<
    { id: string; submittedAt: string }[]
  >([]);
  const [showTooltip, setShowTooltip] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showTooltip &&
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowTooltip(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showTooltip]);

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

  const handleFetchAllSMI = async () => {
    if (!email) {
      setError("No client email available.");
      setAllSmiForms([]);
      setShowTooltip(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetchAllSmiForms(email);
      const smiForms = res.data.smiForms ?? [];

      if (res.ok) {
        if (smiForms.length === 0) {
          setAllSmiForms([
            { id: "0", submittedAt: "No SMI submissions found" },
          ]);
        } else if (smiForms.length === 1) {
          setAllSmiForms([
            {
              id: smiForms[0].id,
              submittedAt: "This user does not have additional SMI submissions",
            },
          ]);
        } else {
          setAllSmiForms(
            smiForms.map((form) => ({
              id: form.id,
              submittedAt: formatDate(form.submittedAt),
            }))
          );
        }
        setShowTooltip(true);
      } else {
        setAllSmiForms([{ id: "0", submittedAt: res.data.error ?? "Error" }]);
        setShowTooltip(true);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch SMI submissions.");
      setAllSmiForms([{ id: "0", submittedAt: "Error fetching submissions" }]);
      setShowTooltip(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mb-12">
      <h2 className="question-title text-[--color-primary] text-center text-2xl md:text-[18px]">
        SMI Modes{" "}
        {submittedAt && (
          <span className="text-gray-400">({formatDate(submittedAt)})</span>
        )}
      </h2>

      <table className="hidden lg:table w-full table-fixed text-center text-sm rounded shadow-sm">
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
                const data = cell ? getCellData(cell, smiScores) : null;
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
                      <div className="flex justify-center gap-4 mt-4 relative w-max mx-auto">
                        <div
                          className="relative inline-flex justify-center cursor-pointer"
                          onClick={openModal}
                        >
                          <FileText className="w-10 h-10 text-gray-400 hover:text-gray-600 transition-colors duration-300" />
                        </div>

                        <div
                          ref={buttonRef}
                          className="relative inline-flex justify-center cursor-pointer"
                          onClick={handleFetchAllSMI}
                        >
                          <Database className="w-10 h-10 text-gray-400 hover:text-gray-600 transition-colors duration-300" />
                          {showTooltip && (
                            <div
                              ref={tooltipRef}
                              className="absolute left-1/2 top-full -translate-x-1/2 mt-2 w-48 sm:w-64 p-2 bg-white border-2 border-gray-400 rounded-lg shadow-lg text-xs sm:text-sm z-50"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <p className="font-bold text-sm sm:text-base">
                                  SMI Submissions
                                </p>
                                <button
                                  onClick={() => setShowTooltip(false)}
                                  className="text-gray-600 hover:text-gray-800 cursor-pointer"
                                  aria-label="Close"
                                >
                                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                              </div>

                              {loading && (
                                <div className="flex justify-center py-2">
                                  <Loader className="w-5 h-5 text-gray-500 animate-spin" />
                                </div>
                              )}

                              {error && <p className="text-red-600">{error}</p>}

                              <ul className="list-none space-y-1">
                                {allSmiForms.map((form) => (
                                  <li key={form.id}>{form.submittedAt}</li>
                                ))}
                              </ul>
                            </div>
                          )}
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

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:hidden text-center gap-2 mt-4">
        {smiModes.map((cell, idx) => {
          const data = getCellData(cell, smiScores);
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

        <div className="p-4 rounded gap-4 bg-gray-100 border border-gray-300 flex flex-row items-center justify-center col-span-2 sm:col-span-1 relative">
          <div
            className="cursor-pointer transition-colors duration-300"
            onClick={openModal}
          >
            <FileText className="w-10 h-10 text-gray-400 hover:text-gray-600 transition-colors duration-300" />
          </div>

          <div
            ref={buttonRef}
            onClick={handleFetchAllSMI}
            className="relative inline-flex justify-center cursor-pointer transition-colors duration-300"
          >
            <Database className="w-10 h-10 text-gray-400 hover:text-gray-600 transition-colors duration-300" />
            {showTooltip && (
              <div
                ref={tooltipRef}
                className="absolute left-1/2 top-full -translate-x-1/2 mt-2 w-48 sm:w-64 p-2 bg-white border-2 border-gray-400 rounded-lg shadow-lg text-xs sm:text-sm z-50"
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="font-bold text-sm sm:text-base">
                    SMI Submissions
                  </p>
                  <button
                    onClick={() => setShowTooltip(false)}
                    className="text-gray-600 hover:text-gray-800 cursor-pointer"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                {loading && (
                  <div className="flex justify-center py-2">
                    <Loader className="w-5 h-5 text-gray-500 animate-spin" />
                  </div>
                )}

                {error && <p className="text-red-600">{error}</p>}

                <ul className="list-none space-y-1">
                  {allSmiForms.map((form) => (
                    <li key={form.id}>{form.submittedAt}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
