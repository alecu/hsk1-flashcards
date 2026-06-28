import { useEffect, useState, type KeyboardEvent } from "react";

import type { CustomWordRow } from "../data/customList";
import type {
  CardProgress,
  StudyMode,
  UserSettings,
  VocabularySet,
} from "../types/cards";

type HomeScreenProps = {
  activeVocabularySet: VocabularySet;
  totalCards: number;
  mistakeCards: number;
  customDeckErrors: string[];
  customRows: CustomWordRow[];
  progress: Record<string, CardProgress>;
  settings: UserSettings;
  onVocabularySetChange: (value: VocabularySet) => void;
  onCustomRowChange: (
    rowIndex: number,
    key: "hanzi" | "pinyin" | "spanish",
    value: string,
  ) => void;
  onCustomRowDelete: (rowIndex: number) => void;
  onCustomRowAdd: () => void;
  onRoundSizeChange: (value: number) => void;
  onToggleSetting: (key: "showPinyin" | "colorTones") => void;
  onStart: (mode: StudyMode) => void;
};

const vocabularyOptions: Array<{
  id: VocabularySet;
  title: string;
  description: string;
}> = [
  {
    id: "hsk20",
    title: "HSK 2.0",
    description: "Nivel clasico con 150 palabras.",
  },
  {
    id: "hsk30",
    title: "HSK 3.0",
    description: "Nueva lista con 300 palabras base.",
  },
  {
    id: "custom",
    title: "Lista personal",
    description: "Cards creadas desde una lista editable de pinyin y castellano.",
  },
];

const modeCards: Array<{
  id: StudyMode;
  title: string;
  description: string;
}> = [
  {
    id: "typing",
    title: "Chino -> Castellano",
    description:
      "La app muestra la palabra en chino y la usuaria escribe la traduccion.",
  },
  {
    id: "choice",
    title: "Multiple choice",
    description:
      "Cada ronda ofrece cuatro opciones y prioriza velocidad de repaso.",
  },
  {
    id: "review",
    title: "Revision de errores",
    description:
      "Construye una ronda con las tarjetas falladas recientemente.",
  },
  {
    id: "tones",
    title: "Modo tonos",
    description:
      "Muestra el hanzi y el pinyin plano para identificar el tono correcto de cada silaba.",
  },
];

const spreadsheetColumns = ["hanzi", "pinyin", "spanish"] as const;

function focusSpreadsheetCell(rowIndex: number, columnIndex: number) {
  if (typeof document === "undefined") {
    return;
  }

  const cell = document.querySelector<HTMLElement>(
    `[data-spreadsheet-cell="true"][data-row-index="${rowIndex}"][data-column-index="${columnIndex}"]`,
  );

  cell?.focus();
}

