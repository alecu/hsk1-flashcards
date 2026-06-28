import { describe, expect, it } from "vitest";

import {
  formatPinyinWithToneMark,
  getPinyinSyllables,
  getToneFromPinyin,
} from "./pinyin";

describe("pinyin helpers", () => {
  it("extracts syllables from chinese words without injecting phantom prefixes", () => {
    expect(getPinyinSyllables("猫")).toEqual(["mao1"]);
    expect(getPinyinSyllables("你好")).toEqual(["ni3", "hao3"]);
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
  });
});
