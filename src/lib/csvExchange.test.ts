import { describe, expect, it } from "vitest";

import { exportVocabularyCsv, importVocabularyCsv, mergeImportedProgress } from "./csvExchange";
import { defaultProgressByMode } from "./progress";
import type { Card, ProgressByMode } from "../types/cards";

const customCard: Card = {
  id: "custom-1-0-飞机-fei1-ji1",
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
};

const hskCard: Card = {
  id: "hsk20-猫",
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

describe("csv exchange", () => {
  it("exports semicolon csv with words and per-mode progress", () => {
    const progress = defaultProgressByMode();
    progress.tones[customCard.id] = {
      attempts: 2,
      correct: 1,
      incorrect: 1,
      streak: 0,
      lastSeenAt: 10,
      lastResult: "incorrect",
      recentResults: ["incorrect", "correct"],
      introducedAt: 1,
      lastIncorrectAt: 10,
    };

    const csv = exportVocabularyCsv({
      cardsBySet: {
        custom: [customCard],
        hsk20: [hskCard],
        hsk30: [],
        radicales: [],
        isleNivel2: [],
      },
      customRows: [{ hanzi: "飞机", pinyin: "fei1ji1", spanish: "avión" }],
      progressByMode: progress,
      scope: "custom",
    });

    expect(csv).toContain("record_type;vocabulary_set;mode;card_id");
    expect(csv).toContain("word;custom;;;");
    expect(csv).toContain("progress;custom;tones;custom-1-0-飞机-fei1-ji1");
  });

  it("imports custom words and progress and merges them cleanly", () => {
    const csv = [
      "record_type;vocabulary_set;mode;card_id;hanzi;pinyin;spanish;answers;attempts;correct;incorrect;streak;last_result;recent_results;introduced_at;last_seen_at;last_incorrect_at",
      'word;custom;;;飞机;fei1ji1;avión;;;;;;;;;;',
      'progress;custom;tones;custom-1-0-飞机-fei1-ji1;飞机;"fei1 ji1";avión;avión;2;1;1;0;incorrect;incorrect,correct;1;10;10',
      'progress;hsk20;typing;hsk20-猫;猫;mao1;gato;gato;3;2;1;1;correct;correct,incorrect;2;11;5',
    ].join("\n");

    const imported = importVocabularyCsv(csv);
    const merged = mergeImportedProgress({
      current: defaultProgressByMode(),
      imported: imported.progressByMode,
      replaceCustomProgress: true,
    });

    expect(imported.customRows).toEqual([
      { hanzi: "飞机", pinyin: "fei1ji1", spanish: "avión" },
    ]);
    expect(merged.tones["custom-1-0-飞机-fei1-ji1"]).toMatchObject({
      attempts: 2,
      incorrect: 1,
      lastResult: "incorrect",
    });
    expect(merged.typing["hsk20-猫"]).toMatchObject({
      attempts: 3,
      correct: 2,
    });
  });
});
