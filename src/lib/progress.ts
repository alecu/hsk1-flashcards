import type { CardProgress } from "../types/cards";

export const RECENT_RESULTS_LIMIT = 3;
export const MASTERED_STREAK_THRESHOLD = 4;

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
