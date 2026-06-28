import { useEffect, useState } from "react";

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

  return (
    <main className="app-shell">
      <section className="hero-block">
        <div>
          <p className="eyebrow">HSK1 FlashCards</p>
          <h1>Mandarin inicial, sin backend y lista para GitHub Pages.</h1>
          <p className="hero-copy">
            La app ahora permite elegir entre HSK 2.0, HSK 3.0 o una lista
            propia con hanzi, pinyin y castellano, con el mismo motor de
            rondas, pinyin por silaba y colores por tono.
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
                <div className="custom-table" role="table" aria-label="Lista personal">
                  <div className="custom-table-head" role="rowgroup">
                    <div className="custom-table-row custom-table-row-head" role="row">
                      <span role="columnheader">Hanzi</span>
                      <span role="columnheader">Pinyin</span>
                      <span role="columnheader">Castellano</span>
                      <span role="columnheader">Acción</span>
                    </div>
                  </div>

                  <div className="custom-table-body" role="rowgroup">
                    {customRows.map((row, index) => (
                      <div className="custom-table-row" role="row" key={`custom-row-${index}`}>
                        <div className="custom-cell" role="cell">
                          <span className="custom-cell-label">Hanzi</span>
                          <div
                            className="custom-grid-cell"
                            contentEditable
                            suppressContentEditableWarning
                            data-placeholder="例: 飞机"
                            spellCheck={false}
                            onBlur={(event) =>
                              onCustomRowChange(
                                index,
                                "hanzi",
                                event.currentTarget.textContent ?? "",
                              )
                            }
                          >
                            {row.hanzi}
                          </div>
                        </div>

                        <div className="custom-cell" role="cell">
                          <span className="custom-cell-label">Pinyin</span>
                          <div
                            className="custom-grid-cell"
                            contentEditable
                            suppressContentEditableWarning
                            data-placeholder="fei1ji1"
                            spellCheck={false}
                            onBlur={(event) =>
                              onCustomRowChange(
                                index,
                                "pinyin",
                                event.currentTarget.textContent ?? "",
                              )
                            }
                          >
                            {row.pinyin}
                          </div>
                        </div>

                        <div className="custom-cell" role="cell">
                          <span className="custom-cell-label">Castellano</span>
                          <div
                            className="custom-grid-cell"
                            contentEditable
                            suppressContentEditableWarning
                            data-placeholder="avión"
                            onBlur={(event) =>
                              onCustomRowChange(
                                index,
                                "spanish",
                                event.currentTarget.textContent ?? "",
                              )
                            }
                          >
                            {row.spanish}
                          </div>
                        </div>

                        <div className="custom-row-actions">
                          <button
                            type="button"
                            className="ghost-button"
                            onClick={() => onCustomRowDelete(index)}
                            disabled={customRows.length === 1}
                          >
                            Borrar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
