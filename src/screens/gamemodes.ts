export type GameMode = "normal" | "hotcold";

export type HintStyle = "distance" | "color";

export type GameStatus = "idle" | "playing" | "won" | "lost";

export interface CountryFeature {
  properties: {
    ADMIN: string;
    ISO_A2: string;
    LABEL_X: number;
    LABEL_Y: number;
  };
  geometry: object;
}

export interface Guess {
  country: CountryFeature;
  distanceKm: number;
  bearingDeg: number;
}

export interface GuessSettings {
  maxGuesses: number;
  hintStyle: HintStyle;
  hintsEnabled: boolean;
}
