import { parseCsvLine, serializeCsvRow } from "./csv";
import { normalizeCardProgress, normalizeProgressByMode, trackedStudyModes } from "./progress";
import type { CustomWordRow } from "../data/customList";
import type { Card, CardProgress, ProgressByMode, StudyMode, VocabularySet } from "../types/cards";

export type ExportScope = VocabularySet | "all";

type ExchangeRecord = {
  record_type: "word" | "progress";
  vocabulary_set: string;
  mode: string;
  card_id: string;
  hanzi: string;
  pinyin: string;
  spanish: string;
  answers: string;
  attempts: string;
  correct: string;
  incorrect: string;
  streak: string;
  last_result: string;
  recent_results: string;
  introduced_at: string;
  last_seen_at: string;
  last_incorrect_at: string;
};

const exchangeHeader: Array<keyof ExchangeRecord> = [
  "record_type",
  "vocabulary_set",
  "mode",
  "card_id",
  "hanzi",
  "pinyin",
  "spanish",
  "answers",
  "attempts",
  "correct",
  "incorrect",
  "streak",
  "last_result",
  "recent_results",
  "introduced_at",
  "last_seen_at",
  "last_incorrect_at",
];

function buildPinyinNumber(card: Card) {
  return card.syllables.map((syllable) => syllable.pinyinNumber).join(" ");
}

function scopedCards(
  scope: ExportScope,
  cardsBySet: Record<VocabularySet, Card[]>,
) {
  if (scope === "all") {
    return [...cardsBySet.hsk20, ...cardsBySet.hsk30, ...cardsBySet.custom];
  }

  return cardsBySet[scope];
}

function scopedWordRows(
  scope: ExportScope,
  cardsBySet: Record<VocabularySet, Card[]>,
  customRows: CustomWordRow[],
) {
  const rows: ExchangeRecord[] = [];

  if (scope === "all" || scope === "custom") {
    customRows.forEach((row) => {
      if (!row.hanzi && !row.pinyin && !row.spanish) {
        return;
      }

      rows.push({
        record_type: "word",
        vocabulary_set: "custom",
        mode: "",
        card_id: "",
        hanzi: row.hanzi,
        pinyin: row.pinyin,
        spanish: row.spanish,
        answers: "",
        attempts: "",
        correct: "",
        incorrect: "",
        streak: "",
        last_result: "",
        recent_results: "",
        introduced_at: "",
        last_seen_at: "",
        last_incorrect_at: "",
      });
    });
  }

  (["hsk20", "hsk30"] as VocabularySet[]).forEach((setId) => {
    if (scope !== "all" && scope !== setId) {
      return;
    }

    cardsBySet[setId].forEach((card) => {
      rows.push({
        record_type: "word",
        vocabulary_set: setId,
        mode: "",
        card_id: card.id,
        hanzi: card.hanzi,
        pinyin: buildPinyinNumber(card),
        spanish: card.spanish,
        answers: card.answers.join(" / "),
        attempts: "",
        correct: "",
        incorrect: "",
        streak: "",
        last_result: "",
        recent_results: "",
        introduced_at: "",
        last_seen_at: "",
        last_incorrect_at: "",
      });
    });
  });

  return rows;
}

function buildProgressRecord(
  card: Card,
  mode: StudyMode,
  progress?: CardProgress,
): ExchangeRecord {
  const normalized = normalizeCardProgress(progress);

  return {
    record_type: "progress",
    vocabulary_set: card.vocabularySet,
    mode,
    card_id: card.id,
    hanzi: card.hanzi,
    pinyin: buildPinyinNumber(card),
    spanish: card.spanish,
    answers: card.answers.join(" / "),
    attempts: String(normalized.attempts),
    correct: String(normalized.correct),
    incorrect: String(normalized.incorrect),
    streak: String(normalized.streak),
    last_result: normalized.lastResult ?? "",
    recent_results: normalized.recentResults.join(","),
    introduced_at:
      normalized.introducedAt === null ? "" : String(normalized.introducedAt),
    last_seen_at:
      normalized.lastSeenAt === null ? "" : String(normalized.lastSeenAt),
    last_incorrect_at:
      normalized.lastIncorrectAt === null
        ? ""
        : String(normalized.lastIncorrectAt),
  };
}

