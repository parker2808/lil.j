export type ChapterId =
  | "gallery"
  | "scratch"
  | "quiz"
  | "memory"
  | "dreams"
  | "friends"
  | "counter";

export type Scene = "gate" | "envelope" | "universe" | "cake" | "letters" | "finale";

export type Chapter = {
  id: string;
  star: string;
  kicker: string;
  title: string;
  lede: string;
};

export type Photo = {
  id: string;
  src: string;
  alt: string;
  caption: string;
  compliment: string;
  pair: boolean;
};

export type Scratch = {
  id: string;
  cover: string;
  reveal: string;
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  answer: number;
  rightNote: string;
  wrongNote: string;
};

export type Dream = {
  id: string;
  text: string;
  detail: string;
};

export type FriendNote = {
  id: string;
  author: string;
  tone: string;
  text: string;
};

export type Letter = {
  id: string;
  label: string;
  body: string;
};

export type Content = {
  meta: {
    title: string;
    herName: string;
    constellationName: string;
    monogram: string;
  };
  gate: {
    password: string;
    question: string;
    placeholder: string;
    submit: string;
    empty: string;
    hints: string[];
  };
  startDate: string;
  music: string;
  envelope: {
    greeting: string;
    sealCaption: string;
    openHint: string;
    body: string;
    enter: string;
  };
  chapters: Chapter[];
  photos: Photo[];
  scratches: Scratch[];
  quiz: QuizQuestion[];
  quizSummary: string;
  memoryCopy: {
    moves: string;
    best: string;
    win: string;
    again: string;
    back: string;
  };
  dreams: Dream[];
  friendNotes: FriendNote[];
  together: {
    past: string;
    future: string;
  };
  cake: {
    title: string;
    kicker: string;
    lede: string;
    candles: number;
    mic: string;
    micStop: string;
    listening: string;
    micError: string;
    tapHint: string;
    letterTitle: string;
    letter: string;
    skip: string;
    next: string;
  };
  openWhen: Letter[];
  lettersCopy: {
    title: string;
    kicker: string;
    lede: string;
    sealed: string;
    openedNote: string;
    next: string;
  };
  finale: {
    question: string;
    yes: string;
    no: string;
    teases: string[];
    yesTitle: string;
    yesBody: string;
  };
  ui: {
    back: string;
    loading: string;
    lit: string;
    waiting: string;
    formed: string;
    doorCake: string;
    doorLetters: string;
    doorFinale: string;
    musicOn: string;
    musicOff: string;
    musicBlocked: string;
    reset: string;
    resetConfirm: string;
    starOpened: string;
    starClosed: string;
    nextQuestion: string;
    seeAgain: string;
    summaryTitle: string;
    contentError: string;
    crash: string;
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
};

export type ChapterProps = {
  progress: Progress;
  update: (recipe: (progress: Progress) => Progress) => void;
  onBack: () => void;
};
