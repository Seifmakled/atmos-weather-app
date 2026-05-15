import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { geocodeSearch } from "@/lib/geocode";
import { getUserLocation } from "@/hooks/useGeolocation";
import { useWeatherStore } from "@/store/useWeatherStore";
import type { Location } from "@/types/weather";

export default function SearchBar() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Location[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const loadWeather = useWeatherStore((s) => s.loadWeather);
  const recent = useWeatherStore((s) => s.recent);

  // Debounced search
  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    const id = window.setTimeout(async () => {
      try {
        const list = await geocodeSearch(q);
        setResults(list);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 220);
    return () => window.clearTimeout(id);
  }, [q]);

  // Click outside to close
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const pick = (loc: Location) => {
    setQ("");
    setResults([]);
    setOpen(false);
    void loadWeather(loc);
  };

  const handleLocate = async () => {
    try {
      const loc = await getUserLocation();
      // Try to reverse-resolve a friendly name via geocoding (closest match by name)
      void loadWeather(loc);
    } catch {
      // ignore — user denied
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim().length < 2) return;
    try {
      const list = await geocodeSearch(q);
      if (list.length) pick(list[0]);
    } catch {
      /* swallow — UI shows nothing */
    }
  };

  const showRecent = open && q.trim().length < 2 && recent.length > 0;
  const showResults = open && q.trim().length >= 2;

  return (
    <div ref={wrapRef} className="relative w-full max-w-xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="glass-strong rounded-full flex items-center gap-2 pl-5 pr-2 py-2 shadow-2xl">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="opacity-70 flex-shrink-0"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder="Search any city — Cairo, Tokyo, Reykjavík…"
            aria-label="Search city"
            className="flex-1 bg-transparent border-none outline-none text-ink placeholder:text-ink-faint py-2 text-sm md:text-base"
          />
          <button
            type="button"
            onClick={handleLocate}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs text-ink-soft hover:text-ink hover:bg-white/10 transition-colors"
            title="Use my location"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
            </svg>
            Locate
          </button>
          <button
            type="submit"
            className="rounded-full bg-white text-black/90 hover:bg-white/90 px-5 py-2 text-sm font-medium transition-all hover:scale-[1.02] active:scale-95"
          >
            Search
          </button>
        </div>
      </form>

      <AnimatePresence>
        {(showResults || showRecent) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 glass-frosted rounded-3xl overflow-hidden shadow-2xl z-50"
          >
            {showResults && (
              <div>
                {searching && (
                  <div className="px-5 py-3 text-xs text-ink-faint italic">Searching…</div>
                )}
                {!searching && results.length === 0 && (
                  <div className="px-5 py-3 text-xs text-ink-faint italic">No results.</div>
                )}
                {results.map((r, i) => (
                  <button
                    key={`${r.latitude}-${r.longitude}-${i}`}
                    type="button"
                    onClick={() => pick(r)}
                    className="w-full text-left px-5 py-3 hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0 flex items-baseline justify-between gap-3"
                  >
                    <span className="text-sm text-ink">{r.name}</span>
                    <span className="text-xs text-ink-faint truncate">
                      {[r.admin1, r.country].filter(Boolean).join(", ")}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {showRecent && (
              <div>
                <div className="px-5 pt-3 pb-1 text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                  Recent searches
                </div>
                {recent.map((r, i) => (
                  <button
                    key={`r-${i}`}
                    type="button"
                    onClick={() => pick({ ...r })}
                    className="w-full text-left px-5 py-3 hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0 flex items-baseline justify-between gap-3"
                  >
                    <span className="text-sm text-ink">{r.name}</span>
                    <span className="text-xs text-ink-faint truncate">
                      {[r.admin1, r.country].filter(Boolean).join(", ")}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
