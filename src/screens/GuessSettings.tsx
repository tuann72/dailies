import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type {
  GuessSettings as GuessSettingsType,
  HintStyle,
  GameStatus,
} from "./gamemodes";

interface GuessSettingsProps {
  settings: GuessSettingsType;
  onSettingsChange: (settings: GuessSettingsType) => void;
  onNewGame: () => void;
  gameStatus: GameStatus;
}

function GuessSettings({
  settings,
  onSettingsChange,
  onNewGame,
  gameStatus,
}: GuessSettingsProps) {
  return (
    <div className="mt-4 flex flex-col gap-4">
      <Button className="w-full cursor-pointer" onClick={onNewGame}>
        {gameStatus === "playing" ? "Restart" : "New Game"}
      </Button>

      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Enable hints</label>
        <Switch
          checked={settings.hintsEnabled}
          onCheckedChange={(checked) =>
            onSettingsChange({ ...settings, hintsEnabled: checked })
          }
        />
      </div>

      {settings.hintsEnabled && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Hint style</label>
          <Select
            value={settings.hintStyle}
            onValueChange={(v) =>
              onSettingsChange({ ...settings, hintStyle: v as HintStyle })
            }
          >
            <SelectTrigger className="cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="distance">Distance (km)</SelectItem>
              <SelectItem value="color">Color gradient</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">
          Number of guesses: {settings.maxGuesses === 21 ? "Unlimited" : settings.maxGuesses}
        </label>
        <Slider
          min={1}
          max={21}
          step={1}
          value={[settings.maxGuesses]}
          onValueChange={([value]) =>
            onSettingsChange({ ...settings, maxGuesses: value })
          }
        />
      </div>
    </div>
  );
}

export default GuessSettings;
