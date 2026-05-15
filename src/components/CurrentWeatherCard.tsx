import { motion } from "framer-motion";
import { useWeatherStore } from "@/store/useWeatherStore";
import WeatherIcon from "@/components/WeatherIcon";
import { fmtKmh, fmtPct, fmtTemp, fmtTempLong, clockTime, compassDir } from "@/lib/format";

const ease = [0.22, 1, 0.36, 1] as const;

export default function CurrentWeatherCard() {
  const weather = useWeatherStore((s) => s.weather);
  const location = useWeatherStore((s) => s.location);
  const unit = useWeatherStore((s) => s.unit);
  if (!weather || !location) return null;

  const c = weather.current;

  return (
    <motion.section
      key={`${location.latitude}-${location.longitude}`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease }}
      className="glass-strong rounded-[2rem] p-6 md:p-10 relative overflow-hidden"
    >
      {/* Decorative accent — radial wash matching scene */}
      <div
        className="absolute -top-20 -right-20 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgb(var(--accent) / 0.25) 0%, transparent 65%)",
        }}
        aria-hidden="true"
      />

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl md:text-4xl font-display text-ink leading-tight tracking-tight">
            {location.name}
          </h1>
          <p className="text-xs md:text-sm text-ink-faint mt-1">
            {[location.admin1, location.country].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.22em] text-ink-faint">As of</p>
          <p className="text-sm text-ink-soft tabular">{clockTime(c.time)}</p>
        </div>
      </header>

      <div className="mt-8 md:mt-12 flex flex-wrap items-end gap-6 md:gap-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease, delay: 0.1 }}
          className="text-7xl md:text-[8.5rem] font-display tabular text-ink leading-none"
        >
          {fmtTemp(c.tempC, unit)}
          <span className="text-3xl md:text-5xl text-ink-faint ml-1 align-top">{unit}</span>
        </motion.div>

        <div className="flex flex-col gap-2">
          <WeatherIcon icon={c.condition.icon} size={84} className="text-ink" />
          <p className="text-xl md:text-2xl font-display italic text-ink">
            {c.condition.label}
          </p>
          <p className="text-sm text-ink-soft">
            Feels like {fmtTempLong(c.feelsC, unit)}
          </p>
        </div>
      </div>

      <div className="mt-8 md:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <Stat label="Humidity" value={fmtPct(c.humidity)} />
        <Stat label="Wind" value={`${fmtKmh(c.windKmh)} ${compassDir(c.windDeg)}`} />
        <Stat label="Sunrise" value={clockTime(c.sunrise)} />
        <Stat label="Sunset" value={clockTime(c.sunset)} />
      </div>
    </motion.section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 backdrop-blur-sm">
      <p className="text-[10px] uppercase tracking-[0.22em] text-ink-faint mb-1">{label}</p>
      <p className="text-base md:text-lg font-display text-ink tabular leading-tight">{value}</p>
    </div>
  );
}
