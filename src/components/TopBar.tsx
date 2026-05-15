import { useWeatherStore } from "@/store/useWeatherStore";

export default function TopBar() {
  const unit = useWeatherStore((s) => s.unit);
  const setUnit = useWeatherStore((s) => s.setUnit);
  const audioEnabled = useWeatherStore((s) => s.audioEnabled);
  const toggleAudio = useWeatherStore((s) => s.toggleAudio);

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-display italic text-ink leading-none">Atmos</span>
        <span className="hidden sm:inline text-[10px] uppercase tracking-[0.22em] text-ink-faint">
          Weather, alive.
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Audio toggle */}
        <button
          type="button"
          onClick={toggleAudio}
          className="glass rounded-full px-3 py-2 text-xs text-ink-soft hover:text-ink hover:bg-white/15 transition-colors inline-flex items-center gap-1.5"
          aria-pressed={audioEnabled}
          aria-label="Toggle ambient sound"
          title={audioEnabled ? "Mute ambient" : "Play ambient"}
        >
          {audioEnabled ? (
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          )}
          <span className="hidden sm:inline">Ambient</span>
        </button>

        {/* Unit toggle */}
        <div className="glass inline-flex rounded-full p-1">
          {(["C", "F"] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
                unit === u
                  ? "bg-white text-black"
                  : "text-ink-soft hover:text-ink"
              }`}
              aria-pressed={unit === u}
            >
              °{u}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
