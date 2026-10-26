import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { content, validateContent } from "./content.ts";
import { Envelope } from "./components/Envelope.tsx";
import { GateBurst } from "./components/Fireworks.tsx";
import { Gate } from "./components/Gate.tsx";
import { LanguageToggle } from "./components/LanguageToggle.tsx";
import { MusicButton } from "./components/MusicButton.tsx";
import { Starfield } from "./components/Starfield.tsx";
import { StickyNext } from "./components/StickyNext.tsx";
import { StickyNextContext, type StickyAction } from "./components/sticky-next-context.ts";
import { Universe } from "./components/Universe.tsx";
import { FLOW, clampStep, stepDone, type StepId } from "./lib/flow.ts";
import { useI18n } from "./lib/locale-context.ts";
import { restoreMusicVolume, startMusic } from "./lib/music.ts";
import { bindViewport } from "./lib/viewport.ts";
import { clearProgress } from "./lib/progress.ts";
import { fillTemplate } from "./lib/pure.ts";
import { useReducedMotion } from "./lib/useReducedMotion.ts";
import { useProgress } from "./lib/useProgress.ts";

const Cake = lazy(() => import("./components/Cake.tsx").then((mod) => ({ default: mod.Cake })));
const BirthSky = lazy(() => import("./components/BirthSky.tsx").then((mod) => ({ default: mod.BirthSky })));
const WishSky = lazy(() => import("./components/WishSky.tsx").then((mod) => ({ default: mod.WishSky })));
const FinalLetter = lazy(() => import("./components/FinalLetter.tsx").then((mod) => ({ default: mod.FinalLetter })));
const Gallery = lazy(() => import("./chapters/Gallery.tsx").then((mod) => ({ default: mod.Gallery })));
const Quiz = lazy(() => import("./chapters/Quiz.tsx").then((mod) => ({ default: mod.Quiz })));
const Counter = lazy(() => import("./chapters/Counter.tsx").then((mod) => ({ default: mod.Counter })));
const Memory = lazy(() => import("./chapters/Memory.tsx").then((mod) => ({ default: mod.Memory })));
const Scratch = lazy(() => import("./chapters/Scratch.tsx").then((mod) => ({ default: mod.Scratch })));
const Dreams = lazy(() => import("./chapters/Dreams.tsx").then((mod) => ({ default: mod.Dreams })));
const Friends = lazy(() => import("./chapters/Friends.tsx").then((mod) => ({ default: mod.Friends })));
const Letters = lazy(() => import("./components/Letters.tsx").then((mod) => ({ default: mod.Letters })));
const Finale = lazy(() => import("./components/Finale.tsx").then((mod) => ({ default: mod.Finale })));

const QUIZ_IDS = content.quiz.map((question) => question.id);
const SCRATCH_IDS = content.scratches.map((card) => card.id);
const LETTER_IDS = content.openWhen.map((letter) => letter.id);
const CANDLES = Math.max(1, Math.min(8, content.cake.candles || 5));

