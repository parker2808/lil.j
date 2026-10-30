import type { StepId } from "./lib/flow.ts";
import type { StoryChapterId } from "./lib/story.ts";
import type { Copy } from "./lib/i18n.ts";

export type { Copy } from "./lib/i18n.ts";

export type ChapterId =
  | "gallery"
  | "scratch"
  | "quiz"
  | "memory"
  | "dreams"
  | "friends"
  | "counter";

export type Wish = {
  id: string;
  text: string;
  at: number;
};

export type Chapter = {
  id: string;
  star: Copy;
  kicker: Copy;
  title: Copy;
  lede: Copy;
};

export type Photo = {
  id: string;
  src: string;
  alt: Copy;
  caption: Copy;
  compliment: Copy;
  pair: boolean;
};

export type EraPhoto = {
  id: string;
  src: string;
  caption?: Copy;
  compliment: Copy;
  date?: string;
};

export type EraKind = "her-life" | "first-meeting" | "together";

export type Era = {
  id: string;
  title: Copy;
  date?: string;
  kind: EraKind;
  color: string;
  photos: EraPhoto[];
};

export type Scratch = {
  id: string;
  cover: Copy;
  reveal: Copy;
};

export type QuizQuestion = {
  id: string;
  question: Copy;
  options: Copy[];
  answer: number;
  rightNote: Copy;
  wrongNote: Copy;
};

export type Dream = {
  id: string;
  text: Copy;
  detail: Copy;
};

export type FriendNote = {
  id: string;
  author: string;
  tone: string;
  text: Copy;
};

export type Letter = {
  id: string;
  label: Copy;
  body: Copy;
};

export type MusicTrack = {
  title: string;
  artist?: string;
  src: string;
};

