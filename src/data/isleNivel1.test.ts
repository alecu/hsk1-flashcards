import { describe, expect, it } from "vitest";

import { isleNivel1Cards, isleNivel1Deck } from "./isleNivel1";

describe("ISLE Nivel 1 deck", () => {
  it("exposes deck metadata for UI selection", () => {
    expect(isleNivel1Deck.label).toBe("ISLE Nivel 1");
    expect(isleNivel1Deck.subtitle).toBe(
      "Instituto Superior de Lenguas Extranjeras",
    );
  });

  it("carries the original 87-word custom-list default, unchanged by the Nivel 2 split", () => {
    // 87 rows, plus extra cards from rows with "/"-separated hanzi/pinyin
    // variants -- see buildAnswers/resolveVariantValue in customList.ts.
    expect(isleNivel1Cards.length).toBe(90);
    expect(isleNivel1Cards.every((card) => card.vocabularySet === "isleNivel1")).toBe(
      true,
    );

    const avion = isleNivel1Cards.find((card) => card.hanzi === "飞机");
    expect(avion?.spanish).toBe("avión");

    // Nivel 2 vocabulary must not have leaked into this deck.
    const reservar = isleNivel1Cards.find((card) => card.hanzi === "预订");
    expect(reservar).toBeUndefined();
  });
});
