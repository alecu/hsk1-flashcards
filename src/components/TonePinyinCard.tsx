import type { Card } from "../types/cards";

type TonePinyinCardProps = {
  card: Card;
  colorTones: boolean;
  revealSpanish?: boolean;
  showPinyin: boolean;
};

export function TonePinyinCard({
  card,
  colorTones,
  revealSpanish = false,
  showPinyin,
}: TonePinyinCardProps) {
  return (
    <article className="study-card">
      <div className="hanzi-row" aria-label={`Palabra en chino: ${card.hanzi}`}>
        {card.syllables.map((syllable) => (
          <div className="syllable-block" key={`${card.id}-${syllable.hanzi}`}>
            <span className="hanzi-char">{syllable.hanzi}</span>
            {showPinyin ? (
              <span
                className="pinyin"
                data-tone={colorTones ? syllable.tone : 0}
              >
                {syllable.pinyinDisplay}
              </span>
            ) : (
              <span className="pinyin pinyin-hidden">pinyin oculto</span>
            )}
          </div>
        ))}
      </div>

      {revealSpanish ? (
        <div className="spanish-side">
          <span className="label">Castellano</span>
          <strong>{card.spanish}</strong>
        </div>
      ) : null}
    </article>
  );
}
