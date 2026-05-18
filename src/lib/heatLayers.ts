/**
 * Heat-map layer registry.
 *
 * Each layer has:
 *  - id              stable identifier
 *  - label           UI label
 *  - provider        which tile server it uses
 *  - tileUrl()       template string with {z}/{x}/{y}, optionally substituted
 *  - opacity         default opacity (0–1)
 *  - legend          array of { color, label } stops shown on the bottom bar
 *  - requiresOwmKey  if true, only show if VITE_OPENWEATHERMAP_API_KEY is set
 */

export type LayerProvider = "rainviewer" | "openweathermap";

export interface LegendStop {
  color: string;
  label: string;
}

export interface HeatLayer {
  id: string;
  label: string;
  provider: LayerProvider;
  /** Returns a tile URL with {z}/{x}/{y} that Leaflet will substitute. */
  tileUrl: (ctx: { owmKey?: string; rainviewerHost?: string; rainviewerFrame?: string }) => string;
  opacity: number;
  legend: LegendStop[];
  requiresOwmKey: boolean;
  attribution: string;
}

const OWM_BASE = "https://tile.openweathermap.org/map";

export const LAYERS: HeatLayer[] = [
  {
    id: "precip",
    label: "Precipitation",
    provider: "rainviewer",
    tileUrl: ({ rainviewerHost, rainviewerFrame }) => {
      if (!rainviewerHost || !rainviewerFrame) return "";
      return `${rainviewerHost}${rainviewerFrame}/256/{z}/{x}/{y}/4/1_1.png`;
    },
    opacity: 0.7,
    legend: [
      { color: "#4dabf7", label: "Drizzle" },
      { color: "#4263eb", label: "Light" },
      { color: "#9775fa", label: "Moderate" },
      { color: "#f783ac", label: "Heavy" },
      { color: "#fa5252", label: "Intense" },
    ],
    requiresOwmKey: false,
    attribution: "Radar &copy; <a href='https://rainviewer.com'>RainViewer</a>",
  },
  {
    id: "temp",
    label: "Temperature",
    provider: "openweathermap",
    tileUrl: ({ owmKey }) => `${OWM_BASE}/temp_new/{z}/{x}/{y}.png?appid=${owmKey}`,
    opacity: 0.6,
    legend: [
      { color: "#0d3b9c", label: "−40°" },
      { color: "#3490dc", label: "−20°" },
      { color: "#38c172", label: "0°" },
      { color: "#ffed4a", label: "20°" },
      { color: "#f6993f", label: "30°" },
      { color: "#e3342f", label: "40°+" },
    ],
    requiresOwmKey: true,
    attribution: "&copy; OpenWeatherMap",
  },
  {
    id: "clouds",
    label: "Clouds",
    provider: "openweathermap",
    tileUrl: ({ owmKey }) => `${OWM_BASE}/clouds_new/{z}/{x}/{y}.png?appid=${owmKey}`,
    opacity: 0.55,
    legend: [
      { color: "#0c1525", label: "0%" },
      { color: "#5a6478", label: "25%" },
      { color: "#aab2c0", label: "50%" },
      { color: "#dde2ea", label: "75%" },
      { color: "#ffffff", label: "100%" },
    ],
    requiresOwmKey: true,
    attribution: "&copy; OpenWeatherMap",
  },
  {
    id: "wind",
    label: "Wind",
    provider: "openweathermap",
    tileUrl: ({ owmKey }) => `${OWM_BASE}/wind_new/{z}/{x}/{y}.png?appid=${owmKey}`,
    opacity: 0.65,
    legend: [
      { color: "#dce4ed", label: "Calm" },
      { color: "#90b4dd", label: "5 m/s" },
      { color: "#5e7fbf", label: "10 m/s" },
      { color: "#3b54a1", label: "20 m/s" },
      { color: "#1a2c80", label: "40 m/s+" },
    ],
    requiresOwmKey: true,
    attribution: "&copy; OpenWeatherMap",
  },
  {
    id: "pressure",
    label: "Pressure",
    provider: "openweathermap",
    tileUrl: ({ owmKey }) => `${OWM_BASE}/pressure_new/{z}/{x}/{y}.png?appid=${owmKey}`,
    opacity: 0.55,
    legend: [
      { color: "#3490dc", label: "980 hPa" },
      { color: "#38c172", label: "1000" },
      { color: "#ffed4a", label: "1013" },
      { color: "#f6993f", label: "1025" },
      { color: "#e3342f", label: "1040 hPa+" },
    ],
    requiresOwmKey: true,
    attribution: "&copy; OpenWeatherMap",
  },
];

export function getAvailableLayers(): HeatLayer[] {
  const owmKey = import.meta.env.VITE_OPENWEATHERMAP_API_KEY as string | undefined;
  return LAYERS.filter((l) => !l.requiresOwmKey || !!owmKey);
}