export type Content = {
  meta: {
    title: Copy;
    description: Copy;
    herName: string;
    constellationName: string;
    monogram: string;
  };
  gate: {
    password: string;
    question: Copy;
    subtitle: Copy;
    found: Copy;
    welcome: Copy;
    placeholder: Copy;
    submit: Copy;
    empty: Copy;
    hints: Copy[];
  };
  startDate: string;
  /** Only when confirmed; null means the first meeting date is unknown. */
  firstMeeting: string | null;
  /** The six photos the memory game pairs. Order is the deal order. */
  memoryPhotoIds: string[];
  music: {
    tracks: MusicTrack[];
    birthday?: MusicTrack;
  };
  envelope: {
    greeting: Copy;
    sealCaption: Copy;
    openHint: Copy;
    body: Copy;
    enter: Copy;
  };
  chapters: Chapter[];
  storyChapters: Record<StoryChapterId, Copy>;
  eras: Era[];
  photos: Photo[];
  galleryCopy: {
    count: Copy;
    progress: Copy;
    back: Copy;
    backToGalaxy: Copy;
    eraProgress: Copy;
    nextEra: Copy;
    seen: Copy;
    pending: Copy;
    empty: Copy;
    close: Copy;
    orbit: Copy;
  };
  scratches: Scratch[];
  quiz: QuizQuestion[];
  quizSummary: Copy;
  quizMarks: Copy;
  memoryCopy: {
    moves: Copy;
    best: Copy;
    win: Copy;
    again: Copy;
    back: Copy;
    later: Copy;
    lines: Copy[];
  };
  scratchCopy: {
    later: Copy;
  };
  dreams: Dream[];
  friendNotes: FriendNote[];
  friendsCopy: {
    sign: Copy;
  };
  together: {
    past: Copy;
    future: Copy;
    until: Copy;
  };
  cake: {
    title: Copy;
    kicker: Copy;
    lede: Copy;
    candles: number;
    mic: Copy;
    micStop: Copy;
    listening: Copy;
    micError: Copy;
    tapHint: Copy;
    letterTitle: Copy;
    letter: Copy;
    skip: Copy;
    next: Copy;
  };
  birth: {
    when: string;
    /** The 16:45 birth time was confirmed by Parker. */
    timeConfirmed: boolean;
    lat: number;
    lon: number;
    place: Copy;
    kicker: Copy;
    title: Copy;
    lede: Copy;
    north: Copy;
    east: Copy;
    south: Copy;
    west: Copy;
    caption: Copy;
    progress: Copy;
    sign: Copy;
    notes: { id: string; title: Copy; body: Copy }[];
  };
  constellations: Record<string, Copy>;
  wish: {
    kicker: Copy;
    title: Copy;
    lede: Copy;
    placeholder: Copy;
    send: Copy;
    keep: Copy;
    empty: Copy;
    sent: Copy;
    more: Copy;
    saved: Copy;
  };
  finalLetter: {
    date: string;
    kicker: Copy;
    title: Copy;
    lede: Copy;
    body: Copy;
    skip: Copy;
    replay: Copy;
    closing: Copy;
    signature: Copy;
  };
  flow: {
    next: Copy;
    back: Copy;
    progress: Copy;
    done: Copy;
    doneLast: Copy;
    devJump: Copy;
    hints: Record<string, Copy>;
  };
  openWhen: Letter[];
  lettersCopy: {
    title: Copy;
    kicker: Copy;
    lede: Copy;
    sealed: Copy;
    openedNote: Copy;
    close: Copy;
    next: Copy;
    later: Copy;
  };
  finale: {
    question: Copy;
    yes: Copy;
    no: Copy;
    teases: Copy[];
    yesTitle: Copy;
    yesBody: Copy;
    lead: Copy;
    celebrate: Copy;
    later: Copy;
  };
  ui: {
    back: Copy;
    loading: Copy;
    lit: Copy;
    waiting: Copy;
    formed: Copy;
    doorCake: Copy;
    doorLetters: Copy;
    doorFinale: Copy;
    musicOn: Copy;
    musicOff: Copy;
    musicHint: Copy;
    musicBlocked: Copy;
    journey: Copy;
    journeyClose: Copy;
    reset: Copy;
    resetConfirm: Copy;
    resetYes: Copy;
    resetNo: Copy;
    startOver: Copy;
    starOpened: Copy;
    starClosed: Copy;
    nextQuestion: Copy;
    seeAgain: Copy;
    summaryTitle: Copy;
    contentError: Copy;
    crash: Copy;
    flip: Copy;
    candleOn: Copy;
    candleOut: Copy;
    language: Copy;
    unitDays: Copy;
    unitHours: Copy;
    unitMinutes: Copy;
    unitSeconds: Copy;
    langVi: Copy;
    langEn: Copy;
    dottedDate: Copy;
  };
  lock: {
    unlockAt: string;
    title: Copy;
    subtitle: Copy;
    days: Copy;
    hours: Copy;
    minutes: Copy;
    seconds: Copy;
  };
};

export type Progress = {
  gateUnlocked: boolean;
  envelopeOpened: boolean;
  openedChapters: string[];
  flippedPhotos: string[];
  erasViewed: string[];
  scratched: string[];
  quiz: Record<string, number>;
  memoryBest: number | null;
  dreamsDone: string[];
  candlesOut: number[];
  saidYes: boolean;
  openWhen: Record<string, string>;
  muted: boolean;
  step: number;
  unlocked: number;
  skyDone: boolean;
  birthSeen: boolean;
  counterSeen: boolean;
  friendsSeen: boolean;
  letterDone: boolean;
  wishes: Wish[];
  flowVersion: number;
  /** Scenes the visitor may open. This is a set of ids, not a prefix of `unlocked`. */
  accessibleSteps: StepId[];
  /** Explicit later choices. Never inferred from missing interaction data. */
  skippedSteps: StepId[];
  /** The wish stays on this device with no wish record and no sent line. */
  wishPrivate: boolean;
};

export type ChapterProps = {
  progress: Progress;
  update: (recipe: (progress: Progress) => Progress) => void;
};
