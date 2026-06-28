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
  progress: Record<string, CardProgress>;
  settings: UserSettings;
  onVocabularySetChange: (value: VocabularySet) => void;
  onCustomWordListChange: (value: string) => void;
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
  progress,
  settings,
  onVocabularySetChange,
  onCustomWordListChange,
  onRoundSizeChange,
  onToggleSetting,
  onStart,
}: HomeScreenProps) {
  const knownCards = Object.values(progress).filter(
    (entry) => entry.correct >= 2 && entry.correct > entry.incorrect,
  ).length;

  return (
    <main className="app-shell">
      <section className="hero-block">
        <div>
          <p className="eyebrow">HSK1 FlashCards</p>
          <h1>Mandarin inicial, sin backend y lista para GitHub Pages.</h1>
          <p className="hero-copy">
            La app ahora permite elegir entre HSK 2.0, HSK 3.0 o una lista
            propia en pinyin, con el mismo motor de rondas, pinyin por silaba
            y colores por tono.
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
            <label className="custom-list-field" htmlFor="custom-word-list">
              <span>Lista editable</span>
              <small>
                Formato: pinyin numérico, tabulador, traducción. El lado chino
                se mostrará en pinyin porque esta lista no trae hanzi.
              </small>
              <textarea
                id="custom-word-list"
                value={settings.customWordList}
                onChange={(event) => onCustomWordListChange(event.target.value)}
                spellCheck={false}
              />
            </label>

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
