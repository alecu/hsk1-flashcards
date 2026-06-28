import { pinyin } from "pinyin-pro";

import type { Tone } from "../types/cards";

const manualPinyin: Record<string, string[]> = {
  "一点儿": ["yi4", "dian3", "er5"],
  "哪儿": ["na3", "er5"],
};

export function getPinyinSyllables(hanzi: string) {
  const manual = manualPinyin[hanzi];

  if (manual) {
    return manual;
  }

  return pinyin(hanzi, {
    type: "array",
    toneType: "num",
    v: false,
    nonZh: "consecutive",
  }) as string[];
}

export function getToneFromPinyin(syllable: string): Tone {
  const toneMatch = syllable.match(/([0-5])$/);

  if (!toneMatch) {
    return 0;
  }

  const toneValue = Number(toneMatch[1]);
  return toneValue === 5 ? 0 : (toneValue as Tone);
}

const toneReplacementMap: Record<string, [string, string, string, string]> = {
  a: ["ā", "á", "ǎ", "à"],
  e: ["ē", "é", "ě", "è"],
  i: ["ī", "í", "ǐ", "ì"],
  o: ["ō", "ó", "ǒ", "ò"],
  u: ["ū", "ú", "ǔ", "ù"],
  v: ["ǖ", "ǘ", "ǚ", "ǜ"],
  ü: ["ǖ", "ǘ", "ǚ", "ǜ"],
};

function getToneVowelIndex(baseSyllable: string) {
  if (baseSyllable.includes("a")) {
    return baseSyllable.indexOf("a");
  }

  if (baseSyllable.includes("e")) {
    return baseSyllable.indexOf("e");
  }

  if (baseSyllable.includes("ou")) {
    return baseSyllable.indexOf("o");
  }

  for (let index = baseSyllable.length - 1; index >= 0; index -= 1) {
    if ("aeiouvü".includes(baseSyllable[index])) {
      return index;
    }
  }

  return -1;
}

export function formatPinyinWithToneMark(syllable: string) {
  const tone = getToneFromPinyin(syllable);

  if (tone === 0) {
    return syllable;
  }

  const toneDigit = String(tone);
  const baseSyllable = syllable.slice(0, -1).replace(/u:/g, "ü").replace(/v/g, "ü");
  const vowelIndex = getToneVowelIndex(baseSyllable);

  if (vowelIndex === -1) {
    return syllable;
  }

  const vowel = baseSyllable[vowelIndex];
  const replacements = toneReplacementMap[vowel];

  if (!replacements) {
    return syllable;
  }

  const marked =
    baseSyllable.slice(0, vowelIndex) +
    replacements[tone - 1] +
    baseSyllable.slice(vowelIndex + 1);

  return `${marked}${toneDigit}`;
}
