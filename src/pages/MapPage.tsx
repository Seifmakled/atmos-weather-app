import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

import { useWeatherStore } from "@/store/useWeatherStore";
import { fetchRadarManifest, type RadarManifest } from "@/lib/rainviewer";
import { getAvailableLayers, type HeatLayer } from "@/lib/heatLayers";
import { fetchWeather } from "@/lib/weather";
import { fmtTemp, fmtKmh, fmtPct, clockTime } from "@/lib/format";
import WeatherIcon from "@/components/WeatherIcon";
import type { NormalizedWeather } from "@/types/weather";

/* --------------------------------------------------------------------------
 * Fix Leaflet's bundled marker URLs under Vite
 * -------------------------------------------------------------------------- */
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// Re-bind the default icon so map markers render
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

/* --------------------------------------------------------------------------
 * Small helper: recenter the map programmatically (controlled component
 * pattern — useful when user picks a city from the side panel).
 * -------------------------------------------------------------------------- */
function MapCenterController({ lat, lon, zoom }: { lat: number; lon: number; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lon], zoom ?? map.getZoom(), { duration: 1.4 });
  }, [lat, lon, zoom, map]);
  return null;
}

/* --------------------------------------------------------------------------
 * Helper: emit a click event to the parent so we can fetch weather at any
 * point the user clicks on the map.
 * -------------------------------------------------------------------------- */
function MapClickHandler({ onPick }: { onPick: (lat: number, lon: number) => void }) {
  const map = useMap();
  useEffect(() => {
    const handler = (e: L.LeafletMouseEvent) => onPick(e.latlng.lat, e.latlng.lng);
    map.on("click", handler);
    return () => { map.off("click", handler); };
  }, [map, onPick]);
  return null;
}

/* ========================================================================= */

