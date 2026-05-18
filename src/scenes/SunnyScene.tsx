import { motion } from "framer-motion";

/** Ambient particles (dust motes / pollen) — pure CSS animation, very cheap. */
function SunParticles() {
  const motes = Array.from({ length: 24 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {motes.map((_, i) => {
        const left = (i * 37) % 100;
        const delay = (i * 0.7) % 8;
        const duration = 14 + ((i * 1.7) % 10);
        const size = 2 + (i % 4);
        return (
          <span
            key={i}
            className="particle absolute rounded-full bg-white/40"
            style={{
              left: `${left}%`,
              bottom: "-5vh",
              width: size,
              height: size,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              filter: "blur(0.5px)",
              boxShadow: "0 0 6px rgba(255, 230, 180, 0.7)",
            }}
          />
        );
      })}
    </div>
  );
}

export default function SunnyScene() {
  return (
    <>
      {/* Sun + warmth wash */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6 }}
          className="absolute top-[-10vh] right-[-10vw] w-[60vmax] h-[60vmax]"
        >
          {/* Halo */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255, 220, 140, 0.85) 0%, rgba(255, 180, 100, 0.5) 18%, rgba(255, 160, 80, 0.2) 35%, transparent 70%)",
              filter: "blur(20px)",
            }}
          />
          {/* Rotating ray spokes */}
          <div className="absolute inset-0 ray-rotate" style={{ mixBlendMode: "screen" }}>
            <svg viewBox="0 0 100 100" className="w-full h-full opacity-30">
              <defs>
                <radialGradient id="ray" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(255,220,160,0.9)" />
                  <stop offset="100%" stopColor="rgba(255,220,160,0)" />
                </radialGradient>
              </defs>
              {Array.from({ length: 12 }).map((_, i) => (
                <rect
                  key={i}
                  x="49.5"
                  y="0"
                  width="1"
                  height="50"
                  fill="url(#ray)"
                  transform={`rotate(${i * 30} 50 50)`}
                />
              ))}
            </svg>
          </div>
        </motion.div>

        {/* Soft golden brightness wash on whole screen */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 70% 0%, rgba(255, 230, 170, 0.35) 0%, transparent 60%)",
          }}
        />

        {/* Lens flare streak */}
        <div
          className="absolute"
          style={{
            top: "10vh",
            right: "8vw",
            width: "50vw",
            height: "2px",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255, 240, 200, 0.6) 50%, transparent 100%)",
            filter: "blur(2px)",
            transform: "rotate(-25deg)",
          }}
        />
      </div>

      <SunParticles />

      {/* Brightness boost overlay — adds contrast without changing hardware brightness */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06) 0%, transparent 70%)",
          mixBlendMode: "overlay",
        }}
        aria-hidden="true"
      />
    </>
  );
}
