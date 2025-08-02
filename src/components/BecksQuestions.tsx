type BecksQuestionsProps = {
  item: {
    id: number;
    prompt: string;
    options: { value: number; text: string }[];
  };
  answers: Record<number, number>;
  handleChange: (id: number, value: number | undefined) => void;
  missingIds: number[];
};

export default function BecksQuestions({
  item,
  answers,
  handleChange,
  missingIds,
}: BecksQuestionsProps) {
  return (
    <fieldset
      className={`question ${missingIds.includes(item.id) ? "missing" : ""}`}
    >
      <legend className="question-title">{item.prompt}</legend>
      <div className="options">
        {item.options.map((opt) => {
          const inputId = `q${item.id}-${opt.value}`;
          const name = `q${item.id}`;
          const checked = answers[item.id] === opt.value;

          return (
            <div
              className="option"
              key={opt.value}
              onContextMenu={(e) => {
                e.preventDefault();
                if (checked) {
                  const updated = { ...answers };
                  delete updated[item.id];
                  handleChange(item.id, updated[item.id]);
                }
              }}
            >
              <input
                id={inputId}
                className="option-input"
                type="radio"
                name={name}
                value={opt.value}
                checked={checked || false}
                onChange={() => handleChange(item.id, opt.value)}
              />
              <label htmlFor={inputId} className="option-label">
                <span className="badge">{opt.value}</span>
                <span>{opt.text}</span>
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
