import type { NormalizedWeather } from "@/types/weather";
import { fetchWeatherOpenMeteo } from "@/lib/providers/openmeteo";
import { fetchWeatherOpenWeatherMap } from "@/lib/providers/openweathermap";

export async function fetchWeather(lat: number, lon: number): Promise<NormalizedWeather> {
  const provider = (import.meta.env.VITE_WEATHER_PROVIDER || "openmeteo").toLowerCase();

  if (provider === "openweathermap") {
    const key = import.meta.env.VITE_OPENWEATHERMAP_API_KEY as string | undefined;
    return fetchWeatherOpenWeatherMap(lat, lon, key ?? "");
  }
  // Default: Open-Meteo (no key needed)
  return fetchWeatherOpenMeteo(lat, lon);
}
