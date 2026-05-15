import type { NormalizedWeather, NormalizedCondition, WeatherFamily } from "@/types/weather";

/**
 * Map OpenWeatherMap "main" + condition id to our family taxonomy.
 * Codes: https://openweathermap.org/weather-conditions
 */
function owmCondition(main: string, id: number, iconCode: string): NormalizedCondition {
  const isDay = iconCode.endsWith("d");
  let family: WeatherFamily = "cloudy";
  let label = main;

  if (id >= 200 && id < 300) { family = "storm"; label = "Thunderstorm"; }
  else if (id >= 300 && id < 400) { family = "rain"; label = "Drizzle"; }
  else if (id >= 500 && id < 600) { family = "rain"; label = "Rain"; }
  else if (id >= 600 && id < 700) { family = "snow"; label = "Snow"; }
  else if (id >= 700 && id < 800) { family = "fog"; label = "Mist"; }
  else if (id === 800)            { family = "clear"; label = isDay ? "Clear sky" : "Clear night"; }
  else if (id > 800 && id < 900)  { family = "cloudy"; label = id === 801 ? "Mainly clear" : "Cloudy"; }

  const icon =
    family === "clear"  ? (isDay ? "sun" : "moon") :
    family === "cloudy" ? (id === 801 ? "partly" : "cloud") :
    family === "rain"   ? (id < 510 ? "drizzle" : "rain") :
    family === "snow"   ? "snow" :
    family === "storm"  ? "storm" : "fog";

  return { family, label, icon, isDay };
}

interface OwmCurrent {
  dt: number;
  temp: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  uvi: number;
  wind_speed: number;
  wind_deg: number;
  sunrise: number;
  sunset: number;
  weather: { id: number; main: string; description: string; icon: string }[];
}
interface OwmHourly extends OwmCurrent { pop: number; }
interface OwmDaily {
  dt: number;
  temp: { min: number; max: number };
  sunrise: number;
  sunset: number;
  pop: number;
  rain?: number;
  snow?: number;
  weather: { id: number; main: string; description: string; icon: string }[];
}
interface OwmOneCall {
  current: OwmCurrent;
  hourly: OwmHourly[];
  daily: OwmDaily[];
}

const toIso = (sec: number) => new Date(sec * 1000).toISOString();
// OWM returns wind in m/s by default with units=metric; convert to km/h
const msToKmh = (v: number) => v * 3.6;

export async function fetchWeatherOpenWeatherMap(
  lat: number,
  lon: number,
  apiKey: string
): Promise<NormalizedWeather> {
  if (!apiKey) throw new Error("Missing VITE_OPENWEATHERMAP_API_KEY");
  const url = new URL("https://api.openweathermap.org/data/3.0/onecall");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("units", "metric");
  url.searchParams.set("exclude", "minutely,alerts");
  url.searchParams.set("appid", apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`OWM fetch failed (${res.status})`);
  const data: OwmOneCall = await res.json();

  const cur = data.current;
  const curW = cur.weather[0];

  return {
    current: {
      time: toIso(cur.dt),
      tempC: cur.temp,
      feelsC: cur.feels_like,
      humidity: cur.humidity,
      windKmh: msToKmh(cur.wind_speed),
      windDeg: cur.wind_deg,
      pressureHpa: cur.pressure,
      uvIndex: cur.uvi,
      condition: owmCondition(curW.main, curW.id, curW.icon),
      sunrise: toIso(cur.sunrise),
      sunset: toIso(cur.sunset),
    },
    hourly: data.hourly.slice(0, 24).map((h) => {
      const w = h.weather[0];
      return {
        time: toIso(h.dt),
        tempC: h.temp,
        precipProb: Math.round((h.pop ?? 0) * 100),
        condition: owmCondition(w.main, w.id, w.icon),
      };
    }),
    daily: data.daily.slice(0, 7).map((d) => {
      const w = d.weather[0];
      return {
        date: toIso(d.dt),
        minC: d.temp.min,
        maxC: d.temp.max,
        precipMm: (d.rain ?? 0) + (d.snow ?? 0),
        sunrise: toIso(d.sunrise),
        sunset: toIso(d.sunset),
        condition: owmCondition(w.main, w.id, w.icon),
      };
    }),
  };
}
