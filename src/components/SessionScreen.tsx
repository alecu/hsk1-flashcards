import { useState } from "react";

import { buildToneOptionPinyin } from "../lib/pinyin";
import {
  hasTonePerfectAudio,
  playTonePerfectSequence,
  playTonePerfectSyllable,
} from "../lib/tonePerfect";
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
  const [audioStatus, setAudioStatus] = useState<string | null>(null);
  const toneAudioEnabled = !(
    (import.meta as ImportMeta & { env?: { PROD?: boolean } }).env?.PROD ?? false
  );
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
          colorTones={
            mode === "tones" ? feedback !== null : settings.colorTones
          }
          plainPinyin={mode === "tones" && feedback === null}
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
            <div className="tones-toolbar">
              <button
                type="button"
                className="ghost-button"
                disabled={!toneAudioEnabled}
                onClick={async () => {
                  if (!toneAudioEnabled) {
                    return;
                  }

                  try {
                    const result = await playTonePerfectSequence(
                      session.currentCard.syllables.map(
                        (syllable) => syllable.pinyinNumber,
                      ),
                    );

                    if (result.played === 0) {
                      setAudioStatus(
                        "Tone Perfect no tiene audio para tonos neutros.",
                      );
                      return;
                    }

                    setAudioStatus(
                      result.skipped > 0
                        ? "Se reprodujeron los tonos disponibles. Los tonos neutros quedaron sin audio."
                        : "Audio reproducido desde Tone Perfect.",
                    );
                  } catch {
                    setAudioStatus("No se pudo reproducir el audio Tone Perfect.");
                  }
                }}
              >
                Escuchar palabra
              </button>
              <small>
                {toneAudioEnabled
                  ? "Audio Tone Perfect disponible para tonos 1-4. Fuente: Michigan State University."
                  : "Audio Tone Perfect deshabilitado en producción."}
              </small>
            </div>
            <div className="tones-grid">
              {session.currentCard.syllables.map((syllable, index) => (
                <div className="tone-prompt" key={`${session.currentCard.id}-tone-${index}`}>
                  <div className="tone-prompt-head">
                    <strong>{syllable.hanzi || syllable.prompt}</strong>
                    <button
                      type="button"
                      className="ghost-button tone-audio-button"
                      disabled={
                        !toneAudioEnabled ||
                        !hasTonePerfectAudio(syllable.pinyinNumber)
                      }
                      onClick={async () => {
                        if (!toneAudioEnabled) {
                          return;
                        }

                        try {
                          const played = await playTonePerfectSyllable(
                            syllable.pinyinNumber,
                          );

                          setAudioStatus(
                            played
                              ? `Audio reproducido para ${syllable.pinyinDisplay}.`
                              : "Tone Perfect no tiene audio para ese tono.",
                          );
                        } catch {
                          setAudioStatus(
                            "No se pudo reproducir el audio Tone Perfect.",
                          );
                        }
                      }}
                    >
                      Escuchar
                    </button>
                  </div>
                  <span>{syllable.pinyinNumber.replace(/[0-5]$/, "")}</span>
                  <div className="tone-options">
                    {toneOptions.map((tone) => (
                      <button
                        type="button"
                        className={`tone-button tone-button-tone-${tone} ${toneSelections[index] === tone ? "tone-button-active" : ""}`}
                        key={tone}
                        onClick={() => onToneSelectionChange(index, tone)}
                        disabled={feedback !== null}
                      >
                        <span className="tone-button-tone">{tone}</span>
                        <span className="tone-button-label">
                          {buildToneOptionPinyin(syllable.pinyinNumber, tone)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {audioStatus ? (
              <div className="tones-audio-status" role="status">
                {audioStatus}
              </div>
            ) : null}
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