export default function MapPage() {
  const location = useWeatherStore((s) => s.location);
  const weather = useWeatherStore((s) => s.weather);

  // Layers
  const availableLayers = useMemo(() => getAvailableLayers(), []);
  const [activeLayerId, setActiveLayerId] = useState<string>(availableLayers[0]?.id ?? "precip");
  const activeLayer: HeatLayer | undefined = availableLayers.find((l) => l.id === activeLayerId);

  // RainViewer state
  const [manifest, setManifest] = useState<RadarManifest | null>(null);
  const allFrames = useMemo(
    () => (manifest ? [...manifest.past, ...manifest.nowcast] : []),
    [manifest]
  );
  const [frameIdx, setFrameIdx] = useState(0); // index into allFrames
  const [playing, setPlaying] = useState(false);
  const playRef = useRef<number | null>(null);

  // Probed location (when user clicks the map)
  const [probe, setProbe] = useState<{
    lat: number;
    lon: number;
    weather: NormalizedWeather | null;
    loading: boolean;
    error?: string;
  } | null>(null);

  // Load RainViewer manifest on mount
  useEffect(() => {
    fetchRadarManifest()
      .then((m) => {
        setManifest(m);
        // Start at the most recent past frame (end of past array)
        const start = Math.max(0, m.past.length - 1);
        setFrameIdx(start);
      })
      .catch(() => {
        // RainViewer failed; the precipitation layer will simply not appear.
      });
  }, []);

  // Auto-play loop
  useEffect(() => {
    if (!playing || allFrames.length === 0) return;
    playRef.current = window.setInterval(() => {
      setFrameIdx((i) => (i + 1) % allFrames.length);
    }, 700);
    return () => {
      if (playRef.current !== null) window.clearInterval(playRef.current);
    };
  }, [playing, allFrames.length]);

  // Probe handler
  const handleMapClick = (lat: number, lon: number) => {
    setProbe({ lat, lon, weather: null, loading: true });
    fetchWeather(lat, lon)
      .then((w) => setProbe({ lat, lon, weather: w, loading: false }))
      .catch((e) =>
        setProbe({ lat, lon, weather: null, loading: false, error: e instanceof Error ? e.message : "Failed" })
      );
  };

  // Tile URL for current heat layer
  const currentFrame = allFrames[frameIdx];
  const tileUrl = activeLayer
    ? activeLayer.tileUrl({
        owmKey: import.meta.env.VITE_OPENWEATHERMAP_API_KEY as string | undefined,
        rainviewerHost: manifest?.host,
        rainviewerFrame: currentFrame?.path,
      })
    : "";

  const center: [number, number] = location
    ? [location.latitude, location.longitude]
    : [30.0444, 31.2357]; // Cairo fallback

  return (
    <div className="fixed inset-0">
      {/* Leaflet map fills the screen */}
      <MapContainer
        center={center}
        zoom={6}
        minZoom={3}
        maxZoom={12}
        zoomControl={false}
        attributionControl={true}
        className="w-full h-full"
        style={{ background: "#0d1620" }}
      >
        {/* Dark base map */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* Heat-map overlay */}
        {activeLayer && tileUrl && (
          <TileLayer
            key={`${activeLayer.id}-${currentFrame?.time ?? "static"}`}
            url={tileUrl}
            opacity={activeLayer.opacity}
            attribution={activeLayer.attribution}
            zIndex={400}
          />
        )}

        {/* Location pin for currently loaded city */}
        {location && (
          <Marker position={[location.latitude, location.longitude]}>
            <Popup>
              <strong>{location.name}</strong>
              <br />
              {weather && (
                <>
                  {fmtTemp(weather.current.tempC, "C")} ·{" "}
                  {weather.current.condition.label}
                </>
              )}
            </Popup>
          </Marker>
        )}

        {/* Click probe pin */}
        {probe && (
          <Marker position={[probe.lat, probe.lon]}>
            <Popup>
              {probe.loading && "Loading…"}
              {probe.error && <span style={{ color: "#e76f51" }}>{probe.error}</span>}
              {probe.weather && (
                <>
                  <strong>
                    {probe.lat.toFixed(2)}, {probe.lon.toFixed(2)}
                  </strong>
                  <br />
                  {fmtTemp(probe.weather.current.tempC, "C")} ·{" "}
                  {probe.weather.current.condition.label}
                </>
              )}
            </Popup>
          </Marker>
        )}

        <MapCenterController lat={center[0]} lon={center[1]} zoom={6} />
        <MapClickHandler onPick={handleMapClick} />
      </MapContainer>

      {/* ============================== UI overlays ============================== */}

      {/* Back button */}
      <Link
        to="/"
        className="absolute top-4 left-4 z-[1000] glass-strong rounded-full pl-3 pr-4 py-2 inline-flex items-center gap-2 text-sm text-white hover:bg-white/20 transition-colors no-underline"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </Link>

      {/* City label */}
      {location && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] glass-strong rounded-full px-4 py-2 text-sm text-white pointer-events-none">
          <span className="font-display italic mr-1">{location.name}</span>
          <span className="text-white/60 text-xs">
            {[location.admin1, location.country].filter(Boolean).join(" · ")}
          </span>
        </div>
      )}

      {/* Right-side layer picker (iPhone style) */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[1000]">
        <div className="glass-strong rounded-2xl p-1.5 flex flex-col gap-1">
          {availableLayers.map((layer) => (
            <button
              key={layer.id}
              type="button"
              onClick={() => setActiveLayerId(layer.id)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                activeLayerId === layer.id
                  ? "bg-white text-black"
                  : "text-white/80 hover:bg-white/15"
              }`}
              title={layer.label}
            >
              <LayerIcon id={layer.id} />
              <span className="block mt-0.5 text-[10px]">{layer.label}</span>
            </button>
          ))}
        </div>
        {availableLayers.length < 5 && (
          <p className="mt-2 text-[10px] text-white/60 text-center max-w-[100px] leading-tight">
            Add an OpenWeatherMap key for temperature, clouds, wind, pressure.
          </p>
        )}
      </div>

      {/* Bottom: legend + time scrubber */}
      <div className="absolute bottom-4 left-4 right-4 z-[1000] flex flex-col gap-2 pointer-events-none">
        {/* Time scrubber — only for the precipitation/radar layer */}
        {activeLayer?.id === "precip" && allFrames.length > 0 && (
          <div className="glass-strong rounded-2xl px-4 py-3 pointer-events-auto">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                className="rounded-full w-9 h-9 bg-white text-black flex items-center justify-center hover:scale-105 transition-transform flex-shrink-0"
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <rect x="6" y="5" width="4" height="14" />
                    <rect x="14" y="5" width="4" height="14" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <polygon points="6 4 20 12 6 20 6 4" />
                  </svg>
                )}
              </button>

              <div className="flex-1 flex flex-col gap-1.5">
                <input
                  type="range"
                  min={0}
                  max={allFrames.length - 1}
                  value={frameIdx}
                  onChange={(e) => {
                    setPlaying(false);
                    setFrameIdx(parseInt(e.target.value, 10));
                  }}
                  className="w-full accent-white"
                  aria-label="Radar time"
                />
                <div className="flex justify-between text-[10px] text-white/70 tabular">
                  <span>−2 hr</span>
                  <span className="text-white">
                    {currentFrame && (
                      <>
                        {currentFrame.isForecast && "+ "}
                        {clockTime(currentFrame.iso)}
                        {currentFrame.isForecast && " (forecast)"}
                      </>
                    )}
                  </span>
                  <span>+30 min</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        {activeLayer && (
          <div className="glass-strong rounded-2xl px-4 py-3 pointer-events-auto">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase tracking-[0.18em] text-white/80">
                {activeLayer.label}
              </span>
              <span
                className="text-[10px] text-white/50"
                dangerouslySetInnerHTML={{ __html: activeLayer.attribution }}
              />
            </div>
            <div className="flex items-center h-3 rounded-full overflow-hidden">
              {activeLayer.legend.map((stop, i, arr) => (
                <div
                  key={i}
                  className="h-full flex-1"
                  style={{
                    background:
                      i === arr.length - 1
                        ? stop.color
                        : `linear-gradient(to right, ${stop.color} 0%, ${arr[i + 1].color} 100%)`,
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-white/70 tabular">
              {activeLayer.legend.map((stop, i) => (
                <span key={i}>{stop.label}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Probe-result side card */}
      <AnimatePresence>
        {probe && probe.weather && (
          <motion.aside
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-4 top-20 z-[1000] glass-strong rounded-2xl p-4 w-64 text-white"
          >
            <header className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/60">
                  Picked location
                </p>
                <p className="text-sm tabular text-white/90">
                  {probe.lat.toFixed(2)}, {probe.lon.toFixed(2)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setProbe(null)}
                className="text-white/60 hover:text-white text-xl leading-none -mt-1"
                aria-label="Close"
              >
                ×
              </button>
            </header>

            <div className="flex items-center gap-3 mb-3">
              <WeatherIcon icon={probe.weather.current.condition.icon} size={48} className="text-white" />
              <div>
                <div className="text-3xl font-display tabular">
                  {fmtTemp(probe.weather.current.tempC, "C")}C
                </div>
                <div className="text-xs text-white/80">{probe.weather.current.condition.label}</div>
              </div>
            </div>

            <ul className="text-xs space-y-1 text-white/80">
              <li className="flex justify-between"><span>Humidity</span><span className="tabular">{fmtPct(probe.weather.current.humidity)}</span></li>
              <li className="flex justify-between"><span>Wind</span><span className="tabular">{fmtKmh(probe.weather.current.windKmh)}</span></li>
              <li className="flex justify-between"><span>Sunrise</span><span className="tabular">{clockTime(probe.weather.current.sunrise)}</span></li>
              <li className="flex justify-between"><span>Sunset</span><span className="tabular">{clockTime(probe.weather.current.sunset)}</span></li>
            </ul>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Loading hint when the user clicks but data hasn't returned */}
      <AnimatePresence>
        {probe && probe.loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute left-4 top-20 z-[1000] glass-strong rounded-2xl p-4 w-64 text-white text-sm italic"
          >
            Reading conditions at {probe.lat.toFixed(2)}, {probe.lon.toFixed(2)}…
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Tiny inline icon for the layer picker (5 layers × small icons)
 * -------------------------------------------------------------------------- */
function LayerIcon({ id }: { id: string }) {
  const props = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, className: "mx-auto" };
  switch (id) {
    case "precip":
      return (
        <svg {...props}><path d="M12 3a7 7 0 0 0-7 7c0 4 7 11 7 11s7-7 7-11a7 7 0 0 0-7-7z" /></svg>
      );
    case "temp":
      return (
        <svg {...props}><path d="M14 4a2 2 0 1 0-4 0v10a4 4 0 1 0 4 0V4z" /></svg>
      );
    case "clouds":
      return (
        <svg {...props}><path d="M17.5 19a4.5 4.5 0 0 0 0-9c-.6-3-3.4-5-6.5-5a6.5 6.5 0 0 0-6.4 7.5A4.5 4.5 0 0 0 6.5 19z" /></svg>
      );
    case "wind":
      return (
        <svg {...props}><path d="M9.6 4.6A2 2 0 1 1 11 8H2M12.6 19.4A2 2 0 1 0 14 16H2M17.6 7.6A3 3 0 1 1 20 12H2" /></svg>
      );
    case "pressure":
      return (
        <svg {...props}><circle cx="12" cy="12" r="9" /><path d="M12 6v6l4 2" /></svg>
      );
    default:
      return null;
  }
}
