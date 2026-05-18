import { useEffect } from "react";
import { useWeatherStore } from "@/store/useWeatherStore";
import { getScene, SCENES } from "@/lib/scenes";

/**
 * Watches the current weather condition and writes scene tokens
 * (background, text colors, accent, brightness) to :root as CSS vars.
 *
 * On first paint — before any weather has loaded — this uses a calm
 * default night scene so the app doesn't flash bright white.
 */
export function useSceneTokens() {
  const weather = useWeatherStore((s) => s.weather);

  useEffect(() => {
    const scene = weather
      ? getScene(weather.current.condition.family, weather.current.condition.isDay)
      : SCENES.clear_night;

    const root = document.documentElement;
    root.style.setProperty("--bg-1", scene.bg1);
    root.style.setProperty("--bg-2", scene.bg2);
    root.style.setProperty("--bg-3", scene.bg3);
    root.style.setProperty("--ink", scene.ink);
    root.style.setProperty("--ink-soft", scene.inkSoft);
    root.style.setProperty("--ink-faint", scene.inkFaint);
    root.style.setProperty("--glass", scene.glass);
    root.style.setProperty("--accent", scene.accent);
    root.style.setProperty("--brightness", String(scene.brightness));
    // Match the browser chrome to the scene
    const meta = document.querySelector("meta[name=theme-color]");
    if (meta) meta.setAttribute("content", scene.bg1);
  }, [weather]);
}
