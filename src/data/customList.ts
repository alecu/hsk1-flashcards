import {
  formatPinyinWithToneMark,
  getToneFromPinyin,
  segmentHanziBySyllables,
  splitNumericPinyinSyllables,
} from "../lib/pinyin";
import { normalizeAnswer } from "../lib/text";
import type { Card } from "../types/cards";

export type CustomWordRow = {
  hanzi: string;
  pinyin: string;
  spanish: string;
};

const defaultCustomWordRows: CustomWordRow[] = [
  { hanzi: "飞机", pinyin: "fei1ji1", spanish: "avión" },
  { hanzi: "出租车", pinyin: "chu1zu1che1", spanish: "taxi" },
  { hanzi: "公交车", pinyin: "gong1jiao1che1", spanish: "colectivo" },
  { hanzi: "或", pinyin: "huo4", spanish: "o" },
  { hanzi: "车票", pinyin: "che1piao4", spanish: "boleto" },
  { hanzi: "市中心", pinyin: "shi4zhong1xin1", spanish: "centro" },
  { hanzi: "哪儿", pinyin: "na3 er0", spanish: "dónde" },
  { hanzi: "差不多", pinyin: "cha4bu4duo1", spanish: "más o menos" },
  { hanzi: "巴士", pinyin: "ba1shi4", spanish: "micro" },
  { hanzi: "火车站", pinyin: "huo3che1zhan4", spanish: "estación de tren" },
  { hanzi: "火车", pinyin: "huo3che1", spanish: "tren" },
  { hanzi: "在", pinyin: "zai4", spanish: "estar" },
  { hanzi: "去", pinyin: "qu4", spanish: "ir" },
  { hanzi: "坐", pinyin: "zuo4", spanish: "sentarse / tomar" },
  { hanzi: "要", pinyin: "yao4", spanish: "querer" },
  { hanzi: "可以", pinyin: "ke3yi3", spanish: "poder" },
  { hanzi: "百", pinyin: "bai3", spanish: "centena" },
  { hanzi: "打", pinyin: "da2", spanish: "docena" },
  { hanzi: "法文", pinyin: "fa3wen2", spanish: "idioma francés" },
  { hanzi: "葡萄牙文", pinyin: "pu2tao2ya2wen2", spanish: "idioma portugués" },
  { hanzi: "西文", pinyin: "xi1wen2", spanish: "idioma español" },
  { hanzi: "日文", pinyin: "ri4wen2", spanish: "idioma japonés" },
  { hanzi: "普通话", pinyin: "pu3tong1hua4", spanish: "lengua china" },
  { hanzi: "中文", pinyin: "zhong1wen2", spanish: "idioma chino" },
  { hanzi: "呢", pinyin: "ne0", spanish: "partícula interrogativa" },
  { hanzi: "有趣", pinyin: "you3qu4", spanish: "interesante" },
  { hanzi: "也不", pinyin: "ye3 bu4", spanish: "tampoco" },
  { hanzi: "也", pinyin: "ye3", spanish: "también" },
  { hanzi: "一点点", pinyin: "yi4 dian3dian3", spanish: "un poquito" },
  { hanzi: "探戈秀", pinyin: "tan4ge1xiu4", spanish: "show de tango" },
  { hanzi: "探戈舞", pinyin: "tan4ge1wu3", spanish: "tango / baile de tango" },
  { hanzi: "英文", pinyin: "ying1wen2", spanish: "idioma inglés" },
  { hanzi: "说", pinyin: "shuo1", spanish: "hablar / decir" },
  { hanzi: "看", pinyin: "kan4", spanish: "mirar / ver" },
  { hanzi: "跳", pinyin: "tiao4", spanish: "bailar" },
  { hanzi: "会", pinyin: "hui4", spanish: "saber una habilidad" },
  { hanzi: "法国", pinyin: "fa3guo2", spanish: "Francia" },
  { hanzi: "英国", pinyin: "ying1guo2", spanish: "Gran Bretaña" },
  { hanzi: "西班牙", pinyin: "xi1ban1ya2", spanish: "España" },
  { hanzi: "美国", pinyin: "mei3guo2", spanish: "Estados Unidos" },
  { hanzi: "巴西", pinyin: "ba1xi1", spanish: "Brasil" },
  { hanzi: "阿根廷", pinyin: "a1gen1ting2", spanish: "Argentina" },
  { hanzi: "贵", pinyin: "gui4", spanish: "caro" },
  { hanzi: "真的", pinyin: "zhen1 de0", spanish: "en serio" },
  { hanzi: "中国", pinyin: "zhong1guo2", spanish: "China" },
  { hanzi: "太贵了", pinyin: "tai4 gui4 le0", spanish: "carísimo" },
  { hanzi: "营业员", pinyin: "ying2ye4yuan2", spanish: "vendedor" },
  { hanzi: "多少", pinyin: "duo1shao3", spanish: "cuánto" },
  { hanzi: "钱", pinyin: "qian2", spanish: "dinero" },
  { hanzi: "块 / 元", pinyin: "kuai4 / yuan2", spanish: "unidad monetaria" },
  { hanzi: "最好的", pinyin: "zui4hao3de0", spanish: "el mejor / la mejor" },
  { hanzi: "白酒", pinyin: "bai2jiu3", spanish: "licor" },
  { hanzi: "啤酒", pinyin: "pi2jiu3", spanish: "cerveza" },
  { hanzi: "那", pinyin: "na4", spanish: "eso / aquello" },
  { hanzi: "这", pinyin: "zhe4", spanish: "esto" },
  { hanzi: "请问", pinyin: "qing3wen4", spanish: "una pregunta" },
  { hanzi: "早上好", pinyin: "zao3shang4hao3", spanish: "buen día" },
  { hanzi: "牛奶", pinyin: "niu2nai3", spanish: "leche" },
  { hanzi: "可乐", pinyin: "ke3le4", spanish: "bebida cola" },
  { hanzi: "水", pinyin: "shui3", spanish: "agua" },
  { hanzi: "果汁", pinyin: "guo3zhi1", spanish: "jugo" },
  { hanzi: "服务生", pinyin: "fu2wu4sheng1", spanish: "mozo / moza" },
  { hanzi: "老外", pinyin: "lao3wai4", spanish: "occidentales" },
  { hanzi: "咖啡", pinyin: "ka1fei1", spanish: "café" },
  { hanzi: "茶", pinyin: "cha2", spanish: "té" },
  { hanzi: "什么", pinyin: "shen2me0", spanish: "qué" },
  { hanzi: "不", pinyin: "bu4", spanish: "no" },
  { hanzi: "喜欢", pinyin: "xi3huan1", spanish: "gustar" },
  { hanzi: "喝", pinyin: "he1", spanish: "beber" },
  { hanzi: "和", pinyin: "he2", spanish: "y / con" },
  { hanzi: "秘书", pinyin: "mi4shu1", spanish: "secretario / secretaria" },
  { hanzi: "先生", pinyin: "xian1sheng0", spanish: "señor" },
  { hanzi: "是", pinyin: "shi4", spanish: "ser" },
  { hanzi: "太太", pinyin: "tai4tai0", spanish: "señora" },
  { hanzi: "再见", pinyin: "zai4jian4", spanish: "adiós" },
  { hanzi: "谢谢", pinyin: "xie4xie0", spanish: "gracias" },
  { hanzi: "好", pinyin: "hao3", spanish: "muy" },
  { hanzi: "很", pinyin: "hen3", spanish: "muy" },
  { hanzi: "你们", pinyin: "ni3men0", spanish: "ustedes" },
  { hanzi: "小姐 / 女士", pinyin: "xiao3jie3 / nv3shi4", spanish: "señorita" },
  { hanzi: "我", pinyin: "wo3", spanish: "yo" },
  { hanzi: "他 / 她", pinyin: "ta1", spanish: "él / ella" },
  { hanzi: "没关系", pinyin: "mei2guan1xi0", spanish: "no importa" },
  { hanzi: "对不起", pinyin: "dui4bu4qi3", spanish: "perdón" },
  { hanzi: "不客气", pinyin: "bu2ke4qi0", spanish: "no hay de qué / de nada" },
  { hanzi: "学生", pinyin: "xue2sheng1", spanish: "estudiante" },
  { hanzi: "老师", pinyin: "lao3shi1", spanish: "docente" },
];

