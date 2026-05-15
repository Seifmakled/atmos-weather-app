import type { WeatherFamily } from "@/types/weather";

export interface SceneTokens {
  // Background gradient stops
  bg1: string;
  bg2: string;
  bg3: string;
  // Text & UI tokens (RGB triples, used by Tailwind via CSS vars)
  ink: string;        // primary text
  inkSoft: string;    // secondary text
  inkFaint: string;   // tertiary text
  glass: string;      // base for glassmorphism cards
  accent: string;     // accent color (also used for highlights)
  // Atmosphere
  brightness: number; // 0.6 - 1.2 (overall brightness multiplier)
  description: string;
}

const RGB = {
  white: "245 245 250",
  whiteSoft: "215 220 230",
  whiteFaint: "175 180 195",
  warm: "60 40 30",
  warmSoft: "90 65 45",
  warmFaint: "130 100 75",
};

export const SCENES: Record<string, SceneTokens> = {
  clear_day: {
    bg1: "#ff9a5a",
    bg2: "#ffc168",
    bg3: "#ffe7a3",
    ink: "20 20 20",
    inkSoft: "55 55 55",
    inkFaint: "95 95 95",
    glass: "255 250 240",
    accent: "255 215 100",
    brightness: 1.12,
    description: "Sunny",
  },
  clear_night: {
    bg1: "#06122b",
    bg2: "#142244",
    bg3: "#2b3b6e",
    ink: "240 244 255",
    inkSoft: "200 210 230",
    inkFaint: "160 175 200",
    glass: "230 235 255",
    accent: "180 200 240",
    brightness: 0.92,
    description: "Clear night",
  },
  cloudy_day: {
    bg1: "#5d6a7b",
    bg2: "#8896a8",
    bg3: "#bcc6d3",
    ink: "20 20 20",
    inkSoft: "55 55 55",
    inkFaint: "95 95 95",
    glass: "255 255 255",
    accent: "200 210 225",
    brightness: 0.95,
    description: "Cloudy",
  },
  cloudy_night: {
    bg1: "#1a1f2a",
    bg2: "#2d3543",
    bg3: "#4a5462",
    ink: "230 232 240",
    inkSoft: "190 195 210",
    inkFaint: "150 160 175",
    glass: "230 235 245",
    accent: "165 180 200",
    brightness: 0.85,
    description: "Cloudy night",
  },
  rain_day: {
    bg1: "#2c3a4c",
    bg2: "#445870",
    bg3: "#6f8aa5",
    ink: "20 20 20",
    inkSoft: "55 55 55",
    inkFaint: "95 95 95",
    glass: "230 240 255",
    accent: "150 200 245",
    brightness: 0.88,
    description: "Rainy",
  },
  rain_night: {
    bg1: "#0a1422",
    bg2: "#172538",
    bg3: "#2d3f56",
    ink: "220 230 245",
    inkSoft: "175 190 215",
    inkFaint: "140 155 180",
    glass: "210 225 245",
    accent: "130 180 240",
    brightness: 0.78,
    description: "Rainy night",
  },
  snow_day: {
    bg1: "#a6b7c8",
    bg2: "#cdd9e3",
    bg3: "#eaf1f7",
    ink: "20 20 20",
    inkSoft: "55 55 55",
    inkFaint: "95 95 95",
    glass: "255 255 255",
    accent: "120 160 200",
    brightness: 1.0,
    description: "Snowy",
  },
  snow_night: {
    bg1: "#2a3854",
    bg2: "#4a5a78",
    bg3: "#7b8ba8",
    ink: "230 235 245",
    inkSoft: "200 210 225",
    inkFaint: "165 180 200",
    glass: "230 240 255",
    accent: "160 200 240",
    brightness: 0.88,
    description: "Snowy night",
  },
  storm_day: {
    bg1: "#1c1d2b",
    bg2: "#2a2c44",
    bg3: "#4a4d75",
    ink: "20 20 20",
    inkSoft: "55 55 55",
    inkFaint: "95 95 95",
    glass: "230 230 250",
    accent: "200 180 255",
    brightness: 0.75,
    description: "Thunderstorm",
  },
  storm_night: {
    bg1: "#0a0b16",
    bg2: "#16172a",
    bg3: "#2a2c45",
    ink: "230 230 250",
    inkSoft: "180 185 215",
    inkFaint: "140 145 180",
    glass: "210 215 245",
    accent: "180 165 245",
    brightness: 0.7,
    description: "Thunderstorm night",
  },
  fog_day: {
    bg1: "#7d8590",
    bg2: "#a3aab4",
    bg3: "#c8ced6",
    ink: "20 20 20",
    inkSoft: "55 55 55",
    inkFaint: "95 95 95",
    glass: "255 255 255",
    accent: "210 215 225",
    brightness: 0.95,
    description: "Foggy",
  },
  fog_night: {
    bg1: "#1c2128",
    bg2: "#373d46",
    bg3: "#5b626c",
    ink: "230 232 238",
    inkSoft: "185 190 200",
    inkFaint: "145 152 165",
    glass: "225 230 240",
    accent: "180 188 200",
    brightness: 0.82,
    description: "Foggy night",
  },
};

export function getScene(family: WeatherFamily, isDay: boolean): SceneTokens {
  const key = `${family}_${isDay ? "day" : "night"}`;
  return SCENES[key] ?? SCENES.clear_day;
}
