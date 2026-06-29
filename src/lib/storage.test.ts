import { describe, expect, it, vi } from "vitest";

import { buildNextProgress } from "./storage";
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

    const next = buildNextProgress(current, [
      { cardId: "cat", result: "incorrect" },
      { cardId: "dog", result: "correct" },
    ]);

    expect(next.cat.recentResults).toEqual([
      "incorrect",
      "correct",
      "incorrect",
    ]);
    expect(next.cat.lastIncorrectAt).toBe(1_234);
    expect(next.dog.introducedAt).toBe(1_234);
    expect(next.dog.recentResults).toEqual(["correct"]);

    vi.restoreAllMocks();
  });
});
