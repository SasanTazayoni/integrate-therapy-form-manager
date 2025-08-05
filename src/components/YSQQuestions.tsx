type YSQQuestionProps = {
  item: {
    id: number;
    prompt: string;
    options: { id: number; label: string }[];
  };
  value: number | null;
  onChange: (value: number) => void;
  showError?: boolean;
};

const YSQQuestion = ({
  item,
  value,
  onChange,
  showError = false,
}: YSQQuestionProps) => {
  return (
    <div className={`question${showError ? " missing" : ""}`}>
      <p className="question-title">{item.prompt}</p>
      <div className="options">
        {item.options.map((opt) => (
          <div className="option" key={opt.id}>
            <input
              className="option-input"
              type="radio"
              id={`q${item.id}_opt${opt.id}`}
              name={`q${item.id}`}
              value={opt.id}
              checked={value === opt.id}
              onChange={() => onChange(opt.id)}
              required
            />
            <label
              className="option-label"
              htmlFor={`q${item.id}_opt${opt.id}`}
            >
              <span className="badge">{opt.id}</span>
              <span>{opt.label}</span>
            </label>
          </div>
        ))}
      </div>
      {showError && (
        <div className="field" style={{ color: "red", fontSize: "0.875rem" }}>
          Please select a response.
        </div>
      )}
    </div>
  );
};

export default YSQQuestion;
