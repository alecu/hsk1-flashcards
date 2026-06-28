import { describe, expect, it } from "vitest";

import { createSession, isCorrectAnswer, resolveAnswer } from "./session";
import type { Card } from "../types/cards";

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
});
