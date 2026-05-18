import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Location, NormalizedWeather } from "@/types/weather";
import { fetchWeather } from "@/lib/weather";

export type Unit = "C" | "F";
export type Status = "idle" | "loading" | "ready" | "error";

interface RecentSearch {
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

interface WeatherState {
  // Persisted
  unit: Unit;
  audioEnabled: boolean;
  recent: RecentSearch[];

  // Not persisted
  location: Location | null;
  weather: NormalizedWeather | null;
  status: Status;
  error: string | null;

  // Actions
  setUnit: (u: Unit) => void;
  toggleAudio: () => void;
  loadWeather: (loc: Location) => Promise<void>;
  clearError: () => void;
}

const MAX_RECENT = 6;

export const useWeatherStore = create<WeatherState>()(
  persist(
    (set, get) => ({
      unit: "C",
      audioEnabled: false,
      recent: [],

      location: null,
      weather: null,
      status: "idle",
      error: null,

      setUnit: (u) => set({ unit: u }),
      toggleAudio: () => set({ audioEnabled: !get().audioEnabled }),
      clearError: () => set({ error: null }),

      loadWeather: async (loc) => {
        set({ status: "loading", error: null, location: loc });
        try {
          const data = await fetchWeather(loc.latitude, loc.longitude);
          // Add to recent searches (dedupe by lat/lon rounded)
          const key = (l: RecentSearch) =>
            `${l.latitude.toFixed(2)},${l.longitude.toFixed(2)}`;
          const incoming: RecentSearch = {
            name: loc.name,
            admin1: loc.admin1,
            country: loc.country,
            latitude: loc.latitude,
            longitude: loc.longitude,
          };
          const filtered = get().recent.filter((r) => key(r) !== key(incoming));
          const next = [incoming, ...filtered].slice(0, MAX_RECENT);
          set({ weather: data, status: "ready", recent: next });
        } catch (e) {
          const message = e instanceof Error ? e.message : "Failed to load weather.";
          set({ status: "error", error: message });
        }
      },
    }),
    {
      name: "atmos-weather-store",
      partialize: (s) => ({ unit: s.unit, audioEnabled: s.audioEnabled, recent: s.recent }),
    }
  )
);
