function isTextField(node: EventTarget | null): node is HTMLInputElement | HTMLTextAreaElement {
  if (node instanceof HTMLTextAreaElement) return true;
  if (!(node instanceof HTMLInputElement)) return false;
  const skip = new Set(["button", "checkbox", "radio", "range", "file", "submit", "reset", "hidden", "color"]);
  return !skip.has(node.type);
}

/** Tracks the visual viewport and hides the bottom bar while a text field is focused or the keyboard shrinks the view. */
export function bindViewport(): () => void {
  const root = document.documentElement;
  let scrollTimer = 0;

  const sync = () => {
    const vv = window.visualViewport;
    const height = vv?.height ?? window.innerHeight;
    const offsetTop = vv?.offsetTop ?? 0;
    const inset = Math.max(0, window.innerHeight - height - offsetTop);
    const focused = isTextField(document.activeElement);
    const keyboard = focused || inset > 80;
    const visible = keyboard && inset > 80 ? height : keyboard ? Math.max(220, window.innerHeight - Math.round(window.innerHeight * 0.42)) : height;
    root.style.setProperty("--vv-top", `${offsetTop}px`);
    root.style.setProperty("--vv-height", `${visible}px`);
    root.classList.toggle("keyboard-open", keyboard);
    const footer = document.querySelector(".flow");
    if (footer instanceof HTMLElement) {
      root.style.setProperty("--footer-h", keyboard ? "0px" : `${footer.offsetHeight}px`);
    }
    if (focused && keyboard) {
      const field = document.activeElement;
      const nudge = () => {
        if (!(field instanceof HTMLElement) || document.activeElement !== field) return;
        const stage = document.querySelector(".stage");
        if (!(stage instanceof HTMLElement)) return;
        const fieldBox = field.getBoundingClientRect();
        const stageBox = stage.getBoundingClientRect();
        const delta = fieldBox.top - stageBox.top - (stageBox.height - fieldBox.height) / 2;
        if (Math.abs(delta) > 1) stage.scrollTop += delta;
      };
      nudge();
      window.requestAnimationFrame(() => {
        nudge();
        window.requestAnimationFrame(nudge);
      });
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(nudge, 60);
    }
  };

  sync();
  window.visualViewport?.addEventListener("resize", sync);
  window.visualViewport?.addEventListener("scroll", sync);
  window.addEventListener("resize", sync);
  window.addEventListener("focusin", sync);
  window.addEventListener("focusout", sync);
  return () => {
    window.clearTimeout(scrollTimer);
    window.visualViewport?.removeEventListener("resize", sync);
    window.visualViewport?.removeEventListener("scroll", sync);
    window.removeEventListener("resize", sync);
    window.removeEventListener("focusin", sync);
    window.removeEventListener("focusout", sync);
  };
}
