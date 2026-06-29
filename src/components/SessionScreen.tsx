import { useEffect, useRef } from "react";

import {
  buildToneOptionPinyin,
  plainPinyinFromNumericSyllable,
} from "../lib/pinyin";
import { TonePinyinCard } from "./TonePinyinCard";
import { buildMultipleChoiceOptions } from "../lib/session";
import type { Card, StudyMode, Tone, UserSettings } from "../types/cards";
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

const toneOptions: Tone[] = [1, 2, 3, 4, 0];

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
  const studyStageRef = useRef<HTMLElement | null>(null);
  const options =
    mode === "choice"
      ? buildMultipleChoiceOptions(session.currentCard, allCards)
      : [];
  const isToneMode = mode === "tones";
  const isToneFeedbackVisible = isToneMode && feedback !== null;

  const remaining = session.queue.length + 1;
  const progressWidth = `${(session.learnedIds.length / session.roundSize) * 100}%`;

  useEffect(() => {
    if (typeof studyStageRef.current?.scrollIntoView === "function") {
      studyStageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [session.currentCard.id]);

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

      <section className="study-stage" ref={studyStageRef}>
        <TonePinyinCard
          card={session.currentCard}
          colorTones={isToneMode ? feedback !== null : settings.colorTones}
          compactSpanish={isToneFeedbackVisible}
          hideSpanishLabel={isToneFeedbackVisible}
          plainPinyin={isToneMode && feedback === null}
          revealSpanish={feedback !== null}
          showPinyin={isToneMode ? true : settings.showPinyin}
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
        ) : isToneMode && feedback === null ? (
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
                  <strong>{syllable.hanzi || syllable.prompt}</strong>
                  <div className="tone-options">
                    {toneOptions.map((tone) => (
                      <button
                        type="button"
                        className={`tone-button tone-button-tone-${tone} ${toneSelections[index] === tone ? "tone-button-active" : ""}`}
                        key={tone}
                        onClick={() => onToneSelectionChange(index, tone)}
                        disabled={feedback !== null}
                      >
                        <span className="tone-button-label">
                          {buildToneOptionPinyin(syllable.pinyinNumber, tone)}
                        </span>
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
        ) : isToneMode ? (
          <div
            className={`feedback-panel tone-feedback-panel feedback-${feedback?.status ?? "correct"}`}
            role="status"
          >
            <div className="tone-feedback-row" aria-label="Tonos elegidos">
              <span className="tone-feedback-icon">
                {feedback?.status === "correct" ? "✅" : "❌"}
              </span>
              <div className="tone-feedback-pills">
                {session.currentCard.syllables.map((syllable, index) => {
                  const selectedTone = toneSelections[index];
                  const selectedLabel =
                    selectedTone === -1
                      ? plainPinyinFromNumericSyllable(syllable.pinyinNumber)
                      : buildToneOptionPinyin(
                          syllable.pinyinNumber,
                          selectedTone as Tone,
                        );

                  return (
                    <span
                      className="pinyin tone-feedback-pill"
                      data-tone={selectedTone === -1 ? 0 : selectedTone}
                      key={`${session.currentCard.id}-selected-tone-${index}`}
                    >
                      {selectedLabel}
                    </span>
                  );
                })}
              </div>
            </div>
            {feedback?.status === "incorrect" ? (
              <div className="tone-feedback-row" aria-label="Tonos correctos">
                <span className="tone-feedback-icon">✓</span>
                <div className="tone-feedback-pills">
                  {session.currentCard.syllables.map((syllable, index) => (
                    <span
                      className="pinyin tone-feedback-pill"
                      data-tone={syllable.tone}
                      key={`${session.currentCard.id}-correct-tone-${index}`}
                    >
                      {syllable.pinyinDisplay}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
            <button className="primary-button" onClick={onNext}>
              Siguiente tarjeta
            </button>
          </div>
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

        {feedback && !isToneMode ? (
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
