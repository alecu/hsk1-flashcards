import { describe, expect, it } from "vitest";

import {
  buildCustomDeck,
  defaultCustomWordList,
  parseCustomWordList,
  parseCustomWordRows,
  serializeCustomWordRows,
} from "./customList";

describe("custom vocabulary deck", () => {
  it("parses the default custom list with hanzi and no errors", () => {
    const deck = buildCustomDeck(defaultCustomWordList);
    const planeCard = deck.cards.find((card) => card.hanzi === "飞机");

    expect(deck.cards.length).toBeGreaterThan(80);
    expect(deck.errors).toEqual([]);
    expect(planeCard?.syllables).toEqual([
      {
        hanzi: "飞",
        prompt: "fēi",
        pinyinNumber: "fei1",
        pinyinDisplay: "fēi1",
        tone: 1,
      },
      {
        hanzi: "机",
        prompt: "jī",
        pinyinNumber: "ji1",
        pinyinDisplay: "jī1",
        tone: 1,
      },
    ]);
  });

  it("supports 3-column rows with hanzi and variant expansion", () => {
    const parsed = parseCustomWordList(
      "块 / 元\tkuai4 / yuan2\tunidad monetaria / moneda\n他 / 她\tta1\tél / ella",
    );

    expect(parsed.errors).toEqual([]);
    expect(parsed.cards).toHaveLength(4);
    expect(parsed.cards[0]).toMatchObject({
      hanzi: "块",
      spanish: "unidad monetaria",
      answers: ["unidad monetaria", "moneda"],
    });
    expect(parsed.cards[3]).toMatchObject({
      hanzi: "她",
    });
    expect(parsed.cards[3].syllables[0]).toMatchObject({
      hanzi: "她",
      pinyinNumber: "ta1",
      pinyinDisplay: "tā1",
      tone: 1,
    });
  });

  it("keeps compatibility with legacy 2-column rows", () => {
    const rows = parseCustomWordRows("fei1ji1\tavión\nzai4\testar");

    expect(rows).toEqual([
      { hanzi: "", pinyin: "fei1ji1", spanish: "avión" },
      { hanzi: "", pinyin: "zai4", spanish: "estar" },
    ]);

    expect(serializeCustomWordRows(rows)).toBe("\tfei1ji1\tavión\n\tzai4\testar");
  });

  it("reports invalid rows clearly", () => {
    const parsed = parseCustomWordList("solo una linea sin tabs");

    expect(parsed.cards).toEqual([]);
    expect(parsed.errors).toEqual(["Línea 1: formato incompleto."]);
  });
});
