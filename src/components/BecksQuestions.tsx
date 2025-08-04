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
  const isMissing = missingIds.includes(item.id);
  const selectedValue = answers[item.id];

  return (
    <fieldset className={`question ${isMissing ? "missing" : ""}`}>
      <legend className="question-title">{item.prompt}</legend>
      <div className="options">
        {item.options.map((opt) => {
          const inputId = `q${item.id}-${opt.value}`;
          const name = `q${item.id}`;
          const isChecked = selectedValue === opt.value;

          return (
            <div
              className="option"
              key={opt.value}
              onContextMenu={(e) => {
                e.preventDefault();
                if (isChecked) {
                  handleChange(item.id, undefined);
                }
              }}
            >
              <input
                id={inputId}
                className="option-input"
                type="radio"
                name={name}
                value={opt.value}
                checked={isChecked}
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
