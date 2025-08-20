export const initializeRippleEffect = (button: HTMLButtonElement): void => {
  function createRipple(e: MouseEvent): void {
    if (e.target === button) {
      const target = e.target as HTMLButtonElement;

      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripples = document.createElement("span") as HTMLSpanElement;
      ripples.style.left = `${x}px`;
      ripples.style.top = `${y}px`;
      button.appendChild(ripples);

      setTimeout(() => {
        ripples.remove();
      }, 600);
    }
  }

  button.addEventListener("mouseover", createRipple);
};
