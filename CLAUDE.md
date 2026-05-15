# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite, http://localhost:5173)
npm run build     # Type-check then bundle for production (tsc && vite build)
npm run preview   # Serve the production build locally
```

No test runner is configured.

## Environment

Copy `.env.example` to `.env` to switch weather providers. By default no `.env` is needed — Open-Meteo is used and requires no API key.

```
VITE_WEATHER_PROVIDER=openweathermap      # optional, defaults to "openmeteo"
VITE_OPENWEATHERMAP_API_KEY=your_key_here # required only when using openweathermap
```

## Architecture

**State** lives entirely in a single Zustand store (`src/store/useWeatherStore.ts`). Persisted slices (`unit`, `audioEnabled`, `recent`) are saved to `localStorage` under the key `atmos-weather-store`. All weather fetching flows through `loadWeather()` in that store.

**Data pipeline:** `App.tsx` bootstraps on mount (geolocation → last recent → Cairo fallback) → `loadWeather` calls `src/lib/weather.ts` (provider dispatcher) → one of the two providers in `src/lib/providers/` → normalized `NormalizedWeather` shape defined in `src/types/weather.ts`.

**Scene system:** `useSceneTokens` (called once in `App`) watches `weather.current.condition` and writes 9 CSS custom properties (`--bg-1/2/3`, `--ink`, `--ink-soft`, `--ink-faint`, `--glass`, `--accent`, `--brightness`) to `:root`. All colors in the UI come from these vars — never hardcode colors when adding UI. Tailwind tokens like `text-ink`, `bg-glass`, `text-accent` map to these via `rgb(var(--token) / <alpha>)` in `tailwind.config.ts`.

**Scene backgrounds** (`src/scenes/`) are full-page animated overlays, one per weather family (`clear`, `cloudy`, `rain`, `storm`, `snow`, `fog`). `SceneBackground` (in `src/components/`) dispatches the correct scene and wraps transitions in Framer Motion `AnimatePresence`.

**WMO codes** are mapped to normalized condition families in `src/lib/wmo.ts`. When adding support for a new weather state, this is where the mapping lives.

**Glassmorphism** uses three Tailwind utility classes defined in `index.css`: `.glass`, `.glass-strong`, `.glass-frosted`. Use these for any card or overlay UI.

## Path alias

`@/` resolves to `src/` (configured in both `vite.config.ts` and `tsconfig.json`).

## Git workflow

When the user approves meaningful progress (a working feature, a significant fix, a notable visual improvement), push to the GitHub remote immediately without asking. Do not push for trivial changes, config tweaks, or anything that isn't clearly useful. Avoid frequent small pushes — batch related work where it makes sense.
