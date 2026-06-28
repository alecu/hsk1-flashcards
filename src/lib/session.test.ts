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
];

describe("session engine", () => {
  it("accepts normalized answers with accents removed", () => {
    expect(isCorrectAnswer(sampleCards[1], "PERRÓ")).toBe(true);
    expect(isCorrectAnswer(sampleCards[1], "perro")).toBe(true);
    expect(isCorrectAnswer(sampleCards[1], "gato")).toBe(false);
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
