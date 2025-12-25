import React, { useEffect, useMemo, useState } from "react";
import levels from "./data/levels";
import Card, { GameCard } from "./components/Card";
import "./App.css";

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(level: typeof levels[number]) {
  const pairs: GameCard[] = [];
  level.cards.forEach((c) => {
    const base = { pairKey: c.pairKey, text: c.text, image: c.image };
    pairs.push({ ...base, uniqueId: `${c.id}-a` });
    pairs.push({ ...base, uniqueId: `${c.id}-b` });
  });
  return shuffle(pairs);
}

export default function App() {
  const [levelId, setLevelId] = useState<number>(levels[0].id);
  const currentLevel = useMemo(
    () => levels.find((l) => l.id === levelId) ?? levels[0],
    [levelId]
  );

  const [deck, setDeck] = useState<GameCard[]>(() => buildDeck(currentLevel));
  useEffect(() => {
    setDeck(buildDeck(currentLevel));
    setFlipped([]);
    setMatched(new Set());
  }, [currentLevel]);

  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (flipped.length === 2) {
      const [a, b] = flipped;
      const cardA = deck.find((c) => c.uniqueId === a)!;
      const cardB = deck.find((c) => c.uniqueId === b)!;
      if (cardA && cardB) {
        if (cardA.pairKey === cardB.pairKey) {
          setMatched((prev) => new Set(prev).add(cardA.pairKey));
        }
        setTimeout(() => setFlipped([]), 700);
      }
    }
  }, [flipped, deck]);

  function handleCardClick(card: GameCard) {
    if (flipped.length >= 2) return;
    if (matched.has(card.pairKey)) return;
    if (flipped.includes(card.uniqueId)) return;
    setFlipped((f) => [...f, card.uniqueId]);
  }

  return (
    <div className="mcg-app">
      <header className="mcg-header">
        <h1>Memory Card Game</h1>
        <div className="mcg-controls">
          <label>
            Level:
            <select
              value={levelId}
              onChange={(e) => setLevelId(Number(e.target.value))}
            >
              {levels.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={() => {
              setDeck(buildDeck(currentLevel));
              setFlipped([]);
              setMatched(new Set());
            }}
          >
            Restart Level
          </button>
        </div>
      </header>

      <main
        className="mcg-board"
        style={{
          gridTemplateColumns: `repeat(${currentLevel.cols}, 1fr)`,
        }}
      >
        {deck.map((c) => (
          <Card
            key={c.uniqueId}
            card={c}
            flipped={flipped.includes(c.uniqueId)}
            matched={matched.has(c.pairKey)}
            onClick={handleCardClick}
          />
        ))}
      </main>
    </div>
  );
}
