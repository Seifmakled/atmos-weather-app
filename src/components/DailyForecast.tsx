import { motion } from "framer-motion";
import { useWeatherStore } from "@/store/useWeatherStore";
import WeatherIcon from "@/components/WeatherIcon";
import { fmtTemp, weekday, monthDay } from "@/lib/format";

export default function DailyForecast() {
  const weather = useWeatherStore((s) => s.weather);
  const unit = useWeatherStore((s) => s.unit);
  if (!weather) return null;

  const days = weather.daily;
  const wkMin = Math.min(...days.map((d) => d.minC));
  const wkMax = Math.max(...days.map((d) => d.maxC));
  const range = wkMax - wkMin || 1;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
      className="glass rounded-[1.75rem] p-5 md:p-6"
    >
      <header className="mb-4">
        <h2 className="text-[10px] uppercase tracking-[0.22em] text-ink-soft">7-day forecast</h2>
      </header>

      <div className="flex flex-col">
        {days.map((d, i) => {
          const leftPct = ((d.minC - wkMin) / range) * 100;
          const rightPct = 100 - ((d.maxC - wkMin) / range) * 100;
          const isToday = i === 0;
          return (
            <div
              key={d.date}
              className={`grid grid-cols-[64px_32px_1fr_72px] sm:grid-cols-[88px_36px_1fr_90px] items-center gap-3 sm:gap-4 py-3 ${
                i < days.length - 1 ? "border-b border-white/8" : ""
              }`}
            >
              <div className="text-sm">
                <div className="font-medium text-ink">{isToday ? "Today" : weekday(d.date)}</div>
                <div className="text-[10px] text-ink-faint">{monthDay(d.date)}</div>
              </div>
              <WeatherIcon icon={d.condition.icon} size={28} className="text-ink" />
              <div
                className="relative h-1.5 rounded-full overflow-hidden"
                style={{ background: "rgb(var(--glass) / 0.16)" }}
                title={`${Math.round(d.minC)}° → ${Math.round(d.maxC)}°`}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.06 }}
                  className="absolute top-0 bottom-0"
                  style={{
                    left: `${leftPct}%`,
                    right: `${rightPct}%`,
                    background:
                      "linear-gradient(90deg, #4a90c2 0%, #ffd166 70%, #e76f51 100%)",
                    borderRadius: "999px",
                  }}
                />
              </div>
              <div className="text-right tabular text-sm font-display text-ink">
                <span className="text-ink-faint mr-2">{fmtTemp(d.minC, unit)}</span>
                {fmtTemp(d.maxC, unit)}
              </div>
            </div>
          );
        })}
      </div>
    </motion.section>
  );
}
