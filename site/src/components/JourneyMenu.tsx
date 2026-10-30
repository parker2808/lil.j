import { useLayoutEffect, useRef, useState } from "react";
import { content } from "../content.ts";
import { FLOW, type StepId } from "../lib/flow.ts";
import type { Copy } from "../lib/i18n.ts";
import { useI18n } from "../lib/locale-context.ts";
import { STORY_CHAPTERS } from "../lib/story.ts";

type JourneyMenuProps = {
  accessible: readonly StepId[];
  current: StepId;
  onGo: (index: number) => void;
  canReset: boolean;
  onReset: () => void;
};

export function JourneyMenu({ accessible, current, onGo, canReset, onReset }: JourneyMenuProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);
  const openSet = new Set(accessible);

  useLayoutEffect(() => {
    if (!open) {
      if (wasOpen.current) buttonRef.current?.focus();
      return;
    }
    wasOpen.current = true;
    document.documentElement.classList.add("journey-open-lock");
    const dialog = dialogRef.current;
    const currentButton = dialog?.querySelector<HTMLElement>("[aria-current='step']");
    const fallback = dialog?.querySelector<HTMLElement>("button");
    const target = currentButton ?? fallback;
    target?.focus();
    target?.scrollIntoView({ block: "nearest" });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      const items = [...dialog.querySelectorAll<HTMLElement>("button")];
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("journey-open-lock");
    };
  }, [open]);

  function close() {
    const reduce =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setOpen(false);
      return;
    }
    setClosing(true);
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      setClosing(false);
      setOpen(false);
    }, 220);
  }
  const closeRef = useRef(close);
  closeRef.current = close;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="journey-reset journey-open"
        aria-label={t(content.ui.journey)}
        aria-expanded={open}
        aria-controls="journey-menu"
        onClick={() => setOpen(true)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M6 7.5h12M6 12h12M6 16.5h8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      </button>
      {open && (
        <div className={closing ? "sheet-backdrop journey-backdrop is-closing" : "sheet-backdrop journey-backdrop"} onClick={close}>
          <div
            ref={dialogRef}
            id="journey-menu"
            className="sheet journey-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="journey-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="journey-head">
              <h2 id="journey-title">{t(content.ui.journey)}</h2>
              <button type="button" className="journey-close" aria-label={t(content.ui.journeyClose)} onClick={close}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 7l10 10M17 7L7 17" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="journey-body">
            {STORY_CHAPTERS.map((chapter) => {
              const scenes = chapter.scenes.filter((id) => openSet.has(id));
              if (scenes.length === 0) return null;
              return (
                <section key={chapter.id} className="journey-group">
                  <h3 className="journey-chapter">
                    <span>{chapter.id}</span> {t(content.storyChapters[chapter.id])}
                  </h3>
                  <div className="journey-scenes">
                    {scenes.map((id) => (
                      <button
                        key={id}
                        type="button"
                        className="btn journey-scene"
                        aria-current={id === current ? "step" : undefined}
                        onClick={() => {
                          onGo(FLOW.indexOf(id));
                          close();
                        }}
                      >
                        {t(sceneCopy(id))}
                      </button>
                    ))}
                  </div>
                </section>
              );
            })}
            {canReset && (
              <div className="journey-foot">
                <button
                  type="button"
                  className="btn journey-start-over"
                  onClick={() => {
                    setOpen(false);
                    setClosing(false);
                    onReset();
                  }}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7.2 7.2V4.4H4.4M7.4 16.6a7 7 0 1 0-.8-8.4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {t(content.ui.reset)}
                </button>
              </div>
            )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function sceneCopy(id: StepId): Copy {
  const chapter = content.chapters.find((item) => item.id === id);
  if (chapter) return chapter.title;
  if (id === "gate") return content.gate.question;
  if (id === "sky") return content.meta.title;
  if (id === "birth") return content.birth.title;
  if (id === "letters") return content.lettersCopy.title;
  if (id === "cake") return content.cake.title;
  if (id === "wish") return content.wish.title;
  if (id === "envelope") return content.envelope.sealCaption;
  return id === "finale" ? content.finale.lead : content.finalLetter.kicker;
}
