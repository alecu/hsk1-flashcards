export type Tone = 0 | 1 | 2 | 3 | 4;
export type VocabularySet =
  | "hsk20"
  | "hsk30"
  | "custom"
  | "radicales"
  | "isleNivel1"
  | "isleNivel2";

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
  // Round index (PersistedState.roundsPlayed at the time) this card was
  // last presented in this mode -- used to keep a just-answered-correctly
  // word out of the next few rounds. See progress.ts's isCoolingDown().
  lastSeenRound: number | null;
};

export type ProgressByMode = Record<StudyMode, Record<string, CardProgress>>;

export type UserSettings = {
  roundSize: number;
  showPinyin: boolean;
  colorTones: boolean;
  vocabularySet: VocabularySet;
  customWordList: string;
  // How many rounds a correctly-answered word sits out before it's eligible
  // to be picked again (0 disables the cooldown).
  cooldownRounds: number;
};

export type PersistedState = {
  settings: UserSettings;
  progress: ProgressByMode;
  recentSessions: SessionSummary[];
  // Total rounds started across every mode -- a simple monotonic counter,
  // not per-mode, so it also works as a shared "how long ago" clock for the
  // cooldown even though progress itself stays scoped per mode.
  roundsPlayed: number;
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
