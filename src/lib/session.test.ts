import { describe, expect, it } from "vitest";

import {
  areCorrectToneSelections,
  createSession,
  isCorrectAnswer,
  pickRoundCards,
  resolveAnswer,
} from "./session";
import type { Card, CardProgress } from "../types/cards";

const sampleCards: Card[] = [
  {
    id: "1",
    hanzi: "猫",
    spanish: "gato",
    answers: ["gato"],
    syllables: [
      {
        hanzi: "猫",
        pinyinNumber: "mao1",
        pinyinDisplay: "māo1",
        tone: 1,
      },
    ],
    vocabularySet: "hsk20",
    hskLevel: 1,
  },
  {
    id: "2",
    hanzi: "狗",
    spanish: "perro",
    answers: ["perro"],
    syllables: [
      {
        hanzi: "狗",
        pinyinNumber: "gou3",
        pinyinDisplay: "gǒu3",
        tone: 3,
      },
    ],
    vocabularySet: "hsk20",
    hskLevel: 1,
  },
  {
    id: "3",
    hanzi: "坐",
    spanish: "sentarse",
    answers: ["sentarse"],
    syllables: [
      {
        hanzi: "坐",
        pinyinNumber: "zuo4",
        pinyinDisplay: "zuò4",
        tone: 4,
      },
    ],
    vocabularySet: "hsk20",
    hskLevel: 1,
  },
  {
    id: "4",
    hanzi: "朋友",
    spanish: "amigo",
    answers: ["amigo"],
    syllables: [
      {
        hanzi: "朋",
        pinyinNumber: "peng2",
        pinyinDisplay: "péng2",
        tone: 2,
      },
      {
        hanzi: "友",
        pinyinNumber: "you3",
        pinyinDisplay: "yǒu3",
        tone: 3,
      },
    ],
    vocabularySet: "hsk20",
    hskLevel: 1,
  },
];

