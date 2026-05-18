import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { useWeatherStore } from "@/store/useWeatherStore";
import SunnyScene from "@/scenes/SunnyScene";
import CloudyScene from "@/scenes/CloudyScene";
import RainyScene from "@/scenes/RainyScene";
import SnowScene from "@/scenes/SnowScene";
import StormScene from "@/scenes/StormScene";
import FogScene from "@/scenes/FogScene";
import type { WeatherFamily } from "@/types/weather";

const SCENE_MAP: Record<WeatherFamily, (isDay: boolean) => ReactNode> = {
  clear:  (isDay) => isDay ? <SunnyScene /> : <NightSky />,
  cloudy: () => <CloudyScene />,
  rain:   () => <RainyScene />,
  snow:   () => <SnowScene />,
  storm:  () => <StormScene />,
  fog:    () => <FogScene />,
};

/**
 * Clear-night scene: textured moon with crater detail and a soft glow halo
 * (blended with the sky via screen mix-blend), a bed of twinkling stars,
 * and shooting stars streaking across the sky.
 */
function NightSky() {
  // Twinkling star field — pseudo-random but deterministic
  const stars = Array.from({ length: 110 }, (_, i) => {
    const left = (i * 11.137) % 100;
    const top = (i * 7.319) % 100;
    const size = 0.8 + ((i * 13) % 10) / 10 * 1.8; // 0.8 – 2.6 px
    const dur = 2.4 + ((i * 17) % 50) / 10;        // 2.4 – 7.4 s
    const delay = ((i * 0.27) % 5).toFixed(2);
    const opHi = 0.7 + ((i % 4) * 0.075);
    return { left, top, size, dur, delay, opHi, key: i };
  });

  // Shooting stars — angle drives both the rotation AND the travel direction
  // so the tip leads the motion. Streaks slope downward to the right (positive
  // angle), which is the classic meteor look against the upper sky.
  const shooters = [
    { top: "10%", left: "-6%",  ang: 18, dist: 780, dur: 3.0, delay: 0.6,  len: 110, peak: 0.55 },
    { top: "24%", left: "8%",   ang: 14, dist: 700, dur: 3.6, delay: 5.4,  len: 90,  peak: 0.45 },
    { top: "6%",  left: "38%",  ang: 26, dist: 620, dur: 3.2, delay: 9.2,  len: 130, peak: 0.55 },
    { top: "40%", left: "-8%",  ang: 10, dist: 880, dur: 4.2, delay: 14.0, len: 100, peak: 0.4  },
    { top: "16%", left: "55%",  ang: 22, dist: 560, dur: 2.8, delay: 18.6, len: 100, peak: 0.5  },
    { top: "4%",  left: "72%",  ang: 32, dist: 480, dur: 3.4, delay: 22.4, len: 80,  peak: 0.5  },
    { top: "32%", left: "30%",  ang: 16, dist: 760, dur: 3.8, delay: 27.6, len: 120, peak: 0.45 },
  ].map((s) => {
    const r = (s.ang * Math.PI) / 180;
    return { ...s, dx: Math.cos(r) * s.dist, dy: Math.sin(r) * s.dist };
  });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Subtle stellar haze */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 80% 18%, rgba(120,150,220,0.18), transparent 60%), radial-gradient(ellipse 50% 30% at 20% 70%, rgba(80,100,180,0.12), transparent 65%)",
          mixBlendMode: "screen",
        }}
      />

      {/* Twinkling stars */}
      {stars.map((s) => (
        <span
          key={s.key}
          className="absolute rounded-full bg-white twinkle"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            boxShadow: `0 0 ${s.size * 3}px rgba(255,255,255,0.7)`,
            ["--tdur" as string]: `${s.dur}s`,
            ["--tdelay" as string]: `${s.delay}s`,
            ["--op-lo" as string]: "0.25",
            ["--op-hi" as string]: `${s.opHi}`,
          } as React.CSSProperties}
        />
      ))}

      {/* Shooting stars — faint trail with a slightly brighter tip glow */}
      {shooters.map((s, i) => (
        <div
          key={`shoot-${i}`}
          className="absolute shooting-star"
          style={{
            top: s.top,
            left: s.left,
            width: s.len + 8,
            height: 6,
            transformOrigin: "right center",
            ["--dx" as string]: `${s.dx}px`,
            ["--dy" as string]: `${s.dy}px`,
            ["--ang" as string]: `${s.ang}deg`,
            ["--dur" as string]: `${s.dur}s`,
            ["--delay" as string]: `${s.delay}s`,
            ["--peak" as string]: `${s.peak}`,
          } as React.CSSProperties}
        >
          {/* Faint trail — fades from invisible to soft pale-blue toward the tip */}
          <div
            className="absolute"
            style={{
              left: 0,
              right: 5,
              top: 2,
              height: 1.5,
              borderRadius: 999,
              background:
                "linear-gradient(90deg, rgba(200,220,255,0) 0%, rgba(200,220,255,0.18) 55%, rgba(225,235,255,0.45) 92%, rgba(255,255,255,0.6) 100%)",
            }}
          />
          {/* Tip — small glowing dot at the leading edge */}
          <div
            className="absolute"
            style={{
              right: 0,
              top: 0,
              width: 5,
              height: 5,
              borderRadius: 999,
              background: "rgba(255,255,255,0.85)",
              boxShadow:
                "0 0 4px rgba(220,235,255,0.8), 0 0 10px rgba(170,200,255,0.45)",
            }}
          />
        </div>
      ))}

      {/* Moon — textured, with halo, blended into the night sky */}
      <Moon />
    </div>
  );
}

