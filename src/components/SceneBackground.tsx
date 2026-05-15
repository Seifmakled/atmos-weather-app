import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
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

/** Star field for clear nights. */
function NightSky() {
  const { scrollYProgress } = useScroll();
  const moonX = useTransform(scrollYProgress, [0, 0.25, 0.55, 0.8, 1], [0, -24, 18, -10, 30]);
  const moonY = useTransform(scrollYProgress, [0, 0.25, 0.55, 0.8, 1], [0, 42, -24, 18, -10]);
  const moonScale = useTransform(scrollYProgress, [0, 1], [0.96, 1.12]);
  const moonRotate = useTransform(scrollYProgress, [0, 1], [-12, 16]);
  const moonGlow = useTransform(scrollYProgress, [0, 1], [0.22, 0.42]);

  const stars = Array.from({ length: 90 });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
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
      <motion.div
        className="absolute"
        style={{
          top: "11vh",
          right: "8vw",
          width: 170,
          height: 170,
          x: moonX,
          y: moonY,
          scale: moonScale,
          rotate: moonRotate,
        }}
        animate={{
          opacity: [0.76, 1, 0.74, 0.92, 0.76],
          y: [0, -8, 10, -4, 0],
          x: [0, 8, -12, 10, 0],
          rotate: [-6, 8, 16, -10, -6],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ opacity: moonGlow }}
          animate={{ scale: [0.94, 1.1, 0.96], rotate: [0, 18, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 35% 35%, rgba(255,255,252,0.98) 0%, rgba(233,238,255,0.95) 28%, rgba(192,204,232,0.82) 58%, rgba(192,204,232,0.08) 74%, transparent 77%)",
              boxShadow: "0 0 60px rgba(190, 205, 255, 0.42)",
              filter: "blur(1px)",
            }}
          />
          <div
            className="absolute left-[20%] top-[28%] h-[18%] w-[18%] rounded-full"
            style={{ background: "rgba(175, 187, 219, 0.42)", filter: "blur(1px)" }}
          />
          <div
            className="absolute left-[55%] top-[46%] h-[12%] w-[12%] rounded-full"
            style={{ background: "rgba(175, 187, 219, 0.3)", filter: "blur(1px)" }}
          />
          <div
            className="absolute inset-[-12%] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 38%, transparent 72%)",
              filter: "blur(14px)",
            }}
          />
        </motion.div>
      </motion.div>
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
