import { lazy, Suspense, useState, type ComponentType, type LazyExoticComponent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { content, validateContent } from "./content.ts";
import { Envelope } from "./components/Envelope.tsx";
import { Gate } from "./components/Gate.tsx";
import { LanguageToggle } from "./components/LanguageToggle.tsx";
import { MusicButton } from "./components/MusicButton.tsx";
import { Starfield } from "./components/Starfield.tsx";
import { Universe } from "./components/Universe.tsx";
import { useI18n } from "./lib/locale-context.ts";
import { startMusic } from "./lib/music.ts";
import { loadProgress } from "./lib/progress.ts";
import { useReducedMotion } from "./lib/useReducedMotion.ts";
import { useProgress } from "./lib/useProgress.ts";
import type { ChapterProps, Scene } from "./types.ts";

const Cake = lazy(() => import("./components/Cake.tsx").then((mod) => ({ default: mod.Cake })));
const Letters = lazy(() => import("./components/Letters.tsx").then((mod) => ({ default: mod.Letters })));
const Finale = lazy(() => import("./components/Finale.tsx").then((mod) => ({ default: mod.Finale })));
const Gallery = lazy(() => import("./chapters/Gallery.tsx").then((mod) => ({ default: mod.Gallery })));
const Scratch = lazy(() => import("./chapters/Scratch.tsx").then((mod) => ({ default: mod.Scratch })));
const Quiz = lazy(() => import("./chapters/Quiz.tsx").then((mod) => ({ default: mod.Quiz })));
const Memory = lazy(() => import("./chapters/Memory.tsx").then((mod) => ({ default: mod.Memory })));
const Dreams = lazy(() => import("./chapters/Dreams.tsx").then((mod) => ({ default: mod.Dreams })));
const Friends = lazy(() => import("./chapters/Friends.tsx").then((mod) => ({ default: mod.Friends })));
const Counter = lazy(() => import("./chapters/Counter.tsx").then((mod) => ({ default: mod.Counter })));

const CHAPTERS: Record<string, LazyExoticComponent<ComponentType<ChapterProps>>> = {
  gallery: Gallery,
  scratch: Scratch,
  quiz: Quiz,
  memory: Memory,
  dreams: Dreams,
  friends: Friends,
  counter: Counter,
};

function firstScene(): Scene {
  const saved = loadProgress();
  if (!saved.gateUnlocked) return "gate";
  if (!saved.envelopeOpened) return "envelope";
  return "universe";
}

export function App() {
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const problem = validateContent(content);
  const { progress, update } = useProgress();
  const [scene, setScene] = useState<Scene>(firstScene);
  const [chapter, setChapter] = useState<string | null>(null);
  const [musicNote, setMusicNote] = useState("");

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
    update((current) => ({ ...current, gateUnlocked: true }));
    setScene("envelope");
  }

  function openEnvelope() {
    void startMusic(content.music, progress.muted).catch(() => setMusicNote(t(content.ui.musicBlocked)));
  }

  function openStar(id: string) {
    update((current) =>
      current.openedChapters.includes(id)
        ? current
        : { ...current, openedChapters: [...current.openedChapters, id] },
    );
    setChapter(id);
  }

  const ChapterView = chapter ? CHAPTERS[chapter] : null;
  let sceneKey: string = scene;
  let node: ReactNode = null;

  if (scene === "gate") {
    node = <Gate onUnlock={unlock} />;
  } else if (scene === "envelope") {
    node = (
      <Envelope
        open={progress.envelopeOpened}
        onOpen={() => {
          openEnvelope();
          update((current) => ({ ...current, envelopeOpened: true }));
        }}
        onEnter={() => setScene("universe")}
      />
    );
  } else if (scene === "universe" && ChapterView) {
    sceneKey = `chapter-${chapter}`;
    node = (
      <Suspense fallback={<p className="scene loading">{t(content.ui.loading)}</p>}>
        <ChapterView progress={progress} update={update} onBack={() => setChapter(null)} />
      </Suspense>
    );
  } else if (scene === "universe") {
    node = (
      <Universe
        progress={progress}
        onOpenStar={openStar}
        onCake={() => setScene("cake")}
        onLetters={() => setScene("letters")}
        onFinale={() => setScene("finale")}
      />
    );
  } else if (scene === "cake") {
    node = (
      <Suspense fallback={<p className="scene loading">{t(content.ui.loading)}</p>}>
        <Cake
          progress={progress}
          update={update}
          onBack={() => setScene("universe")}
          onNext={() => setScene("letters")}
        />
      </Suspense>
    );
  } else if (scene === "letters") {
    node = (
      <Suspense fallback={<p className="scene loading">{t(content.ui.loading)}</p>}>
        <Letters
          progress={progress}
          update={update}
          onBack={() => setScene("universe")}
          onNext={() => setScene("finale")}
        />
      </Suspense>
    );
  } else {
    node = (
      <Suspense fallback={<p className="scene loading">{t(content.ui.loading)}</p>}>
        <Finale
          saidYes={progress.saidYes}
          onYes={() => update((current) => ({ ...current, saidYes: true }))}
          onBack={() => setScene("universe")}
        />
      </Suspense>
    );
  }

  return (
    <>
      <Starfield />
      <LanguageToggle />
      <AnimatePresence mode="wait">
        <motion.div
          key={sceneKey}
          initial={reduced ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 1 } : { opacity: 0, y: -12 }}
          transition={{ duration: reduced ? 0 : 0.42, ease: [0.22, 1, 0.36, 1] }}
        >
          {node}
        </motion.div>
      </AnimatePresence>
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
