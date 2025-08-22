type SMIModesScoreSummaryTableProps = {
  label: string;
  items: string[];
  smiTableData: Record<
    string,
    { column: string | null; alignment: "left" | "center" | "right" | null }
  >;
};

const columns = [
  "Very Low - Average",
  "Average - Moderate",
  "Moderate - High",
  "High - Very High",
  "Very High - Severe",
];

function getCellClass(
  columnName: string,
  column: string | null,
  alignment: "left" | "center" | "right" | null
) {
  if (columnName !== column)
    return "px-2 py-2 border-l border-gray-400 text-center";
  if (alignment === "left")
    return "px-2 py-2 border-l border-gray-400 text-left font-bold text-lg";
  if (alignment === "right")
    return "px-2 py-2 border-l border-gray-400 text-right font-bold text-lg";
  return "px-2 py-2 border-l border-gray-400 text-center font-bold text-lg";
}

export default function SMIModesScoreSummaryTable({
  label,
  items,
  smiTableData,
}: SMIModesScoreSummaryTableProps) {
  return (
    <div className="hidden lg:block overflow-hidden rounded-lg border border-gray-500">
      <table className="w-full table-fixed smi-modes-table">
        <thead className="bg-gray-100 text-sm font-semibold text-gray-800">
          <tr>
            <th className="w-1/4 px-4 py-2 text-center">{label}</th>
            {columns.map((heading) => (
              <th
                key={heading}
                className="w-1/5 px-2 py-2 text-center border-l border-gray-500"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((mode) => {
            const { column, alignment } = smiTableData[mode] || {};
            return (
              <tr key={mode} className="border-t border-gray-400">
                <td className="px-4 py-2 font-normal">{mode}</td>
                {columns.map((col) => (
                  <td
                    key={col}
                    className={getCellClass(col, column, alignment)}
                  >
                    {column === col ? (
                      <span className="text-lg font-bold">X</span>
                    ) : (
                      ""
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
