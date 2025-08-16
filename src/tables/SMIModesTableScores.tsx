type SMIModesScoreSummaryTableProps = {
  label: string;
  items: string[];
  smiTableData: Record<string, string | null>;
};

export default function SMIModesScoreSummaryTable({
  label,
  items,
  smiTableData,
}: SMIModesScoreSummaryTableProps) {
  const columns = [
    "Very Low - Average",
    "Average - Moderate",
    "Moderate - High",
    "High – Very High",
    "Very High - Severe",
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-gray-500">
      <table className="w-full table-fixed">
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
          {items.map((mode) => (
            <tr key={mode} className="border-t border-gray-400">
              <td className="px-4 py-2 font-normal">{mode}</td>
              {columns.map((col) => (
                <td
                  key={col}
                  className="px-2 py-2 border-l border-gray-400 text-center"
                >
                  {smiTableData[mode] === col ? "X" : ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
