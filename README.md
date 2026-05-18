# Atmos — A cinematic weather app

### 🌤️ [Live demo → atmos-iota.vercel.app](https://atmos-iota.vercel.app/)

[![Live Demo](https://img.shields.io/badge/Live_Demo-atmos--iota.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://atmos-iota.vercel.app/)

A production-quality weather web app that feels like the environment outside your window is reflected on the screen. The atmosphere changes with the weather: sun rays for clear days, animated rain and lightning for storms, drifting clouds, falling snow, a starfield at night.

**New:** iPhone-style weather heat-map page at `/map` — pan and zoom anywhere in the world, switch between precipitation (radar) / temperature / clouds / wind / pressure, scrub through the past two hours of radar with a play/pause control, tap anywhere on the map to read current conditions at that point.

Built with **React + Vite + TypeScript + Tailwind CSS + Framer Motion + Zustand + Leaflet**.

![React](https://img.shields.io/badge/React-18-61DAFB) ![Vite](https://img.shields.io/badge/Vite-5-646CFF) ![Tailwind](https://img.shields.io/badge/Tailwind-3-38BDF8) ![Framer](https://img.shields.io/badge/Framer_Motion-11-FF0080) ![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900)

## Quick start

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). The app works out of the box — **no API key needed**.

Click "Map" next to the search bar to jump into the heat-map view.

## Build for production

```bash
npm run build
npm run preview
```

## Features

### Home page (`/`)
- City search with debounced autocomplete (Open-Meteo geocoding)
- Auto-detect your location on first load
- Current temperature, "feels like", humidity, wind speed + compass direction, sunrise/sunset, UV index
- 24-hour hourly forecast (horizontally scrollable)
- 7-day daily forecast with min/max range bars
- Live animated clock and date
- Sunrise/sunset arc with a sun marker that moves with the current time
- °C ↔ °F unit toggle (persisted)
- Recent searches saved across sessions (top 6)
- Ambient sound toggle — different audio per weather family
- Dynamic backgrounds (6 weather families × day/night = 12 scenes)
- Glassmorphism cards, animated SVG icons, smooth transitions

### Heat-map page (`/map`)
- Full-screen interactive map (Leaflet + dark Carto base tiles)
- **Precipitation radar** via RainViewer (no key needed) with:
  - Past 12 frames (covering ~2 hours of past radar)
  - Up to 3 nowcast frames (~30 min future)
  - Play/pause auto-scrubbing
  - Manual scrubbing with a slider
- **Optional layers** (require `VITE_OPENWEATHERMAP_API_KEY`):
  - Temperature
  - Cloud cover
  - Wind speed
  - Atmospheric pressure
- Floating layer picker (right side, iPhone-style)
- Color-coded legend bar (bottom)
- City pin auto-placed for currently loaded city
- Click anywhere on the map → fetches conditions at that point and shows a side card with temp / humidity / wind / sunrise / sunset
- Smooth fade transition between home and map pages

### Design
- Glassmorphism cards (three intensity levels)
- Custom keyframes: `rain-fall`, `snow-fall`, `cloud-drift`, `ray-rotate`, `lightning-burst`, `particle-float`, `wet-shift`
- Fully responsive (mobile / tablet / desktop)
- Browser theme color updates to match the current scene

## API providers

The app supports two providers for **forecast data** and two for **heat-map tiles**.

### Forecast data
**Default — Open-Meteo (keyless).** Just run `npm run dev`.

**Optional — OpenWeatherMap.** Add to `.env`:
```
VITE_WEATHER_PROVIDER=openweathermap
VITE_OPENWEATHERMAP_API_KEY=your_key_here
```

### Heat-map tiles
**Default — RainViewer (keyless).** Only precipitation/radar.

**Add OpenWeatherMap key for more layers.** With `VITE_OPENWEATHERMAP_API_KEY` set, the layer picker also exposes temperature, clouds, wind, and pressure tiles.

## Project structure

```
src/
├── main.tsx                   React root
├── App.tsx                    Router (HomePage + MapPage)
├── index.css                  Tailwind layers, scene CSS vars, Leaflet overrides
│
├── pages/
│   ├── HomePage.tsx           Single-page dashboard view (the original Atmos)
│   └── MapPage.tsx            Heat-map view (Leaflet + RainViewer + OWM)
│
├── types/
│   └── weather.ts             Normalized weather data shape
│
├── lib/
│   ├── wmo.ts                 WMO weather-code mapping
│   ├── format.ts              Temperature, time, compass helpers
│   ├── geocode.ts             City search
│   ├── scenes.ts              12 scene token sets
│   ├── weather.ts             Forecast provider dispatcher
│   ├── rainviewer.ts          RainViewer radar manifest + tile URLs
│   ├── heatLayers.ts          Heat-map layer registry + legends
│   └── providers/
│       ├── openmeteo.ts       Default forecast provider
│       └── openweathermap.ts  Optional forecast provider
│
├── hooks/
│   ├── useSceneTokens.ts      Applies scene CSS vars on weather change
│   ├── useLiveClock.ts        Re-renders once per second
│   └── useGeolocation.ts      Promise wrapper around navigator.geolocation
│
├── store/
│   └── useWeatherStore.ts     Zustand + persist
│
├── scenes/                    Atmospheric overlays
│   ├── SunnyScene.tsx
│   ├── CloudyScene.tsx
│   ├── RainyScene.tsx
│   ├── SnowScene.tsx
│   ├── StormScene.tsx
│   └── FogScene.tsx
│
└── components/
    ├── SceneBackground.tsx    Scene dispatcher
    ├── WeatherIcon.tsx        9 animated SVG icons
    ├── TopBar.tsx
    ├── SearchBar.tsx
    ├── CurrentWeatherCard.tsx
    ├── HourlyForecast.tsx
    ├── DailyForecast.tsx
    ├── SunArc.tsx
    ├── LiveClock.tsx
    ├── LoadingOverlay.tsx
    ├── ErrorToast.tsx
    └── AmbientAudio.tsx
```

## Notes

- The "increased screen brightness" for sunny days is purely visual — CSS overlays, glow, contrast adjustments. Hardware brightness is never modified.
- All animations are GPU-accelerated CSS transforms and `<svg>` properties.
- Audio is gated behind a user-gesture toggle to comply with browser autoplay policies.
- Recent searches and unit preference persist in `localStorage` (key: `atmos-weather-store`).
- The map page uses Leaflet's default attribution control as required by RainViewer, CARTO, and OpenStreetMap licenses.

## License

Public domain — do whatever you want with it.
