import { plainPinyinFromNumericSyllable } from "../lib/pinyin";
import type { Card } from "../types/cards";

type TonePinyinCardProps = {
  card: Card;
  colorTones: boolean;
  compactSpanish?: boolean;
  hideSpanishLabel?: boolean;
  plainPinyin?: boolean;
  revealSpanish?: boolean;
  showPinyin: boolean;
};

export function TonePinyinCard({
  card,
  colorTones,
  compactSpanish = false,
  hideSpanishLabel = false,
  plainPinyin = false,
  revealSpanish = false,
  showPinyin,
}: TonePinyinCardProps) {
  return (
    <article className="study-card">
      <div className="hanzi-row" aria-label={`Palabra en chino: ${card.hanzi}`}>
        {card.syllables.map((syllable, index) => (
          <div
            className="syllable-block"
            key={`${card.id}-${index}-${syllable.hanzi}-${syllable.pinyinNumber}`}
          >
            <span className="hanzi-char">{syllable.hanzi || syllable.prompt}</span>
            {showPinyin ? (
              <span
                className={`pinyin ${plainPinyin ? "pinyin-plain" : ""}`}
                data-tone={colorTones ? syllable.tone : 0}
              >
                {plainPinyin
                  ? plainPinyinFromNumericSyllable(syllable.pinyinNumber)
                  : syllable.pinyinDisplay}
              </span>
            ) : (
              <span className="pinyin pinyin-hidden">pinyin oculto</span>
            )}
          </div>
        ))}
      </div>

      {revealSpanish ? (
        <div
          className={`spanish-side ${compactSpanish ? "spanish-side-compact" : ""}`}
        >
          {hideSpanishLabel ? null : <span className="label">Castellano</span>}
          <strong>{card.spanish}</strong>
        </div>
      ) : null}
    </article>
  );
}
