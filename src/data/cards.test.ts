import { describe, expect, it } from "vitest";

import { hsk1Cards } from "./cards";

describe("hsk1 dataset", () => {
  it("contains the full HSK1 set", () => {
    expect(hsk1Cards).toHaveLength(150);
  });

  it("keeps hanzi and pinyin aligned by syllable", () => {
    hsk1Cards.forEach((card) => {
      expect(card.syllables).toHaveLength(Array.from(card.hanzi).length);
    });
  });

  it("does not inject a phantom ma1 prefix on gato", () => {
    const catCard = hsk1Cards.find((card) => card.hanzi === "猫");

    expect(catCard).toBeDefined();
    expect(catCard?.syllables).toEqual([
      {
        hanzi: "猫",
        pinyinNumber: "mao1",
        pinyinDisplay: "māo1",
        tone: 1,
      },
    ]);
  });
});
