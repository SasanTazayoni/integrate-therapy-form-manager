import { Printer } from "lucide-react";

const FormResultsSummary = () => {
  return (
    <div className="relative outer-container bg-[var(--color-block--white)] text-[--color-link] font-sans">
      <div className="absolute top-4 right-4 no-print group">
        <button
          onClick={() => window.print()}
          className="text-gray-400 hover:text-gray-600 transition-colors duration-200 cursor-pointer"
          title="Print this page"
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

      <section className="mb-12">
        <h2 className="question-title text-[--color-primary] text-center">
          SMI Modes
        </h2>
        <table className="w-full table-fixed text-center text-sm rounded overflow-hidden shadow-sm">
          <tbody>
            {[
              [
                "Detached Protector",
                "Bully & Attack",
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
                "Contented Child",
                "Demanding/Critical",
                "Punitive Parent",
                "Healthy Adult",
                "",
              ],
            ].map((row, i) => (
              <tr key={i} className="border-b border-gray-300">
                {row.map((cell, idx) => {
                  const isLastCell = i === 2 && idx === 4;
                  return (
                    <td
                      key={idx}
                      className={`border-r border-gray-300 p-3 align-top ${
                        isLastCell ? "bg-gray-100" : "bg-[--color-block--grey]"
                      }`}
                    >
                      <div className="font-semibold text-sm">{cell}</div>
                      {cell && <div className="mt-6 h-6 border-b w-full"></div>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mb-12">
        <h2 className="question-title text-[--color-primary] text-center">
          YSQ Schemas
        </h2>
        <table className="w-full border-gray-200 text-sm rounded overflow-hidden shadow-md">
          <thead>
            <tr className="text-center bg-gray-200">
              <th className="border border-gray-300 p-2 w-1/3">Schema Name</th>
              <th className="border border-gray-300 p-2 w-1/12">Raw</th>
              <th className="border border-gray-300 p-2 w-1/12">4/5/6</th>
              <th className="border border-gray-300 p-2 w-1/12">Max Score</th>
              <th className="border border-gray-300 p-2 w-1/6">
                Is this one of your schemas?
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: "Emotional Deprivation", code: "ED", max: 54 },
              { name: "Abandonment", code: "AB", max: 102 },
              { name: "Mistrust/Abuse", code: "MA", max: 102 },
              { name: "Social Isolation", code: "SI", max: 60 },
              { name: "Defectiveness/Shame", code: "DS/DE", max: 90 },
              { name: "Failure", code: "FA", max: 54 },
              { name: "Dependence/Incompetence", code: "DI", max: 90 },
              { name: "Vulnerability to Harm", code: "VU/VH", max: 72 },
              {
                name: "Enmeshment/Under-Developed Self",
                code: "EU/EM",
                max: 66,
              },
              { name: "Subjugation", code: "SB", max: 60 },
              { name: "Self-Sacrifice", code: "SS", max: 102 },
              { name: "Emotional Inhibition", code: "EI", max: 54 },
              { name: "Unrelenting Standards", code: "US", max: 96 },
              { name: "Entitlement/Grandiosity", code: "ET", max: 66 },
              { name: "Insufficient Self-Control", code: "IS", max: 90 },
              { name: "Approval Seeking", code: "AS", max: 84 },
              { name: "Negativity/Pessimism", code: "NP", max: 66 },
              { name: "Punitiveness", code: "PU", max: 84 },
            ].map(({ name, code, max }) => (
              <tr
                key={code}
                className="text-center bg-[--color-block--white] hover:bg-[--color-selected-bg] transition"
              >
                <td className="border border-gray-300 p-2 text-left font-medium">
                  {name} <strong>({code})</strong>
                </td>
                <td className="border border-gray-300 p-2"></td>
                <td className="border border-gray-300 p-2"></td>
                <td className="border border-gray-300 p-2">{max}</td>
                <td className="border border-gray-300 p-2"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="flex flex-wrap justify-center gap-8 max-w-2xl mx-auto">
        {[
          { title: "BAI", value: "___" },
          { title: "BDI", value: "___" },
        ].map(({ title, value }) => (
          <div
            key={title}
            className="flex-1 min-w-[140px] p-6 rounded-md shadow-lg text-center form-border"
          >
            <h3 className="text-lg font-semibold text-[--color-link] mb-2">
              {title}
            </h3>
            <p className="text-3xl font-bold text-[--color-secondary] mb-1">
              {value}
            </p>
            <p className="text-sm text-gray-700">(Severity)</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default FormResultsSummary;
