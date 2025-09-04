import { forwardRef } from "react";

type YSQQuestionsProps = {
  item: {
    id: number;
    prompt: string;
    category: string;
  };
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  showError?: boolean;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
};

const YSQQuestions = forwardRef<HTMLInputElement, YSQQuestionsProps>(
  (
    { item, value, onChange, showError = false, onArrowUp, onArrowDown },
    ref
  ) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        onArrowDown?.();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        onArrowUp?.();
      }
    };

    return (
      <div className="flex items-center gap-4 p-2 border-b border-gray-300">
        <div className="ysq-question-number w-10 h-10 flex items-center justify-center border rounded bg-gray-100 font-semibold text-gray-400">
          {item.id}
        </div>

        <input
          ref={ref}
          type="number"
          min={1}
          max={6}
          value={value ?? ""}
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "") onChange(undefined);
            else {
              const num = parseInt(val, 10);
              if (!isNaN(num) && num >= 1 && num <= 6) onChange(num);
            }
          }}
          onKeyDown={handleKeyDown}
          className={`small-square-input w-10 h-10 text-center rounded font-bold focus:outline-none ${
            showError ? "error" : ""
          }`}
        />

        <div className="ysq-question flex-1">{item.prompt}</div>

        <div className="ysq-schema-code w-12 text-sm text-center text-gray-400">
          {item.category}
        </div>
      </div>
    );
  }
);

export default YSQQuestions;
