import type { CardProgress, ProgressByMode, StudyMode } from "../types/cards";

export const RECENT_RESULTS_LIMIT = 3;
export const MASTERED_STREAK_THRESHOLD = 4;
export const trackedStudyModes: StudyMode[] = [
  "typing",
  "choice",
  "tones",
  "review",
];

export function normalizeCardProgress(
  progress?: Partial<CardProgress> | null,
): CardProgress {
  return {
    attempts: progress?.attempts ?? 0,
    correct: progress?.correct ?? 0,
    incorrect: progress?.incorrect ?? 0,
    streak: progress?.streak ?? 0,
    lastSeenAt: progress?.lastSeenAt ?? null,
    lastResult: progress?.lastResult ?? null,
    recentResults: progress?.recentResults?.slice(0, RECENT_RESULTS_LIMIT) ?? [],
    introducedAt: progress?.introducedAt ?? null,
    lastIncorrectAt: progress?.lastIncorrectAt ?? null,
  };
}

export function hasRecentIncorrect(progress: CardProgress) {
  return progress.recentResults.includes("incorrect");
}

export function isMastered(progress: CardProgress) {
  return (
    progress.streak >= MASTERED_STREAK_THRESHOLD &&
    !hasRecentIncorrect(progress)
  );
}

export function defaultProgressByMode(): ProgressByMode {
  return {
    typing: {},
    choice: {},
    tones: {},
    review: {},
  };
}

export function normalizeProgressByMode(
  progress?: unknown,
): ProgressByMode {
  const normalized = defaultProgressByMode();

  if (!progress || typeof progress !== "object") {
    return normalized;
  }

  const progressRecord = progress as Record<string, unknown>;
  const looksLikeLegacyCardMap = Object.values(progressRecord).some(
    (value) =>
      typeof value === "object" &&
      value !== null &&
      ("attempts" in (value as Record<string, unknown>) ||
        "correct" in (value as Record<string, unknown>) ||
        "incorrect" in (value as Record<string, unknown>)),
  );

  if (looksLikeLegacyCardMap) {
    normalized.typing = Object.fromEntries(
      Object.entries(progressRecord).map(([cardId, entry]) => [
        cardId,
        normalizeCardProgress(entry as Partial<CardProgress>),
      ]),
    );
    return normalized;
  }

  trackedStudyModes.forEach((mode) => {
    const modeProgress = progressRecord[mode];

    if (!modeProgress || typeof modeProgress !== "object") {
      normalized[mode] = {};
      return;
    }

    normalized[mode] = Object.fromEntries(
      Object.entries(modeProgress as Record<string, Partial<CardProgress>>).map(
        ([cardId, entry]) => [cardId, normalizeCardProgress(entry)],
      ),
    );
  });

  return normalized;
}

export function mergeProgressEntries(entries: CardProgress[]): CardProgress {
  if (entries.length === 0) {
    return normalizeCardProgress();
  }

  const mostRecentSeen = [...entries].sort(
    (left, right) => (right.lastSeenAt ?? 0) - (left.lastSeenAt ?? 0),
  )[0];
  const mostRecentIncorrect = [...entries]
    .filter((entry) => entry.lastIncorrectAt !== null)
    .sort(
      (left, right) =>
        (right.lastIncorrectAt ?? 0) - (left.lastIncorrectAt ?? 0),
    )[0];
  const recentResults = entries
    .flatMap((entry) => entry.recentResults)
    .slice(0, RECENT_RESULTS_LIMIT);

  return {
    attempts: entries.reduce((sum, entry) => sum + entry.attempts, 0),
    correct: entries.reduce((sum, entry) => sum + entry.correct, 0),
    incorrect: entries.reduce((sum, entry) => sum + entry.incorrect, 0),
    streak: Math.max(...entries.map((entry) => entry.streak), 0),
    lastSeenAt: mostRecentSeen?.lastSeenAt ?? null,
    lastResult: mostRecentSeen?.lastResult ?? null,
    recentResults,
    introducedAt: entries.reduce<number | null>((earliest, entry) => {
      if (entry.introducedAt === null) {
        return earliest;
      }

      if (earliest === null || entry.introducedAt < earliest) {
        return entry.introducedAt;
      }

      return earliest;
    }, null),
    lastIncorrectAt: mostRecentIncorrect?.lastIncorrectAt ?? null,
  };
}

export function aggregateProgressByCards(
  progressByMode: ProgressByMode,
): Record<string, CardProgress> {
  const byCard = new Map<string, CardProgress[]>();

  trackedStudyModes.forEach((mode) => {
    Object.entries(progressByMode[mode]).forEach(([cardId, progress]) => {
      byCard.set(cardId, [...(byCard.get(cardId) ?? []), progress]);
    });
  });

  return Object.fromEntries(
    Array.from(byCard.entries()).map(([cardId, entries]) => [
      cardId,
      mergeProgressEntries(entries),
    ]),
  );
}
