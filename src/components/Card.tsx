import React from "react";
import "./Card.css";

export type GameCard = {
  uniqueId: string; // unique per visible card (after duplication)
  pairKey: string; // used to match two cards
  text?: string;
  image?: string;
};

type Props = {
  card: GameCard;
  flipped: boolean;
  matched: boolean;
  onClick: (card: GameCard) => void;
};

export default function Card({ card, flipped, matched, onClick }: Props) {
  const showFront = flipped || matched;

  return (
    <button
      className={`mcg-card ${showFront ? "mcg-card--flipped" : ""} ${
        matched ? "mcg-card--matched" : ""
      }`}
      onClick={() => {
        if (!flipped && !matched) onClick(card);
      }}
      aria-pressed={showFront}
    >
      <div className="mcg-card__inner">
        <div className="mcg-card__front">
          {card.image ? (
            <img src={card.image} alt={card.text ?? "card image"} />
          ) : (
            <div className="mcg-card__text">{card.text}</div>
          )}
        </div>
        <div className="mcg-card__back">
          <div className="mcg-card__back-content">?</div>
        </div>
      </div>
    </button>
  );
}
