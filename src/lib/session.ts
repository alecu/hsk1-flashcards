import type {
  Card,
  CardProgress,
  SessionSummary,
  StudyMode,
} from "../types/cards";
import { hasRecentIncorrect, isMastered, normalizeCardProgress } from "./progress";
import { areEquivalentAnswers } from "./text";

export type AdaptiveSelectionBucket =
  | "recent-error"
  | "unseen"
  | "recovery"
  | "general"
  | "mastered";

export type Session = {
  id: string;
  mode: StudyMode;
  startedAt: number;
  queue: Card[];
  learnedIds: string[];
  incorrectIds: string[];
  currentCard: Card;
  roundSize: number;
};

export function shuffle<T>(items: T[]) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

export function pickRoundCards(
  allCards: Card[],
  roundSize: number,
  progress: Record<string, CardProgress>,
  mode: StudyMode,
) {
  if (mode === "review") {
    return pickReviewRoundCards(allCards, roundSize, progress);
  }

  return pickAdaptiveRoundCards(allCards, roundSize, progress);
}

function cardProgressMap(progressByCard: Record<string, CardProgress>, card: Card) {
  return normalizeCardProgress(progressByCard[card.id]);
}

export function getAdaptivePriorityScore(progress: CardProgress, now: number) {
  const ageBoost =
    progress.lastSeenAt === null
      ? 0
      : Math.min((now - progress.lastSeenAt) / (1000 * 60 * 60 * 8), 6);

  return (
    progress.incorrect * 6 +
    (progress.lastResult === "incorrect" ? 18 : 0) +
    (hasRecentIncorrect(progress) ? 12 : 0) +
    ageBoost -
    progress.correct * 2 -
    progress.streak * 3 -
    (isMastered(progress) ? 40 : 0)
  );
}

export function getReviewPriorityScore(progress: CardProgress, now: number) {
  const ageBoost =
    progress.lastIncorrectAt === null
      ? 0
      : Math.min((now - progress.lastIncorrectAt) / (1000 * 60 * 60 * 6), 6);

  return (
    progress.incorrect * 7 +
    (progress.lastResult === "incorrect" ? 24 : 0) +
    (hasRecentIncorrect(progress) ? 16 : 0) +
    ageBoost -
    progress.correct
  );
}

export function getAdaptiveSelectionBucket(
  progress: CardProgress,
): AdaptiveSelectionBucket {
  if (progress.lastResult === "incorrect") {
    return "recent-error";
  }

  if (progress.attempts === 0) {
    return "unseen";
  }

  if (hasRecentIncorrect(progress)) {
    return "recovery";
  }

  if (isMastered(progress)) {
    return "mastered";
  }

  return "general";
}

function sortCardsByScore(
  cards: Card[],
  progressByCard: Record<string, CardProgress>,
  scoreBuilder: (progress: CardProgress, now: number) => number,
) {
  const now = Date.now();

  return shuffle(cards).sort((left, right) => {
    const leftScore = scoreBuilder(cardProgressMap(progressByCard, left), now);
    const rightScore = scoreBuilder(cardProgressMap(progressByCard, right), now);
    return rightScore - leftScore;
  });
}

function takeCards(
  source: Card[],
  amount: number,
  selectedIds: Set<string>,
) {
  const picked: Card[] = [];

  source.forEach((card) => {
    if (picked.length >= amount || selectedIds.has(card.id)) {
      return;
    }

    selectedIds.add(card.id);
    picked.push(card);
  });

  return picked;
}

