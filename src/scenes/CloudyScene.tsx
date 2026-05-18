interface CloudConfig {
  top: string;
  scale: number;
  duration: number;
  delay: number;
  opacity: number;
}

const CLOUDS: CloudConfig[] = [
  { top: "8vh",  scale: 1.0, duration: 120, delay: 0,   opacity: 0.45 },
  { top: "22vh", scale: 0.7, duration: 160, delay: -40, opacity: 0.35 },
  { top: "40vh", scale: 1.4, duration: 200, delay: -90, opacity: 0.30 },
  { top: "60vh", scale: 0.9, duration: 180, delay: -25, opacity: 0.25 },
  { top: "75vh", scale: 1.2, duration: 220, delay: -130, opacity: 0.22 },
];

/** A soft, blurred cloud shape rendered with stacked radial gradients. */
function CloudShape({ scale, opacity }: { scale: number; opacity: number }) {
  return (
    <div
      style={{
        width: `${260 * scale}px`,
        height: `${100 * scale}px`,
        filter: "blur(6px)",
        opacity,
      }}
      className="relative"
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at 30% 60%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 30%, transparent 70%)," +
            "radial-gradient(ellipse at 70% 40%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.6) 30%, transparent 70%)," +
            "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.75) 0%, transparent 60%)",
        }}
      />
    </div>
  );
}

export default function CloudyScene() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {CLOUDS.map((c, i) => (
        <div
          key={i}
          className="cloud absolute"
          style={{
            top: c.top,
            animationDuration: `${c.duration}s`,
            animationDelay: `${c.delay}s`,
          }}
        >
          <CloudShape scale={c.scale} opacity={c.opacity} />
        </div>
      ))}
      {/* Soft top vignette to add atmospheric depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 60% at 50% 0%, rgba(255,255,255,0.06) 0%, transparent 50%)",
        }}
      />
    </div>
  );
}
