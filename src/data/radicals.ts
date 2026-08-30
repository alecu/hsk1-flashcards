import { formatPinyinWithToneMark, getToneFromPinyin } from "../lib/pinyin";
import type { Card } from "../types/cards";

type RadicalEntry = {
  hanzi: string;
  pinyinNumber: string;
  spanish: string;
};

const radicalEntries: RadicalEntry[] = [
  { hanzi: "口", pinyinNumber: "kou3", spanish: "boca" },
  { hanzi: "囗", pinyinNumber: "wei2", spanish: "rodeado" },
  { hanzi: "亻", pinyinNumber: "ren2", spanish: "persona" },
  { hanzi: "饣", pinyinNumber: "shi2", spanish: "comida" },
  { hanzi: "氵", pinyinNumber: "shui3", spanish: "agua" },
  { hanzi: "女", pinyinNumber: "nv3", spanish: "mujer" },
  { hanzi: "辶", pinyinNumber: "chuo4", spanish: "caminar" },
  { hanzi: "礻", pinyinNumber: "shi4", spanish: "rituales" },
  { hanzi: "门", pinyinNumber: "men2", spanish: "puerta" },
  { hanzi: "阝", pinyinNumber: "fu4", spanish: "ciudades" },
  { hanzi: "讠", pinyinNumber: "yan2", spanish: "palabra" },
  { hanzi: "钅", pinyinNumber: "jin1", spanish: "metal" },
  { hanzi: "心", pinyinNumber: "xin1", spanish: "corazón" },
  { hanzi: "戈", pinyinNumber: "ge1", spanish: "lanza" },
  { hanzi: "月", pinyinNumber: "yue4", spanish: "luna" },
  { hanzi: "灬", pinyinNumber: "huo3", spanish: "fuego" },
  { hanzi: "扌", pinyinNumber: "shou3", spanish: "mano" },
  { hanzi: "山", pinyinNumber: "shan1", spanish: "montaña" },
];

export const radicalesCards: Card[] = radicalEntries.map((entry) => ({
  id: `radicales-${entry.hanzi}`,
  hanzi: entry.hanzi,
  spanish: entry.spanish,
  answers: [entry.spanish],
  syllables: [
    {
      hanzi: entry.hanzi,
      pinyinNumber: entry.pinyinNumber,
      pinyinDisplay: formatPinyinWithToneMark(entry.pinyinNumber),
      tone: getToneFromPinyin(entry.pinyinNumber),
    },
  ],
  vocabularySet: "radicales",
  hskLevel: 1,
}));
