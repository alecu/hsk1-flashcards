import { aggregateProgressByCards, normalizeCardProgress } from "./progress";
import {
  getAdaptivePriorityScore,
  getAdaptiveSelectionBucket,
  getReviewPriorityScore,
  pickRoundCards,
} from "./session";
import type {
  Card,
  CardProgress,
  ProgressByMode,
  StudyMode,
} from "../types/cards";

export type CardModeStatsRow = {
  cardId: string;
  hanzi: string;
  pinyinDisplay: string;
  pinyinSortKey: string;
  spanish: string;
  mode: StudyMode;
  bucket: string;
  attempts: number;
  correct: number;
  incorrect: number;
  streak: number;
  recentIncorrects: number;
  recentResultsLabel: string;
  priorityScore: number;
  estimatedProbability: number;
  selectedInPreview: boolean;
};

export type CardModeStatsSort =
  | "pinyin-asc"
  | "hanzi-asc"
  | "spanish-asc"
  | "priority-desc"
  | "probability-desc"
  | "incorrect-desc"
  | "recent-incorrect-desc"
  | "correct-desc"
  | "attempts-desc"
  | "streak-desc";

function getModeProgress(
  progressByMode: ProgressByMode,
  mode: StudyMode,
): Record<string, CardProgress> {
  return mode === "review"
    ? aggregateProgressByCards(progressByMode)
    : progressByMode[mode];
}

function bucketLabel(mode: StudyMode, progress: CardProgress) {
  if (mode === "review") {
    if (progress.lastResult === "incorrect") {
      return "Error inmediato";
    }

    if (progress.recentResults.includes("incorrect")) {
      return "Error reciente";
    }

    return "Historial con fallos";
  }

  switch (getAdaptiveSelectionBucket(progress)) {
    case "recent-error":
      return "Error inmediato";
    case "unseen":
      return "Nueva";
    case "recovery":
      return "En fijación";
    case "general":
      return "Repaso general";
    case "mastered":
      return "Dominada";
  }
}

function estimateProbability(
  cards: Card[],
  progressByCard: Record<string, CardProgress>,
  mode: StudyMode,
  roundSize: number,
  targetCardId: string,
) {
  const now = Date.now();
  const weights = cards.map((card) => {
    const progress = normalizeCardProgress(progressByCard[card.id]);
    const rawScore =
      mode === "review"
        ? getReviewPriorityScore(progress, now)
        : getAdaptivePriorityScore(progress, now);

    return {
      cardId: card.id,
      weight: Math.max(0.1, rawScore + 45),
    };
  });
  const totalWeight = weights.reduce((sum, item) => sum + item.weight, 0);
  const targetWeight =
    weights.find((item) => item.cardId === targetCardId)?.weight ?? 0;

  if (totalWeight === 0 || targetWeight === 0) {
    return 0;
  }

  return Math.min(99, (roundSize * targetWeight * 100) / totalWeight);
}

function recentResultsLabel(progress: CardProgress) {
  if (progress.recentResults.length === 0) {
    return "sin intentos";
  }

  return progress.recentResults
    .map((result) => (result === "correct" ? "✓" : "✕"))
    .join(" ");
}

export function buildModeStatsRows(
  cards: Card[],
  progressByMode: ProgressByMode,
  mode: StudyMode,
  roundSize: number,
): CardModeStatsRow[] {
  const progressByCard = getModeProgress(progressByMode, mode);
  const previewIds = new Set(
    pickRoundCards(cards, roundSize, progressByCard, mode).map((card) => card.id),
  );
  const now = Date.now();

  return cards.map((card) => {
    const progress = normalizeCardProgress(progressByCard[card.id]);
    const priorityScore =
      mode === "review"
        ? getReviewPriorityScore(progress, now)
        : getAdaptivePriorityScore(progress, now);

    return {
      cardId: card.id,
      hanzi: card.hanzi,
      pinyinDisplay: card.syllables.map((syllable) => syllable.pinyinDisplay).join(" "),
      pinyinSortKey: card.syllables
        .map((syllable) => syllable.pinyinNumber)
        .join(" "),
      spanish: card.spanish,
      mode,
      bucket: bucketLabel(mode, progress),
      attempts: progress.attempts,
      correct: progress.correct,
      incorrect: progress.incorrect,
      streak: progress.streak,
      recentIncorrects: progress.recentResults.filter(
        (result) => result === "incorrect",
      ).length,
      recentResultsLabel: recentResultsLabel(progress),
      priorityScore,
      estimatedProbability: estimateProbability(
        cards,
        progressByCard,
        mode,
        roundSize,
        card.id,
      ),
      selectedInPreview: previewIds.has(card.id),
    };
  });
}

export function sortModeStatsRows(
  rows: CardModeStatsRow[],
  sort: CardModeStatsSort,
): CardModeStatsRow[] {
  const sorted = [...rows];

  sorted.sort((left, right) => {
    switch (sort) {
      case "pinyin-asc":
        return left.pinyinSortKey.localeCompare(right.pinyinSortKey);
      case "hanzi-asc":
        return left.hanzi.localeCompare(right.hanzi);
      case "spanish-asc":
        return left.spanish.localeCompare(right.spanish);
      case "priority-desc":
        return right.priorityScore - left.priorityScore;
      case "probability-desc":
        return right.estimatedProbability - left.estimatedProbability;
      case "incorrect-desc":
        return right.incorrect - left.incorrect;
      case "recent-incorrect-desc":
        return right.recentIncorrects - left.recentIncorrects;
      case "correct-desc":
        return right.correct - left.correct;
      case "attempts-desc":
        return right.attempts - left.attempts;
      case "streak-desc":
        return right.streak - left.streak;
    }
  });

  return sorted;
}
