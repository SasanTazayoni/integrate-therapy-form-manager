type BurnsItem = {
  id: string;
  category: string;
  text: string;
  options: { value: 0 | 1 | 2 | 3; text: string }[];
};

type Props = {
  item: BurnsItem;
  answers: Record<string, number>;
  handleChange: (id: string, value: number | undefined) => void;
  missingIds: string[];
};

const BurnsQuestions = ({ item, answers, handleChange, missingIds }: Props) => {
  const isMissing = missingIds.includes(item.id);
  const selectedValue = answers[item.id];

  return (
    <fieldset className={`question ${isMissing ? "missing" : ""}`}>
      <legend className="question-title">{`${item.id}: ${item.text}`}</legend>
      <div className="options">
        {item.options.map((opt) => {
          const inputId = `${item.id}-${opt.value}`;
          const name = item.id;
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
                type="radio"
                name={name}
                value={opt.value.toString()}
                checked={selectedValue?.toString() === opt.value.toString()}
                onChange={(e) => handleChange(item.id, Number(e.target.value))}
                className="option-input"
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
};

export default BurnsQuestions;
