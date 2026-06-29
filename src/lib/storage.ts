import { defaultCustomWordList } from "../data/customList";
import {
  defaultProgressByMode,
  normalizeCardProgress,
  normalizeProgressByMode,
  RECENT_RESULTS_LIMIT,
} from "./progress";
import type {
  CardProgress,
  PersistedState,
  StudyMode,
  SessionSummary,
  UserSettings,
} from "../types/cards";

const STORAGE_KEY = "hsk1-flashcards-state-v1";

export const defaultSettings: UserSettings = {
  roundSize: 20,
  showPinyin: true,
  colorTones: true,
  vocabularySet: "hsk20",
  customWordList: defaultCustomWordList,
};

export const defaultPersistedState: PersistedState = {
  settings: defaultSettings,
  progress: defaultProgressByMode(),
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
      progress: normalizeProgressByMode(parsed.progress),
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
  current: PersistedState["progress"],
  mode: StudyMode,
  updates: Array<{ cardId: string; result: "correct" | "incorrect" }>,
) {
  const nextProgress = {
    ...current,
    [mode]: { ...current[mode] },
  };
  const now = Date.now();

  updates.forEach(({ cardId, result }) => {
    const previous = normalizeCardProgress(nextProgress[mode][cardId]);

    nextProgress[mode][cardId] = {
      attempts: previous.attempts + 1,
      correct: previous.correct + (result === "correct" ? 1 : 0),
      incorrect: previous.incorrect + (result === "incorrect" ? 1 : 0),
      streak: result === "correct" ? previous.streak + 1 : 0,
      lastSeenAt: now,
      lastResult: result,
      recentResults: [result, ...previous.recentResults].slice(
        0,
        RECENT_RESULTS_LIMIT,
      ),
      introducedAt: previous.introducedAt ?? now,
      lastIncorrectAt: result === "incorrect" ? now : previous.lastIncorrectAt,
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