export function exportVocabularyCsv(params: {
  cardsBySet: Record<VocabularySet, Card[]>;
  customRows: CustomWordRow[];
  progressByMode: ProgressByMode;
  scope: ExportScope;
}) {
  const { cardsBySet, customRows, progressByMode, scope } = params;
  const rows: ExchangeRecord[] = [
    ...scopedWordRows(scope, cardsBySet, customRows),
    ...scopedCards(scope, cardsBySet).flatMap((card) =>
      trackedStudyModes.map((mode) =>
        buildProgressRecord(card, mode, progressByMode[mode][card.id]),
      ),
    ),
  ];

  return [
    serializeCsvRow(exchangeHeader),
    ...rows.map((row) =>
      serializeCsvRow(exchangeHeader.map((column) => row[column])),
    ),
  ].join("\n");
}

function buildEmptyProgressEntry(record: ExchangeRecord): CardProgress {
  return normalizeCardProgress({
    attempts: Number(record.attempts || 0),
    correct: Number(record.correct || 0),
    incorrect: Number(record.incorrect || 0),
    streak: Number(record.streak || 0),
    lastResult:
      record.last_result === "correct" || record.last_result === "incorrect"
        ? record.last_result
        : null,
    recentResults: record.recent_results
      ? record.recent_results
          .split(",")
          .filter(
            (value): value is "correct" | "incorrect" =>
              value === "correct" || value === "incorrect",
          )
      : [],
    introducedAt: record.introduced_at ? Number(record.introduced_at) : null,
    lastSeenAt: record.last_seen_at ? Number(record.last_seen_at) : null,
    lastIncorrectAt: record.last_incorrect_at
      ? Number(record.last_incorrect_at)
      : null,
  });
}

export function importVocabularyCsv(source: string) {
  const lines = source
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return {
      customRows: [] as CustomWordRow[],
      progressByMode: normalizeProgressByMode(undefined),
    };
  }

  const [headerLine, ...dataLines] = lines;
  const header = parseCsvLine(headerLine);

  if (!header.includes("record_type")) {
    return {
      customRows: lines.map((line) => {
        const columns = parseCsvLine(line);
        return {
          hanzi: columns[0]?.trim() ?? "",
          pinyin: columns[1]?.trim() ?? "",
          spanish: columns.slice(2).join(";").trim(),
        } satisfies CustomWordRow;
      }),
      progressByMode: normalizeProgressByMode(undefined),
    };
  }

  const customRows: CustomWordRow[] = [];
  const seenCustomRows = new Set<string>();
  const progressByMode = normalizeProgressByMode(undefined);

  dataLines.forEach((line) => {
    const values = parseCsvLine(line);
    const record = Object.fromEntries(
      header.map((column, index) => [column, values[index] ?? ""]),
    ) as ExchangeRecord;

    if (record.record_type === "word" && record.vocabulary_set === "custom") {
      const row = {
        hanzi: record.hanzi,
        pinyin: record.pinyin,
        spanish: record.spanish,
      } satisfies CustomWordRow;
      const key = `${row.hanzi}::${row.pinyin}::${row.spanish}`;

      if (!seenCustomRows.has(key)) {
        seenCustomRows.add(key);
        customRows.push(row);
      }
      return;
    }

    if (
      record.record_type === "progress" &&
      trackedStudyModes.includes(record.mode as StudyMode) &&
      record.card_id
    ) {
      progressByMode[record.mode as StudyMode][record.card_id] =
        buildEmptyProgressEntry(record);
    }
  });

  return {
    customRows,
    progressByMode,
  };
}

export function mergeImportedProgress(params: {
  current: ProgressByMode;
  imported: ProgressByMode;
  replaceCustomProgress: boolean;
}) {
  const { current, imported, replaceCustomProgress } = params;
  const next = normalizeProgressByMode(current);

  trackedStudyModes.forEach((mode) => {
    const currentEntries = { ...next[mode] };

    if (replaceCustomProgress) {
      Object.keys(currentEntries).forEach((cardId) => {
        if (cardId.startsWith("custom-")) {
          delete currentEntries[cardId];
        }
      });
    }

    Object.keys(imported[mode]).forEach((cardId) => {
      currentEntries[cardId] = imported[mode][cardId];
    });

    next[mode] = currentEntries;
  });

  return next;
}
