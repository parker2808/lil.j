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

/** Wide desktop windows keep their layout when a field is focused. */
function isDesktopLayout(): boolean {
  const width = window.innerWidth;
  const height = window.innerHeight;
  return width >= 1200 && height <= 1100 && width / height >= 1.5;
}

/**
 * Scrolls the stage, not the window, so the field and its heading stay above the keyboard.
 * A `[data-keyboard-block]` around the field keeps its controls in view too (the wish switch).
 */
function revealFocused(field: HTMLInputElement | HTMLTextAreaElement) {
  const stage = field.closest(".stage");
  if (!(stage instanceof HTMLElement)) return;
  const heading = field.closest("section")?.querySelector("h1");
  const block = field.closest("[data-keyboard-block]") ?? field;
  const pad = 8;
  const fit = () => {
    const stageBox = stage.getBoundingClientRect();
    const blockBox = block.getBoundingClientRect();
    const below = blockBox.bottom - (stageBox.bottom - pad);
    const above = stageBox.top + pad - blockBox.top;
    if (below > 1) stage.scrollTop += below;
    else if (above > 1) stage.scrollTop -= above;
    if (!(heading instanceof HTMLElement)) return;
    let headBox = heading.getBoundingClientRect();
    let nextStage = stage.getBoundingClientRect();
    if (headBox.bottom < nextStage.top + pad) stage.scrollTop -= nextStage.top + pad - headBox.bottom;
    const nextField = field.getBoundingClientRect();
    nextStage = stage.getBoundingClientRect();
    if (nextField.top > nextStage.bottom - pad) stage.scrollTop += nextField.top - (nextStage.bottom - pad);
    headBox = heading.getBoundingClientRect();
    nextStage = stage.getBoundingClientRect();
    if (headBox.top > nextStage.bottom - pad) stage.scrollTop -= headBox.top - (nextStage.bottom - pad);
  };
  fit();
  requestAnimationFrame(fit);
}

/** Tracks the visual viewport and keeps the window itself from scrolling. */
export function bindViewport(): () => void {
  const root = document.documentElement;
  let lastX = 0;
  let lastY = 0;
  let lastVisible = 0;

  const pinWindow = () => {
    if (window.scrollY !== 0 || root.scrollTop !== 0 || document.body.scrollTop !== 0) {
      window.scrollTo(0, 0);
    }
  };

  let scratchGesture: "idle" | "pending" | "scroll" | "scratch" = "idle";
  let originX = 0;
  let originY = 0;

  const sync = () => {
    const vv = window.visualViewport;
    const height = vv?.height ?? window.innerHeight;
    const offsetTop = vv?.offsetTop ?? 0;
    const offsetLeft = vv?.offsetLeft ?? 0;
    const width = vv?.width ?? window.innerWidth;
    const inset = Math.max(0, window.innerHeight - height - offsetTop);
    const focused = isTextField(document.activeElement);
    const desktop = isDesktopLayout();
    const keyboardLayout = focused && !desktop;
    const realKeyboard = keyboardLayout && inset > 140;
    const visible = !keyboardLayout
      ? height
      : realKeyboard
        ? height
        : Math.max(220, Math.round(window.innerHeight * 0.58));
    root.style.setProperty("--vv-top", `${keyboardLayout ? offsetTop : 0}px`);
    root.style.setProperty("--vv-left", `${keyboardLayout ? offsetLeft : 0}px`);
    root.style.setProperty("--vv-width", `${keyboardLayout ? width : window.innerWidth}px`);
    root.style.setProperty("--vv-height", `${visible}px`);
    root.classList.toggle("keyboard-open", keyboardLayout);
    const footer = document.querySelector(".flow");
    if (footer instanceof HTMLElement) {
      root.style.setProperty("--footer-h", keyboardLayout ? "0px" : `${footer.offsetHeight}px`);
    }
    const opened = keyboardLayout && Math.abs(visible - lastVisible) > 40;
    lastVisible = visible;
    pinWindow();
    if (opened && isTextField(document.activeElement)) {
      const field = document.activeElement;
      requestAnimationFrame(() => {
        if (document.activeElement === field) revealFocused(field);
      });
    }
  };

  const onTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0];
    lastX = touch?.clientX ?? 0;
    lastY = touch?.clientY ?? 0;
    originX = lastX;
    originY = lastY;
    const covered = event.target instanceof Element && event.target.closest(".scratch:not(.is-open)");
    scratchGesture = covered ? "pending" : "idle";
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
    if (scratchGesture === "pending") {
      const totalX = x - originX;
      const totalY = y - originY;
      const dist = Math.hypot(totalX, totalY);
      if (dist < 4) return;
      const mostlyVertical = Math.abs(totalY) > Math.abs(totalX) * 1.25;
      if (mostlyVertical) {
        if (dist < 8) return;
        scratchGesture = "scroll";
      } else {
        scratchGesture = "scratch";
      }
    }
    if (scratchGesture === "scratch") {
      event.preventDefault();
      return;
    }
    if (Math.abs(dy) < 10 || Math.abs(dy) < Math.abs(dx)) return;
    if (!gestureCanScroll(event.target, dy)) event.preventDefault();
  };

  sync();
  const refit = new ResizeObserver(() => {
    if (!isTextField(document.activeElement) || isDesktopLayout()) return;
    const field = document.activeElement;
    requestAnimationFrame(() => {
      if (document.activeElement === field) revealFocused(field);
    });
  });
  const chrome = document.querySelector(".chrome");
  const stage = document.querySelector(".stage");
  if (chrome) refit.observe(chrome);
  if (stage) refit.observe(stage);
  window.visualViewport?.addEventListener("resize", sync);
  window.visualViewport?.addEventListener("scroll", sync);
  window.addEventListener("resize", sync);
  window.addEventListener("scroll", pinWindow, { passive: true });
  const onFocusIn = (event: FocusEvent) => {
    sync();
    if (!isTextField(event.target) || isDesktopLayout()) return;
    const field = event.target;
    requestAnimationFrame(() => {
      if (document.activeElement === field) revealFocused(field);
    });
  };
  window.addEventListener("focusin", onFocusIn);
  window.addEventListener("focusout", sync);
  document.addEventListener("touchstart", onTouchStart, { passive: true });
  document.addEventListener("touchmove", onTouchMove, { passive: false });
  return () => {
    window.visualViewport?.removeEventListener("resize", sync);
    window.visualViewport?.removeEventListener("scroll", sync);
    window.removeEventListener("resize", sync);
    window.removeEventListener("scroll", pinWindow);
    window.removeEventListener("focusin", onFocusIn);
    window.removeEventListener("focusout", sync);
    document.removeEventListener("touchstart", onTouchStart);
    document.removeEventListener("touchmove", onTouchMove);
    refit.disconnect();
  };
}
