import { describe, expect, it } from "vitest";

import { buildModeStatsRows } from "./modeStats";
import { defaultProgressByMode } from "./progress";
import type { Card, CardProgress } from "../types/cards";

const cards: Card[] = [
  {
    id: "1",
    hanzi: "猫",
    spanish: "gato",
    answers: ["gato"],
    syllables: [
      { hanzi: "猫", pinyinNumber: "mao1", pinyinDisplay: "māo1", tone: 1 },
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
      { hanzi: "狗", pinyinNumber: "gou3", pinyinDisplay: "gǒu3", tone: 3 },
    ],
    vocabularySet: "hsk20",
    hskLevel: 1,
  },
];

const correctProgress = (lastSeenRound: number): CardProgress => ({
  attempts: 1,
  correct: 1,
  incorrect: 0,
  streak: 1,
  lastSeenAt: 100,
  lastResult: "correct",
  recentResults: ["correct"],
  introducedAt: 100,
  lastIncorrectAt: null,
  lastSeenRound,
});

describe("mode stats", () => {
  it("shows 0% for a card that's currently cooling down", () => {
    const progressByMode = defaultProgressByMode();
    progressByMode.typing["1"] = correctProgress(5);

    const rows = buildModeStatsRows(cards, progressByMode, "typing", 10, 6, 3);
    const coolingDownRow = rows.find((row) => row.cardId === "1");

    expect(coolingDownRow?.bucket).toBe("En espera");
    expect(coolingDownRow?.estimatedProbability).toBe(0);
  });

  it("keeps a non-zero estimate once the cooldown has expired", () => {
    const progressByMode = defaultProgressByMode();
    progressByMode.typing["1"] = correctProgress(5);

    const rows = buildModeStatsRows(cards, progressByMode, "typing", 10, 8, 3);
    const expiredRow = rows.find((row) => row.cardId === "1");

    expect(expiredRow?.bucket).not.toBe("En espera");
    expect(expiredRow?.estimatedProbability).toBeGreaterThan(0);
  });

  it("ignores cooldown in review mode, which has no cooldown concept", () => {
    const progressByMode = defaultProgressByMode();
    progressByMode.typing["1"] = correctProgress(5);

    const rows = buildModeStatsRows(cards, progressByMode, "review", 10, 6, 3);
    const row = rows.find((row) => row.cardId === "1");

    // Cooldown is a typing/choice/tones-mode concept only (see
    // bucketLabel's "review" branch in modeStats.ts), so a card that would
    // be cooling down in those modes gets a normal, non-zero estimate here.
    expect(row?.estimatedProbability).toBeGreaterThan(0);
  });
});
