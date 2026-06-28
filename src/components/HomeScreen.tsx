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
  progress: Record<string, CardProgress>;
  settings: UserSettings;
  onVocabularySetChange: (value: VocabularySet) => void;
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
  progress,
  settings,
  onVocabularySetChange,
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
            La app ahora permite elegir entre el vocabulario HSK 2.0 de 150
            palabras y el HSK 3.0 de 300 palabras, con el mismo motor de
            rondas, pinyin por silaba y colores por tono.
          </p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">
              {activeVocabularySet === "hsk20" ? "Tarjetas HSK 2.0" : "Tarjetas HSK 3.0"}
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
              disabled={mode.id === "review" && mistakeCards === 0}
            >
              {mode.id === "review" && mistakeCards === 0
                ? "Sin errores guardados"
                : "Empezar ronda"}
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}
