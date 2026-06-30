import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HomeScreen } from "./HomeScreen";
import { defaultCustomWordList } from "../data/customList";
import { defaultProgressByMode } from "../lib/progress";
import type { Card, UserSettings } from "../types/cards";

const cards: Card[] = [
  {
    id: "plane",
    hanzi: "飞机",
    spanish: "avión",
    answers: ["avión"],
    syllables: [
      {
        hanzi: "飞",
        pinyinNumber: "fei1",
        pinyinDisplay: "fēi1",
        tone: 1,
      },
      {
        hanzi: "机",
        pinyinNumber: "ji1",
        pinyinDisplay: "jī1",
        tone: 1,
      },
    ],
    vocabularySet: "custom",
    hskLevel: 1,
  },
];

const settings: UserSettings = {
  roundSize: 20,
  showPinyin: true,
  colorTones: true,
  vocabularySet: "custom",
  customWordList: defaultCustomWordList,
};

describe("HomeScreen", () => {
  it("keeps the custom editor closed by default", () => {
    render(
      <HomeScreen
        activeVocabularySet="custom"
        allCards={cards}
        totalCards={12}
        mistakeCards={0}
        customDeckErrors={[]}
        customRows={[
          { hanzi: "飞机", pinyin: "fei1ji1", spanish: "avión" },
          { hanzi: "出租车", pinyin: "chu1zu1che1", spanish: "taxi" },
        ]}
        progress={{}}
        progressByMode={defaultProgressByMode()}
        settings={settings}
        onVocabularySetChange={vi.fn()}
        onCustomRowChange={vi.fn()}
        onCustomRowDelete={vi.fn()}
        onCustomRowAdd={vi.fn()}
        onRoundSizeChange={vi.fn()}
        onToggleSetting={vi.fn()}
        onStart={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("table", { name: "Lista personal" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Editar lista" }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("opens the custom editor and wires spreadsheet-like cell editing", () => {
    const onCustomRowChange = vi.fn();
    const onCustomRowDelete = vi.fn();
    const onCustomRowAdd = vi.fn();

    render(
      <HomeScreen
        activeVocabularySet="custom"
        allCards={cards}
        totalCards={12}
        mistakeCards={0}
        customDeckErrors={[]}
        customRows={[
          { hanzi: "飞机", pinyin: "fei1ji1", spanish: "avión" },
          { hanzi: "火车", pinyin: "huo3che1", spanish: "tren" },
        ]}
        progress={{}}
        progressByMode={defaultProgressByMode()}
        settings={settings}
        onVocabularySetChange={vi.fn()}
        onCustomRowChange={onCustomRowChange}
        onCustomRowDelete={onCustomRowDelete}
        onCustomRowAdd={onCustomRowAdd}
        onRoundSizeChange={vi.fn()}
        onToggleSetting={vi.fn()}
        onStart={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Editar lista" }));

    expect(screen.getByRole("table", { name: "Lista personal" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cerrar editor" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    const hanziCell = screen.getByText("飞机");
    hanziCell.textContent = "火车";
    fireEvent.blur(hanziCell);

    fireEvent.click(screen.getByRole("button", { name: "Agregar fila" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Borrar" })[0]);

    expect(onCustomRowChange).toHaveBeenCalledWith(0, "hanzi", "火车");
    expect(onCustomRowAdd).toHaveBeenCalled();
    expect(onCustomRowDelete).toHaveBeenCalledWith(0);
  });

  it("opens advanced stats and lets the user sort by pinyin", () => {
    const progressByMode = defaultProgressByMode();
    progressByMode.typing.plane = {
      attempts: 3,
      correct: 2,
      incorrect: 1,
      streak: 1,
      lastSeenAt: 100,
      lastResult: "incorrect",
      recentResults: ["incorrect", "correct", "correct"],
      introducedAt: 80,
      lastIncorrectAt: 100,
    };

    render(
      <HomeScreen
        activeVocabularySet="custom"
        allCards={cards}
        totalCards={1}
        mistakeCards={1}
        customDeckErrors={[]}
        customRows={[{ hanzi: "飞机", pinyin: "fei1ji1", spanish: "avión" }]}
        progress={{
          plane: progressByMode.typing.plane,
        }}
        progressByMode={progressByMode}
        settings={settings}
        onVocabularySetChange={vi.fn()}
        onCustomRowChange={vi.fn()}
        onCustomRowDelete={vi.fn()}
        onCustomRowAdd={vi.fn()}
        onRoundSizeChange={vi.fn()}
        onToggleSetting={vi.fn()}
        onStart={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Ver estadísticas" }));
    fireEvent.change(screen.getByLabelText("Ordenar por"), {
      target: { value: "pinyin-asc" },
    });

    expect(
      screen.getByRole("table", { name: "Estadísticas por tarjeta" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Error inmediato")).toBeInTheDocument();
    expect(screen.getByText("fēi1 jī1")).toBeInTheDocument();
  });
});
