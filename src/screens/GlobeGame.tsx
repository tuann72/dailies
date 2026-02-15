import { useState, useEffect, useRef } from "react";
import Globe from "react-globe.gl";
import type { GlobeMethods } from "react-globe.gl";
import "./GlobeGame.css";
import { Button } from "@/components/ui/button";
import { House, ChevronRight } from "lucide-react";
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

import type { GameMode } from "./gamemodes";

function GlobeGame({ onHome }: { onHome: () => void }) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [countries, setCountries] = useState<{ features: object[] }>({
    features: [],
  });
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [focused, setFocused] = useState(false);
  const [highlightedCountry, setHighlightedCountry] = useState("");

  const handleSubmit = () => {
    if (selectedCountry) {
      if ((gameMode ?? "normal") === "normal") {
        setHighlightedCountry(selectedCountry);

        const feature = countries.features.find(
          (f) =>
            (f as { properties: { ADMIN: string } }).properties.ADMIN ===
            selectedCountry,
        ) as { properties: { LABEL_Y: number; LABEL_X: number } } | undefined;

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
      }
      setSearch("");
      setSelectedCountry("");
    }
  };

  const countryNames = countries.features.map(
    (f) => (f as { properties: { ADMIN: string } }).properties.ADMIN,
  );

  useEffect(() => {
    fetch("/ne_50m_admin_0_countries.geojson")
      .then((res) => res.json())
      .then(setCountries);
  }, []);

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
          onValueChange={(v) => setGameMode(v as GameMode)}
        >
          <SelectTrigger className="bg-white cursor-pointer">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="hotcold">Hot/Cold</SelectItem>
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
      <Globe
        ref={globeRef}
        globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png"
        polygonsData={countries.features.filter(
          (d) =>
            (d as { properties: { ISO_A2: string } }).properties.ISO_A2 !==
            "AQ",
        )}
        polygonAltitude={0.01}
        polygonCapColor={(obj: object) => {
          const name = (obj as { properties: { ADMIN: string } }).properties
            .ADMIN;
          return (gameMode ?? "normal") === "normal" &&
            name === highlightedCountry
            ? "#f97316"
            : "#ffffff";
        }}
        polygonSideColor={() => "rgba(0, 100, 0, 0.15)"}
        polygonStrokeColor={() => "#111"}
        polygonLabel={(obj: object) => {
          const d = (obj as { properties: { ADMIN: string } }).properties;
          return `<b>${d.ADMIN}</b>`;
        }}
      />
    </div>
  );
}

export default GlobeGame;