export function App() {
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const problem = validateContent(content);
  const { progress, update } = useProgress();
  const [musicNote, setMusicNote] = useState("");
  const [opening, setOpening] = useState(false);
  const [dev] = useState(() => new URLSearchParams(window.location.search).get("dev") === "1");
  const headerRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const [quizAction, setQuizAction] = useState<StickyAction | null>(null);
  const setStickyAction = useCallback((action: StickyAction | null) => {
    setQuizAction((current) => {
      if (!action && !current) return current;
      if (action && current && action.label === current.label && action.disabled === current.disabled) return current;
      return action;
    });
  }, []);
  const stickyValue = useMemo(() => setStickyAction, [setStickyAction]);
  const step = clampStep(progress.step);
  const stepId = (FLOW[step] ?? "gate") as StepId;

  const mark = useCallback(
    (key: "skyDone" | "birthSeen" | "letterDone") => {
      update((current) => (current[key] ? current : { ...current, [key]: true }));
    },
    [update],
  );
  const finishSky = useCallback(() => mark("skyDone"), [mark]);
  const finishBirth = useCallback(() => mark("birthSeen"), [mark]);
  const finishLetter = useCallback(() => mark("letterDone"), [mark]);

  const go = useCallback(
    (target: number, jump = false) => {
      update((current) => {
        const next = clampStep(target);
        const unlocked = clampStep(current.unlocked);
        if (!jump && (next < 0 || next > unlocked + 1)) return current;
        const raised = Math.max(unlocked, next);
        if (next === current.step && raised === unlocked) return current;
        return {
          ...current,
          step: next,
          unlocked: raised,
          gateUnlocked: next > 0 || current.gateUnlocked,
        };
      });
    },
    [update],
  );

  const sendWish = useCallback(
    (text: string) => {
      const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `wish-${Date.now()}`;
      update((current) => ({
        ...current,
        wishes: [...current.wishes, { id, text, at: Date.now() }].slice(-24),
      }));
    },
    [update],
  );

  useEffect(() => {
    if (stepId !== "counter" || progress.counterSeen) return;
    const timer = window.setTimeout(() => {
      update((current) => (current.counterSeen ? current : { ...current, counterSeen: true }));
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [progress.counterSeen, stepId, update]);

  useEffect(() => {
    if (stepId !== "friends" || progress.friendsSeen) return;
    const timer = window.setTimeout(() => {
      update((current) => (current.friendsSeen ? current : { ...current, friendsSeen: true }));
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [progress.friendsSeen, stepId, update]);

  useEffect(() => bindViewport(), []);

  useEffect(() => {
    const watch = (element: HTMLElement | null, name: "--header-h" | "--footer-h" | "--dock-h") => {
      if (!element) return () => {};
      const apply = () => {
        if (
          (name === "--footer-h" || name === "--dock-h") &&
          document.documentElement.classList.contains("keyboard-open")
        ) {
          document.documentElement.style.setProperty(name, "0px");
          return;
        }
        const hidden = getComputedStyle(element).display === "none";
        document.documentElement.style.setProperty(name, hidden ? "0px" : `${element.offsetHeight}px`);
      };
      apply();
      const observer = new ResizeObserver(apply);
      observer.observe(element);
      return () => observer.disconnect();
    };
    const stopHeader = watch(headerRef.current, "--header-h");
    const stopFooter = watch(footerRef.current, "--footer-h");
    const stopDock = watch(dockRef.current, "--dock-h");
    if (!dockRef.current) document.documentElement.style.setProperty("--dock-h", "0px");
    return () => {
      stopHeader();
      stopFooter();
      stopDock();
    };
  }, [dev, stepId]);

  useEffect(() => {
    if (!dev) return;
    const bar = document.querySelector(".dev-jump");
    const current = bar?.querySelector("[aria-current='step']");
    if (!(bar instanceof HTMLElement) || !(current instanceof HTMLElement)) return;
    const left = current.offsetLeft - bar.clientWidth / 2 + current.clientWidth / 2;
    bar.scrollTo({ left: Math.max(0, left) });
  }, [dev, step]);

  useEffect(() => {
    if (stepId !== "letter") restoreMusicVolume();
  }, [stepId]);

  if (problem) {
    return (
      <main className="scene">
        <Starfield />
        <LanguageToggle />
        <h1>{t(content.ui.contentError)}</h1>
        <p>{problem}</p>
      </main>
    );
  }

  function unlock() {
    if (opening) return;
    setOpening(true);
    void startMusic(content.music, progress.muted).catch(() => setMusicNote(t(content.ui.musicBlocked)));
    window.setTimeout(() => {
      update((current) => ({
        ...current,
        gateUnlocked: true,
        step: Math.max(current.step, 1),
        unlocked: Math.max(current.unlocked, 1),
      }));
      setOpening(false);
    }, reduced ? 0 : 1200);
  }

  const done = stepDone(stepId, progress, CANDLES, QUIZ_IDS, SCRATCH_IDS, LETTER_IDS);
  const flowAction: StickyAction | null =
    stepId === "letter" || quizAction
      ? null
      : {
          label: t(content.flow.next),
          disabled: !done,
          onClick: () => go(step + 1),
        };
  const stickyAction = quizAction ?? flowAction;
  const hint = done
    ? stepId === "letter"
      ? content.flow.doneLast
      : content.flow.done
    : content.flow.hints[stepId];

  let node: ReactNode = null;
  if (stepId === "gate") node = <Gate onUnlock={unlock} />;
  else if (stepId === "sky") node = <Universe already={progress.skyDone} onDone={finishSky} />;
  else if (stepId === "birth") {
    node = (
      <Suspense fallback={<p className="scene loading">{t(content.ui.loading)}</p>}>
        <BirthSky onSeen={finishBirth} />
      </Suspense>
    );
  } else if (stepId === "gallery") {
    node = (
      <Suspense fallback={<p className="scene loading">{t(content.ui.loading)}</p>}>
        <Gallery progress={progress} update={update} />
      </Suspense>
    );
  } else if (stepId === "quiz") {
    node = (
      <Suspense fallback={<p className="scene loading">{t(content.ui.loading)}</p>}>
        <Quiz progress={progress} update={update} />
      </Suspense>
    );
  } else if (stepId === "counter") {
    node = (
      <Suspense fallback={<p className="scene loading">{t(content.ui.loading)}</p>}>
        <Counter />
      </Suspense>
    );
  } else if (stepId === "cake") {
    node = (
      <Suspense fallback={<p className="scene loading">{t(content.ui.loading)}</p>}>
        <Cake progress={progress} update={update} />
      </Suspense>
    );
  } else if (stepId === "envelope") {
    node = (
      <Envelope
        open={progress.envelopeOpened}
        onOpen={() => update((current) => (current.envelopeOpened ? current : { ...current, envelopeOpened: true }))}
      />
    );
  } else if (stepId === "memory") {
    node = (
      <Suspense fallback={<p className="scene loading">{t(content.ui.loading)}</p>}>
        <Memory progress={progress} update={update} />
      </Suspense>
    );
  } else if (stepId === "scratch") {
    node = (
      <Suspense fallback={<p className="scene loading">{t(content.ui.loading)}</p>}>
        <Scratch progress={progress} update={update} />
      </Suspense>
    );
  } else if (stepId === "letters") {
    node = (
      <Suspense fallback={<p className="scene loading">{t(content.ui.loading)}</p>}>
        <Letters progress={progress} update={update} />
      </Suspense>
    );
  } else if (stepId === "friends") {
    node = (
      <Suspense fallback={<p className="scene loading">{t(content.ui.loading)}</p>}>
        <Friends />
      </Suspense>
    );
  } else if (stepId === "dreams") {
    node = (
      <Suspense fallback={<p className="scene loading">{t(content.ui.loading)}</p>}>
        <Dreams progress={progress} update={update} />
      </Suspense>
    );
  } else if (stepId === "finale") {
    node = (
      <Suspense fallback={<p className="scene loading">{t(content.ui.loading)}</p>}>
        <Finale
          saidYes={progress.saidYes}
          onYes={() => update((current) => (current.saidYes ? current : { ...current, saidYes: true }))}
        />
      </Suspense>
    );
  } else if (stepId === "wish") {
    node = (
      <Suspense fallback={<p className="scene loading">{t(content.ui.loading)}</p>}>
        <WishSky wishes={progress.wishes} onSend={sendWish} />
      </Suspense>
    );
  } else {
    node = (
      <Suspense fallback={<p className="scene loading">{t(content.ui.loading)}</p>}>
        <FinalLetter already={progress.letterDone} onDone={finishLetter} />
      </Suspense>
    );
  }

  return (
    <StickyNextContext.Provider value={stickyValue}>
      <Starfield />
      <header className="chrome" ref={headerRef}>
        <div className="chrome-row">
          <LanguageToggle />
          {step > 0 && (
            <button type="button" className="step-back" onClick={() => go(step - 1)} aria-label={t(content.flow.back)}>
              ←
            </button>
          )}
          <span className="chrome-spacer" />
          {progress.gateUnlocked && (
            <MusicButton
              muted={progress.muted}
              onMuted={(muted) => update((current) => ({ ...current, muted }))}
              onBlocked={() => setMusicNote(t(content.ui.musicBlocked))}
            />
          )}
        </div>
        {dev && (
          <div className="dev-jump">
            {FLOW.map((id, index) => (
              <button
                key={id}
                type="button"
                aria-current={index === step ? "step" : undefined}
                aria-label={fillTemplate(t(content.flow.devJump), { n: index + 1 })}
                onClick={() => go(index, true)}
              >
                {index + 1}
              </button>
            ))}
            <button
              type="button"
              aria-label={t(content.ui.reset)}
              onClick={() => {
                clearProgress();
                window.location.reload();
              }}
            >
              ×
            </button>
          </div>
        )}
      </header>
      <div className="stage-shell">
      <div className="stage">
        <AnimatePresence mode="wait">
          <motion.div
            key={stepId}
            className="stage-pane"
            data-step={stepId}
            initial={reduced ? false : { opacity: 0, y: 48, scale: 1.12, rotateX: 10, filter: "blur(16px)" }}
            animate={
              reduced
                ? { opacity: 1 }
                : { opacity: 1, y: 0, scale: 1, rotateX: 0, filter: "blur(0px)" }
            }
            exit={reduced ? undefined : { opacity: 0, y: -36, scale: 0.92, rotateX: -8, filter: "blur(14px)" }}
            transition={{ duration: reduced ? 0 : 0.78, ease: [0.16, 1, 0.3, 1] }}
          >
            {node}
          </motion.div>
        </AnimatePresence>
      </div>
      {stickyAction && (
        <div className="stage-dock" ref={dockRef}>
          <StickyNext
            motionKey={`${stepId}-${stickyAction.label}-${stickyAction.disabled ? "wait" : "go"}`}
            label={stickyAction.label}
            disabled={stickyAction.disabled}
            reduced={reduced}
            onClick={stickyAction.onClick}
          />
        </div>
      )}
      </div>
      <footer className="flow" ref={footerRef}>
        <p className="sr-only">{fillTemplate(t(content.flow.progress), { n: step + 1, total: FLOW.length })}</p>
        <div className="dots" aria-hidden="true">
          {FLOW.map((id: StepId, index) => (
            <span key={id} className={index < step ? "dot is-done" : index === step ? "dot is-now" : "dot"} />
          ))}
        </div>
        <p className="flow-hint" aria-live="polite">
          {t(hint)}
        </p>
      </footer>
      {opening && <GateBurst />}
      {musicNote && (
        <p className="toast" role="status">
          {musicNote}
        </p>
      )}
    </StickyNextContext.Provider>
  );
}
