import { useEffect, useRef } from "react";
import { initializeRippleEffect } from "../../utils/ripple";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "danger";
};

export default function Button({
  variant = "primary",
  children,
  ...props
}: ButtonProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (buttonRef.current) {
      initializeRippleEffect(buttonRef.current);
    }
  }, []);

  return (
    <button
      ref={buttonRef}
      className={`button ${variant === "danger" ? "button--red" : ""}`}
      {...props}
    >
      {children}
    </button>
  );
}
