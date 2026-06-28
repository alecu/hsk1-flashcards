import type { SessionSummary } from "../types/cards";

type ResultsScreenProps = {
  totalCards: number;
  summary: SessionSummary;
  onRestart: () => void;
};

export function ResultsScreen({
  totalCards,
  summary,
  onRestart,
}: ResultsScreenProps) {
  const accuracy =
    summary.roundSize === 0
      ? 0
      : Math.round((summary.correct / (summary.correct + summary.incorrect)) * 100);

  return (
    <main className="app-shell">
      <section className="results-card">
        <p className="eyebrow">Sesion completada</p>
        <h1>Ronda terminada</h1>
        <p className="hero-copy">
          Se completaron {summary.roundSize} tarjetas sobre un mazo total de{" "}
          {totalCards}. El objetivo del MVP es repetir hasta vaciar la pila.
        </p>

        <div className="results-grid">
          <div className="stat-card">
            <span className="stat-label">Correctas</span>
            <strong>{summary.correct}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Incorrectas</span>
            <strong>{summary.incorrect}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Precision</span>
            <strong>{Number.isFinite(accuracy) ? `${accuracy}%` : "0%"}</strong>
          </div>
        </div>

        <button className="primary-button" onClick={onRestart}>
          Volver al inicio
        </button>
      </section>
    </main>
  );
}
