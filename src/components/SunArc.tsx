import { motion } from "framer-motion";
import { useWeatherStore } from "@/store/useWeatherStore";
import { clockTime } from "@/lib/format";

/**
 * Renders an arc from sunrise to sunset with a "sun" marker at the
 * fractional position of the current time between them. After sunset the
 * marker docks at the end of the arc.
 */
export default function SunArc() {
  const weather = useWeatherStore((s) => s.weather);
  if (!weather) return null;

  const c = weather.current;
  const sr = new Date(c.sunrise).getTime();
  const ss = new Date(c.sunset).getTime();
  const now = Date.now();
  const span = Math.max(1, ss - sr);
  const t = Math.min(1, Math.max(0, (now - sr) / span));

  // Arc geometry: a semicircle from (10, 80) sweep to (190, 80) with radius 90
  // Parametric: x = 100 - 90 cos(πt), y = 80 - 90 sin(πt)
  const ang = Math.PI * t;
  const x = 100 - 90 * Math.cos(ang);
  const y = 80 - 90 * Math.sin(ang);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
      className="glass rounded-[1.75rem] p-5 md:p-6"
    >
      <header className="mb-3">
        <h2 className="text-[10px] uppercase tracking-[0.22em] text-ink-soft">Sun position</h2>
      </header>

      <svg viewBox="0 0 200 100" className="w-full" aria-hidden="true">
        <defs>
          <linearGradient id="sunArcGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgb(var(--accent) / 0.4)" />
            <stop offset="50%" stopColor="rgb(var(--accent) / 0.8)" />
            <stop offset="100%" stopColor="rgb(var(--accent) / 0.4)" />
          </linearGradient>
        </defs>
        {/* Horizon */}
        <line x1="0" y1="80" x2="200" y2="80" stroke="rgb(var(--glass) / 0.3)" strokeWidth="0.5" />
        {/* Arc */}
        <path
          d="M 10 80 A 90 90 0 0 1 190 80"
          fill="none"
          stroke="url(#sunArcGrad)"
          strokeWidth="1.2"
          strokeDasharray="2 3"
        />
        {/* Travelled portion (solid line) */}
        <path
          d={`M 10 80 A 90 90 0 0 1 ${x} ${y}`}
          fill="none"
          stroke="rgb(var(--accent))"
          strokeWidth="1.5"
        />
        {/* Sun marker */}
        <circle cx={x} cy={y} r="4" fill="rgb(var(--accent))">
          <animate attributeName="r" values="3.5;4.5;3.5" dur="3s" repeatCount="indefinite" />
        </circle>
      </svg>

      <div className="flex items-center justify-between mt-2 text-[11px] text-ink-soft tabular">
        <span>↑ {clockTime(c.sunrise)}</span>
        <span className="text-ink-faint">{t < 1 && now > sr ? `${Math.round(t * 100)}% of daylight` : t >= 1 ? "Sunset has passed" : "Before sunrise"}</span>
        <span>↓ {clockTime(c.sunset)}</span>
      </div>
    </motion.section>
  );
}