function pickAdaptiveRoundCards(
  allCards: Card[],
  roundSize: number,
  progressByCard: Record<string, CardProgress>,
) {
  const targetSize = Math.min(roundSize, allCards.length);

  if (targetSize === 0) {
    return [];
  }

  const recentErrorCards = sortCardsByScore(
    allCards.filter((card) => cardProgressMap(progressByCard, card).lastResult === "incorrect"),
    progressByCard,
    getAdaptivePriorityScore,
  );
  const unseenCards = shuffle(
    allCards.filter((card) => cardProgressMap(progressByCard, card).attempts === 0),
  );
  const recoveryCards = sortCardsByScore(
    allCards.filter((card) => {
      const progress = cardProgressMap(progressByCard, card);
      return (
        progress.attempts > 0 &&
        progress.lastResult !== "incorrect" &&
        hasRecentIncorrect(progress)
      );
    }),
    progressByCard,
    getAdaptivePriorityScore,
  );
  const generalCards = sortCardsByScore(
    allCards.filter((card) => {
      const progress = cardProgressMap(progressByCard, card);
      return progress.attempts > 0 && !isMastered(progress);
    }),
    progressByCard,
    getAdaptivePriorityScore,
  );
  const masteredCards = sortCardsByScore(
    allCards.filter((card) => isMastered(cardProgressMap(progressByCard, card))),
    progressByCard,
    getAdaptivePriorityScore,
  );

  const selectedIds = new Set<string>();
  const selected: Card[] = [];
  const recentErrorQuota = Math.min(
    recentErrorCards.length,
    Math.ceil(targetSize * 0.35),
  );
  const unseenQuota = Math.min(unseenCards.length, Math.ceil(targetSize * 0.25));
  const recoveryQuota = Math.min(
    recoveryCards.length,
    Math.ceil(targetSize * 0.25),
  );

  selected.push(...takeCards(recentErrorCards, recentErrorQuota, selectedIds));
  selected.push(...takeCards(unseenCards, unseenQuota, selectedIds));
  selected.push(...takeCards(recoveryCards, recoveryQuota, selectedIds));
  selected.push(
    ...takeCards(generalCards, targetSize - selected.length, selectedIds),
  );
  selected.push(
    ...takeCards(masteredCards, targetSize - selected.length, selectedIds),
  );
  selected.push(
    ...takeCards(
      sortCardsByScore(allCards, progressByCard, getAdaptivePriorityScore),
      targetSize - selected.length,
      selectedIds,
    ),
  );

  return shuffle(selected).slice(0, targetSize);
}

function pickReviewRoundCards(
  allCards: Card[],
  roundSize: number,
  progressByCard: Record<string, CardProgress>,
) {
  const targetSize = Math.min(roundSize, allCards.length);

  const eligibleCards = sortCardsByScore(
    allCards.filter((card) => {
      const progress = cardProgressMap(progressByCard, card);
      return progress.incorrect > 0 || hasRecentIncorrect(progress);
    }),
    progressByCard,
    getReviewPriorityScore,
  );

  return eligibleCards.slice(0, targetSize);
}

export function createSession(
  cards: Card[],
  roundSize: number,
  mode: StudyMode,
) {
  const queue = shuffle(cards);

  if (queue.length === 0) {
    return null;
  }

  const [currentCard, ...rest] = queue;

  return {
    id: `session-${Date.now()}`,
    mode,
    startedAt: Date.now(),
    queue: rest,
    learnedIds: [],
    incorrectIds: [],
    currentCard,
    roundSize: queue.length,
  } satisfies Session;
}

export function isCorrectAnswer(card: Card, input: string) {
  return card.answers.some((answer) => areEquivalentAnswers(answer, input));
}

export function areCorrectToneSelections(card: Card, selections: number[]) {
  if (selections.length !== card.syllables.length) {
    return false;
  }

  return card.syllables.every(
    (syllable, index) => syllable.tone === selections[index],
  );
}

export function resolveAnswer(session: Session, wasCorrect: boolean) {
  const learnedIds = [...session.learnedIds];
  const incorrectIds = [...session.incorrectIds];
  const remainingQueue = [...session.queue];

  if (wasCorrect) {
    learnedIds.push(session.currentCard.id);
  } else {
    incorrectIds.push(session.currentCard.id);
    const insertionFloor = Math.max(0, Math.floor(remainingQueue.length * 0.45));
    const insertionIndex =
      insertionFloor +
      Math.floor(Math.random() * (remainingQueue.length - insertionFloor + 1));
    remainingQueue.splice(insertionIndex, 0, session.currentCard);
  }

  const nextCard = remainingQueue.shift();

  if (!nextCard) {
    return {
      done: true as const,
      summary: {
        id: session.id,
        mode: session.mode,
        startedAt: session.startedAt,
        completedAt: Date.now(),
        roundSize: session.roundSize,
        correct: learnedIds.length,
        incorrect: incorrectIds.length,
      } satisfies SessionSummary,
      learnedIds,
      incorrectIds,
    };
  }

  return {
    done: false as const,
    session: {
      ...session,
      queue: remainingQueue,
      learnedIds,
      incorrectIds,
      currentCard: nextCard,
    } satisfies Session,
  };
}

export function buildMultipleChoiceOptions(card: Card, allCards: Card[]) {
  const distractors = shuffle(
    allCards.filter(
      (candidate) =>
        candidate.id !== card.id && candidate.spanish !== card.spanish,
    ),
  )
    .slice(0, 3)
    .map((candidate) => candidate.spanish);

  return shuffle([card.spanish, ...distractors]);
}