describe("session engine", () => {
  it("accepts normalized answers with accents removed", () => {
    expect(isCorrectAnswer(sampleCards[1], "PERRÓ")).toBe(true);
    expect(isCorrectAnswer(sampleCards[1], "perro")).toBe(true);
    expect(isCorrectAnswer(sampleCards[1], "gato")).toBe(false);
  });

  it("accepts non reflexive infinitives and basic verb forms", () => {
    expect(isCorrectAnswer(sampleCards[2], "sentar")).toBe(true);
    expect(isCorrectAnswer(sampleCards[2], "siento")).toBe(false);
    expect(isCorrectAnswer(sampleCards[2], "sentado")).toBe(true);
  });

  it("accepts singular and plural noun variants", () => {
    expect(isCorrectAnswer(sampleCards[3], "amigo")).toBe(true);
    expect(isCorrectAnswer(sampleCards[3], "amigos")).toBe(true);
    expect(isCorrectAnswer(sampleCards[3], "amiga")).toBe(true);
    expect(isCorrectAnswer(sampleCards[3], "las amigas")).toBe(true);
  });

  it("accepts optional leading articles", () => {
    expect(isCorrectAnswer(sampleCards[0], "el gato")).toBe(true);
    expect(isCorrectAnswer(sampleCards[1], "los perros")).toBe(true);
    expect(isCorrectAnswer(sampleCards[1], "un perro")).toBe(true);
  });

  it("validates tone selections syllable by syllable", () => {
    expect(areCorrectToneSelections(sampleCards[0], [1])).toBe(true);
    expect(areCorrectToneSelections(sampleCards[0], [4])).toBe(false);
    expect(areCorrectToneSelections(sampleCards[3], [2, 3])).toBe(true);
    expect(areCorrectToneSelections(sampleCards[3], [2, 4])).toBe(false);
  });

  it("moves a correct answer to learned and ends when queue is empty", () => {
    const session = createSession([sampleCards[0]], 1, "typing");

    expect(session).not.toBeNull();

    const result = resolveAnswer(session!, true);

    expect(result.done).toBe(true);
    if (result.done) {
      expect(result.learnedIds).toEqual([sampleCards[0].id]);
      expect(result.summary.correct).toBe(1);
      expect(result.summary.incorrect).toBe(0);
    }
  });

  it("requeues an incorrect card instead of dropping it", () => {
    const session = createSession(sampleCards, 2, "typing");

    expect(session).not.toBeNull();

    const result = resolveAnswer(session!, false);

    expect(result.done).toBe(false);
    if (!result.done) {
      const idsInPlay = [
        result.session.currentCard.id,
        ...result.session.queue.map((card) => card.id),
      ];
      expect(idsInPlay).toContain(session!.currentCard.id);
      expect(result.session.incorrectIds).toEqual([session!.currentCard.id]);
    }
  });

  it("builds adaptive rounds with recent errors, unseen cards and recovery cards", () => {
    const adaptiveCards = Array.from({ length: 12 }, (_, index) => ({
      ...sampleCards[index % sampleCards.length],
      id: `adaptive-${index + 1}`,
      hanzi: `字${index + 1}`,
      spanish: `palabra-${index + 1}`,
      answers: [`palabra-${index + 1}`],
    })) satisfies Card[];
    const progress: Record<string, CardProgress> = {};

    adaptiveCards.forEach((card, index) => {
      if (index < 3) {
        progress[card.id] = {
          attempts: 3,
          correct: 1,
          incorrect: 2,
          streak: 0,
          lastSeenAt: 100,
          lastResult: "incorrect",
          recentResults: ["incorrect", "correct", "incorrect"],
          introducedAt: 10,
          lastIncorrectAt: 100,
        };
      } else if (index < 5) {
        progress[card.id] = {
          attempts: 0,
          correct: 0,
          incorrect: 0,
          streak: 0,
          lastSeenAt: null,
          lastResult: null,
          recentResults: [],
          introducedAt: null,
          lastIncorrectAt: null,
        };
      } else if (index < 7) {
        progress[card.id] = {
          attempts: 3,
          correct: 2,
          incorrect: 1,
          streak: 2,
          lastSeenAt: 120,
          lastResult: "correct",
          recentResults: ["correct", "correct", "incorrect"],
          introducedAt: 15,
          lastIncorrectAt: 110,
        };
      } else if (index < 10) {
        progress[card.id] = {
          attempts: 4,
          correct: 3,
          incorrect: 1,
          streak: 3,
          lastSeenAt: 140,
          lastResult: "correct",
          recentResults: ["correct", "correct", "correct"],
          introducedAt: 20,
          lastIncorrectAt: 130,
        };
      } else {
        progress[card.id] = {
          attempts: 6,
          correct: 6,
          incorrect: 0,
          streak: 6,
          lastSeenAt: 160,
          lastResult: "correct",
          recentResults: ["correct", "correct", "correct"],
          introducedAt: 30,
          lastIncorrectAt: null,
        };
      }
    });

    const round = pickRoundCards(adaptiveCards, 8, progress, "tones");
    const ids = round.map((card) => card.id);

    expect(ids).toEqual(expect.arrayContaining(["adaptive-1", "adaptive-2", "adaptive-3"]));
    expect(ids).toEqual(expect.arrayContaining(["adaptive-4", "adaptive-5"]));
    expect(ids).toEqual(expect.arrayContaining(["adaptive-6", "adaptive-7"]));
    expect(ids).not.toEqual(expect.arrayContaining(["adaptive-11", "adaptive-12"]));
  });

  it("keeps review mode focused on cards with historical mistakes", () => {
    const reviewProgress: Record<string, CardProgress> = {
      1: {
        attempts: 4,
        correct: 2,
        incorrect: 2,
        streak: 0,
        lastSeenAt: 100,
        lastResult: "incorrect",
        recentResults: ["incorrect", "correct", "incorrect"],
        introducedAt: 10,
        lastIncorrectAt: 100,
      },
      2: {
        attempts: 5,
        correct: 4,
        incorrect: 1,
        streak: 3,
        lastSeenAt: 90,
        lastResult: "correct",
        recentResults: ["correct", "incorrect", "correct"],
        introducedAt: 10,
        lastIncorrectAt: 85,
      },
      3: {
        attempts: 0,
        correct: 0,
        incorrect: 0,
        streak: 0,
        lastSeenAt: null,
        lastResult: null,
        recentResults: [],
        introducedAt: null,
        lastIncorrectAt: null,
      },
      4: {
        attempts: 4,
        correct: 4,
        incorrect: 0,
        streak: 4,
        lastSeenAt: 80,
        lastResult: "correct",
        recentResults: ["correct", "correct", "correct"],
        introducedAt: 10,
        lastIncorrectAt: null,
      },
    };

    const round = pickRoundCards(sampleCards, 4, reviewProgress, "review");

    expect(round.map((card) => card.id)).toEqual(expect.arrayContaining(["1", "2"]));
    expect(round.map((card) => card.id)).not.toContain("3");
    expect(round.map((card) => card.id)).not.toContain("4");
  });
});
