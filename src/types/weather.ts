// Normalized weather data shape — all providers map into this.

export type WeatherFamily =
  | "clear"
  | "cloudy"
  | "rain"
  | "snow"
  | "storm"
  | "fog";

export interface NormalizedCondition {
  family: WeatherFamily;
  label: string; // human-readable e.g. "Partly cloudy"
  icon: string;  // emoji or short token used by WeatherIcon component
  isDay: boolean;
}

export interface NormalizedCurrent {
  time: string;          // ISO
  tempC: number;
  feelsC: number;
  humidity: number;      // %
  windKmh: number;
  windDeg: number;
  pressureHpa?: number;
  uvIndex?: number;
  condition: NormalizedCondition;
  sunrise: string;       // ISO
  sunset: string;        // ISO
}

export interface NormalizedHour {
  time: string;          // ISO
  tempC: number;
  condition: NormalizedCondition;
  precipProb: number;    // %
}

export interface NormalizedDay {
  date: string;          // ISO (date only)
  minC: number;
  maxC: number;
  condition: NormalizedCondition;
  precipMm: number;
  sunrise: string;       // ISO
  sunset: string;        // ISO
}

export interface NormalizedWeather {
  current: NormalizedCurrent;
  hourly: NormalizedHour[];  // next 24
  daily: NormalizedDay[];    // 7 days
}

export interface Location {
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}
