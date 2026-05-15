import { motion } from "framer-motion";
import { useWeatherStore } from "@/store/useWeatherStore";
import WeatherIcon from "@/components/WeatherIcon";
import { fmtTemp, shortTime } from "@/lib/format";

export default function HourlyForecast() {
  const weather = useWeatherStore((s) => s.weather);
  const unit = useWeatherStore((s) => s.unit);
  if (!weather) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      className="glass rounded-[1.75rem] p-5 md:p-6"
    >
      <header className="flex items-baseline justify-between gap-3 mb-4">
        <h2 className="text-[10px] uppercase tracking-[0.22em] text-ink-soft">Next 24 hours</h2>
        <span className="text-[10px] uppercase tracking-[0.22em] text-ink-faint">
          Scroll →
        </span>
      </header>

      <div className="overflow-x-auto -mx-1 px-1 pb-1">
        <div className="flex gap-2 md:gap-3 min-w-max">
          {weather.hourly.map((h, i) => {
            const isNow = i === 0;
            return (
              <div
                key={h.time}
                className={`flex flex-col items-center justify-between gap-1.5 rounded-2xl px-3 py-3 min-w-[68px] transition-colors ${
                  isNow ? "bg-white/15 border border-white/20" : "hover:bg-white/8"
                }`}
              >
                <span className={`text-[11px] ${isNow ? "text-ink" : "text-ink-soft"}`}>
                  {isNow ? "Now" : shortTime(h.time)}
                </span>
                <WeatherIcon icon={h.condition.icon} size={32} className="text-ink" />
                {h.precipProb > 5 ? (
                  <span className="text-[10px] text-ink-faint tabular">{Math.round(h.precipProb)}%</span>
                ) : (
                  <span className="text-[10px] opacity-0">·</span>
                )}
                <span className="text-base font-display tabular text-ink">
                  {fmtTemp(h.tempC, unit)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
