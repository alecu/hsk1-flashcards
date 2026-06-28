import { describe, expect, it } from "vitest";

import {
  buildCustomDeck,
  defaultCustomWordList,
  parseCustomWordList,
} from "./customList";

describe("custom vocabulary deck", () => {
  it("parses the default custom list without errors", () => {
    const deck = buildCustomDeck(defaultCustomWordList);

    expect(deck.cards.length).toBeGreaterThan(70);
    expect(deck.errors).toEqual([]);
  });

  it("supports pinyin alternatives and spanish aliases", () => {
    const parsed = parseCustomWordList(
      "kuai4 / yuan2\tunidad monetaria / moneda\nxiao3jie3 / nv3shi4\tseñorita",
    );

    expect(parsed.errors).toEqual([]);
    expect(parsed.cards).toHaveLength(4);
    expect(parsed.cards[0]).toMatchObject({
      hanzi: "kuài",
      spanish: "unidad monetaria",
      answers: ["unidad monetaria", "moneda"],
    });
    expect(parsed.cards[3]).toMatchObject({
      hanzi: "nǚ shì",
      spanish: "señorita",
    });
  });

  it("reports invalid lines clearly", () => {
    const parsed = parseCustomWordList("solo una linea sin tab");

    expect(parsed.cards).toEqual([]);
    expect(parsed.errors).toEqual([
      "Línea 1: falta tabulador entre pinyin y castellano.",
    ]);
  });
});