function Moon() {
  // Craters on a 200-unit canvas; moon disc centered at (100,100) r=60.
  // Tuple: [cx, cy, radius, darkness(0–1)]
  const craters: Array<[number, number, number, number]> = [
    [118, 80,  8,   0.60],
    [85,  96,  5.5, 0.50],
    [102, 116, 6.5, 0.48],
    [128, 108, 4.5, 0.55],
    [78,  78,  4,   0.42],
    [110, 92,  3,   0.50],
    [92,  130, 4,   0.45],
    [134, 92,  3.5, 0.48],
    [70,  110, 3,   0.42],
    [120, 130, 2.8, 0.55],
    [95,  74,  2.5, 0.38],
    [82,  140, 2,   0.45],
    [140, 120, 2.2, 0.50],
    [108, 138, 2.5, 0.42],
    [66,  92,  2,   0.40],
    [130, 76,  2.2, 0.45],
    [148, 100, 1.8, 0.42],
    [76,  124, 2,   0.40],
  ];
  // Tiny stipple speckles for added grain
  const speckles = Array.from({ length: 40 }, (_, i) => {
    const a = (i * 137.5) * (Math.PI / 180); // golden-angle scatter
    const rad = 8 + ((i * 13) % 48);
    return {
      cx: 100 + Math.cos(a) * rad,
      cy: 100 + Math.sin(a) * rad,
      r: 0.4 + ((i * 7) % 5) / 10,
      o: 0.18 + ((i * 11) % 30) / 100,
    };
  });

  return (
    <div
      className="absolute moon-drift"
      style={{
        top: "11vh",
        right: "14vw",
        width: 180,
        height: 180,
        opacity: 0.58,
      }}
    >
      {/* Outer atmospheric glow — sits behind, screens onto sky */}
      <div
        className="absolute inset-0 halo-pulse"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255,245,210,0.22) 0%, rgba(220,225,255,0.09) 30%, rgba(180,200,255,0.03) 55%, transparent 75%)",
          filter: "blur(10px)",
          mixBlendMode: "screen",
        }}
      />

      {/* Moon itself */}
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 moon-pulse"
        style={{ filter: "drop-shadow(0 0 10px rgba(255,240,200,0.15))" }}
      >
        <defs>
          {/* Lit body — warm cream highlight upper-left, fading to dusty rim */}
          <radialGradient id="moonBody" cx="38%" cy="32%" r="78%">
            <stop offset="0%"  stopColor="#fffaee" />
            <stop offset="35%" stopColor="#f3ead0" />
            <stop offset="70%" stopColor="#cdc4a8" />
            <stop offset="100%" stopColor="#7a7560" />
          </radialGradient>

          {/* Terminator shadow — deepens the unlit side, blends to sky */}
          <radialGradient id="moonShadow" cx="78%" cy="72%" r="78%">
            <stop offset="0%"  stopColor="rgba(15,20,40,0.65)" />
            <stop offset="45%" stopColor="rgba(15,20,40,0.25)" />
            <stop offset="100%" stopColor="rgba(15,20,40,0)" />
          </radialGradient>

          {/* Rim light — faint ring on far edge to keep moon distinct from sky */}
          <radialGradient id="moonRim" cx="50%" cy="50%" r="50%">
            <stop offset="92%" stopColor="rgba(255,250,230,0)" />
            <stop offset="98%" stopColor="rgba(255,250,230,0.45)" />
            <stop offset="100%" stopColor="rgba(255,250,230,0)" />
          </radialGradient>

          {/* Coarse noise — broad blotches, like uneven regolith albedo */}
          <filter id="moonTextureCoarse" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="3" seed="11" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0.55 0"
            />
            <feComposite in2="SourceGraphic" operator="in" />
          </filter>

          {/* Fine noise — sharp speckle grain on top of the coarse layer */}
          <filter id="moonTextureFine" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="2.8" numOctaves="2" seed="3" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0.45 0"
            />
            <feComposite in2="SourceGraphic" operator="in" />
          </filter>

          {/* Clip path so noise/craters never leak past the disc */}
          <clipPath id="moonDisc">
            <circle cx="100" cy="100" r="60" />
          </clipPath>
        </defs>

        {/* Soft inner glow ring around the moon disc */}
        <circle cx="100" cy="100" r="78" fill="rgba(255,245,215,0.08)" />
        <circle cx="100" cy="100" r="68" fill="rgba(255,245,215,0.12)" />

        {/* Moon body */}
        <circle cx="100" cy="100" r="60" fill="url(#moonBody)" />

        {/* Craters + noise texture, clipped to disc */}
        <g clipPath="url(#moonDisc)">
          {/* Maria — large dusky patches of basaltic plains */}
          <ellipse cx="112" cy="92"  rx="22" ry="14" fill="rgba(105,92,68,0.32)" />
          <ellipse cx="86"  cy="118" rx="18" ry="11" fill="rgba(105,92,68,0.28)" transform="rotate(-15 86 118)" />
          <ellipse cx="130" cy="120" rx="12" ry="8"  fill="rgba(95,82,60,0.24)"  transform="rotate(20 130 120)" />
          <ellipse cx="78"  cy="88"  rx="10" ry="6"  fill="rgba(105,92,68,0.20)" transform="rotate(40 78 88)" />

          {/* Coarse albedo blotches */}
          <rect x="40" y="40" width="120" height="120" filter="url(#moonTextureCoarse)" opacity="0.55" />

          {/* Stipple speckles — fine grain scattered across the disc */}
          {speckles.map((s, i) => (
            <circle key={`sp-${i}`} cx={s.cx} cy={s.cy} r={s.r} fill={`rgba(70,60,45,${s.o})`} />
          ))}

          {/* Craters */}
          {craters.map(([cx, cy, r, d], i) => (
            <g key={i}>
              {/* crater shadow (offset down-right) */}
              <circle cx={cx + r * 0.25} cy={cy + r * 0.25} r={r} fill={`rgba(45,38,28,${d})`} />
              {/* crater floor */}
              <circle cx={cx} cy={cy} r={r * 0.85} fill="rgba(170,158,128,0.55)" />
              {/* crater highlight rim (upper-left) */}
              <circle cx={cx - r * 0.2} cy={cy - r * 0.25} r={r * 0.55} fill="rgba(255,250,225,0.32)" />
            </g>
          ))}

          {/* Fine surface grain — last so it stipples over craters and maria */}
          <rect x="40" y="40" width="120" height="120" filter="url(#moonTextureFine)" opacity="0.45" />

          {/* Terminator / shaded crescent on the lower-right */}
          <circle cx="100" cy="100" r="60" fill="url(#moonShadow)" />
        </g>

        {/* Outer rim light */}
        <circle cx="100" cy="100" r="60" fill="url(#moonRim)" />
      </svg>
    </div>
  );
}

export default function SceneBackground() {
  const weather = useWeatherStore((s) => s.weather);

  const family: WeatherFamily = weather?.current.condition.family ?? "clear";
  const isDay = weather?.current.condition.isDay ?? false;
  const key = `${family}_${isDay ? "day" : "night"}`;
  const Scene = SCENE_MAP[family];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden scene-bg">
      <AnimatePresence mode="wait">
        <motion.div
          key={key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          {Scene(isDay)}
        </motion.div>
      </AnimatePresence>

      {/* Bottom fade to dark for legibility of footer content */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 100%)",
        }}
        aria-hidden="true"
      />
    </div>
  );
}
