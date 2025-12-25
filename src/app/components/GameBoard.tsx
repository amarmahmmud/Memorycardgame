import { useState, useEffect, useCallback } from "react";
import { MemoryCard } from "./MemoryCard";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

interface Pair {
  id: string;
  arabicWord: string;
  amharicWord: string;
  imageUrl?: string | null;
}

interface Card {
  id: string;
  pairId: string;
  content: string;
  type: "arabic" | "amharic" | "image";
  imageUrl?: string | null;
}

interface GameBoardProps {
  pairs: Pair[];
  gameMode: "single" | "two";
  onGameEnd: (winner: string, scores: { player1: number; player2?: number }) => void;
}

export function GameBoard({ pairs, gameMode, onGameEnd }: GameBoardProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameActive, setIsGameActive] = useState(true);
  const [botMemory, setBotMemory] = useState<Map<string, string>>(new Map());

  // Initialize cards from pairs
  useEffect(() => {
    const newCards: Card[] = [];
    pairs.forEach((pair) => {
      // Add Arabic card
      newCards.push({
        id: `${pair.id}-arabic`,
        pairId: pair.id,
        content: pair.arabicWord,
        type: "arabic",
      });

      // Add Amharic card or Image card
      if (pair.imageUrl) {
        newCards.push({
          id: `${pair.id}-image`,
          pairId: pair.id,
          content: pair.arabicWord,
          type: "image",
          imageUrl: pair.imageUrl,
        });
      } else {
        newCards.push({
          id: `${pair.id}-amharic`,
          pairId: pair.id,
          content: pair.amharicWord,
          type: "amharic",
        });
      }
    });

    // Shuffle cards
    const shuffled = newCards.sort(() => Math.random() - 0.5);
    setCards(shuffled);
  }, [pairs]);

  // Timer
  useEffect(() => {
    if (!isGameActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTurnEnd();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentPlayer, isGameActive]);

  // Check if game is complete
  useEffect(() => {
    if (matchedPairs.length === pairs.length && matchedPairs.length > 0) {
      setIsGameActive(false);
      const winner =
        gameMode === "single"
          ? "ተጫዋች"
          : scores.player1 > scores.player2
          ? "ተጫዋች 1"
          : scores.player2 > scores.player1
          ? "ተጫዋች 2"
          : "አቻ";
      
      setTimeout(() => {
        onGameEnd(winner, scores);
      }, 1000);
    }
  }, [matchedPairs, pairs.length, gameMode, scores, onGameEnd]);

  const handleTurnEnd = useCallback(() => {
    if (gameMode === "two") {
      setCurrentPlayer((prev) => (prev === 1 ? 2 : 1));
      setTimeLeft(60);
    }
  }, [gameMode]);

  const handleCardClick = useCallback(
    (cardId: string) => {
      if (!isGameActive) return;
      if (flippedCards.length >= 2) return;
      if (flippedCards.includes(cardId)) return;
      if (matchedPairs.some((pairId) => cardId.startsWith(pairId))) return;

      const newFlipped = [...flippedCards, cardId];
      setFlippedCards(newFlipped);

      // Store in bot memory (with 50% chance)
      if (gameMode === "single" && currentPlayer === 1 && Math.random() > 0.5) {
        const card = cards.find((c) => c.id === cardId);
        if (card) {
          setBotMemory((prev) => new Map(prev).set(cardId, card.pairId));
        }
      }

      if (newFlipped.length === 2) {
        const [firstId, secondId] = newFlipped;
        const firstCard = cards.find((c) => c.id === firstId);
        const secondCard = cards.find((c) => c.id === secondId);

        if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
          // Match!
          setTimeout(() => {
            setMatchedPairs((prev) => [...prev, firstCard.pairId]);
            setFlippedCards([]);
            setScores((prev) => ({
              ...prev,
              [`player${currentPlayer}`]: prev[`player${currentPlayer}`] + 1,
            }));
            
            // Play success sound
            const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi77eeeTRAMUKjk77RgGwU7k9nyz3suBSh+zPLaizsIHGrA7OSYThELTKXj8bllHAU6ktjyz30vBSh+zPLaizsIHGrA7OSYThELTKXj8bllHAU7k9nyz3suBSh+zPLaizsIHGrA7OSYThELTKXj8bllHAU6ktjyz30vBSh+zPLaizsIHGrA7OSYThELTKXj8bllHAU7k9nyz3suBSh+zPLaizsIHGrA7OSYThELTKXj8bllHAU6ktjyz30vBSh+zPLaizsIHGrA7OSYThELTKXj8bllHAU7k9nyz3suBSh+zPLaizsIHGrA7OSYThELTKXj8bllHAU6ktjyz30vBSh+zPLaizsIHGrA7OSYThELTKXj8bllHAU7k9nyz3suBSh+zPLaizsIHGrA7OSYThELTKXj8bllHAU6ktjyz30vBSh+zPLaizsIHGrA7OSYThELTKXj8bllHAU7k9nyz3suBQ==");
            audio.play().catch(() => {});
            
            toast.success("ተገኘ ጥንድ!", {
              duration: 2000,
            });
          }, 500);
        } else {
          // No match
          setTimeout(() => {
            setFlippedCards([]);
            handleTurnEnd();
            
            // Play failure sound
            const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi77eeeTRAMUKjk77RgGwU7k9nyz3suBSh+zPLaizsIHGrA7OSYThELTKXj8bllHAU6ktjyz30vBSh+zPLaizsIHGrA7OSYThELTKXj8bllHAU7k9nyz3suBSh+zPLaizsIHGrA7OSYThELTKXj8bllHAU6ktjyz30vBSh+zPLaizsIHGrA7OSYThELTKXj8bllHAU7k9nyz3suBSh+zPLaizsIHGrA7OSYThELTKXj8bllHAU6ktjyz30vBSh+zPLaizsIHGrA7OSYThELTKXj8bllHAU7k9nyz3suBSh+zPLaizsIHGrA7OSYThELTKXj8bllHAU6ktjyz30vBSh+zPLaizsIHGrA7OSYThELTKXj8bllHAU7k9nyz3suBSh+zPLaizsIHGrA7OSYThELTKXj8bllHAU6ktjyz30vBQ==");
            audio.play().catch(() => {});
          }, 1000);
        }
      }
    },
    [flippedCards, matchedPairs, cards, currentPlayer, gameMode, isGameActive, handleTurnEnd]
  );

  // Bot turn
  useEffect(() => {
    if (gameMode === "single" && currentPlayer === 2 && isGameActive && flippedCards.length === 0) {
      setTimeout(() => {
        // Bot logic: try to use memory or pick random
        const availableCards = cards.filter(
          (card) =>
            !matchedPairs.some((pairId) => card.id.startsWith(pairId)) &&
            !flippedCards.includes(card.id)
        );

        if (availableCards.length < 2) return;

        // Try to find a match using memory
        let firstCard = availableCards[Math.floor(Math.random() * availableCards.length)];
        let secondCard = availableCards.find(
          (card) =>
            card.id !== firstCard.id &&
            card.pairId === firstCard.pairId &&
            botMemory.get(card.id) === firstCard.pairId
        );

        if (!secondCard) {
          // Pick random second card
          const remaining = availableCards.filter((card) => card.id !== firstCard.id);
          secondCard = remaining[Math.floor(Math.random() * remaining.length)];
        }

        if (firstCard && secondCard) {
          handleCardClick(firstCard.id);
          setTimeout(() => {
            handleCardClick(secondCard.id);
          }, 800);
        }
      }, 1500);
    }
  }, [currentPlayer, gameMode, isGameActive, flippedCards, cards, matchedPairs, botMemory, handleCardClick]);

  return (
    <div className="flex flex-col items-center gap-6 p-4 md:p-8">
      {/* Score and Timer */}
      <div className="w-full max-w-4xl flex justify-between items-center bg-white rounded-xl shadow-lg p-4">
        <div className="flex gap-8">
          <div className="text-center">
            <div className="text-sm text-gray-600">
              {gameMode === "single" ? "ተጫዋች" : "ተጫዋች 1"}
            </div>
            <div className="text-2xl">{scores.player1}</div>
          </div>
          {gameMode === "two" && (
            <div className="text-center">
              <div className="text-sm text-gray-600">ተጫዋች 2</div>
              <div className="text-2xl">{scores.player2}</div>
            </div>
          )}
        </div>

        <div className="text-center">
          <div className="text-sm text-gray-600">ጊዜ</div>
          <motion.div
            className="text-2xl font-bold"
            animate={{
              color: timeLeft < 10 ? "#ef4444" : "#10b981",
            }}
          >
            {timeLeft}s
          </motion.div>
        </div>

        <div className="text-center">
          <div className="text-sm text-gray-600">ተራ</div>
          <div className="text-xl">
            {gameMode === "single"
              ? currentPlayer === 1
                ? "ተጫዋች"
                : "ቦት"
              : `ተጫዋች ${currentPlayer}`}
          </div>
        </div>
      </div>

      {/* Game Grid */}
      <div 
        className={`w-full max-w-4xl grid gap-4 ${
          cards.length <= 8 
            ? "grid-cols-2 md:grid-cols-4" 
            : cards.length <= 12 
            ? "grid-cols-3 md:grid-cols-4" 
            : "grid-cols-3 md:grid-cols-5"
        }`}
      >
        <AnimatePresence>
          {cards.map((card) => (
            <MemoryCard
              key={card.id}
              id={card.id}
              content={card.content}
              isImage={card.type === "image"}
              imageUrl={card.imageUrl}
              isFlipped={flippedCards.includes(card.id)}
              isMatched={matchedPairs.some((pairId) => card.id.startsWith(pairId))}
              onClick={() => handleCardClick(card.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}