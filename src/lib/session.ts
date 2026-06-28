import type {
  Card,
  CardProgress,
  SessionSummary,
  StudyMode,
} from "../types/cards";
import { areEquivalentAnswers } from "./text";

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
  const sourceCards =
    mode === "review"
      ? allCards
          .filter((card) => (progress[card.id]?.incorrect ?? 0) > 0)
          .sort((left, right) => {
            const leftScore =
              (progress[left.id]?.incorrect ?? 0) -
              (progress[left.id]?.correct ?? 0);
            const rightScore =
              (progress[right.id]?.incorrect ?? 0) -
              (progress[right.id]?.correct ?? 0);
            return rightScore - leftScore;
          })
      : shuffle(allCards);

  return sourceCards.slice(0, Math.min(roundSize, sourceCards.length));
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
