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

  it("carries the hotel/restaurant/dates vocabulary that used to be the custom-list default", () => {
    expect(isleNivel2Cards.length).toBeGreaterThan(80);
    expect(isleNivel2Cards.every((card) => card.vocabularySet === "isleNivel2")).toBe(
      true,
    );

    const reservar = isleNivel2Cards.find((card) => card.hanzi === "预订");
    expect(reservar?.spanish).toBe("reservar");

    const domingo = isleNivel2Cards.find((card) => card.spanish === "domingo");
    expect(domingo?.hanzi).toBe("星期天");
  });

  it("no longer ships as part of the default custom list", () => {
    const parsed = parseCustomWordList(defaultCustomWordList);
    const reservar = parsed.cards.find((card) => card.hanzi === "预订");

    expect(reservar).toBeUndefined();
    // The list restored as default is whatever "Lista personal" had before
    // Nivel 2 was appended to it -- it still ends on "docente".
    expect(parsed.cards[parsed.cards.length - 1]?.spanish).toBe("docente");
  });
});
