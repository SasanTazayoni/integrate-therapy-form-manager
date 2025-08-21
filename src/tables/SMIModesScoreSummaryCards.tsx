type SMIModesScoreSummaryCardsProps = {
  modeGroups: { label: string; items: string[] }[];
  smiTableData: Record<
    string,
    { column: string | null; alignment: "left" | "center" | "right" | null }
  >;
};

export default function SMIModesScoreSummaryCards({
  modeGroups,
  smiTableData,
}: SMIModesScoreSummaryCardsProps) {
  return (
    <div className="space-y-4 lg:hidden">
      {modeGroups.map(({ label, items }) => (
        <div
          key={label}
          className="border-2 border-gray-300 rounded-lg p-4 shadow-sm bg-white"
        >
          <h3 className="card-title text-center text-gray-500 text-lg font-semibold mb-3">
            {label}
          </h3>
          <ul className="space-y-1">
            {items.map((mode) => {
              const { column } = smiTableData[mode] || {};
              return (
                <li
                  key={mode}
                  className="flex flex-row items-center max-[480px]:flex-col max-[480px]:items-start"
                >
                  <span className="font-medium">{mode}:</span>
                  <span className="font-bold text-gray-500">
                    {column || ""}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
