import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { proximityToColor, distanceToProximity } from "@/lib/haversine";
import type { Guess, GameStatus, HotColdSettings } from "./gamemodes";

interface GuessHistoryProps {
  guesses: Guess[];
  gameStatus: GameStatus;
  settings: HotColdSettings;
  targetName: string | null;
  panelOpen: boolean;
  onTogglePanel: () => void;
  onPlayAgain: () => void;
}

function GuessHistory({
  guesses,
  gameStatus,
  settings,
  targetName,
  panelOpen,
  onTogglePanel,
  onPlayAgain,
}: GuessHistoryProps) {
  const isGameOver = gameStatus === "won" || gameStatus === "lost";

  return (
    <div
      className={`absolute top-32 bottom-4 z-10 flex transition-all duration-300 ${
        panelOpen ? "right-4" : "-right-87.5"
      }`}
    >
      <Button
        size="icon"
        variant="ghost"
        className="mt-2 h-10 w-6 cursor-pointer rounded-r-none rounded-l-md bg-white shadow-lg"
        onClick={onTogglePanel}
      >
        {panelOpen ? <ChevronRight /> : <ChevronLeft />}
      </Button>
      <div className="flex w-87.5 flex-col rounded-lg bg-white p-4 shadow-lg">
        <h2 className="text-lg font-semibold">
          Guesses ({guesses.length} / {settings.maxGuesses})
        </h2>

        {isGameOver && (
          <div className="mt-3 rounded-md border p-3 text-center">
            <p className="font-semibold">
              {gameStatus === "won" ? "You found it!" : "Out of guesses!"}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              The answer was <span className="font-bold">{targetName}</span>
            </p>
            <Button
              className="mt-2 w-full cursor-pointer"
              onClick={onPlayAgain}
            >
              Play Again
            </Button>
          </div>
        )}

        <div className="mt-3 flex flex-col gap-1.5 overflow-y-auto">
          {[...guesses].reverse().map((guess, i) => (
            <div
              key={guesses.length - 1 - i}
              className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
            >
              <span>{guess.country.properties.ADMIN}</span>
              {settings.hintsEnabled && settings.hintStyle === "distance" && (
                <span className="text-gray-500">
                  {Math.round(guess.distanceKm).toLocaleString()} km
                </span>
              )}
              {settings.hintsEnabled && settings.hintStyle === "color" && (
                <span
                  className="inline-block h-4 w-4 rounded-full"
                  style={{
                    backgroundColor: proximityToColor(
                      distanceToProximity(guess.distanceKm),
                    ),
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GuessHistory;
