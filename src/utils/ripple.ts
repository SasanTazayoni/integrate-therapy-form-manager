export const initializeRippleEffect = (button: HTMLButtonElement): void => {
  function createRipple(e: MouseEvent): void {
    if (button.disabled) return;

    if (e.target === button) {
      const target = e.target as HTMLButtonElement;

      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const rippleElement = document.createElement("span") as HTMLSpanElement;
      rippleElement.style.left = `${x}px`;
      rippleElement.style.top = `${y}px`;
      button.appendChild(rippleElement);

      setTimeout(() => {
        rippleElement.remove();
      }, 600);
    }
  }

  button.addEventListener("mouseover", createRipple);
};
