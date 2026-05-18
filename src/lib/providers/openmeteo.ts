import type { NormalizedWeather } from "@/types/weather";
import { conditionFromWmo } from "@/lib/wmo";

interface OpenMeteoResponse {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    surface_pressure: number;
    weather_code: number;
    is_day: number;
    precipitation: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    precipitation_probability: number[];
    is_day: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    sunrise: string[];
    sunset: string[];
    uv_index_max: number[];
  };
}

export async function fetchWeatherOpenMeteo(
  lat: number,
  lon: number
): Promise<NormalizedWeather> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set(
    "current",
    "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,surface_pressure,weather_code,is_day,precipitation"
  );
  url.searchParams.set(
    "hourly",
    "temperature_2m,weather_code,precipitation_probability,is_day"
  );
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset,uv_index_max"
  );
  url.searchParams.set("forecast_days", "7");
  url.searchParams.set("timezone", "auto");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Weather fetch failed (${res.status})`);
  const data: OpenMeteoResponse = await res.json();

  const isDayNow = data.current.is_day === 1;

  // Build hourly slice — find the index at-or-after "now"
  const nowMs = Date.now();
  let startIdx = data.hourly.time.findIndex((t) => new Date(t).getTime() >= nowMs);
  if (startIdx < 0) startIdx = 0;
  const sliceEnd = Math.min(startIdx + 24, data.hourly.time.length);

  const hourly = [];
  for (let i = startIdx; i < sliceEnd; i++) {
    hourly.push({
      time: data.hourly.time[i],
      tempC: data.hourly.temperature_2m[i],
      precipProb: data.hourly.precipitation_probability[i] ?? 0,
      condition: conditionFromWmo(
        data.hourly.weather_code[i],
        data.hourly.is_day[i] === 1
      ),
    });
  }

  const daily = data.daily.time.map((d, i) => ({
    date: d,
    minC: data.daily.temperature_2m_min[i],
    maxC: data.daily.temperature_2m_max[i],
    precipMm: data.daily.precipitation_sum[i],
    sunrise: data.daily.sunrise[i],
    sunset: data.daily.sunset[i],
    condition: conditionFromWmo(data.daily.weather_code[i], true),
  }));

  return {
    current: {
      time: data.current.time,
      tempC: data.current.temperature_2m,
      feelsC: data.current.apparent_temperature,
      humidity: data.current.relative_humidity_2m,
      windKmh: data.current.wind_speed_10m,
      windDeg: data.current.wind_direction_10m,
      pressureHpa: data.current.surface_pressure,
      uvIndex: data.daily.uv_index_max[0],
      condition: conditionFromWmo(data.current.weather_code, isDayNow),
      sunrise: data.daily.sunrise[0],
      sunset: data.daily.sunset[0],
    },
    hourly,
    daily,
  };
}
