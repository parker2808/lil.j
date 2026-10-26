function isTextField(node: EventTarget | null): node is HTMLInputElement | HTMLTextAreaElement {
  if (node instanceof HTMLTextAreaElement) return true;
  if (!(node instanceof HTMLInputElement)) return false;
  const skip = new Set(["button", "checkbox", "radio", "range", "file", "submit", "reset", "hidden", "color"]);
  return !skip.has(node.type);
}

function overflowingY(element: HTMLElement): boolean {
  const style = getComputedStyle(element);
  if (style.overflowY !== "auto" && style.overflowY !== "scroll") return false;
  return element.scrollHeight > element.clientHeight + 1;
}

/** True when some overflow box between the finger and the document can still move. */
function gestureCanScroll(start: EventTarget | null, dy: number): boolean {
  let node = start instanceof Element ? start : null;
  while (node && node !== document.documentElement) {
    if (node instanceof HTMLElement && overflowingY(node)) {
      const roomAbove = node.scrollTop > 0;
      const roomBelow = node.scrollTop + node.clientHeight < node.scrollHeight - 1;
      if ((dy > 0 && roomAbove) || (dy < 0 && roomBelow)) return true;
    }
    node = node.parentElement;
  }
  return false;
}

/** Tracks the visual viewport and keeps the window itself from scrolling. */
export function bindViewport(): () => void {
  const root = document.documentElement;
  let lastX = 0;
  let lastY = 0;

  const pinWindow = () => {
    if (window.scrollY !== 0 || root.scrollTop !== 0 || document.body.scrollTop !== 0) {
      window.scrollTo(0, 0);
    }
  };

  const sync = () => {
    const vv = window.visualViewport;
    const height = vv?.height ?? window.innerHeight;
    const offsetTop = vv?.offsetTop ?? 0;
    const inset = Math.max(0, window.innerHeight - height - offsetTop);
    const focused = isTextField(document.activeElement);
    const realKeyboard = focused && inset > 140;
    const visible = !focused
      ? height
      : realKeyboard
        ? height
        : Math.max(220, Math.round(window.innerHeight * 0.58));
    root.style.setProperty("--vv-top", `${offsetTop}px`);
    root.style.setProperty("--vv-height", `${visible}px`);
    root.classList.toggle("keyboard-open", focused);
    const footer = document.querySelector(".flow");
    if (footer instanceof HTMLElement) {
      root.style.setProperty("--footer-h", focused ? "0px" : `${footer.offsetHeight}px`);
    }
    pinWindow();
  };

  const onTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0];
    lastX = touch?.clientX ?? 0;
    lastY = touch?.clientY ?? 0;
  };

  const onTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0];
    const x = touch?.clientX ?? lastX;
    const y = touch?.clientY ?? lastY;
    const dx = x - lastX;
    const dy = y - lastY;
    lastX = x;
    lastY = y;
    pinWindow();
    if (Math.abs(dy) < 10 || Math.abs(dy) < Math.abs(dx)) return;
    if (!gestureCanScroll(event.target, dy)) event.preventDefault();
  };

  sync();
  window.visualViewport?.addEventListener("resize", sync);
  window.visualViewport?.addEventListener("scroll", sync);
  window.addEventListener("resize", sync);
  window.addEventListener("scroll", pinWindow, { passive: true });
  window.addEventListener("focusin", sync);
  window.addEventListener("focusout", sync);
  document.addEventListener("touchstart", onTouchStart, { passive: true });
  document.addEventListener("touchmove", onTouchMove, { passive: false });
  return () => {
    window.visualViewport?.removeEventListener("resize", sync);
    window.visualViewport?.removeEventListener("scroll", sync);
    window.removeEventListener("resize", sync);
    window.removeEventListener("scroll", pinWindow);
    window.removeEventListener("focusin", sync);
    window.removeEventListener("focusout", sync);
    document.removeEventListener("touchstart", onTouchStart);
    document.removeEventListener("touchmove", onTouchMove);
  };
}
