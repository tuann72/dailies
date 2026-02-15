import { useState, useEffect, useRef, useCallback } from "react";
import Globe from "react-globe.gl";
import type { GlobeMethods } from "react-globe.gl";
import "./GlobeGame.css";
import { Button } from "@/components/ui/button";
import { House, ChevronRight, ChevronLeft } from "lucide-react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type {
  GameMode,
  GuessSettings,
  GameStatus,
  CountryFeature,
  Guess,
} from "./gamemodes";
import GuessSettingsPanel from "./GuessSettings";
import GuessHistory from "./GuessHistory";
import {
  haversineDistanceKm,
  bearingDeg,
  distanceToProximity,
  proximityToColor,
} from "@/lib/haversine";

function GlobeGame({ onHome }: { onHome: () => void }) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [countries, setCountries] = useState<{ features: CountryFeature[] }>({
    features: [],
  });
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [focused, setFocused] = useState(false);
  const [highlightedCountry, setHighlightedCountry] = useState("");
  const [panelOpen, setPanelOpen] = useState(true);
  const [guessSettings, setGuessSettings] = useState<GuessSettings>({
    maxGuesses: 10,
    hintStyle: "distance",
    hintsEnabled: true,
  });

  // Hot/Cold game state
  const [gameStatus, setGameStatus] = useState<GameStatus>("idle");
  const [targetCountry, setTargetCountry] = useState<CountryFeature | null>(
    null,
  );
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  const nonAntarcticaCountries = countries.features.filter(
    (f) => f.properties.ISO_A2 !== "AQ",
  );

  const startNewGame = useCallback(() => {
    const eligible = nonAntarcticaCountries;
    if (eligible.length === 0) return;
    const target = eligible[Math.floor(Math.random() * eligible.length)];
    setTargetCountry(target);
    setGuesses([]);
    setGameStatus("playing");
    setPanelOpen(false);
    setRightPanelOpen(true);
  }, [nonAntarcticaCountries]);

  const handleSubmit = () => {
    if (!selectedCountry) return;

    if ((gameMode ?? "normal") === "normal") {
      setHighlightedCountry(selectedCountry);
      const feature = countries.features.find(
        (f) => f.properties.ADMIN === selectedCountry,
      );
      if (feature) {
        globeRef.current?.pointOfView(
          {
            lat: feature.properties.LABEL_Y,
            lng: feature.properties.LABEL_X,
            altitude: 2,
          },
          1000,
        );
      }
    } else if (gameMode === "hotcold") {
      if (gameStatus !== "playing" || !targetCountry) {
        setSearch("");
        setSelectedCountry("");
        return;
      }

      // Skip duplicate guesses
      if (guesses.some((g) => g.country.properties.ADMIN === selectedCountry)) {
        setSearch("");
        setSelectedCountry("");
        return;
      }

      const feature = countries.features.find(
        (f) => f.properties.ADMIN === selectedCountry,
      );
      if (!feature) {
        setSearch("");
        setSelectedCountry("");
        return;
      }

      const distanceKm = haversineDistanceKm(
        feature.properties,
        targetCountry.properties,
      );
      const bearing = bearingDeg(feature.properties, targetCountry.properties);
      const newGuess: Guess = { country: feature, distanceKm, bearingDeg: bearing };
      const newGuesses = [...guesses, newGuess];
      setGuesses(newGuesses);

      // Pan to guessed country
      globeRef.current?.pointOfView(
        {
          lat: feature.properties.LABEL_Y,
          lng: feature.properties.LABEL_X,
          altitude: 2,
        },
        1000,
      );

      // Win/loss checks
      if (feature.properties.ADMIN === targetCountry.properties.ADMIN) {
        setGameStatus("won");
      } else if (guessSettings.maxGuesses !== 21 && newGuesses.length >= guessSettings.maxGuesses) {
        setGameStatus("lost");
        // Pan to the correct answer
        globeRef.current?.pointOfView(
          {
            lat: targetCountry.properties.LABEL_Y,
            lng: targetCountry.properties.LABEL_X,
            altitude: 2,
          },
          1000,
        );
      }
    }

    setSearch("");
    setSelectedCountry("");
  };

  const guessedNames = new Set(guesses.map((g) => g.country.properties.ADMIN));
  const countryNames = countries.features
    .map((f) => f.properties.ADMIN)
    .filter((name) => !guessedNames.has(name));


  useEffect(() => {
    fetch("/ne_50m_admin_0_countries.geojson")
      .then((res) => res.json())
      .then(setCountries);
  }, []);

  // Compute polygons data
  const getPolygonsData = () => {
    if (gameMode === "hotcold" && gameStatus === "playing") {
      return guesses.map((g) => g.country);
    }
    if (
      gameMode === "hotcold" &&
      (gameStatus === "won" || gameStatus === "lost")
    ) {
      const guessedCountries = guesses.map((g) => g.country);
      // Reveal target if not already guessed
      if (
        targetCountry &&
        !guesses.some(
          (g) =>
            g.country.properties.ADMIN === targetCountry.properties.ADMIN,
        )
      ) {
        return [...guessedCountries, targetCountry];
      }
      return guessedCountries;
    }
    // Hot/cold idle: show nothing until game starts
    if (gameMode === "hotcold") {
      return [];
    }
    // Normal mode: show all non-Antarctica
    return nonAntarcticaCountries;
  };

  // Compute polygon cap color
  const getPolygonCapColor = (obj: object) => {
    const feature = obj as CountryFeature;
    const name = feature.properties.ADMIN;

    if (gameMode === "hotcold") {
      // Target country on game over: green
      if (
        (gameStatus === "won" || gameStatus === "lost") &&
        targetCountry &&
        name === targetCountry.properties.ADMIN
      ) {
        return "#22c55e";
      }

      const guess = guesses.find((g) => g.country.properties.ADMIN === name);
      if (guess && guessSettings.hintsEnabled && guessSettings.hintStyle === "color") {
        return proximityToColor(distanceToProximity(guess.distanceKm));
      }

      // Distance mode or no hints: neutral gray
      return "#d1d5db";
    }

    // Normal mode
    return name === highlightedCountry ? "#f97316" : "#ffffff";
  };

  return (
    <div className="globe-container relative">
      <Button
        size="icon"
        className="absolute top-4 right-4 z-10 cursor-pointer"
        onClick={onHome}
      >
        <House />
      </Button>
      <div className="absolute top-32 left-1/2 z-10 flex -translate-x-1/2 items-start gap-2">
        <Select
          value={gameMode ?? "normal"}
          onValueChange={(v) => {
            const mode = v as GameMode;
            setGameMode(mode);
            if (mode !== "hotcold") {
              setGameStatus("idle");
              setTargetCountry(null);
              setGuesses([]);
            }
          }}
        >
          <SelectTrigger className="bg-white cursor-pointer">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="hotcold">Guess</SelectItem>
          </SelectContent>
        </Select>
        <Command className="h-fit w-80">
          <CommandInput
            placeholder="Enter country name..."
            value={search}
            onValueChange={setSearch}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 100)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
          />
          {focused && (
            <CommandList className="max-h-30">
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {countryNames.map((name) => (
                  <CommandItem
                    key={name}
                    value={name}
                    onSelect={(value) => {
                      setSearch(value);
                      setSelectedCountry(value);
                      setFocused(false);
                    }}
                  >
                    {name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          )}
        </Command>
        <Button size="icon" className="cursor-pointer" onClick={handleSubmit}>
          <ChevronRight />
        </Button>
      </div>
      {gameMode && gameMode !== "normal" && (
        <div
          className={`absolute top-32 bottom-4 z-10 flex transition-all duration-300 ${
            panelOpen ? "left-4" : "-left-87.5"
          }`}
        >
          <div className="w-87.5 rounded-lg bg-white p-4 shadow-lg">
            <h2 className="text-lg font-semibold capitalize">
              {gameMode === "hotcold" ? "Guess" : gameMode}
            </h2>
            {gameMode === "hotcold" && (
              <GuessSettingsPanel
                settings={guessSettings}
                onSettingsChange={setGuessSettings}
                onNewGame={startNewGame}
                gameStatus={gameStatus}
              />
            )}
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="mt-2 h-10 w-6 cursor-pointer rounded-l-none rounded-r-md bg-white shadow-lg"
            onClick={() => setPanelOpen(!panelOpen)}
          >
            {panelOpen ? <ChevronLeft /> : <ChevronRight />}
          </Button>
        </div>
      )}
      {gameMode === "hotcold" && gameStatus !== "idle" && (
        <GuessHistory
          guesses={guesses}
          gameStatus={gameStatus}
          settings={guessSettings}
          targetName={targetCountry?.properties.ADMIN ?? null}
          panelOpen={rightPanelOpen}
          onTogglePanel={() => setRightPanelOpen(!rightPanelOpen)}
          onPlayAgain={startNewGame}
        />
      )}
      <Globe
        ref={globeRef}
        backgroundImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png"
        polygonsData={getPolygonsData()}
        polygonAltitude={0.01}
        polygonCapColor={getPolygonCapColor}
        polygonSideColor={() => "rgba(0, 100, 0, 0.15)"}
        polygonStrokeColor={() => "#111"}
        polygonLabel={(obj: object) => {
          const d = (obj as CountryFeature).properties;
          return `<b>${d.ADMIN}</b>`;
        }}
      />
    </div>
  );
}

export default GlobeGame;
