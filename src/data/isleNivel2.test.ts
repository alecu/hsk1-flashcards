import { describe, expect, it } from "vitest";

import { defaultCustomWordList, parseCustomWordList } from "./customList";
import { isleNivel2Cards, isleNivel2Deck } from "./isleNivel2";

describe("ISLE Nivel 2 deck", () => {
  it("exposes deck metadata for UI selection", () => {
    expect(isleNivel2Deck.label).toBe("ISLE Nivel 2");
    expect(isleNivel2Deck.subtitle).toBe(
      "Instituto Superior de Lenguas Extranjeras",
    );
  });

  it("only carries the Nivel 2 specific vocabulary, split out of Nivel 1", () => {
    // 80 Nivel 2 rows, plus extra cards from rows with "/"-separated
    // hanzi/pinyin variants -- the original 87 rows now live in
    // isleNivel1.ts.
    expect(isleNivel2Cards.length).toBe(82);
    expect(isleNivel2Cards.every((card) => card.vocabularySet === "isleNivel2")).toBe(
      true,
    );

    // An original word -- no longer part of this deck.
    const avion = isleNivel2Cards.find((card) => card.hanzi === "飞机");
    expect(avion).toBeUndefined();

    // Nivel 2 vocabulary (hotel/restaurant/dates).
    const reservar = isleNivel2Cards.find((card) => card.hanzi === "预订");
    expect(reservar?.spanish).toBe("reservar");

    const domingo = isleNivel2Cards.find((card) => card.spanish === "domingo");
    expect(domingo?.hanzi).toBe("星期天");
  });

  it("no longer ships Nivel 2 words as part of the editable default custom list", () => {
    const parsed = parseCustomWordList(defaultCustomWordList);
    const reservar = parsed.cards.find((card) => card.hanzi === "预订");

    expect(reservar).toBeUndefined();
    // The list restored as default is whatever "Lista personal" had before
    // Nivel 2 was appended to it -- it still ends on "docente", and still
    // has the original words too.
    const avion = parsed.cards.find((card) => card.hanzi === "飞机");
    expect(avion?.spanish).toBe("avión");
    expect(parsed.cards[parsed.cards.length - 1]?.spanish).toBe("docente");
  });
});
