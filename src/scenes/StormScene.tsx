import RainyScene from "@/scenes/RainyScene";

/**
 * Storm = heavy rain + frequent lightning + dramatic vignette.
 * We reuse RainyScene with heavy=true and stack two extra lightning layers
 * with offset animation delays to make the bursts feel non-rhythmic.
 */
export default function StormScene() {
  return (
    <>
      <RainyScene heavy />

      {/* Lightning layers — different delays so flashes feel chaotic */}
      <div
        className="absolute inset-0 pointer-events-none lightning-burst"
        style={{
          background:
            "linear-gradient(180deg, rgba(220, 220, 255, 0.6) 0%, transparent 60%)",
          animationDelay: "0s",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 pointer-events-none lightning-burst"
        style={{
          background:
            "radial-gradient(ellipse at 70% 0%, rgba(230, 230, 255, 0.5) 0%, transparent 50%)",
          animationDelay: "4.5s",
        }}
        aria-hidden="true"
      />

      {/* Deeper darkening */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "rgba(0, 0, 30, 0.18)" }}
        aria-hidden="true"
      />
    </>
  );
}
