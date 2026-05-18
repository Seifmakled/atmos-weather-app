import { useEffect, useRef, useState } from "react";
import { useWeatherStore } from "@/store/useWeatherStore";

/**
 * AmbientAudio
 *
 * Plays a soft ambient loop matched to the current weather family.
 *
 * Strategy: every weather family has at least one CDN fallback URL.
 * If all CDN URLs fail to load, we generate a soft synthetic
 * ambient tone with the Web Audio API so the user still hears
 * SOMETHING when they enable the toggle.
 *
 * Browsers require a user gesture before audio plays. The toggle button
 * in TopBar provides that gesture, so play() is safe to call here.
 */

interface AmbientTrack {
  /** Array of fallback URLs — first one that loads wins. */
  urls: string[];
  /** Synthetic fallback parameters used if all URLs fail. */
  synth: {
    /** Base frequency in Hz for the noise filter sweep. */
    centerFreq: number;
    /** Q (resonance) — higher = more tonal, lower = more diffuse. */
    q: number;
    /** Overall gain 0-1. */
    gain: number;
  };
}

// Internet Archive has stable, hot-linkable, public-domain field recordings.
// Each URL ends in .mp3 and serves a proper Content-Type. They loop cleanly.
const TRACKS: Record<string, AmbientTrack> = {
  clear: {
    urls: [
      "https://archive.org/download/birdsongsfx/Bird%20Songs%20-%20Forest.mp3",
    ],
    synth: { centerFreq: 500, q: 0.4, gain: 0.04 },
  },
  cloudy: {
    urls: [
      "https://archive.org/download/wind-light-breeze/wind-light-breeze.mp3",
    ],
    synth: { centerFreq: 280, q: 0.5, gain: 0.05 },
  },
  rain: {
    urls: [
      "https://archive.org/download/RainAmbience/RainAmbience.mp3",
    ],
    synth: { centerFreq: 1800, q: 0.6, gain: 0.08 },
  },
  storm: {
    urls: [
      "https://archive.org/download/ThunderstormSoundEffect/ThunderstormSoundEffect.mp3",
    ],
    synth: { centerFreq: 200, q: 0.8, gain: 0.1 },
  },
  snow: {
    urls: [
      "https://archive.org/download/wind-light-breeze/wind-light-breeze.mp3",
    ],
    synth: { centerFreq: 350, q: 0.4, gain: 0.05 },
  },
  fog: {
    urls: [
      "https://archive.org/download/wind-light-breeze/wind-light-breeze.mp3",
    ],
    synth: { centerFreq: 220, q: 0.4, gain: 0.05 },
  },
};

/** Build a Web Audio graph that synthesizes ambient noise locally. */
function createSynthAmbient(
  ctx: AudioContext,
  params: AmbientTrack["synth"]
): { stop: () => void } {
  // Pink-ish noise via filtered white noise
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  // Simple pink noise approximation (Voss-McCartney)
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
    b6 = white * 0.115926;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = params.centerFreq;
  filter.Q.value = params.q;

  const gain = ctx.createGain();
  gain.gain.value = 0;

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start();
  // Fade in
  gain.gain.linearRampToValueAtTime(params.gain, ctx.currentTime + 1.2);

  return {
    stop: () => {
      // Fade out then disconnect
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.5);
      window.setTimeout(() => {
        try {
          noise.stop();
          noise.disconnect();
          filter.disconnect();
          gain.disconnect();
        } catch { /* ignore */ }
      }, 600);
    },
  };
}

export default function AmbientAudio() {
  const audioEnabled = useWeatherStore((s) => s.audioEnabled);
  const weather = useWeatherStore((s) => s.weather);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<{ stop: () => void } | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  // We track the current family so weather updates that don't change family
  // don't reset the audio.
  const lastFamilyRef = useRef<string | null>(null);
  const [, force] = useState(0);
  void force;

  const family = weather?.current.condition.family ?? "clear";
  const track = TRACKS[family] ?? TRACKS.clear;

  // Stop everything cleanly
  const stopAll = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
    }
    if (synthRef.current) {
      synthRef.current.stop();
      synthRef.current = null;
    }
  };

  // Start playback — try CDN first, fall back to Web Audio synth
  const startAudio = async () => {
    stopAll();
    const el = audioRef.current;
    if (!el) return;

    // Try each URL in order
    for (const url of track.urls) {
      try {
        el.src = url;
        el.volume = 0.4;
        el.loop = true;
        await el.play();
        return; // success
      } catch {
        // Try next URL
      }
    }

    // All CDN URLs failed — synthesize locally so the user hears something
    try {
      if (!ctxRef.current) {
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        ctxRef.current = new AC();
      }
      if (ctxRef.current.state === "suspended") {
        await ctxRef.current.resume();
      }
      synthRef.current = createSynthAmbient(ctxRef.current, track.synth);
    } catch {
      // Last-resort failure — silently give up; the toggle reverts visually
      // via the store's audioEnabled remaining false on next click.
    }
  };

  // React to toggle changes
  useEffect(() => {
    if (audioEnabled) {
      lastFamilyRef.current = family;
      void startAudio();
    } else {
      stopAll();
    }
    // We intentionally don't include startAudio/stopAll deps (they're stable)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioEnabled]);

  // React to family changes WHILE playing
  useEffect(() => {
    if (!audioEnabled) return;
    if (lastFamilyRef.current === family) return;
    lastFamilyRef.current = family;
    void startAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [family]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAll();
      if (ctxRef.current) {
        ctxRef.current.close().catch(() => { /* ignore */ });
        ctxRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <audio ref={audioRef} preload="none" />;
}
