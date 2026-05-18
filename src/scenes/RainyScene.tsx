/**
 * Rainy atmosphere — many vertical rain streaks with staggered timings,
 * a subtle wet-glass smear pattern, and rare lightning flashes.
 */
export default function RainyScene({ heavy = false }: { heavy?: boolean }) {
  const dropCount = heavy ? 120 : 80;
  const drops = Array.from({ length: dropCount });

  return (
    <>
      {/* Rain streaks */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {drops.map((_, i) => {
          const left = (i * 13.7) % 100;
          const delay = (i * 0.13) % 2;
          const duration = 0.6 + ((i * 0.07) % 0.8);
          const height = 30 + ((i * 3) % 40);
          const opacity = 0.35 + ((i * 0.05) % 0.4);
          return (
            <span
              key={i}
              className="rain-drop absolute block"
              style={{
                left: `${left}%`,
                top: "-10vh",
                width: 1,
                height,
                background: `linear-gradient(to bottom, transparent, rgba(220, 235, 255, ${opacity}))`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
              }}
            />
          );
        })}
      </div>

      {/* Wet-glass overlay — slow horizontal smear */}
      <div className="absolute inset-0 pointer-events-none wet-overlay" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              "radial-gradient(ellipse 30% 8% at 30% 40%, rgba(255,255,255,0.4) 0%, transparent 70%)," +
              "radial-gradient(ellipse 20% 6% at 70% 60%, rgba(255,255,255,0.3) 0%, transparent 70%)," +
              "radial-gradient(ellipse 25% 5% at 50% 80%, rgba(255,255,255,0.25) 0%, transparent 70%)",
            filter: "blur(2px)",
          }}
        />
      </div>

      {/* Darkening vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 100% 80% at 50% 100%, rgba(0,0,0,0.25) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      {/* Occasional lightning during heavy rain */}
      {heavy && (
        <div
          className="absolute inset-0 pointer-events-none lightning-burst"
          style={{ background: "rgba(220, 230, 255, 0.5)", animationDelay: "3s" }}
          aria-hidden="true"
        />
      )}
    </>
  );
}
