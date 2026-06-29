import { describe, expect, it, vi } from "vitest";

import { buildNextProgress } from "./storage";
import { defaultProgressByMode } from "./progress";
import type { CardProgress } from "../types/cards";

describe("storage progress updates", () => {
  it("stores recent results and timestamps for spaced selection", () => {
    vi.spyOn(Date, "now").mockReturnValue(1_234);

    const current: Record<string, CardProgress> = {
      cat: {
        attempts: 2,
        correct: 1,
        incorrect: 1,
        streak: 1,
        lastSeenAt: 100,
        lastResult: "correct",
        recentResults: ["correct", "incorrect"],
        introducedAt: 90,
        lastIncorrectAt: 80,
      },
    };

    const next = buildNextProgress(
      {
        ...defaultProgressByMode(),
        tones: current,
      },
      "tones",
      [
      { cardId: "cat", result: "incorrect" },
      { cardId: "dog", result: "correct" },
      ],
    );

    expect(next.tones.cat.recentResults).toEqual([
      "incorrect",
      "correct",
      "incorrect",
    ]);
    expect(next.tones.cat.lastIncorrectAt).toBe(1_234);
    expect(next.tones.dog.introducedAt).toBe(1_234);
    expect(next.tones.dog.recentResults).toEqual(["correct"]);

    vi.restoreAllMocks();
  });
});
