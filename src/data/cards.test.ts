import { describe, expect, it } from "vitest";

import { hsk20Cards, hsk30Cards, vocabularyDecks } from "./cards";

describe("hsk1 dataset", () => {
  it("contains both HSK1 decks", () => {
    expect(hsk20Cards).toHaveLength(150);
    expect(hsk30Cards).toHaveLength(300);
  });

  it("keeps hanzi and pinyin aligned by syllable", () => {
    [...hsk20Cards, ...hsk30Cards].forEach((card) => {
      expect(card.syllables.length).toBeGreaterThan(0);
      expect(card.syllables.length).toBeLessThanOrEqual(Array.from(card.hanzi).length);
    });
  });

  it("does not inject a phantom ma1 prefix on gato", () => {
    const catCard = hsk20Cards.find((card) => card.hanzi === "猫");

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

  it("uses the expected spoken reading for 谁", () => {
    const whoCard = hsk30Cards.find((card) => card.hanzi === "谁");

    expect(whoCard).toBeDefined();
    expect(whoCard?.syllables).toEqual([
      {
        hanzi: "谁",
        pinyinNumber: "shei2",
        pinyinDisplay: "shéi2",
        tone: 2,
      },
    ]);
  });

  it("exposes deck metadata for UI selection", () => {
    expect(vocabularyDecks.hsk20.subtitle).toBe("150 palabras");
    expect(vocabularyDecks.hsk30.subtitle).toBe("300 palabras");
  });

  it("groups erhua words from HSK 3.0 into the expected syllable blocks", () => {
    const funCard = hsk30Cards.find((card) => card.hanzi === "好玩儿");

    expect(funCard).toBeDefined();
    expect(funCard?.syllables).toEqual([
      {
        hanzi: "好",
        pinyinNumber: "hao3",
        pinyinDisplay: "hǎo3",
        tone: 3,
      },
      {
        hanzi: "玩儿",
        pinyinNumber: "wanr2",
        pinyinDisplay: "wánr2",
        tone: 2,
      },
    ]);
  });
});
