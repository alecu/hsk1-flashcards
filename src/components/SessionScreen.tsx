import { TonePinyinCard } from "./TonePinyinCard";
import { buildMultipleChoiceOptions } from "../lib/session";
import type { Card, StudyMode, UserSettings } from "../types/cards";
import type { Session } from "../lib/session";

type Feedback =
  | {
      status: "correct" | "incorrect";
      submittedAnswer: string;
    }
  | null;

type SessionScreenProps = {
  allCards: Card[];
  feedback: Feedback;
  mode: StudyMode;
  onChoice: (value: string) => void;
  onDraftChange: (value: string) => void;
  onNext: () => void;
  onToneSelectionChange: (index: number, tone: number) => void;
  onSubmit: () => void;
  draft: string;
  session: Session;
  settings: UserSettings;
  toneSelections: number[];
  onCancel: () => void;
};

const modeLabel: Record<StudyMode, string> = {
  typing: "Chino -> Castellano",
  choice: "Multiple choice",
  review: "Revision de errores",
  tones: "Modo tonos",
};

export function SessionScreen({
  allCards,
  feedback,
  mode,
  onChoice,
  onDraftChange,
  onNext,
  onToneSelectionChange,
  onSubmit,
  draft,
  session,
  settings,
  toneSelections,
  onCancel,
}: SessionScreenProps) {
  const options =
    mode === "choice"
      ? buildMultipleChoiceOptions(session.currentCard, allCards)
      : [];

  const remaining = session.queue.length + 1;
  const progressWidth = `${(session.learnedIds.length / session.roundSize) * 100}%`;

  return (
    <main className="app-shell session-layout">
      <header className="session-topbar">
        <div>
          <p className="eyebrow">{modeLabel[mode]}</p>
          <h2>Ronda activa</h2>
        </div>
        <button className="ghost-button" onClick={onCancel}>
          Volver al inicio
        </button>
      </header>

      <section className="session-stats">
        <div className="progress-rail" aria-hidden="true">
          <span style={{ width: progressWidth }} />
        </div>
        <div className="session-counters">
          <span>En pila: {remaining}</span>
          <span>Aprendidas: {session.learnedIds.length}</span>
          <span>Falladas: {session.incorrectIds.length}</span>
        </div>
      </section>

      <section className="study-stage">
        <TonePinyinCard
          card={session.currentCard}
          colorTones={mode === "tones" ? false : settings.colorTones}
          plainPinyin={mode === "tones"}
          revealSpanish={feedback !== null}
          showPinyin={mode === "tones" ? true : settings.showPinyin}
        />

        {mode === "choice" ? (
          <div className="choice-grid">
            {options.map((option) => (
              <button
                className="choice-button"
                key={option}
                onClick={() => onChoice(option)}
                disabled={feedback !== null}
              >
                {option}
              </button>
            ))}
          </div>
        ) : mode === "tones" ? (
          <form
            className="tones-form"
            onSubmit={(event) => {
              event.preventDefault();
              onSubmit();
            }}
          >
            <label>Elegi el tono correcto para cada silaba</label>
            <div className="tones-grid">
              {session.currentCard.syllables.map((syllable, index) => (
                <div className="tone-prompt" key={`${session.currentCard.id}-tone-${index}`}>
                  <strong>{syllable.hanzi}</strong>
                  <span>{syllable.pinyinNumber.replace(/[0-5]$/, "")}</span>
                  <div className="tone-options">
                    {[1, 2, 3, 4, 0].map((tone) => (
                      <button
                        type="button"
                        className={`tone-button ${toneSelections[index] === tone ? "tone-button-active" : ""}`}
                        key={tone}
                        onClick={() => onToneSelectionChange(index, tone)}
                        disabled={feedback !== null}
                      >
                        {tone === 0 ? "0" : tone}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              type="submit"
              className="primary-button"
              disabled={
                feedback !== null ||
                toneSelections.length !== session.currentCard.syllables.length ||
                toneSelections.some((tone) => tone === -1)
              }
            >
              Validar tonos
            </button>
          </form>
        ) : (
          <form
            className="answer-form"
            onSubmit={(event) => {
              event.preventDefault();
              onSubmit();
            }}
          >
            <label htmlFor="spanish-answer">Escribi la palabra en castellano</label>
            <div className="answer-row">
              <input
                id="spanish-answer"
                autoComplete="off"
                value={draft}
                onChange={(event) => onDraftChange(event.target.value)}
                disabled={feedback !== null}
                placeholder="Ej: gracias"
              />
              <button
                type="submit"
                className="primary-button"
                disabled={feedback !== null || draft.trim().length === 0}
              >
                Validar
              </button>
            </div>
          </form>
        )}

        {feedback ? (
          <div
            className={`feedback-panel feedback-${feedback.status}`}
            role="status"
          >
            <strong>
              {feedback.status === "correct" ? "Correcto." : "Incorrecto."}
            </strong>
            <span>
              {feedback.status === "correct"
                ? `La tarjeta pasa a aprendidas.`
                : mode === "tones"
                  ? `Los tonos correctos son ${session.currentCard.syllables.map((syllable) => syllable.tone).join(" - ")} y la tarjeta vuelve a la pila.`
                  : `La respuesta correcta es "${session.currentCard.spanish}" y la tarjeta vuelve a la pila.`}
            </span>
            {feedback.submittedAnswer ? (
              <span>Ingresaste: {feedback.submittedAnswer}</span>
            ) : null}
            <button className="primary-button" onClick={onNext}>
              Siguiente tarjeta
            </button>
          </div>
        ) : null}
      </section>
    </main>
  );
}
