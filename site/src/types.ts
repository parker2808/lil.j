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
    placeholder: Copy;
    submit: Copy;
    empty: Copy;
    hints: Copy[];
  };
  startDate: string;
  music: string;
  envelope: {
    greeting: Copy;
    sealCaption: Copy;
    openHint: Copy;
    body: Copy;
    enter: Copy;
  };
  chapters: Chapter[];
  photos: Photo[];
  scratches: Scratch[];
  quiz: QuizQuestion[];
  quizSummary: Copy;
  memoryCopy: {
    moves: Copy;
    best: Copy;
    win: Copy;
    again: Copy;
    back: Copy;
  };
  dreams: Dream[];
  friendNotes: FriendNote[];
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
  };
  wish: {
    kicker: Copy;
    title: Copy;
    lede: Copy;
    placeholder: Copy;
    send: Copy;
    empty: Copy;
    sent: Copy;
    more: Copy;
    saved: Copy;
  };
  finalLetter: {
    kicker: Copy;
    title: Copy;
    lede: Copy;
    body: Copy;
    skip: Copy;
    replay: Copy;
    closing: Copy;
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
  };
  finale: {
    question: Copy;
    yes: Copy;
    no: Copy;
    teases: Copy[];
    yesTitle: Copy;
    yesBody: Copy;
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
    musicBlocked: Copy;
    reset: Copy;
    resetConfirm: Copy;
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
  };
};

export type Progress = {
  gateUnlocked: boolean;
  envelopeOpened: boolean;
  openedChapters: string[];
  flippedPhotos: string[];
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
};

export type ChapterProps = {
  progress: Progress;
  update: (recipe: (progress: Progress) => Progress) => void;
};
