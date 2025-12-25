import { useState, useEffect } from "react";
import { GameBoard } from "./components/GameBoard";
import { AdminPage } from "./components/AdminPage";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";
import { toast, Toaster } from "sonner";
import { motion } from "motion/react";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

interface Pair {
  id: string;
  arabicWord: string;
  amharicWord: string;
  imageUrl?: string | null;
}

interface Level {
  id: string;
  name: string;
  pairs: Pair[];
}

type GameMode = "single" | "two";
type Screen = "menu" | "levelSelect" | "game" | "admin" | "gameEnd";

export default function App() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [gameMode, setGameMode] = useState<GameMode>("single");
  const [levels, setLevels] = useState<Level[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [gameResult, setGameResult] = useState<{
    winner: string;
    scores: { player1: number; player2?: number };
  } | null>(null);

  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e2ec6e19`;

  useEffect(() => {
    initializeDemo();
  }, []);

  const initializeDemo = async () => {
    try {
      const response = await fetch(`${apiUrl}/init-demo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });
      const data = await response.json();
      console.log("Demo initialized:", data);
    } catch (error) {
      console.error("Error initializing demo:", error);
    }
  };

  const fetchLevels = async () => {
    try {
      const response = await fetch(`${apiUrl}/levels`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });
      const data = await response.json();
      setLevels(data.levels || []);
    } catch (error) {
      console.error("Error fetching levels:", error);
      toast.error("Failed to load levels");
    }
  };

  const handleStartGame = (mode: GameMode) => {
    setGameMode(mode);
    fetchLevels();
    setScreen("levelSelect");
  };

  const handleLevelSelect = (level: Level) => {
    setSelectedLevel(level);
    setScreen("game");
  };

  const handleGameEnd = (
    winner: string,
    scores: { player1: number; player2?: number }
  ) => {
    setGameResult({ winner, scores });
    setScreen("gameEnd");
  };

  const handleBackToMenu = () => {
    setScreen("menu");
    setSelectedLevel(null);
    setGameResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <Toaster position="top-center" richColors />

      {/* Main Menu */}
      {screen === "menu" && (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-8"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-green-700 mb-2">
              የማስታወስ ጨዋታ
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              አረብኛ - አማርኛ ትርጉም ጨዋታ
            </p>

            <div className="space-y-4 w-full max-w-md">
              <Button
                onClick={() => handleStartGame("single")}
                className="w-full py-6 text-xl bg-green-600 hover:bg-green-700"
              >
                1 ተጫዋች (ከቦት ጋር)
              </Button>
              <Button
                onClick={() => handleStartGame("two")}
                className="w-full py-6 text-xl bg-blue-600 hover:bg-blue-700"
              >
                2 ተጫዋቾች
              </Button>
              <Button
                onClick={() => setScreen("admin")}
                variant="outline"
                className="w-full py-6 text-xl"
              >
                የአስተዳደር ገጽ
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Level Selection */}
      {screen === "levelSelect" && (
        <div className="min-h-screen p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">ደረጃ ይምረጡ</h1>
              <Button onClick={handleBackToMenu} variant="outline">
                ተመለስ
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {levels.map((level) => (
                <motion.div
                  key={level.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleLevelSelect(level)}
                  >
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-bold mb-2">
                        {level.name}
                      </h2>
                      <p className="text-gray-600">
                        {level.pairs.length} ጥንዶች
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {levels.length === 0 && (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600 mb-4">
                  ምንም ደረጃዎች አልተገኙም
                </p>
                <Button onClick={() => setScreen("admin")}>
                  የአስተዳደር ገጽ
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Game */}
      {screen === "game" && selectedLevel && (
        <div className="min-h-screen">
          <div className="p-4 flex justify-between items-center bg-white shadow">
            <h2 className="text-2xl font-bold">{selectedLevel.name}</h2>
            <Button onClick={handleBackToMenu} variant="outline" size="sm">
              ውጣ
            </Button>
          </div>
          <GameBoard
            pairs={selectedLevel.pairs}
            gameMode={gameMode}
            onGameEnd={handleGameEnd}
          />
        </div>
      )}

      {/* Game End */}
      {screen === "gameEnd" && gameResult && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-6"
          >
            <Card className="p-8">
              <CardContent className="space-y-4">
                <h1 className="text-4xl font-bold text-green-700 mb-4">
                  🎉 ጨዋታ ተጠናቋል! 🎉
                </h1>
                <div className="text-2xl">
                  አሸናፊ: <span className="font-bold">{gameResult.winner}</span>
                </div>
                <div className="space-y-2 text-xl">
                  <div>ተጫዋች 1: {gameResult.scores.player1} ነጥቦች</div>
                  {gameResult.scores.player2 !== undefined && (
                    <div>ተጫዋች 2: {gameResult.scores.player2} ነጥቦች</div>
                  )}
                </div>
                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={() => {
                      setScreen("game");
                      setGameResult(null);
                    }}
                    className="flex-1"
                  >
                    እንደገና ጫወት
                  </Button>
                  <Button onClick={handleBackToMenu} variant="outline" className="flex-1">
                    ዋና ምናሌ
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Admin Page */}
      {screen === "admin" && (
        <AdminPage apiUrl={apiUrl} onBack={handleBackToMenu} />
      )}
    </div>
  );
}