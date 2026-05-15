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

/** Star field for clear nights, with a textured moon that drifts across the sky. */
function NightSky() {
  const stars = Array.from({ length: 90 });
  const heroStars = [
    { left: 15, top: 12, size: 3.5, d: 0 },
    { left: 42, top: 8, size: 2.5, d: 1.2 },
    { left: 68, top: 22, size: 3.2, d: 0.6 },
    { left: 28, top: 35, size: 2.8, d: 2 },
    { left: 85, top: 15, size: 3, d: 1.5 },
    { left: 55, top: 42, size: 2.2, d: 0.9 },
  ];

  // Stars that wander the sky on their own slow path (in addition to twinkling)
  const driftVariants = ["star-drift-a", "star-drift-b", "star-drift-c"] as const;
  const driftingStars = Array.from({ length: 16 }).map((_, i) => ({
    left: (i * 17.3 + 4) % 96,
    top: (i * 11.7 + 6) % 70,
    size: 1.2 + (i % 3) * 0.6,
    twinkle: 2.5 + (i % 4),
    twinkleDelay: (i * 0.37) % 3,
    drift: driftVariants[i % 3],
    driftDelay: (i * 4.3) % 30,
  }));

  // Mare — large irregular darker patches (the moon's "seas")
  const mare = [
    { l: 18, t: 38, w: 34, h: 24, r: "55% 45% 50% 50% / 60% 50% 50% 40%", o: 0.22 },
    { l: 46, t: 54, w: 30, h: 22, r: "60% 40% 55% 45% / 50% 60% 40% 50%", o: 0.18 },
    { l: 58, t: 18, w: 20, h: 16, r: "50% 50% 60% 40% / 55% 45% 50% 50%", o: 0.14 },
  ];

  // Craters — small darker pock-marks with directional shading (lit from upper-left)
  const craters = [
    { l: 22, t: 30, s: 13 },
    { l: 56, t: 44, s: 9 },
    { l: 38, t: 62, s: 7 },
    { l: 68, t: 28, s: 5 },
    { l: 44, t: 22, s: 4 },
    { l: 30, t: 72, s: 5 },
    { l: 62, t: 66, s: 6 },
    { l: 50, t: 36, s: 3.5 },
    { l: 75, t: 52, s: 4 },
    { l: 25, t: 58, s: 3 },
    { l: 78, t: 38, s: 3 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Regular stars */}
      {stars.map((_, i) => {
        const left = (i * 11.1) % 100;
        const top = (i * 7.3) % 100;
        const size = 1 + (i % 3) * 0.5;
        const twinkle = 2 + (i % 5);
        const delay = (i * 0.13) % 4;
        return (
          <span
            key={i}
            className="absolute rounded-full bg-white animate-pulse-slow"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              opacity: 0.6 + (i % 4) * 0.1,
              animationDuration: `${twinkle}s`,
              animationDelay: `${delay}s`,
              boxShadow: "0 0 4px rgba(255,255,255,0.6)",
            }}
          />
        );
      })}

      {/* Hero stars with strong silver glow */}
      {heroStars.map((s, i) => (
        <span
          key={`hero-${i}`}
          className="absolute rounded-full bg-white animate-pulse-slow"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            opacity: 0.95,
            animationDuration: `${2.5 + i * 0.5}s`,
            animationDelay: `${s.d}s`,
            boxShadow: `0 0 ${s.size * 3}px rgba(200,220,255,0.95), 0 0 ${s.size * 7}px rgba(180,210,255,0.5)`,
          }}
        />
      ))}

      {/* Drifting stars — wander the sky slowly while twinkling */}
      {driftingStars.map((s, i) => (
        <div
          key={`drift-${i}`}
          className={`absolute ${s.drift}`}
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            animationDelay: `${s.driftDelay}s`,
          }}
        >
          <span
            className="block rounded-full bg-white animate-pulse-slow"
            style={{
              width: s.size,
              height: s.size,
              opacity: 0.85,
              animationDuration: `${s.twinkle}s`,
              animationDelay: `${s.twinkleDelay}s`,
              boxShadow: `0 0 ${s.size * 2.5}px rgba(220,235,255,0.85), 0 0 ${s.size * 5}px rgba(190,215,255,0.4)`,
            }}
          />
        </div>
      ))}

      {/* Moon — drifts across the sky on its own slow path */}
      <motion.div
        className="absolute"
        style={{ width: 200, height: 200, top: "8vh", left: "58vw" }}
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          x: ["0vw", "-14vw", "-30vw", "-22vw", "4vw", "0vw"],
          y: ["0vh", "9vh", "4vh", "18vh", "-3vh", "0vh"],
        }}
        transition={{
          opacity: { duration: 1.6 },
          x: {
            duration: 110,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.2, 0.45, 0.7, 0.9, 1],
          },
          y: {
            duration: 110,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.2, 0.45, 0.7, 0.9, 1],
          },
        }}
      >
        {/* Far diffuse halo */}
        <div
          className="absolute rounded-full"
          style={{
            inset: "-90%",
            background:
              "radial-gradient(circle, rgba(200,220,255,0.32) 0%, rgba(180,205,255,0.14) 25%, rgba(160,195,255,0.06) 45%, transparent 65%)",
            filter: "blur(32px)",
          }}
        />

        {/* Close corona */}
        <div
          className="absolute rounded-full"
          style={{
            inset: "-35%",
            background:
              "radial-gradient(circle, rgba(220,235,255,0.4) 0%, rgba(195,215,255,0.18) 38%, transparent 65%)",
            filter: "blur(14px)",
          }}
        />

        {/* Outer glow ring (box-shadow only, not clipped) */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow:
              "0 0 55px rgba(200,218,255,0.7), 0 0 130px rgba(180,208,255,0.35), 0 0 240px rgba(160,198,255,0.15)",
          }}
        />

        {/* Moon body — clipped circle, gently bobs within the drifting container */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ overflow: "hidden" }}
          animate={{ y: [0, -3, 4, -2, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Base surface with directional 3D shading */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 35% 32%, rgba(255,255,250,0.99) 0%, rgba(243,247,255,0.97) 14%, rgba(225,232,250,0.95) 30%, rgba(205,216,242,0.92) 48%, rgba(180,195,228,0.88) 66%, rgba(155,175,215,0.78) 82%, rgba(135,158,200,0.6) 96%)",
              boxShadow:
                "inset -18px -28px 55px rgba(70,90,140,0.4), inset 10px 12px 35px rgba(255,255,255,0.22)",
            }}
          />

          {/* Mare — large irregular darker seas */}
          {mare.map((m, i) => (
            <div
              key={`mare-${i}`}
              className="absolute"
              style={{
                left: `${m.l}%`,
                top: `${m.t}%`,
                width: `${m.w}%`,
                height: `${m.h}%`,
                background: `radial-gradient(ellipse at center, rgba(135,155,195,${m.o}) 0%, rgba(150,170,205,${m.o * 0.6}) 60%, transparent 100%)`,
                borderRadius: m.r,
                filter: "blur(3px)",
              }}
            />
          ))}

          {/* Craters — depth via inset shadow (top-left bright, bottom-right dark) */}
          {craters.map((c, i) => (
            <div
              key={`crater-${i}`}
              className="absolute rounded-full"
              style={{
                left: `${c.l}%`,
                top: `${c.t}%`,
                width: `${c.s}%`,
                height: `${c.s}%`,
                background:
                  "radial-gradient(circle at 35% 35%, rgba(130,148,188,0.5) 0%, rgba(155,172,208,0.32) 60%, rgba(255,255,255,0.18) 95%)",
                boxShadow:
                  "inset 1px 1px 2px rgba(255,255,255,0.35), inset -1px -1px 2.5px rgba(60,80,120,0.5)",
                filter: "blur(0.6px)",
              }}
            />
          ))}

          {/* Surface noise grain */}
          <svg
            className="absolute inset-0 w-full h-full"
            style={{ mixBlendMode: "overlay", opacity: 0.35 }}
          >
            <defs>
              <filter id="moonGrain">
                <feTurbulence type="fractalNoise" baseFrequency="3" numOctaves="2" seed="5" />
                <feColorMatrix
                  values="0 0 0 0 0.55
                          0 0 0 0 0.6
                          0 0 0 0 0.7
                          0 0 0 0.45 0"
                />
              </filter>
            </defs>
            <rect width="100%" height="100%" filter="url(#moonGrain)" />
          </svg>

          {/* Dark side falloff — adds depth on lower-right */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 70% 75%, rgba(40,55,90,0.25) 0%, transparent 55%)",
              mixBlendMode: "multiply",
            }}
          />
        </motion.div>

        {/* Outer bloom — sits on top so light feels like it's pooling around the moon */}
        <div
          className="absolute inset-[-15%] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(200,222,255,0.04) 42%, transparent 70%)",
            filter: "blur(20px)",
          }}
        />
      </motion.div>

      {/* Gentle ambient sky wash — centered, non-directional */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 50% at 50% 0%, rgba(180,210,255,0.07) 0%, transparent 55%)",
        }}
      />
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
