export type Tone = 0 | 1 | 2 | 3 | 4;

export type CardSyllable = {
  hanzi: string;
  pinyinNumber: string;
  pinyinDisplay: string;
  tone: Tone;
};

export type Card = {
  id: string;
  hanzi: string;
  spanish: string;
  answers: string[];
  syllables: CardSyllable[];
  hskLevel: 1;
};

export type StudyMode = "typing" | "choice" | "review";

export type CardProgress = {
  attempts: number;
  correct: number;
  incorrect: number;
  streak: number;
  lastSeenAt: number | null;
  lastResult: "correct" | "incorrect" | null;
};

export type UserSettings = {
  roundSize: number;
  showPinyin: boolean;
  colorTones: boolean;
};

export type PersistedState = {
  settings: UserSettings;
  progress: Record<string, CardProgress>;
  recentSessions: SessionSummary[];
};

export type SessionSummary = {
  id: string;
  mode: StudyMode;
  startedAt: number;
  completedAt: number;
  roundSize: number;
  correct: number;
  incorrect: number;
};
