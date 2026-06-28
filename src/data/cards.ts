import hsk20WordsLevel1 from "@leonsilicon/hsk2.0/HSK2.0_words_level1.json";

import { hsk1Glossary } from "./hsk1Glossary";
import {
  formatPinyinWithToneMark,
  getPinyinSyllables,
  getToneFromPinyin,
} from "../lib/pinyin";
import { normalizeWord } from "../lib/text";
import type { Card } from "../types/cards";

const normalizedWords = hsk20WordsLevel1.map(normalizeWord);

export const hsk1Cards: Card[] = normalizedWords.map((word) => {
  const glossaryEntry = hsk1Glossary[word];

  if (!glossaryEntry) {
    throw new Error(`Falta traduccion para la palabra HSK1: ${word}`);
  }

  const characters = Array.from(word);
  const pinyinSyllables = getPinyinSyllables(word);

  if (characters.length !== pinyinSyllables.length) {
    throw new Error(
      `La segmentacion de pinyin no coincide para ${word}: ${characters.length} caracteres, ${pinyinSyllables.length} silabas.`,
    );
  }

  return {
    id: `hsk1-${word}`,
    hanzi: word,
    spanish: glossaryEntry.spanish,
    answers: [glossaryEntry.spanish, ...(glossaryEntry.aliases ?? [])],
    syllables: characters.map((hanzi, index) => {
      const pinyin = pinyinSyllables[index];

      return {
        hanzi,
        pinyinNumber: pinyin,
        pinyinDisplay: formatPinyinWithToneMark(pinyin),
        tone: getToneFromPinyin(pinyin),
      };
    }),
    hskLevel: 1,
  };
});
