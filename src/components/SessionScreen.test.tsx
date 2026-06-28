import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SessionScreen } from "./SessionScreen";
import { defaultCustomWordList } from "../data/customList";
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

describe("SessionScreen", () => {
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

    expect(topCardPinyin).not.toBeNull();
    expect(topCardPinyin).toHaveTextContent("mao");
    expect(topCardPinyin).not.toHaveTextContent("māo1");
    expect(topCardPinyin).toHaveClass("pinyin-plain");
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
});
