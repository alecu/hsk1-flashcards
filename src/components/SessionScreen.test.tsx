import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SessionScreen } from "./SessionScreen";
import { defaultCustomWordList } from "../data/customList";
import * as speech from "../lib/speech";
import type { Session } from "../lib/session";
import type { Card, UserSettings } from "../types/cards";

const catCard: Card = {
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

const settings: UserSettings = {
  roundSize: 20,
  showPinyin: true,
  colorTones: true,
  vocabularySet: "hsk20",
  customWordList: defaultCustomWordList,
};

const session: Session = {
  id: "session-1",
  mode: "tones",
  startedAt: Date.now(),
  queue: [],
  learnedIds: [],
  incorrectIds: [],
  currentCard: catCard,
  roundSize: 1,
};

const dogCard: Card = {
  id: "dog",
  hanzi: "狗",
  spanish: "perro",
  answers: ["perro"],
  syllables: [
    {
      hanzi: "狗",
      pinyinNumber: "gou3",
      pinyinDisplay: "gǒu3",
      tone: 3,
    },
  ],
  vocabularySet: "hsk20",
  hskLevel: 1,
};

describe("SessionScreen", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
    vi.spyOn(speech, "speakChineseText").mockReturnValue(true);
    vi.spyOn(speech, "stopChineseSpeech").mockImplementation(() => undefined);
  });

  it("shows plain pinyin before validating in tone mode", () => {
    const { container } = render(
      <SessionScreen
        allCards={[catCard]}
        draft=""
        feedback={null}
        mode="tones"
        onCancel={vi.fn()}
        onChoice={vi.fn()}
        onDraftChange={vi.fn()}
        onNext={vi.fn()}
        onSubmit={vi.fn()}
        onToneSelectionChange={vi.fn()}
        session={session}
        settings={settings}
        toneSelections={[-1]}
      />,
    );

    const topCardPinyin = container.querySelector(".study-card .pinyin");
    const tonePrompt = container.querySelector(".tone-prompt");
    const tonePromptPlainPinyin = container.querySelector(".tone-prompt > span");
    const toneButtons = container.querySelectorAll(".tone-button");

    expect(topCardPinyin).not.toBeNull();
    expect(topCardPinyin).toHaveTextContent("mao");
    expect(topCardPinyin).not.toHaveTextContent("māo1");
    expect(topCardPinyin).toHaveClass("pinyin-plain");
    expect(tonePrompt).toHaveTextContent("猫");
    expect(tonePromptPlainPinyin).toBeNull();
    expect(toneButtons[0]).toHaveTextContent("māo1");
    expect(toneButtons[0]).not.toHaveTextContent("1māo1");
    expect(
      screen.queryByRole("button", { name: "Reproducir palabra" }),
    ).not.toBeInTheDocument();
  });

  it("reveals colored pinyin with tone after validating in tone mode", () => {
    const { container } = render(
      <SessionScreen
        allCards={[catCard]}
        draft=""
        feedback={{ status: "incorrect", submittedAnswer: "4" }}
        mode="tones"
        onCancel={vi.fn()}
        onChoice={vi.fn()}
        onDraftChange={vi.fn()}
        onNext={vi.fn()}
        onSubmit={vi.fn()}
        onToneSelectionChange={vi.fn()}
        session={session}
        settings={settings}
        toneSelections={[4]}
      />,
    );

    const topCardPinyin = container.querySelector(".study-card .pinyin");

    expect(topCardPinyin).not.toBeNull();
    expect(topCardPinyin).toHaveTextContent("māo1");
    expect(topCardPinyin).not.toHaveClass("pinyin-plain");
  });

  it("collapses tone controls after validating and keeps next card visible", () => {
    render(
      <SessionScreen
        allCards={[catCard]}
        draft=""
        feedback={{ status: "incorrect", submittedAnswer: "mào4" }}
        mode="tones"
        onCancel={vi.fn()}
        onChoice={vi.fn()}
        onDraftChange={vi.fn()}
        onNext={vi.fn()}
        onSubmit={vi.fn()}
        onToneSelectionChange={vi.fn()}
        session={session}
        settings={settings}
        toneSelections={[4]}
      />,
    );

    expect(
      screen.queryByText("Elegi el tono correcto para cada silaba"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Validar tonos" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Castellano")).not.toBeInTheDocument();
    expect(screen.queryByText("Correcto.")).not.toBeInTheDocument();
    expect(screen.getByText("❌")).toBeInTheDocument();
    expect(screen.getByText("✓")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Siguiente tarjeta" })).toBeVisible();
  });

  it("scrolls the study stage into view when a new card is shown", () => {
    const { rerender } = render(
      <SessionScreen
        allCards={[catCard, dogCard]}
        draft=""
        feedback={null}
        mode="tones"
        onCancel={vi.fn()}
        onChoice={vi.fn()}
        onDraftChange={vi.fn()}
        onNext={vi.fn()}
        onSubmit={vi.fn()}
        onToneSelectionChange={vi.fn()}
        session={session}
        settings={settings}
        toneSelections={[-1]}
      />,
    );

    const scrollIntoViewMock = vi.mocked(Element.prototype.scrollIntoView);

    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });

    scrollIntoViewMock.mockClear();

    rerender(
      <SessionScreen
        allCards={[catCard, dogCard]}
        draft=""
        feedback={null}
        mode="tones"
        onCancel={vi.fn()}
        onChoice={vi.fn()}
        onDraftChange={vi.fn()}
        onNext={vi.fn()}
        onSubmit={vi.fn()}
        onToneSelectionChange={vi.fn()}
        session={{
          ...session,
          currentCard: dogCard,
        }}
        settings={settings}
        toneSelections={[-1]}
      />,
    );

    expect(scrollIntoViewMock).toHaveBeenCalledTimes(1);
    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });
  });

  it("autoplays the full Chinese word and allows replay from hanzi or pinyin", () => {
    render(
      <SessionScreen
        allCards={[catCard]}
        draft=""
        feedback={null}
        mode="tones"
        onCancel={vi.fn()}
        onChoice={vi.fn()}
        onDraftChange={vi.fn()}
        onNext={vi.fn()}
        onSubmit={vi.fn()}
        onToneSelectionChange={vi.fn()}
        session={session}
        settings={settings}
        toneSelections={[-1]}
      />,
    );

    expect(speech.speakChineseText).toHaveBeenCalledWith("猫");

    fireEvent.click(screen.getByRole("button", { name: "猫" }));
    fireEvent.click(screen.getByRole("button", { name: "mao" }));

    expect(speech.speakChineseText).toHaveBeenCalledWith("猫");
    expect(speech.speakChineseText).toHaveBeenCalledTimes(3);
  });
});
