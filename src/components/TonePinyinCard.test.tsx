import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TonePinyinCard } from "./TonePinyinCard";
import type { Card } from "../types/cards";

const card: Card = {
  id: "cat",
  hanzi: "猫",
  spanish: "gato",
  answers: ["gato"],
  syllables: [
    {
      hanzi: "猫",
      pinyinNumber: "mao1",
      pinyinDisplay: "māo1",
      tone: 1,
    },
  ],
  vocabularySet: "hsk20",
  hskLevel: 1,
};

describe("TonePinyinCard", () => {
  it("renders accented pinyin with tone number", () => {
    render(
      <TonePinyinCard
        card={card}
        colorTones
        revealSpanish={false}
        showPinyin
      />,
    );

    expect(screen.getByText("māo1")).toBeInTheDocument();
    expect(screen.queryByText("ma1")).not.toBeInTheDocument();
  });
});
