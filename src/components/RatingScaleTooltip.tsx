import { useState, useRef, useEffect } from "react";
import { Info, X } from "lucide-react";

type RatingScaleTooltipProps = {
  title: string;
  items: string[];
};

const RatingScaleTooltip = ({ title, items }: RatingScaleTooltipProps) => {
  const [open, setOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        open &&
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setOpen((prev) => !prev)}
        className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50 p-1 sm:p-1.5 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:outline-none cursor-pointer"
        aria-label={`Show ${title}`}
      >
        <Info className="w-5 h-5 sm:w-7 sm:h-7" />
      </button>

      {open && (
        <div
          ref={tooltipRef}
          className="fixed top-9 sm:top-14 right-2 sm:right-4 z-50 w-48 sm:w-64 p-2 sm:p-4 bg-white border-2 border-gray-400 rounded-lg shadow-lg text-xs sm:text-sm"
        >
          <div className="flex justify-between items-start mb-2">
            <p className="font-bold text-sm sm:text-base">{title}</p>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-600 hover:text-gray-800 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5 sm:w-5 sm:h-5" />
            </button>
          </div>
          <ul className="list-none space-y-1">
            {items.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default RatingScaleTooltip;
