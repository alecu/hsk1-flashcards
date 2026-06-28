import type { CardProgress, StudyMode, UserSettings } from "../types/cards";

type HomeScreenProps = {
  totalCards: number;
  mistakeCards: number;
  progress: Record<string, CardProgress>;
  settings: UserSettings;
  onRoundSizeChange: (value: number) => void;
  onToggleSetting: (key: "showPinyin" | "colorTones") => void;
  onStart: (mode: StudyMode) => void;
};

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
];

export function HomeScreen({
  totalCards,
  mistakeCards,
  progress,
  settings,
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
            MVP en browser con las 150 palabras de HSK1, pinyin por silaba,
            colores por tono y rondas reinsertables hasta dominar cada tarjeta.
          </p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Tarjetas HSK1</span>
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
