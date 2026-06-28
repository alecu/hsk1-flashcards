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

const dadCard: Card = {
  id: "dad",
  hanzi: "爸爸",
  spanish: "papá",
  answers: ["papá", "papa"],
  syllables: [
    {
      hanzi: "爸",
      pinyinNumber: "ba4",
      pinyinDisplay: "bà4",
      tone: 4,
    },
    {
      hanzi: "爸",
      pinyinNumber: "ba0",
      pinyinDisplay: "ba0",
      tone: 0,
    },
  ],
  vocabularySet: "hsk20",
  hskLevel: 1,
};

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

const momCard: Card = {
  id: "mom",
  hanzi: "妈妈",
  spanish: "mamá",
  answers: ["mamá", "mama"],
  syllables: [
    {
      hanzi: "妈",
      pinyinNumber: "ma1",
      pinyinDisplay: "mā1",
      tone: 1,
    },
    {
      hanzi: "妈",
      pinyinNumber: "ma0",
      pinyinDisplay: "ma0",
      tone: 0,
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

  it("does not leak a duplicated first syllable when rerendering from 爸爸 to 饭店", () => {
    const { rerender, container } = render(
      <TonePinyinCard
        card={dadCard}
        colorTones
        revealSpanish={false}
        showPinyin
      />,
    );

    rerender(
      <TonePinyinCard
        card={restaurantCard}
        colorTones
        revealSpanish={false}
        showPinyin
      />,
    );

    expect(screen.queryByText("爸")).not.toBeInTheDocument();
    expect(screen.getByText("饭")).toBeInTheDocument();
    expect(screen.getByText("店")).toBeInTheDocument();
    expect(screen.queryByText("bà4")).not.toBeInTheDocument();
    expect(screen.getByText("fàn4")).toBeInTheDocument();
    expect(screen.getByText("diàn4")).toBeInTheDocument();
    expect(container.querySelectorAll(".syllable-block")).toHaveLength(2);
  });

  it("does not leak ma1 when rerendering from 妈妈 to 猫", () => {
    const { rerender, container } = render(
      <TonePinyinCard
        card={momCard}
        colorTones
        revealSpanish
        showPinyin
      />,
    );

    rerender(
      <TonePinyinCard
        card={card}
        colorTones
        revealSpanish
        showPinyin
      />,
    );

    expect(screen.queryByText(/^妈$/)).not.toBeInTheDocument();
    expect(screen.queryByText("mā1")).not.toBeInTheDocument();
    expect(screen.getByText("猫")).toBeInTheDocument();
    expect(screen.getByText("māo1")).toBeInTheDocument();
    expect(container.querySelectorAll(".syllable-block")).toHaveLength(1);
  });
});
