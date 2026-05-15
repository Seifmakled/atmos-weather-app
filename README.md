# Atmos — A cinematic weather app

A production-quality weather web app that feels like the environment outside your window is reflected on the screen. The atmosphere changes with the weather: sun rays for clear days, animated rain and lightning for storms, drifting clouds, falling snow, a starfield at night.

Built with **React + Vite + TypeScript + Tailwind CSS + Framer Motion + Zustand**.

![Atmos](https://img.shields.io/badge/React-18-61DAFB) ![Vite](https://img.shields.io/badge/Vite-5-646CFF) ![Tailwind](https://img.shields.io/badge/Tailwind-3-38BDF8) ![Framer](https://img.shields.io/badge/Framer_Motion-11-FF0080)

## Quick start

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). The app works out of the box — no API key needed.

## Build for production

```bash
npm run build
npm run preview
```

## Features

### Core
- Search any city worldwide with debounced autocomplete (Open-Meteo geocoding)
- Auto-detect your location on first load (with graceful fallback to Cairo)
- Current conditions: temperature, "feels like", humidity, wind speed + compass direction, sunrise/sunset, UV index
- 24-hour hourly forecast (horizontally scrollable)
- 7-day daily forecast with min/max range bars
- Live animated clock and date
- Sunrise/sunset arc with a sun marker that moves with the current time
- °C ↔ °F unit toggle (persisted)
- Recent searches saved across sessions (top 6)
- Ambient sound toggle — different audio per weather family (rain, storm, wind)

### Dynamic backgrounds
Every weather family renders a unique scene. The whole page background, text color, accent color and overall brightness shift to match. All transitions are smooth via Framer Motion's `AnimatePresence`.

| Weather  | Day scene                                      | Night scene                          |
|----------|------------------------------------------------|--------------------------------------|
| Clear    | Sun with rotating rays, golden wash, dust motes, brightness boost | Starfield + soft moon glow |
| Cloudy   | Soft drifting clouds, calm gray sky            | Same clouds over darker sky          |
| Rain     | Animated rain streaks, wet-glass smear, vignette | Same with deeper darkening         |
| Storm    | Heavy rain + non-rhythmic lightning flashes    | Same + darker sky                    |
| Snow     | Falling flakes with drift, frosted edges       | Same with darker palette             |
| Fog      | Soft horizontal fog bands                      | Same with darker base                |

### Design
- Glassmorphism cards (three intensity levels: `.glass`, `.glass-strong`, `.glass-frosted`)
- Smooth page-load fade, staggered card entrances, animated SVG weather icons
- Custom keyframes: `rain-fall`, `snow-fall`, `cloud-drift`, `ray-rotate`, `lightning-burst`, `particle-float`, `wet-shift`
- Fully responsive (mobile / tablet / desktop)
- Browser theme color updates to match the current scene

## API providers

The app supports two providers. **Open-Meteo is the default and requires no key.**

### Option 1 — Open-Meteo (default, free, keyless)
Nothing to configure. Just run `npm run dev`.

### Option 2 — OpenWeatherMap
1. Get a free API key at https://openweathermap.org/api (the "One Call API 3.0" tier).
2. Copy `.env.example` to `.env` and uncomment:
   ```
   VITE_WEATHER_PROVIDER=openweathermap
   VITE_OPENWEATHERMAP_API_KEY=your_key_here
   ```
3. Restart `npm run dev`.

Both providers feed the same normalized data shape, so the UI doesn't care which one is active.

## Project structure

```
src/
├── main.tsx                  Entry — React root
├── App.tsx                   Composes everything; owns first-load logic
├── index.css                 Tailwind layers, scene CSS vars, all keyframes
│
├── types/
│   └── weather.ts            Normalized weather data shape
│
├── lib/
│   ├── wmo.ts                WMO weather-code → normalized condition
│   ├── format.ts             Temperature, time, compass helpers
│   ├── geocode.ts             City search (Open-Meteo)
│   ├── scenes.ts             Scene tokens (12 palettes: 6 families × day/night)
│   ├── weather.ts            Provider dispatcher
│   └── providers/
│       ├── openmeteo.ts      Default provider
│       └── openweathermap.ts Optional provider
│
├── hooks/
│   ├── useSceneTokens.ts     Applies scene CSS vars on weather change
│   ├── useLiveClock.ts       Re-renders once per second
│   └── useGeolocation.ts     Promise wrapper around navigator.geolocation
│
├── store/
│   └── useWeatherStore.ts    Zustand + persist (unit, audio, recent, weather)
│
├── scenes/                   Atmospheric overlays (one per weather family)
│   ├── SunnyScene.tsx
│   ├── CloudyScene.tsx
│   ├── RainyScene.tsx
│   ├── SnowScene.tsx
│   ├── StormScene.tsx
│   └── FogScene.tsx
│
└── components/
    ├── SceneBackground.tsx   Dispatches the right scene + AnimatePresence
    ├── WeatherIcon.tsx       9 animated SVG icons (sun/moon/cloud/rain/...)
    ├── TopBar.tsx            Brand, unit toggle, ambient audio toggle
    ├── SearchBar.tsx         Debounced search, geolocate, recent list
    ├── CurrentWeatherCard.tsx
    ├── HourlyForecast.tsx
    ├── DailyForecast.tsx
    ├── SunArc.tsx            Sunrise → sunset SVG arc with live marker
    ├── LiveClock.tsx
    ├── LoadingOverlay.tsx    First-load loader
    ├── ErrorToast.tsx        Auto-dismissing error banner
    └── AmbientAudio.tsx      Hidden <audio> element driven by store
```

## Design system

CSS variables live on `:root` and are updated by `useSceneTokens()` whenever the weather changes:

```css
--bg-1, --bg-2, --bg-3   /* Background gradient stops */
--ink, --ink-soft, --ink-faint  /* Text colors (RGB triples) */
--glass                  /* Base for glassmorphism */
--accent                 /* Highlight color */
--brightness             /* Overall scene brightness multiplier */
```

Tailwind exposes the RGB-triple vars as Tailwind color tokens (`bg-glass`, `text-ink`, `text-accent`, etc.) using the `rgb(var(--token) / <alpha-value>)` pattern.

## Notes

- The "increased screen brightness" effect for sunny days is **purely visual** — it uses CSS overlays, glow, and warm contrast adjustments. The hardware brightness is never modified.
- All animations are GPU-accelerated CSS transforms and `<svg>` properties, kept lightweight enough for 60fps on mid-range mobile.
- Audio is gated behind a user-gesture toggle in the TopBar to comply with browser autoplay policies.
- Recent searches and unit preference persist in `localStorage` (key: `atmos-weather-store`).

## License

Public domain — do whatever you want with it.
