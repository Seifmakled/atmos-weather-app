import { useEffect, useRef } from "react";
import { useWeatherStore } from "@/store/useWeatherStore";

/**
 * Plays a soft ambient loop matched to the current weather family when the
 * user toggles the audio on. Sources are public-domain ambient loops on
 * the Pixabay CDN (no auth required). Browsers require a user gesture
 * before audio plays — the toggle button in TopBar provides that.
 */
const AMBIENT_BY_FAMILY: Record<string, string | null> = {
  clear:  null,                                                                 // Quiet
  cloudy: null,                                                                 // Quiet
  fog:    null,                                                                 // Quiet
  rain:   "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3",      // Soft rain
  snow:   "https://cdn.pixabay.com/audio/2022/10/14/audio_a06f04e9c1.mp3",      // Wind
  storm:  "https://cdn.pixabay.com/audio/2022/03/15/audio_d2624f3b08.mp3",      // Storm
};

export default function AmbientAudio() {
  const audioEnabled = useWeatherStore((s) => s.audioEnabled);
  const weather = useWeatherStore((s) => s.weather);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Update src whenever weather family changes
  useEffect(() => {
    const family = weather?.current.condition.family ?? "clear";
    const src = AMBIENT_BY_FAMILY[family] ?? null;

    if (!audioRef.current) return;
    const el = audioRef.current;

    if (src) {
      if (el.src !== src) el.src = src;
    } else {
      el.removeAttribute("src");
    }
  }, [weather]);

  // Play / pause based on toggle + src availability
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (audioEnabled && el.src) {
      el.volume = 0.45;
      el.loop = true;
      el.play().catch(() => { /* autoplay may be blocked; user must retry */ });
    } else {
      el.pause();
    }
  }, [audioEnabled]);

  return <audio ref={audioRef} preload="none" />;
}
