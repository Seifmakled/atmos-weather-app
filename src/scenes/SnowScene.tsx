/**
 * Animated snowfall — a moderate number of flakes drift down with horizontal
 * sway via the snow-fall keyframe. Subtle frost overlay on top.
 */
export default function SnowScene() {
  const flakes = Array.from({ length: 70 });

  return (
    <>
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {flakes.map((_, i) => {
          const left = (i * 7.3) % 100;
          const delay = (i * 0.21) % 6;
          const duration = 7 + ((i * 0.4) % 8);
          const size = 2 + (i % 5);
          const opacity = 0.4 + ((i * 0.07) % 0.6);
          return (
            <span
              key={i}
              className="snow-flake absolute block rounded-full bg-white"
              style={{
                left: `${left}%`,
                top: 0,
                width: size,
                height: size,
                opacity,
                filter: "blur(0.4px)",
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
                boxShadow: "0 0 4px rgba(255,255,255,0.5)",
              }}
            />
          );
        })}
      </div>

      {/* Frost on the edges */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, transparent 50%, rgba(200, 220, 240, 0.15) 100%)",
        }}
        aria-hidden="true"
      />
    </>
  );
}
