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
