import { forwardRef } from "react";
import { Item } from "../data/SMICommon";

type SMIQuestionProps = {
  item: Item;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  showError?: boolean;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
};

const SMIQuestion = forwardRef<HTMLInputElement, SMIQuestionProps>(
  (
    { item, value, onChange, showError = false, onArrowUp, onArrowDown },
    ref
  ) => {
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        onArrowDown?.();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        onArrowUp?.();
      }
    };

    return (
      <div className="smi-question flex items-center gap-3 md:gap-4 p-2 border-b border-gray-300 text-sm md:text-base">
        <div className="smi-question-number w-10 h-10 flex items-center justify-center border rounded bg-gray-100 font-semibold text-gray-400">
          {item.id}
        </div>

        <input
          ref={ref}
          data-testid={`input-${item.id}`}
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

        <div className="flex-1">{item.prompt}</div>
      </div>
    );
  }
);

export default SMIQuestion;
