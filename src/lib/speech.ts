import type { Card, CardSyllable } from "../types/cards";

function getSpeechSynthesis() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return null;
  }

  return window.speechSynthesis;
}

function chooseChineseVoice(utterance: SpeechSynthesisUtterance) {
  const speechSynthesis = getSpeechSynthesis();

  if (!speechSynthesis || typeof speechSynthesis.getVoices !== "function") {
    return;
  }

  const voices = speechSynthesis.getVoices();
  const chineseVoice = voices.find((voice) =>
    /^zh(-|_)/i.test(voice.lang) || /mandarin|chinese|putonghua/i.test(voice.name),
  );

  if (chineseVoice) {
    utterance.voice = chineseVoice;
  }
}

export function buildSpeechTextFromCard(card: Card) {
  const text = card.syllables
    .map((syllable) => syllable.hanzi || syllable.prompt || "")
    .join("");

  return text.trim() || card.hanzi.trim();
}

export function buildSpeechTextFromSyllable(syllable: CardSyllable) {
  return (syllable.hanzi || syllable.prompt || "").trim();
}

export function speakChineseText(text: string) {
  const speechSynthesis = getSpeechSynthesis();
  const trimmedText = text.trim();

  if (!speechSynthesis || trimmedText.length === 0) {
    return false;
  }

  const utterance = new SpeechSynthesisUtterance(trimmedText);
  utterance.lang = "zh-CN";
  utterance.rate = 0.9;
  utterance.pitch = 1;
  chooseChineseVoice(utterance);

  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);

  return true;
}

export function stopChineseSpeech() {
  const speechSynthesis = getSpeechSynthesis();

  if (!speechSynthesis) {
    return;
  }

  speechSynthesis.cancel();
}
