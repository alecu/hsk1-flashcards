import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HomeScreen } from "./HomeScreen";
import { defaultCustomWordList } from "../data/customList";
import type { UserSettings } from "../types/cards";

const settings: UserSettings = {
  roundSize: 20,
  showPinyin: true,
  colorTones: true,
  vocabularySet: "custom",
  customWordList: defaultCustomWordList,
};

describe("HomeScreen", () => {
  it("renders the custom vocabulary table", () => {
    render(
      <HomeScreen
        activeVocabularySet="custom"
        totalCards={12}
        mistakeCards={0}
        customDeckErrors={[]}
        customRows={[
          { hanzi: "飞机", pinyin: "fei1ji1", spanish: "avión" },
          { hanzi: "出租车", pinyin: "chu1zu1che1", spanish: "taxi" },
        ]}
        progress={{}}
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

    expect(screen.getByRole("table", { name: "Lista personal" })).toBeInTheDocument();
    expect(screen.getAllByDisplayValue("飞机")).toHaveLength(1);
    expect(screen.getAllByDisplayValue("fei1ji1")).toHaveLength(1);
    expect(screen.getAllByDisplayValue("avión")).toHaveLength(1);
  });

  it("wires row editing and actions", () => {
    const onCustomRowChange = vi.fn();
    const onCustomRowDelete = vi.fn();
    const onCustomRowAdd = vi.fn();

    render(
      <HomeScreen
        activeVocabularySet="custom"
        totalCards={12}
        mistakeCards={0}
        customDeckErrors={[]}
        customRows={[
          { hanzi: "飞机", pinyin: "fei1ji1", spanish: "avión" },
          { hanzi: "火车", pinyin: "huo3che1", spanish: "tren" },
        ]}
        progress={{}}
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

    fireEvent.change(screen.getByDisplayValue("飞机"), {
      target: { value: "火车" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Agregar fila" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Borrar" })[0]);

    expect(onCustomRowChange).toHaveBeenCalledWith(0, "hanzi", "火车");
    expect(onCustomRowAdd).toHaveBeenCalled();
    expect(onCustomRowDelete).toHaveBeenCalledWith(0);
  });
});
