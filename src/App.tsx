import { useEffect, useState } from "react";

import { HomeScreen } from "./components/HomeScreen";
import { ResultsScreen } from "./components/ResultsScreen";
import { SessionScreen } from "./components/SessionScreen";
import { hsk1Cards } from "./data/cards";
import {
  createSession,
  isCorrectAnswer,
  pickRoundCards,
  resolveAnswer,
} from "./lib/session";
import {
  buildNextProgress,
  buildNextSessions,
  defaultPersistedState,
  loadState,
  saveState,
} from "./lib/storage";
import type {
  PersistedState,
  SessionSummary,
  StudyMode,
  UserSettings,
} from "./types/cards";
import type { Session } from "./lib/session";

type ScreenState =
  | { name: "home" }
  | { name: "session"; session: Session; mode: StudyMode }
  | { name: "results"; summary: SessionSummary };

type Feedback =
  | {
      status: "correct" | "incorrect";
      submittedAnswer: string;
    }
  | null;

export default function App() {
  const [persistedState, setPersistedState] =
    useState<PersistedState>(defaultPersistedState);
  const [screenState, setScreenState] = useState<ScreenState>({ name: "home" });
  const [draft, setDraft] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [pendingResult, setPendingResult] = useState<"correct" | "incorrect" | null>(
    null,
  );
  const [sessionUpdates, setSessionUpdates] = useState<
    Array<{ cardId: string; result: "correct" | "incorrect" }>
  >([]);

  useEffect(() => {
    setPersistedState(loadState());
  }, []);

  useEffect(() => {
    saveState(persistedState);
  }, [persistedState]);

  const handleStart = (mode: StudyMode) => {
    const roundCards = pickRoundCards(
      hsk1Cards,
      persistedState.settings.roundSize,
      persistedState.progress,
      mode,
    );

    const session = createSession(roundCards, persistedState.settings.roundSize, mode);

    if (!session) {
      return;
    }

    setDraft("");
    setFeedback(null);
    setPendingResult(null);
    setSessionUpdates([]);
    setScreenState({ name: "session", session, mode });
  };

  const handleSettingsChange = (nextSettings: UserSettings) => {
    setPersistedState((current) => ({
      ...current,
      settings: nextSettings,
    }));
  };

  const commitAnswer = (
    submittedAnswer: string,
    result: "correct" | "incorrect",
  ) => {
    if (screenState.name !== "session") {
      return;
    }

    setFeedback({
      status: result,
      submittedAnswer,
    });
    setPendingResult(result);
  };

  const handleSubmitTyping = () => {
    if (screenState.name !== "session") {
      return;
    }

    const wasCorrect = isCorrectAnswer(screenState.session.currentCard, draft);
    commitAnswer(draft, wasCorrect ? "correct" : "incorrect");
  };

  const handleChoice = (value: string) => {
    if (screenState.name !== "session") {
      return;
    }

    const wasCorrect = value === screenState.session.currentCard.spanish;
    commitAnswer(value, wasCorrect ? "correct" : "incorrect");
  };

  const handleNext = () => {
    if (screenState.name !== "session" || pendingResult === null) {
      return;
    }

    const currentCardId = screenState.session.currentCard.id;
    const result = resolveAnswer(
      screenState.session,
      pendingResult === "correct",
    );
    const nextUpdates = [
      ...sessionUpdates,
      { cardId: currentCardId, result: pendingResult },
    ];

    setSessionUpdates(nextUpdates);
    setDraft("");
    setFeedback(null);
    setPendingResult(null);

    if (result.done) {
      const nextProgress = buildNextProgress(
        persistedState.progress,
        nextUpdates,
      );

      setPersistedState((current) => ({
        ...current,
        progress: nextProgress,
        recentSessions: buildNextSessions(current.recentSessions, result.summary),
      }));
      setSessionUpdates([]);
      setScreenState({ name: "results", summary: result.summary });
      return;
    }

    setScreenState({
      name: "session",
      mode: screenState.mode,
      session: result.session,
    });
  };

  const mistakeCards = hsk1Cards.filter(
    (card) => (persistedState.progress[card.id]?.incorrect ?? 0) > 0,
  ).length;

  if (screenState.name === "session") {
    return (
      <SessionScreen
        allCards={hsk1Cards}
        draft={draft}
        feedback={feedback}
        mode={screenState.mode}
        onCancel={() => {
          setDraft("");
          setFeedback(null);
          setPendingResult(null);
          setSessionUpdates([]);
          setScreenState({ name: "home" });
        }}
        onChoice={handleChoice}
        onDraftChange={setDraft}
        onNext={handleNext}
        onSubmit={handleSubmitTyping}
        session={screenState.session}
        settings={persistedState.settings}
      />
    );
  }

  if (screenState.name === "results") {
    return (
      <ResultsScreen
        totalCards={hsk1Cards.length}
        summary={screenState.summary}
        onRestart={() => setScreenState({ name: "home" })}
      />
    );
  }

  return (
    <HomeScreen
      totalCards={hsk1Cards.length}
      mistakeCards={mistakeCards}
      progress={persistedState.progress}
      settings={persistedState.settings}
      onRoundSizeChange={(value) =>
        handleSettingsChange({ ...persistedState.settings, roundSize: value })
      }
      onToggleSetting={(key) =>
        handleSettingsChange({
          ...persistedState.settings,
          [key]: !persistedState.settings[key],
        })
      }
      onStart={handleStart}
    />
  );
}
