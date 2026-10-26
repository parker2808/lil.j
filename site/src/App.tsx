import { lazy, Suspense, useCallback, useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { content, validateContent } from "./content.ts";
import { Envelope } from "./components/Envelope.tsx";
import { Gate } from "./components/Gate.tsx";
import { LanguageToggle } from "./components/LanguageToggle.tsx";
import { MusicButton } from "./components/MusicButton.tsx";
import { Starfield } from "./components/Starfield.tsx";
import { Universe } from "./components/Universe.tsx";
import { FLOW, clampStep, stepDone, type StepId } from "./lib/flow.ts";
import { useI18n } from "./lib/locale-context.ts";
import { restoreMusicVolume, startMusic } from "./lib/music.ts";
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
  const [dev] = useState(() => new URLSearchParams(window.location.search).get("dev") === "1");
  const step = clampStep(progress.step);
  const stepId = FLOW[step] ?? "gate";

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

  useEffect(() => {
    if (!dev) return;
    document.querySelector(".dev-jump [aria-current='step']")?.scrollIntoView({ inline: "center", block: "nearest" });
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
    update((current) => ({
      ...current,
      gateUnlocked: true,
      step: Math.max(current.step, 1),
      unlocked: Math.max(current.unlocked, 1),
    }));
    void startMusic(content.music, progress.muted).catch(() => setMusicNote(t(content.ui.musicBlocked)));
  }

  const done = stepDone(stepId, progress, CANDLES, QUIZ_IDS, SCRATCH_IDS, LETTER_IDS);
  const showNext = done && stepId !== "letter" && step < FLOW.length - 1;
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
    <>
      <Starfield />
      <LanguageToggle />
      {step > 0 && (
        <button type="button" className="step-back" onClick={() => go(step - 1)} aria-label={t(content.flow.back)}>
          ←
        </button>
      )}
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
      <AnimatePresence mode="wait">
        <motion.div
          key={stepId}
          initial={reduced ? false : { opacity: 0, y: 28, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduced ? { opacity: 1 } : { opacity: 0, y: -22, scale: 1.01 }}
          transition={{ duration: reduced ? 0 : 0.72, ease: [0.22, 1, 0.36, 1] }}
        >
          {node}
        </motion.div>
      </AnimatePresence>
      <footer className="flow">
        <p className="sr-only">{fillTemplate(t(content.flow.progress), { n: step + 1, total: FLOW.length })}</p>
        <div className="dots" aria-hidden="true">
          {FLOW.map((id: StepId, index) => (
            <span key={id} className={index < step ? "dot is-done" : index === step ? "dot is-now" : "dot"} />
          ))}
        </div>
        <p className="flow-hint" aria-live="polite">
          {t(hint)}
        </p>
        <AnimatePresence>
          {showNext && (
            <motion.button
              key="next"
              type="button"
              className="btn btn-gold flow-next"
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 1 } : { opacity: 0, y: 8 }}
              transition={{ duration: reduced ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => go(step + 1)}
            >
              {t(content.flow.next)}
            </motion.button>
          )}
        </AnimatePresence>
      </footer>
      {progress.gateUnlocked && (
        <MusicButton
          muted={progress.muted}
          onMuted={(muted) => update((current) => ({ ...current, muted }))}
          onBlocked={() => setMusicNote(t(content.ui.musicBlocked))}
        />
      )}
      {musicNote && (
        <p className="toast" role="status">
          {musicNote}
        </p>
      )}
    </>
  );
}
