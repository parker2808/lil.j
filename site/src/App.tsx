import { lazy, Suspense, useState, type ComponentType, type LazyExoticComponent } from "react";
import { content, validateContent } from "./content.ts";
import { Envelope } from "./components/Envelope.tsx";
import { Gate } from "./components/Gate.tsx";
import { MusicButton } from "./components/MusicButton.tsx";
import { Universe } from "./components/Universe.tsx";
import { startMusic } from "./lib/music.ts";
import { loadProgress } from "./lib/progress.ts";
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
  const problem = validateContent(content);
  const { progress, update } = useProgress();
  const [scene, setScene] = useState<Scene>(firstScene);
  const [chapter, setChapter] = useState<string | null>(null);
  const [musicNote, setMusicNote] = useState("");

  if (problem) {
    return (
      <main className="scene">
        <h1>{content.ui.contentError}</h1>
        <p>{problem}</p>
      </main>
    );
  }

  function unlock() {
    update((current) => ({ ...current, gateUnlocked: true }));
    setScene("envelope");
  }

  function openEnvelope() {
    void startMusic(content.music, progress.muted).catch(() => setMusicNote(content.ui.musicBlocked));
    update((current) => ({ ...current, envelopeOpened: true }));
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

  return (
    <>
      {scene === "gate" && <Gate onUnlock={unlock} />}
      {scene === "envelope" && (
        <Envelope
          open={progress.envelopeOpened}
          onOpen={openEnvelope}
          onEnter={() => setScene("universe")}
        />
      )}
      {scene === "universe" && !ChapterView && (
        <Universe
          progress={progress}
          onOpenStar={openStar}
          onCake={() => setScene("cake")}
          onLetters={() => setScene("letters")}
          onFinale={() => setScene("finale")}
        />
      )}
      {scene === "universe" && ChapterView && (
        <Suspense fallback={<p className="scene loading">{content.ui.loading}</p>}>
          <ChapterView progress={progress} update={update} onBack={() => setChapter(null)} />
        </Suspense>
      )}
      {scene === "cake" && (
        <Suspense fallback={<p className="scene loading">{content.ui.loading}</p>}>
          <Cake
            progress={progress}
            update={update}
            onBack={() => setScene("universe")}
            onNext={() => setScene("letters")}
          />
        </Suspense>
      )}
      {scene === "letters" && (
        <Suspense fallback={<p className="scene loading">{content.ui.loading}</p>}>
          <Letters
            progress={progress}
            update={update}
            onBack={() => setScene("universe")}
            onNext={() => setScene("finale")}
          />
        </Suspense>
      )}
      {scene === "finale" && (
        <Suspense fallback={<p className="scene loading">{content.ui.loading}</p>}>
          <Finale
            saidYes={progress.saidYes}
            onYes={() => update((current) => ({ ...current, saidYes: true }))}
            onBack={() => setScene("universe")}
          />
        </Suspense>
      )}
      {progress.gateUnlocked && (
        <MusicButton
          muted={progress.muted}
          onMuted={(muted) => update((current) => ({ ...current, muted }))}
          onBlocked={() => setMusicNote(content.ui.musicBlocked)}
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
