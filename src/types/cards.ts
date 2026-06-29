export type Tone = 0 | 1 | 2 | 3 | 4;
export type VocabularySet = "hsk20" | "hsk30" | "custom";

export type CardSyllable = {
  hanzi: string;
  prompt?: string;
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
  vocabularySet: VocabularySet;
  hskLevel: 1;
};

export type StudyMode = "typing" | "choice" | "review" | "tones";

export type CardProgress = {
  attempts: number;
  correct: number;
  incorrect: number;
  streak: number;
  lastSeenAt: number | null;
  lastResult: "correct" | "incorrect" | null;
  recentResults: Array<"correct" | "incorrect">;
  introducedAt: number | null;
  lastIncorrectAt: number | null;
};

export type ProgressByMode = Record<StudyMode, Record<string, CardProgress>>;

export type UserSettings = {
  roundSize: number;
  showPinyin: boolean;
  colorTones: boolean;
  vocabularySet: VocabularySet;
  customWordList: string;
};

export type PersistedState = {
  settings: UserSettings;
  progress: ProgressByMode;
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
