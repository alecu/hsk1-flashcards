import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import {
  buildSpeechTextFromCard,
  buildSpeechTextFromSyllable,
  speakChineseText,
  stopChineseSpeech,
} from "./speech";
import type { Card } from "../types/cards";

const restaurantCard: Card = {
  id: "restaurant",
  hanzi: "饭店",
  spanish: "restaurante",
  answers: ["restaurante"],
  syllables: [
    {
      hanzi: "饭",
      pinyinNumber: "fan4",
      pinyinDisplay: "fàn4",
      tone: 4,
    },
    {
      hanzi: "店",
      pinyinNumber: "dian4",
      pinyinDisplay: "diàn4",
      tone: 4,
    },
  ],
  vocabularySet: "hsk20",
  hskLevel: 1,
};

describe("speech helpers", () => {
  const speak = vi.fn();
  const cancel = vi.fn();
  const getVoices = vi.fn(() => [{ lang: "zh-CN", name: "Test Mandarin" }]);

  beforeEach(() => {
    vi.stubGlobal("SpeechSynthesisUtterance", class {
      text: string;
      lang = "";
      rate = 1;
      pitch = 1;
      voice?: SpeechSynthesisVoice;

      constructor(text: string) {
        this.text = text;
      }
    });

    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: {
        speak,
        cancel,
        getVoices,
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("builds Chinese text from the full card and from a syllable", () => {
    expect(buildSpeechTextFromCard(restaurantCard)).toBe("饭店");
    expect(buildSpeechTextFromSyllable(restaurantCard.syllables[0])).toBe("饭");
  });

  it("speaks Chinese text with a Mandarin utterance", () => {
    const spoken = speakChineseText("饭店");

    expect(spoken).toBe(true);
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(speak).toHaveBeenCalledTimes(1);
    expect(speak.mock.calls[0][0]).toMatchObject({
      text: "饭店",
      lang: "zh-CN",
      rate: 0.9,
      pitch: 1,
    });
  });

  it("cancels active speech when requested", () => {
    stopChineseSpeech();

    expect(cancel).toHaveBeenCalledTimes(1);
  });
});
