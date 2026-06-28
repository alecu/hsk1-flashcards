import { pinyin } from "pinyin-pro";

import type { Tone } from "../types/cards";

const manualPinyin: Record<string, string[]> = {
  "一点儿": ["yi4", "dian3", "er5"],
  "了": ["le0"],
  "哪儿": ["na3", "er5"],
  "谁": ["shei2"],
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

const accentedBaseMap: Record<string, { base: string; tone: Tone }> = {
  ā: { base: "a", tone: 1 },
  á: { base: "a", tone: 2 },
  ǎ: { base: "a", tone: 3 },
  à: { base: "a", tone: 4 },
  ē: { base: "e", tone: 1 },
  é: { base: "e", tone: 2 },
  ě: { base: "e", tone: 3 },
  è: { base: "e", tone: 4 },
  ī: { base: "i", tone: 1 },
  í: { base: "i", tone: 2 },
  ǐ: { base: "i", tone: 3 },
  ì: { base: "i", tone: 4 },
  ō: { base: "o", tone: 1 },
  ó: { base: "o", tone: 2 },
  ǒ: { base: "o", tone: 3 },
  ò: { base: "o", tone: 4 },
  ū: { base: "u", tone: 1 },
  ú: { base: "u", tone: 2 },
  ǔ: { base: "u", tone: 3 },
  ù: { base: "u", tone: 4 },
  ǖ: { base: "ü", tone: 1 },
  ǘ: { base: "ü", tone: 2 },
  ǚ: { base: "ü", tone: 3 },
  ǜ: { base: "ü", tone: 4 },
};

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

const validPinyinSyllables = new Set(
  "a ai an ang ao e ei en eng er o ou ba bai ban bang bao bei ben beng bi bian biao bie bin bing bo bu pa pai pan pang pao pei pen peng pi pian piao pie pin ping po pou pu ma mai man mang mao me mei men meng mi mian miao mie min ming miu mo mou mu fa fan fang fei fen feng fo fou fu da dai dan dang dao de deng di dia dian diao die ding diu dong dou du duan dui dun duo ta tai tan tang tao te teng ti tian tiao tie ting tong tou tu tuan tui tun tuo na nai nan nang nao ne nei nen neng ni nian niang niao nie nin ning niu nong nou nu nuan nue nuo nv la lai lan lang lao le lei leng li lia lian liang liao lie lin ling liu long lou lu luan lun luo lv lve ga gai gan gang gao ge gei gen geng gong gou gu gua guai guan guang gui gun guo ka kai kan kang kao ke ken keng kong kou ku kua kuai kuan kuang kui kun kuo ha hai han hang hao he hei hen heng hong hou hu hua huai huan huang hui hun huo ji jia jian jiang jiao jie jin jing jiong jiu ju juan jue jun qi qia qian qiang qiao qie qin qing qiong qiu qu quan que qun xi xia xian xiang xiao xie xin xing xiong xiu xu xuan xue xun zha zhai zhan zhang zhao zhe zhei zhen zheng zhi zhong zhou zhu zhua zhuai zhuan zhuang zhui zhun zhuo cha chai chan chang chao che chen cheng chi chong chou chu chua chuai chuan chuang chui chun chuo sha shai shan shang shao she shei shen sheng shi shou shu shua shuai shuan shuang shui shun shuo ran rang rao re ren reng ri rong rou ru rua ruan rui run ruo za zai zan zang zao ze zei zen zeng zi zong zou zu zuan zui zun zuo ca cai can cang cao ce cen ceng ci cong cou cu cuan cui cun cuo sa sai san sang sao se sen seng si song sou su suan sui sun suo ya yan yang yao ye yi yin ying yo yong you yu yue yuan yun wa wai wan wang wei wen weng wo wu".split(
    /\s+/,
  ),
);

function normalizePinyinForMatching(value: string) {
  let result = "";

  for (const character of value.toLowerCase()) {
    const accented = accentedBaseMap[character];

    if (accented) {
      result += accented.base === "ü" ? "v" : accented.base;
      continue;
    }

    if (character === "ü") {
      result += "v";
      continue;
    }

    result += character;
  }

  return result;
}

function isValidPinyinSyllable(rawSyllable: string) {
  const plain = normalizePinyinForMatching(rawSyllable);

  if (validPinyinSyllables.has(plain)) {
    return true;
  }

  return (
    plain.length > 1 &&
    plain.endsWith("r") &&
    plain !== "er" &&
    validPinyinSyllables.has(plain.slice(0, -1))
  );
}

export function countHanziUnits(hanzi: string) {
  const characters = hanzi.match(/[\u3400-\u9fff]/g) ?? [];

  if (characters.length === 0) {
    return 1;
  }

  if (characters.length > 1 && characters[characters.length - 1] === "儿") {
    return characters.length - 1;
  }

  return characters.length;
}

export function segmentHanziBySyllables(hanzi: string, syllableCount: number) {
  const characters = Array.from(hanzi);

  if (characters.length === syllableCount) {
    return characters;
  }

  if (
    characters.length === syllableCount + 1 &&
    characters[characters.length - 1] === "儿"
  ) {
    return [...characters.slice(0, -2), characters.slice(-2).join("")];
  }

  return characters;
}

export function segmentDisplayPinyin(rawPinyin: string, hanzi: string) {
  const cleaned = rawPinyin.replace(/[’']/g, "").trim();

  if (!cleaned) {
    return [];
  }

  const target = countHanziUnits(hanzi);
  const targetOptions = [target, ...(target > 1 ? [target - 1] : [])];

  for (const remainingTarget of targetOptions) {
    const memo = new Map<string, string[] | null>();

    const dfs = (position: number, remaining: number): string[] | null => {
      const memoKey = `${position}|${remaining}`;

      if (memo.has(memoKey)) {
        return memo.get(memoKey) ?? null;
      }

      if (position === cleaned.length) {
        return remaining === 0 ? [] : null;
      }

      if (remaining === 0) {
        return null;
      }

      for (let end = cleaned.length; end > position; end -= 1) {
        const chunk = cleaned.slice(position, end);

        if (!isValidPinyinSyllable(chunk)) {
          continue;
        }

        const rest = dfs(end, remaining - 1);

        if (rest) {
          const result = [chunk, ...rest];
          memo.set(memoKey, result);
          return result;
        }
      }

      memo.set(memoKey, null);
      return null;
    };

    const segmented = dfs(0, remainingTarget);

    if (segmented) {
      return segmented;
    }
  }

  const greedyMemo = new Map<number, string[]>();

  const greedy = (position: number): string[] => {
    if (position === cleaned.length) {
      return [];
    }

    if (greedyMemo.has(position)) {
      return greedyMemo.get(position) ?? [];
    }

    for (let end = cleaned.length; end > position; end -= 1) {
      const chunk = cleaned.slice(position, end);

      if (!isValidPinyinSyllable(chunk)) {
        continue;
      }

      const result = [chunk, ...greedy(end)];
      greedyMemo.set(position, result);
      return result;
    }

    const fallback = [cleaned.slice(position)];
    greedyMemo.set(position, fallback);
    return fallback;
  };

  return greedy(0);
}

export function numericPinyinFromDisplaySyllable(displaySyllable: string) {
  let tone: Tone = 0;
  let base = "";

  for (const character of displaySyllable) {
    const accented = accentedBaseMap[character.toLowerCase()];

    if (accented) {
      tone = accented.tone;
      base += accented.base;
      continue;
    }

    base += character.toLowerCase();
  }

  return `${base}${tone}`;
}

export function plainPinyinFromNumericSyllable(numericSyllable: string) {
  return numericSyllable.replace(/[0-5]$/, "");
}

export function buildToneOptionPinyin(
  numericSyllable: string,
  tone: Tone,
) {
  return formatPinyinWithToneMark(
    `${plainPinyinFromNumericSyllable(numericSyllable)}${tone}`,
  );
}
