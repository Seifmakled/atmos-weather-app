/**
 * Foggy/misty atmosphere — soft horizontal bands of low-opacity white drift
 * slowly across the viewport.
 */
export default function FogScene() {
  const bands = [
    { top: "20vh", duration: 90,  opacity: 0.18, height: "30vh", delay: 0 },
    { top: "45vh", duration: 130, opacity: 0.14, height: "25vh", delay: -30 },
    { top: "70vh", duration: 110, opacity: 0.20, height: "20vh", delay: -60 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {bands.map((b, i) => (
        <div
          key={i}
          className="cloud absolute left-0 w-[140vw]"
          style={{
            top: b.top,
            height: b.height,
            background:
              "linear-gradient(180deg, transparent 0%, rgba(255,255,255," + b.opacity + ") 50%, transparent 100%)",
            filter: "blur(40px)",
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
      {/* Subtle haze across the whole screen */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(255,255,255,0.06)" }}
      />
    </div>
  );
}
