/**
 * RainViewer client
 *
 * RainViewer publishes a JSON manifest of available radar frames at
 * https://api.rainviewer.com/public/weather-maps.json . Each frame has a
 * timestamp and a path token. Frames are typically every 10 minutes for the
 * past 2 hours (12 frames) plus 0–3 nowcast frames in the future.
 *
 * Tile URL pattern (from the manifest's `host`):
 *   {host}/{path}/{size}/{z}/{x}/{y}/{color}/{options}.png
 * - size:    256 or 512
 * - color:   1=BR (default), 2=Black/White, 4=Universal Blue, etc. (we use 4)
 * - options: smooth_snow  e.g. "1_1" smooth + snow
 *
 * No API key, no auth, no quota (within reason). MIT-friendly attribution
 * requested in the legend.
 */

export interface RadarFrame {
  time: number;          // unix seconds
  path: string;          // e.g. "/v2/radar/1700000000"
  iso: string;           // ISO string for UI
  isForecast: boolean;
}

export interface RadarManifest {
  host: string;
  past: RadarFrame[];
  nowcast: RadarFrame[];
}

interface RawFrame { time: number; path: string }
interface RawManifest {
  host: string;
  radar: {
    past: RawFrame[];
    nowcast: RawFrame[];
  };
}

const MANIFEST_URL = "https://api.rainviewer.com/public/weather-maps.json";

export async function fetchRadarManifest(): Promise<RadarManifest> {
  const res = await fetch(MANIFEST_URL);
  if (!res.ok) throw new Error(`RainViewer manifest failed (${res.status})`);
  const data: RawManifest = await res.json();
  const wrap = (f: RawFrame, isForecast: boolean): RadarFrame => ({
    time: f.time,
    path: f.path,
    iso: new Date(f.time * 1000).toISOString(),
    isForecast,
  });
  return {
    host: data.host,
    past: data.radar.past.map((f) => wrap(f, false)),
    nowcast: data.radar.nowcast.map((f) => wrap(f, true)),
  };
}

/**
 * Build the tile URL template Leaflet uses, with {z}/{x}/{y} placeholders.
 * Color = 4 (Universal Blue), smooth+snow = 1_1, tile size 256.
 */
export function radarTileUrl(host: string, framePath: string): string {
  return `${host}${framePath}/256/{z}/{x}/{y}/4/1_1.png`;
}
