import React from "react";

type GrayedOutCol = "raw" | "456" | null;

type YSQSchemasTableProps = {
  grayedOutCol: GrayedOutCol;
  onHeaderClick: (col: "raw" | "456") => void;
  onHeaderRightClick: (
    e: React.MouseEvent<HTMLElement>,
    col: "raw" | "456"
  ) => void;
};

export default function YSQSchemasTable({
  grayedOutCol,
  onHeaderClick,
  onHeaderRightClick,
}: YSQSchemasTableProps) {
  const headerTextClass = (col: "raw" | "456") =>
    grayedOutCol === col ? "text-gray-500" : "text-gray-900";

  const cellTextClass = (col: "raw" | "456") =>
    grayedOutCol === col ? "text-gray-300" : "text-gray-900";

  const schemas = [
    { name: "Emotional Deprivation", code: "ED", max: 54 },
    { name: "Abandonment", code: "AB", max: 102 },
    { name: "Mistrust/Abuse", code: "MA", max: 102 },
    { name: "Social Isolation", code: "SI", max: 60 },
    { name: "Defectiveness/Shame", code: "DS/DE", max: 90 },
    { name: "Failure", code: "FA", max: 54 },
    { name: "Dependence/Incompetence", code: "DI", max: 90 },
    { name: "Vulnerability to Harm", code: "VU/VH", max: 72 },
    { name: "Enmeshment/Under-Developed Self", code: "EU/EM", max: 66 },
    { name: "Subjugation", code: "SB", max: 60 },
    { name: "Self-Sacrifice", code: "SS", max: 102 },
    { name: "Emotional Inhibition", code: "EI", max: 54 },
    { name: "Unrelenting Standards", code: "US", max: 96 },
    { name: "Entitlement/Grandiosity", code: "ET", max: 66 },
    { name: "Insufficient Self-Control", code: "IS", max: 90 },
    { name: "Approval Seeking", code: "AS", max: 84 },
    { name: "Negativity/Pessimism", code: "NP", max: 66 },
    { name: "Punitiveness", code: "PU", max: 84 },
  ];

  return (
    <section className="mb-12">
      <h2 className="question-title text-[--color-primary] text-center">
        YSQ Schemas
      </h2>
      <table className="w-full border-gray-200 text-sm rounded overflow-hidden shadow-md">
        <thead>
          <tr className="text-center bg-gray-200">
            <th className="border border-gray-300 p-2 w-1/3">Schema Name</th>
            <th
              className={`border border-gray-300 p-2 w-1/12 cursor-pointer select-none ${headerTextClass(
                "raw"
              )}`}
              onClick={() => onHeaderClick("raw")}
              onContextMenu={(e) => onHeaderRightClick(e, "raw")}
            >
              Raw
            </th>
            <th
              className={`border border-gray-300 p-2 w-1/12 cursor-pointer select-none ${headerTextClass(
                "456"
              )}`}
              onClick={() => onHeaderClick("456")}
              onContextMenu={(e) => onHeaderRightClick(e, "456")}
            >
              4/5/6
            </th>
            <th className="border border-gray-300 p-2 w-1/12">Max Score</th>
            <th className="border border-gray-300 p-2 w-1/6">
              Is this one of your schemas?
            </th>
          </tr>
        </thead>
        <tbody>
          {schemas.map(({ name, code, max }) => (
            <tr
              key={code}
              className="text-center bg-[--color-block--white] hover:bg-[--color-selected-bg] transition"
            >
              <td className="border border-gray-300 p-2 text-left font-medium">
                {name} <strong>({code})</strong>
              </td>
              <td
                className={`border border-gray-300 p-2 ${cellTextClass("raw")}`}
              ></td>
              <td
                className={`border border-gray-300 p-2 ${cellTextClass("456")}`}
              ></td>
              <td className="border border-gray-300 p-2">{max}</td>
              <td className="border border-gray-300 p-2"></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
