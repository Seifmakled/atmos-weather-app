import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useWeatherStore } from "@/store/useWeatherStore";
import { useSceneTokens } from "@/hooks/useSceneTokens";
import { getUserLocation } from "@/hooks/useGeolocation";
import SceneBackground from "@/components/SceneBackground";
import TopBar from "@/components/TopBar";
import SearchBar from "@/components/SearchBar";
import CurrentWeatherCard from "@/components/CurrentWeatherCard";
import HourlyForecast from "@/components/HourlyForecast";
import DailyForecast from "@/components/DailyForecast";
import SunArc from "@/components/SunArc";
import LiveClock from "@/components/LiveClock";
import LoadingOverlay from "@/components/LoadingOverlay";
import ErrorToast from "@/components/ErrorToast";
import AmbientAudio from "@/components/AmbientAudio";
import type { Location } from "@/types/weather";

// Sensible default location: Cairo (matches the original project context).
const DEFAULT_LOCATION: Location = {
  name: "Cairo",
  admin1: "Cairo Governorate",
  country: "Egypt",
  latitude: 30.0444,
  longitude: 31.2357,
};

export default function HomePage() {
  useSceneTokens();

  const status = useWeatherStore((s) => s.status);
  const weather = useWeatherStore((s) => s.weather);
  const loadWeather = useWeatherStore((s) => s.loadWeather);
  const recent = useWeatherStore((s) => s.recent);

  // First-load bootstrap: try geolocation → fall back to most recent → fall back to Cairo
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // If we already have weather (StrictMode double-mount, or store was hydrated), bail
      if (weather) return;

      try {
        const loc = await getUserLocation();
        if (cancelled) return;
        await loadWeather(loc);
      } catch {
        if (cancelled) return;
        if (recent.length > 0) {
          await loadWeather({ ...recent[0] });
        } else {
          await loadWeather(DEFAULT_LOCATION);
        }
      }
    })();
    return () => { cancelled = true; };
    // We only want this on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showInitialLoader = status === "loading" && !weather;

  return (
    <>
      <SceneBackground />
      <AmbientAudio />
      <ErrorToast />

      <AnimatePresence>
        {showInitialLoader && <LoadingOverlay />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative min-h-screen px-4 sm:px-6 md:px-10 py-6 md:py-10"
      >
        <div className="max-w-6xl mx-auto flex flex-col gap-6 md:gap-8">
          {/* Top bar */}
          <header className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 sm:justify-between">
            <TopBar />
            <LiveClock />
          </header>

          {/* Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1">
              <SearchBar />
            </div>
            <Link
              to="/map"
              className="glass rounded-full px-5 py-3 text-sm text-ink hover:bg-white/15 transition-colors inline-flex items-center justify-center gap-2 no-underline whitespace-nowrap"
              aria-label="Open weather heat-map"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                <line x1="8" y1="2" x2="8" y2="18" />
                <line x1="16" y1="6" x2="16" y2="22" />
              </svg>
              Map
            </Link>
          </div>

          {/* Main content */}
          {weather && (
            <main className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6 mt-2">
              <div className="lg:col-span-2 flex flex-col gap-5 md:gap-6">
                <CurrentWeatherCard />
                <HourlyForecast />
              </div>
              <div className="flex flex-col gap-5 md:gap-6">
                <DailyForecast />
                <SunArc />
              </div>
            </main>
          )}

          {/* Footer */}
          <footer className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-[11px] text-ink-faint">
            <span>
              Atmos · Built with React, Tailwind, Framer Motion · Data:{" "}
              <a href="https://open-meteo.com/" className="underline-offset-2 hover:underline" target="_blank" rel="noreferrer">
                Open-Meteo
              </a>
            </span>
            <span>© 2026</span>
          </footer>
        </div>
      </motion.div>
    </>
  );
}
