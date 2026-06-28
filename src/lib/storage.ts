import type {
  CardProgress,
  PersistedState,
  SessionSummary,
  UserSettings,
} from "../types/cards";

const STORAGE_KEY = "hsk1-flashcards-state-v1";

export const defaultSettings: UserSettings = {
  roundSize: 20,
  showPinyin: true,
  colorTones: true,
};

export const defaultPersistedState: PersistedState = {
  settings: defaultSettings,
  progress: {},
  recentSessions: [],
};

export function loadState() {
  if (typeof window === "undefined") {
    return defaultPersistedState;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return defaultPersistedState;
  }

  try {
    const parsed = JSON.parse(raw) as PersistedState;
    return {
      settings: {
        ...defaultSettings,
        ...parsed.settings,
      },
      progress: parsed.progress ?? {},
      recentSessions: parsed.recentSessions ?? [],
    };
  } catch {
    return defaultPersistedState;
  }
}

export function saveState(state: PersistedState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function buildNextProgress(
  current: Record<string, CardProgress>,
  updates: Array<{ cardId: string; result: "correct" | "incorrect" }>,
) {
  const nextProgress = { ...current };

  updates.forEach(({ cardId, result }) => {
    const previous = nextProgress[cardId] ?? {
      attempts: 0,
      correct: 0,
      incorrect: 0,
      streak: 0,
      lastSeenAt: null,
      lastResult: null,
    };

    nextProgress[cardId] = {
      attempts: previous.attempts + 1,
      correct: previous.correct + (result === "correct" ? 1 : 0),
      incorrect: previous.incorrect + (result === "incorrect" ? 1 : 0),
      streak: result === "correct" ? previous.streak + 1 : 0,
      lastSeenAt: Date.now(),
      lastResult: result,
    };
  });

  return nextProgress;
}

export function buildNextSessions(
  current: SessionSummary[],
  nextSummary: SessionSummary,
) {
  return [nextSummary, ...current].slice(0, 12);
}
