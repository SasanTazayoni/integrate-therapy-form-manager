import { useEffect, useRef } from "react";
import { initializeRippleEffect } from "../../utils/ripple";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "danger";
  loading?: boolean;
};

export default function Button({
  variant = "primary",
  children,
  disabled,
  loading = false,
  ...props
}: ButtonProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (buttonRef.current) {
      initializeRippleEffect(buttonRef.current);
    }
  }, []);

  const baseClasses = `
    button
    ${variant === "danger" ? "button--red" : "button"}
    ${disabled || loading ? "bg-gray-300 text-gray-600 cursor-not-allowed" : ""}
    flex justify-center items-center gap-2 px-4 py-2 rounded w-[100px]
  `;

  return (
    <button
      ref={buttonRef}
      className={baseClasses}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