export const defaultCustomWordList = serializeCustomWordRows(defaultCustomWordRows);

export type ParsedCustomList = {
  cards: Card[];
  errors: string[];
};

function formatPromptPinyin(numericSyllable: string) {
  return formatPinyinWithToneMark(numericSyllable).replace(/[0-5]$/, "");
}

function splitVariants(value: string) {
  return value
    .split("/")
    .map((variant) => variant.trim())
    .filter(Boolean);
}

function buildAnswers(spanishText: string) {
  const displayParts = splitVariants(spanishText);

  if (displayParts.length === 0) {
    return [];
  }

  const deduped = new Map<string, string>();

  displayParts.forEach((part) => {
    const normalized = normalizeAnswer(part);

    if (!normalized) {
      return;
    }

    if (!deduped.has(normalized)) {
      deduped.set(normalized, part);
    }
  });

  return [...deduped.values()];
}

function resolveVariantValue(
  variants: string[],
  variantIndex: number,
  kind: "hanzi" | "pinyin",
) {
  if (variants.length === 0) {
    return "";
  }

  if (variants.length === 1) {
    return variants[0];
  }

  if (variantIndex < variants.length) {
    return variants[variantIndex];
  }

  throw new Error(`cantidad de variantes de ${kind} inconsistente`);
}

