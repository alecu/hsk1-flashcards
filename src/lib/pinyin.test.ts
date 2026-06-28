import { describe, expect, it } from "vitest";

import {
  buildToneOptionPinyin,
  formatPinyinWithToneMark,
  getPinyinSyllables,
  getToneFromPinyin,
  numericPinyinFromDisplaySyllable,
  segmentDisplayPinyin,
  splitNumericPinyinSyllables,
} from "./pinyin";

describe("pinyin helpers", () => {
  it("extracts syllables from chinese words without injecting phantom prefixes", () => {
    expect(getPinyinSyllables("猫")).toEqual(["mao1"]);
    expect(getPinyinSyllables("你好")).toEqual(["ni3", "hao3"]);
    expect(getPinyinSyllables("谁")).toEqual(["shei2"]);
  });

  it("extracts tone numbers", () => {
    expect(getToneFromPinyin("ma1")).toBe(1);
    expect(getToneFromPinyin("ma2")).toBe(2);
    expect(getToneFromPinyin("ma3")).toBe(3);
    expect(getToneFromPinyin("ma4")).toBe(4);
    expect(getToneFromPinyin("ma0")).toBe(0);
  });

  it("formats pinyin with accent marks while keeping the tone number", () => {
    expect(formatPinyinWithToneMark("ma4")).toBe("mà4");
    expect(formatPinyinWithToneMark("mao1")).toBe("māo1");
    expect(formatPinyinWithToneMark("xie4")).toBe("xiè4");
    expect(formatPinyinWithToneMark("shui3")).toBe("shuǐ3");
    expect(formatPinyinWithToneMark("shei2")).toBe("shéi2");
  });

  it("segments source pinyin from the downloaded HSK 3.0 list", () => {
    expect(segmentDisplayPinyin("nǚ'ér", "女儿")).toEqual(["nǚ", "ér"]);
    expect(segmentDisplayPinyin("shéi", "谁")).toEqual(["shéi"]);
    expect(segmentDisplayPinyin("yìdiǎnr", "一点儿")).toEqual(["yì", "diǎnr"]);
  });

  it("converts accented syllables back to numeric pinyin", () => {
    expect(numericPinyinFromDisplaySyllable("shéi")).toBe("shei2");
    expect(numericPinyinFromDisplaySyllable("nǚ")).toBe("nü3");
    expect(numericPinyinFromDisplaySyllable("ba")).toBe("ba0");
  });

  it("builds tone option labels from a numeric syllable", () => {
    expect(buildToneOptionPinyin("xue2", 1)).toBe("xuē1");
    expect(buildToneOptionPinyin("xue2", 2)).toBe("xué2");
    expect(buildToneOptionPinyin("xue2", 3)).toBe("xuě3");
    expect(buildToneOptionPinyin("xue2", 4)).toBe("xuè4");
    expect(buildToneOptionPinyin("xue2", 0)).toBe("xue0");
  });

  it("segments numeric pinyin strings for custom lists", () => {
    expect(splitNumericPinyinSyllables("fei1ji1")).toEqual(["fei1", "ji1"]);
    expect(splitNumericPinyinSyllables("zhen1 de0")).toEqual(["zhen1", "de0"]);
    expect(splitNumericPinyinSyllables("tai4gui4le0")).toEqual([
      "tai4",
      "gui4",
      "le0",
    ]);
  });
});
