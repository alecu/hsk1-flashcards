import tonePerfectPinyins from "../data/tonePerfectPinyins.json";
import { formatPinyinWithToneMark } from "./pinyin";

const tonePerfectMap = tonePerfectPinyins as Record<string, number[]>;

export function getTonePerfectKey(numericSyllable: string) {
  if (!/[1-4]$/.test(numericSyllable)) {
    return null;
  }

  return formatPinyinWithToneMark(numericSyllable).replace(/[0-5]$/, "");
}

export function getTonePerfectIds(numericSyllable: string) {
  const key = getTonePerfectKey(numericSyllable);

  if (!key) {
    return [];
  }

  return tonePerfectMap[key] ?? [];
}

export function hasTonePerfectAudio(numericSyllable: string) {
  return getTonePerfectIds(numericSyllable).length > 0;
}

export function getTonePerfectUrl(id: number) {
  return `https://tone.lib.msu.edu/tone/${id}/PROXY_MP3/view`;
}

export function chooseRandomTonePerfectId(
  numericSyllable: string,
  randomValue = Math.random,
) {
  const ids = getTonePerfectIds(numericSyllable);

  if (ids.length === 0) {
    return null;
  }

  return ids[Math.floor(randomValue() * ids.length)];
}

export async function playTonePerfectId(id: number) {
  if (typeof Audio === "undefined") {
    return false;
  }

  const audio = new Audio(getTonePerfectUrl(id));

  await new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      audio.onended = null;
      audio.onerror = null;
    };

    audio.onended = () => {
      cleanup();
      resolve();
    };
    audio.onerror = () => {
      cleanup();
      reject(new Error(`No se pudo reproducir el audio Tone Perfect ${id}`));
    };

    audio
      .play()
      .catch((error) => {
        cleanup();
        reject(error);
      });
  });

  return true;
}

export async function playTonePerfectSyllable(numericSyllable: string) {
  const id = chooseRandomTonePerfectId(numericSyllable);

  if (!id) {
    return false;
  }

  return playTonePerfectId(id);
}

export async function playTonePerfectSequence(numericSyllables: string[]) {
  let played = 0;
  let skipped = 0;

  for (const syllable of numericSyllables) {
    if (!hasTonePerfectAudio(syllable)) {
      skipped += 1;
      continue;
    }

    await playTonePerfectSyllable(syllable);
    played += 1;
  }

  return { played, skipped };
}