function buildCardFromVariant(
  hanziVariant: string,
  pinyinVariant: string,
  spanishText: string,
  lineNumber: number,
  variantIndex: number,
) {
  const syllables = splitNumericPinyinSyllables(pinyinVariant);
  const answers = buildAnswers(spanishText);
  const promptText = syllables.map((syllable) => formatPromptPinyin(syllable)).join(" ");

  if (syllables.length === 0) {
    throw new Error("sin sílabas de pinyin válidas");
  }

  if (answers.length === 0) {
    throw new Error("sin traducción en castellano");
  }

  const hanziUnits = hanziVariant
    ? segmentHanziBySyllables(hanziVariant, syllables.length)
    : [];

  if (hanziVariant && hanziUnits.length !== syllables.length) {
    throw new Error("la cantidad de sílabas no coincide con el hanzi");
  }

  return {
    id: `custom-${lineNumber}-${variantIndex}-${hanziVariant || promptText}-${syllables.join("-")}`,
    hanzi: hanziVariant || promptText,
    spanish: answers[0],
    answers,
    syllables: syllables.map((syllable, index) => ({
      hanzi: hanziUnits[index] ?? "",
      prompt: formatPromptPinyin(syllable),
      pinyinNumber: syllable,
      pinyinDisplay: formatPinyinWithToneMark(syllable),
      tone: getToneFromPinyin(syllable),
    })),
    vocabularySet: "custom",
    hskLevel: 1,
  } satisfies Card;
}

export function parseCustomWordRows(source: string) {
  return source
    .split(/\r?\n/)
    .map((rawLine) => rawLine.replace(/\s+$/, ""))
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const columns = line.split("\t");

      if (columns.length >= 3) {
        return {
          hanzi: columns[0].trim(),
          pinyin: columns[1].trim(),
          spanish: columns.slice(2).join("\t").trim(),
        } satisfies CustomWordRow;
      }

      if (columns.length === 2) {
        return {
          hanzi: "",
          pinyin: columns[0].trim(),
          spanish: columns[1].trim(),
        } satisfies CustomWordRow;
      }

      return {
        hanzi: "",
        pinyin: "",
        spanish: line.trim(),
      } satisfies CustomWordRow;
    });
}

export function serializeCustomWordRows(rows: CustomWordRow[]) {
  return rows
    .filter((row) => row.hanzi.trim() || row.pinyin.trim() || row.spanish.trim())
    .map((row) =>
      [row.hanzi.trim(), row.pinyin.trim(), row.spanish.trim()].join("\t"),
    )
    .join("\n");
}

export function parseCustomWordList(source: string): ParsedCustomList {
  const rows = parseCustomWordRows(source);
  const cards: Card[] = [];
  const errors: string[] = [];

  rows.forEach((row, index) => {
    if (!row.pinyin || !row.spanish) {
      errors.push(`Línea ${index + 1}: formato incompleto.`);
      return;
    }

    const pinyinVariants = splitVariants(row.pinyin);
    const hanziVariants = splitVariants(row.hanzi);

    const variantCount =
      pinyinVariants.length > 1
        ? pinyinVariants.length
        : Math.max(1, hanziVariants.length);

    if (
      pinyinVariants.length > 1 &&
      hanziVariants.length > 1 &&
      hanziVariants.length !== pinyinVariants.length
    ) {
      errors.push(
        `Línea ${index + 1}: cantidad de variantes de hanzi y pinyin inconsistente.`,
      );
      return;
    }

    for (let variantIndex = 0; variantIndex < variantCount; variantIndex += 1) {
      try {
        const pinyinVariant = resolveVariantValue(
          pinyinVariants,
          variantIndex,
          "pinyin",
        );
        const hanziVariant = resolveVariantValue(
          hanziVariants,
          variantIndex,
          "hanzi",
        );

        cards.push(
          buildCardFromVariant(
            hanziVariant,
            pinyinVariant,
            row.spanish,
            index + 1,
            variantIndex,
          ),
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "error desconocido";
        errors.push(`Línea ${index + 1}: ${message}.`);
      }
    }
  });

  return { cards, errors };
}

export function buildCustomDeck(source: string) {
  const parsed = parseCustomWordList(source);

  return {
    id: "custom",
    label: "Lista personal",
    subtitle: `${parsed.cards.length} tarjetas`,
    cards: parsed.cards,
    errors: parsed.errors,
  } as const;
}
