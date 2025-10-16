import React from "react";
import {
  normalizeCode,
  extractNumber,
  extractRating,
  getHighlightLevel,
} from "../utils/YSQHelpers";

type GrayedOutCol = "raw" | "456" | null;

type YSQSchemasTableProps = {
  grayedOutCol: GrayedOutCol;
  onHeaderClick: (col: "raw" | "456") => void;
  onHeaderRightClick: (
    e: React.MouseEvent<HTMLElement>,
    col: "raw" | "456"
  ) => void;
  ysqSubmittedAt?: string;
  ysqScores?: Record<string, string | null>;
  ysq456Scores?: Record<string, string | null>;
};

type Schema = { name: string; code: string; max: number };

export const headerTextClass = (
  col: "raw" | "456",
  grayedOutCol: GrayedOutCol
): string => (grayedOutCol === col ? "text-gray-900" : "text-gray-500");

export const cellTextClass = (
  col: "raw" | "456",
  grayedOutCol: GrayedOutCol
): string => (grayedOutCol === col ? "text-gray-900" : "text-gray-300");

export const getSchemaRowScores = (
  schema: Schema,
  grayedOutCol: GrayedOutCol,
  ysqScores: Record<string, string | null>,
  ysq456Scores: Record<string, string | null>
) => {
  const normCode = normalizeCode(schema.code);
  const rawKey = `ysq_${normCode}_score`;
  const score456Key = `ysq_${normCode}_456`;

  const rawScore = extractNumber(ysqScores[rawKey]);
  const score456 = extractNumber(ysq456Scores[score456Key]);

  let rating = "";
  if (grayedOutCol === "raw") {
    rating = extractRating(ysq456Scores[score456Key]);
  } else if (grayedOutCol === "456") {
    rating = extractRating(ysqScores[rawKey]);
  }

  const highlightLevel = getHighlightLevel(rating);

  return { rawScore, score456, rating, highlightLevel };
};

export default function YSQSchemasTable({
  grayedOutCol,
  onHeaderClick,
  onHeaderRightClick,
  ysqSubmittedAt,
  ysqScores = {},
  ysq456Scores = {},
}: YSQSchemasTableProps) {
  const schemas: Schema[] = [
    { name: "Emotional Deprivation", code: "ED", max: 54 },
    { name: "Abandonment", code: "AB", max: 102 },
    { name: "Mistrust/Abuse", code: "MA", max: 102 },
    { name: "Social Isolation", code: "SI", max: 60 },
    { name: "Defectiveness/Shame", code: "DS", max: 90 },
    { name: "Failure", code: "FA", max: 54 },
    { name: "Dependence/Incompetence", code: "DI", max: 90 },
    { name: "Vulnerability to Harm", code: "VU", max: 72 },
    { name: "Enmeshment/Under-Developed Self", code: "EU", max: 66 },
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
        YSQ Schemas{" "}
        {ysqSubmittedAt && (
          <span className="text-gray-400">
            ({new Date(ysqSubmittedAt).toLocaleDateString()})
          </span>
        )}
      </h2>
      <table className="ysq-table w-full border-gray-200 text-sm rounded overflow-hidden shadow-md">
        <thead>
          <tr className="text-center bg-gray-200">
            <th className="border border-gray-300 p-2 w-1/12 md:w-1/12">
              Schema
            </th>
            <th
              data-testid="raw-header"
              className={`border border-gray-300 p-2 w-1/12 md:w-1/12 cursor-pointer select-none ${headerTextClass(
                "raw",
                grayedOutCol
              )}`}
              onClick={() => onHeaderClick("raw")}
              onContextMenu={(e) => onHeaderRightClick(e, "raw")}
            >
              Raw
            </th>
            <th
              data-testid="456-header"
              className={`border border-gray-300 p-2 w-1/12 md:w-1/12 cursor-pointer select-none ${headerTextClass(
                "456",
                grayedOutCol
              )}`}
              onClick={() => onHeaderClick("456")}
              onContextMenu={(e) => onHeaderRightClick(e, "456")}
            >
              4/5/6
            </th>
            <th className="border border-gray-300 p-2 w-1/12 md:w-1/12">Max</th>
            <th className="border border-gray-300 p-2 w-4/12 md:w-8/12">
              Rating
            </th>
          </tr>
        </thead>
        <tbody>
          {schemas.map((schema) => {
            const { rawScore, score456, rating, highlightLevel } =
              getSchemaRowScores(schema, grayedOutCol, ysqScores, ysq456Scores);

            const bgClass =
              highlightLevel === "severe"
                ? "bg-red-300 border-red-500"
                : highlightLevel === "highlight"
                ? "bg-yellow-200 border-yellow-400"
                : "";

            return (
              <tr
                key={schema.code}
                className="text-center bg-[--color-block--white] hover:bg-[--color-selected-bg] transition"
              >
                <td className="border border-gray-300 p-2 font-medium text-center md:text-left">
                  <span className="hidden md:inline">
                    {schema.name} ({schema.code})
                  </span>
                  <span className="md:hidden font-bold">{schema.code}</span>
                </td>
                <td
                  className={`border border-gray-300 p-2 ${cellTextClass(
                    "raw",
                    grayedOutCol
                  )}`}
                >
                  {rawScore}
                </td>
                <td
                  className={`border border-gray-300 p-2 ${cellTextClass(
                    "456",
                    grayedOutCol
                  )}`}
                >
                  {score456}
                </td>
                <td className="border border-gray-300 p-2">{schema.max}</td>
                <td
                  className={`border border-gray-300 p-2 font-bold rating-cell ${bgClass}`}
                  data-rating={rating}
                >
                  {rating}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
