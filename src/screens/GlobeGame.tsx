import { useState, useEffect } from "react";
import Globe from "react-globe.gl";
import "./GlobeGame.css";
import { Button } from "@/components/ui/button";
import { House, Send } from "lucide-react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

function GlobeGame({ onHome }: { onHome: () => void }) {
  const [countries, setCountries] = useState<{ features: object[] }>({
    features: [],
  });
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [focused, setFocused] = useState(false);

  const countryNames = countries.features.map(
    (f) => (f as { properties: { ADMIN: string } }).properties.ADMIN,
  );


  useEffect(() => {
    fetch("/ne_110m_admin_0_countries.geojson")
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
      <Command className="h-fit w-80">
        <CommandInput
          placeholder="Enter country name..."
          value={search}
          onValueChange={setSearch}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 100)}
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
      <Button
        size="icon"
        className="cursor-pointer"
        onClick={() => {
          if (selectedCountry) {
            console.log("Submitted:", selectedCountry);
          }
        }}
      >
        <Send />
      </Button>
      </div>
      <Globe
        globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png"
        polygonsData={countries.features.filter(
          (d) =>
            (d as { properties: { ISO_A2: string } }).properties.ISO_A2 !==
            "AQ",
        )}
        polygonAltitude={0.01}
        polygonCapColor={() =>
          `#${Math.round(Math.random() * Math.pow(2, 24))
            .toString(16)
            .padStart(6, "0")}`
        }
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
