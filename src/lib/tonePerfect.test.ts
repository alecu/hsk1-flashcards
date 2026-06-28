import { describe, expect, it, vi } from "vitest";

import {
  chooseRandomTonePerfectId,
  getTonePerfectIds,
  getTonePerfectKey,
  getTonePerfectUrl,
  hasTonePerfectAudio,
  playTonePerfectSyllable,
} from "./tonePerfect";

describe("Tone Perfect helpers", () => {
  it("resolves accented keys and ids from numeric pinyin", () => {
    expect(getTonePerfectKey("mao1")).toBe("māo");
    expect(getTonePerfectIds("mao1").length).toBeGreaterThan(0);
    expect(hasTonePerfectAudio("mao1")).toBe(true);
    expect(hasTonePerfectAudio("le0")).toBe(false);
  });

  it("builds Tone Perfect audio urls", () => {
    expect(getTonePerfectUrl(1584)).toBe(
      "https://tone.lib.msu.edu/tone/1584/PROXY_MP3/view",
    );
  });

  it("chooses a deterministic id when a random seed is passed", () => {
    const ids = getTonePerfectIds("mao1");

    expect(chooseRandomTonePerfectId("mao1", () => 0)).toBe(ids[0]);
  });

  it("plays supported syllables and skips unsupported ones", async () => {
    class MockAudio {
      onended: (() => void) | null = null;
      onerror: (() => void) | null = null;

      constructor(public readonly url: string) {}

      play() {
        queueMicrotask(() => {
          this.onended?.();
        });
        return Promise.resolve();
      }
    }

    vi.stubGlobal("Audio", MockAudio);

    await expect(playTonePerfectSyllable("mao1")).resolves.toBe(true);
    await expect(playTonePerfectSyllable("le0")).resolves.toBe(false);
  });
});
