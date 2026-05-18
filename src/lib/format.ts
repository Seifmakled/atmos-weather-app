import type { Unit } from "@/store/useWeatherStore";

export function cToF(c: number) { return c * 9 / 5 + 32; }
export function fmtTemp(c: number, unit: Unit) {
  return `${Math.round(unit === "C" ? c : cToF(c))}°`;
}
export function fmtTempLong(c: number, unit: Unit) {
  return `${Math.round(unit === "C" ? c : cToF(c))}°${unit}`;
}
export function fmtKmh(v: number) { return `${Math.round(v)} km/h`; }
export function fmtPct(v: number) { return `${Math.round(v)}%`; }

export function shortTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric" });
}
export function clockTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}
export function weekday(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: "short" });
}
export function monthDay(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function compassDir(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}
