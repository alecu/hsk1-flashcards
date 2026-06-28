import hsk20WordsLevel1 from "@leonsilicon/hsk2.0/HSK2.0_words_level1.json";

import hsk30Source from "./hsk30Source.json";
import { hsk1Glossary, type GlossaryEntry } from "./hsk1Glossary";
import { hsk30Glossary } from "./hsk30Glossary";
import {
  formatPinyinWithToneMark,
  getPinyinSyllables,
  getToneFromPinyin,
  numericPinyinFromDisplaySyllable,
  segmentHanziBySyllables,
  segmentDisplayPinyin,
} from "../lib/pinyin";
import { normalizeWord } from "../lib/text";
import type { Card, VocabularySet } from "../types/cards";

type Hsk30SourceEntry = {
  hanzi: string;
  pinyin: string;
  english: string;
  partOfSpeech: string;
};

const normalizedLegacyWords = hsk20WordsLevel1.map(normalizeWord);
const mergedHsk30Glossary: Record<string, GlossaryEntry> = {
  ...hsk1Glossary,
  ...hsk30Glossary,
};

function buildGeneratedCard(
  word: string,
  glossaryEntry: GlossaryEntry,
  vocabularySet: VocabularySet,
) {
  const characters = Array.from(word);
  const pinyinSyllables = getPinyinSyllables(word);

  if (characters.length !== pinyinSyllables.length) {
    throw new Error(
      `La segmentacion de pinyin no coincide para ${word}: ${characters.length} caracteres, ${pinyinSyllables.length} silabas.`,
    );
  }

  return {
    id: `${vocabularySet}-${word}`,
    hanzi: word,
    spanish: glossaryEntry.spanish,
    answers: [glossaryEntry.spanish, ...(glossaryEntry.aliases ?? [])],
    syllables: characters.map((hanzi, index) => {
      const pinyinNumber = pinyinSyllables[index];

      return {
        hanzi,
        pinyinNumber,
        pinyinDisplay: formatPinyinWithToneMark(pinyinNumber),
        tone: getToneFromPinyin(pinyinNumber),
      };
    }),
    vocabularySet,
    hskLevel: 1,
  } satisfies Card;
}

function buildSourcedCard(
  entry: Hsk30SourceEntry,
  glossaryEntry: GlossaryEntry,
  vocabularySet: VocabularySet,
) {
  const displaySyllables = segmentDisplayPinyin(entry.pinyin, entry.hanzi);
  const hanziUnits = segmentHanziBySyllables(entry.hanzi, displaySyllables.length);

  if (hanziUnits.length !== displaySyllables.length) {
    throw new Error(
      `La segmentacion del pinyin fuente no coincide para ${entry.hanzi}: ${hanziUnits.length} unidades, ${displaySyllables.length} silabas.`,
    );
  }

  return {
    id: `${vocabularySet}-${entry.hanzi}`,
    hanzi: entry.hanzi,
    spanish: glossaryEntry.spanish,
    answers: [glossaryEntry.spanish, ...(glossaryEntry.aliases ?? [])],
    syllables: hanziUnits.map((hanzi, index) => {
      const pinyinDisplay = displaySyllables[index].toLowerCase();
      const pinyinNumber = numericPinyinFromDisplaySyllable(pinyinDisplay);

      return {
        hanzi,
        pinyinNumber,
        pinyinDisplay: `${pinyinDisplay}${getToneFromPinyin(pinyinNumber)}`,
        tone: getToneFromPinyin(pinyinNumber),
      };
    }),
    vocabularySet,
    hskLevel: 1,
  } satisfies Card;
}

export const hsk20Cards: Card[] = normalizedLegacyWords.map((word) => {
  const glossaryEntry = hsk1Glossary[word];

  if (!glossaryEntry) {
    throw new Error(`Falta traduccion para la palabra HSK 2.0: ${word}`);
  }

  return buildGeneratedCard(word, glossaryEntry, "hsk20");
});

export const hsk30Cards: Card[] = (hsk30Source as Hsk30SourceEntry[]).map((entry) => {
  const glossaryEntry = mergedHsk30Glossary[entry.hanzi];

  if (!glossaryEntry) {
    throw new Error(`Falta traduccion para la palabra HSK 3.0: ${entry.hanzi}`);
  }

  return buildSourcedCard(entry, glossaryEntry, "hsk30");
});

export const vocabularyDecks = {
  hsk20: {
    id: "hsk20",
    label: "HSK 2.0",
    subtitle: "150 palabras",
    cards: hsk20Cards,
  },
  hsk30: {
    id: "hsk30",
    label: "HSK 3.0",
    subtitle: "300 palabras",
    cards: hsk30Cards,
  },
} as const;
