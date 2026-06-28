import {
  formatPinyinWithToneMark,
  getToneFromPinyin,
  plainPinyinFromNumericSyllable,
  splitNumericPinyinSyllables,
} from "../lib/pinyin";
import { normalizeAnswer } from "../lib/text";
import type { Card } from "../types/cards";

export const defaultCustomWordList = `fei1ji1	avión
chu1zu1che1	taxi
gong1jiao1che1	colectivo
huo4	o
che1piao4	boleto
shi4zhong1xin1	centro
na3 er5	dónde
cha4bu4duo1	más o menos
ba1shi4	micro
huo3che1zhan4	estación de tren
huo3che1	tren
zai4	estar
qu4	ir
zuo4	sentarse / tomar
yao4	querer
ke3yi3	poder
bai3	centena
da3shi2	docena
fa3wen2	idioma francés
pu2tao2ya2wen2	idioma portugués
xi1wen2	idioma español
ri4wen2	idioma japonés
pu3tong1hua4	lengua china
zhong1wen2	idioma chino
ne0	partícula interrogativa
you3qu4	interesante
ye3 bu4	tampoco
ye3	también
yi4 dian3dian3	un poquito
tan1ge1xiu4	show de tango
tan1ge1wu3	tango / baile de tango
ying1wen2	idioma inglés
shuo1	hablar / decir
kan4	mirar / ver
tiao4	bailar
hui4	saber una habilidad
fa3guo2	Francia
ying1guo2	Gran Bretaña
xi1ban1ya2	España
mei3guo2	Estados Unidos
ba1xi1	Brasil
a1gen1ting2	Argentina
gui4	caro
zhen1 de0	en serio
zhong1guo2	China
tai4 gui4 le0	carísimo
ying2ye4yuan2	vendedor
duo1shao3	cuánto
qian2	dinero
kuai4 / yuan2	unidad monetaria
zui4hao3de0	el mejor / la mejor
bai2jiu3	licor
pi2jiu3	cerveza
na4	eso / aquello
zhe4	esto
qing3wen4	una pregunta
zao3shang4hao3	buen día
niu2nai3	leche
ke3le4	bebida cola
shui3	agua
guo3zhi1	jugo
fu2wu4sheng1	mozo / moza
lao3wai4	occidentales
ka1fei1	café
cha2	té
shen2me0	qué
bu4	no
xi3huan1	gustar
he1	beber
he2	y / con
mi4shu1	secretario / secretaria
xian1sheng0	señor
shi4	ser
tai4tai5	señora
zai4jian4	adiós
xie4xie0	gracias
hao3	muy
hen3	muy
ni3men0	ustedes
xiao3jie3 / nv3shi4	señorita
wo3	yo
ta1	él / ella
mei2guan1xi0	no importa
dui4bu4qi3	perdón
bu2ke4qi0	no hay de qué / de nada
xue2sheng1	estudiante
lao3shi1	docente`;

export type ParsedCustomList = {
  cards: Card[];
  errors: string[];
};

function formatPromptPinyin(numericSyllable: string) {
  return formatPinyinWithToneMark(numericSyllable).replace(/[0-5]$/, "");
}

function buildAnswers(spanishText: string) {
  const displayParts = spanishText
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);

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

function buildCardFromVariant(
  pinyinVariant: string,
  spanishText: string,
  lineNumber: number,
  variantIndex: number,
) {
  const syllables = splitNumericPinyinSyllables(pinyinVariant);
  const answers = buildAnswers(spanishText);

  if (syllables.length === 0) {
    throw new Error("sin sílabas de pinyin válidas");
  }

  if (answers.length === 0) {
    throw new Error("sin traducción en castellano");
  }

  return {
    id: `custom-${lineNumber}-${variantIndex}-${syllables.join("-")}`,
    hanzi: syllables.map((syllable) => formatPromptPinyin(syllable)).join(" "),
    spanish: answers[0],
    answers,
    syllables: syllables.map((syllable) => ({
      hanzi: "",
      prompt: formatPromptPinyin(syllable),
      pinyinNumber: syllable,
      pinyinDisplay: formatPinyinWithToneMark(syllable),
      tone: getToneFromPinyin(syllable),
    })),
    vocabularySet: "custom",
    hskLevel: 1,
  } satisfies Card;
}

export function parseCustomWordList(source: string): ParsedCustomList {
  const cards: Card[] = [];
  const errors: string[] = [];

  source.split(/\r?\n/).forEach((rawLine, index) => {
    const line = rawLine.trim();

    if (!line) {
      return;
    }

    const tabIndex = line.indexOf("\t");

    if (tabIndex === -1) {
      errors.push(`Línea ${index + 1}: falta tabulador entre pinyin y castellano.`);
      return;
    }

    const pinyinSection = line.slice(0, tabIndex).trim();
    const spanishSection = line.slice(tabIndex + 1).trim();

    if (!pinyinSection || !spanishSection) {
      errors.push(`Línea ${index + 1}: formato incompleto.`);
      return;
    }

    const variants = pinyinSection
      .split("/")
      .map((variant) => variant.trim())
      .filter(Boolean);

    if (variants.length === 0) {
      errors.push(`Línea ${index + 1}: no se encontró pinyin.`);
      return;
    }

    variants.forEach((variant, variantIndex) => {
      try {
        cards.push(
          buildCardFromVariant(variant, spanishSection, index + 1, variantIndex),
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "error desconocido";
        errors.push(`Línea ${index + 1}: ${message}.`);
      }
    });
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