export function HomeScreen({
  activeVocabularySet,
  totalCards,
  mistakeCards,
  customDeckErrors,
  customRows,
  progress,
  settings,
  onVocabularySetChange,
  onCustomRowChange,
  onCustomRowDelete,
  onCustomRowAdd,
  onRoundSizeChange,
  onToggleSetting,
  onStart,
}: HomeScreenProps) {
  const [isCustomEditorOpen, setIsCustomEditorOpen] = useState(false);
  const knownCards = Object.values(progress).filter(
    (entry) => entry.correct >= 2 && entry.correct > entry.incorrect,
  ).length;

  useEffect(() => {
    if (activeVocabularySet === "custom") {
      setIsCustomEditorOpen(false);
    }
  }, [activeVocabularySet]);

  const handleSpreadsheetKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    rowIndex: number,
    columnIndex: number,
  ) => {
    let nextRow = rowIndex;
    let nextColumn = columnIndex;

    switch (event.key) {
      case "Tab":
        event.preventDefault();
        nextColumn = event.shiftKey ? columnIndex - 1 : columnIndex + 1;
        if (nextColumn < 0) {
          nextColumn = spreadsheetColumns.length - 1;
          nextRow = Math.max(0, rowIndex - 1);
        } else if (nextColumn >= spreadsheetColumns.length) {
          nextColumn = 0;
          nextRow = Math.min(customRows.length - 1, rowIndex + 1);
        }
        break;
      case "Enter":
        event.preventDefault();
        nextRow = Math.min(customRows.length - 1, rowIndex + 1);
        break;
      case "ArrowLeft":
        if (window.getSelection()?.anchorOffset === 0) {
          event.preventDefault();
          nextColumn = Math.max(0, columnIndex - 1);
        } else {
          return;
        }
        break;
      case "ArrowRight": {
        const contentLength = event.currentTarget.textContent?.length ?? 0;
        const selection = window.getSelection();
        if (selection?.anchorOffset === contentLength) {
          event.preventDefault();
          nextColumn = Math.min(spreadsheetColumns.length - 1, columnIndex + 1);
        } else {
          return;
        }
        break;
      }
      case "ArrowUp":
        event.preventDefault();
        nextRow = Math.max(0, rowIndex - 1);
        break;
      case "ArrowDown":
        event.preventDefault();
        nextRow = Math.min(customRows.length - 1, rowIndex + 1);
        break;
      default:
        return;
    }

    focusSpreadsheetCell(nextRow, nextColumn);
  };

  return (
    <main className="app-shell">
      <section className="hero-block">
        <div>
          <p className="eyebrow">HSK1 FlashCards</p>
          <h1 className="hero-title-mark">
            <span className="hero-title-main">
              <span className="hero-title-syllable">
                <span className="hero-title-hanzi">近</span>
                <span className="pinyin hero-title-pinyin" data-tone="4">
                  jìn4
                </span>
              </span>
              <span className="hero-title-syllable">
                <span className="hero-title-hanzi">百</span>
                <span className="pinyin hero-title-pinyin" data-tone="3">
                  bǎi3
                </span>
              </span>
            </span>
            <span className="hero-title-note">(99.9%)</span>
          </h1>
          <p className="hero-copy">
            Prácticas de Chino para alumnos de niveles iniciales
          </p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">
              {activeVocabularySet === "hsk20"
                ? "Tarjetas HSK 2.0"
                : activeVocabularySet === "hsk30"
                  ? "Tarjetas HSK 3.0"
                  : "Tarjetas personalizadas"}
            </span>
            <strong>{totalCards}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Dominadas</span>
            <strong>{knownCards}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Con errores</span>
            <strong>{mistakeCards}</strong>
          </div>
        </div>
      </section>

      <section className="control-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Vocabulario</p>
            <h2>Elegir lista</h2>
          </div>
        </div>

        <div className="deck-switcher">
          {vocabularyOptions.map((option) => (
            <button
              key={option.id}
              className={`deck-option ${activeVocabularySet === option.id ? "deck-option-active" : ""}`}
              onClick={() => onVocabularySetChange(option.id)}
              type="button"
            >
              <strong>{option.title}</strong>
              <span>{option.description}</span>
            </button>
          ))}
        </div>

        {activeVocabularySet === "custom" ? (
          <div className="custom-list-panel">
            <div className="custom-list-header">
              <div>
                <span>Lista personal</span>
                <small>
                  Cada fila define una tarjeta. Las variantes se pueden escribir
                  con `/`, por ejemplo `块 / 元` o `小姐 / 女士`.
                </small>
              </div>
              <div className="custom-list-actions">
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => setIsCustomEditorOpen((current) => !current)}
                  aria-expanded={isCustomEditorOpen}
                >
                  {isCustomEditorOpen ? "Cerrar editor" : "Editar lista"}
                </button>
                {isCustomEditorOpen ? (
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={onCustomRowAdd}
                  >
                    Agregar fila
                  </button>
                ) : null}
              </div>
            </div>

            {isCustomEditorOpen ? (
              <div className="custom-table-shell">
                <table className="custom-spreadsheet" aria-label="Lista personal">
                  <thead>
                    <tr>
                      <th className="custom-index-header" scope="col">
                        #
                      </th>
                      <th scope="col">Hanzi</th>
                      <th scope="col">Pinyin</th>
                      <th scope="col">Castellano</th>
                      <th scope="col" className="custom-action-header">
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {customRows.map((row, index) => (
                      <tr key={`custom-row-${index}`}>
                        <th className="custom-row-index" scope="row">
                          {index + 1}
                        </th>
                        {spreadsheetColumns.map((columnKey, columnIndex) => (
                          <td key={`${index}-${columnKey}`}>
                            <div
                              className="custom-grid-cell"
                              contentEditable
                              suppressContentEditableWarning
                              data-placeholder={
                                columnKey === "hanzi"
                                  ? "例: 飞机"
                                  : columnKey === "pinyin"
                                    ? "fei1ji1"
                                    : "avión"
                              }
                              data-spreadsheet-cell="true"
                              data-row-index={index}
                              data-column-index={columnIndex}
                              spellCheck={columnKey === "spanish"}
                              onBlur={(event) =>
                                onCustomRowChange(
                                  index,
                                  columnKey,
                                  event.currentTarget.textContent ?? "",
                                )
                              }
                              onKeyDown={(event) =>
                                handleSpreadsheetKeyDown(
                                  event,
                                  index,
                                  columnIndex,
                                )
                              }
                            >
                              {row[columnKey]}
                            </div>
                          </td>
                        ))}
                        <td className="custom-row-actions">
                          <button
                            type="button"
                            className="ghost-button custom-delete-button"
                            onClick={() => onCustomRowDelete(index)}
                            disabled={customRows.length === 1}
                          >
                            Borrar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            <div className="custom-list-field">
              <small>
                El pinyin usa tonos numéricos. Si dejás el hanzi vacío, la app
                usará el pinyin como prompt visual para esa tarjeta.
              </small>
            </div>

            {customDeckErrors.length > 0 ? (
              <div className="custom-list-errors" role="status">
                <strong>Hay líneas que no se pudieron cargar.</strong>
                <p>{customDeckErrors.slice(0, 4).join(" ")}</p>
              </div>
            ) : (
              <div className="custom-list-hint">
                <strong>Lista cargada.</strong>
                <p>{totalCards} tarjetas disponibles desde tu vocabulario propio.</p>
              </div>
            )}
          </div>
        ) : null}
      </section>

      <section className="control-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Sesion</p>
            <h2>Configurar ronda</h2>
          </div>
        </div>

        <div className="settings-grid">
          <label className="setting">
            <span>Cantidad de tarjetas</span>
            <input
              type="range"
              min={10}
              max={30}
              step={5}
              value={settings.roundSize}
              onChange={(event) => onRoundSizeChange(Number(event.target.value))}
            />
            <strong>{settings.roundSize}</strong>
          </label>

          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.showPinyin}
              onChange={() => onToggleSetting("showPinyin")}
            />
            <span>Mostrar pinyin bajo cada caracter</span>
          </label>

          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.colorTones}
              onChange={() => onToggleSetting("colorTones")}
            />
            <span>Colorear silabas segun tono</span>
          </label>
        </div>
      </section>

      <section className="mode-grid">
        {modeCards.map((mode) => (
          <article className="mode-card" key={mode.id}>
            <div>
              <p className="eyebrow">Modo</p>
              <h3>{mode.title}</h3>
              <p>{mode.description}</p>
            </div>
            <button
              className="primary-button"
              onClick={() => onStart(mode.id)}
              disabled={
                totalCards === 0 ||
                (mode.id === "review" && mistakeCards === 0)
              }
            >
              {totalCards === 0
                ? "Sin tarjetas cargadas"
                : mode.id === "review" && mistakeCards === 0
                ? "Sin errores guardados"
                : "Empezar ronda"}
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}
