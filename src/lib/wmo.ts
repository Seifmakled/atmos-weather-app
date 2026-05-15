import type { NormalizedCondition, WeatherFamily } from "@/types/weather";

interface WmoEntry {
  label: string;
  icon: string;
  family: WeatherFamily;
}

// Open-Meteo WMO weather codes
export const WMO_MAP: Record<number, WmoEntry> = {
  0:  { label: "Clear sky",            icon: "sun",     family: "clear"  },
  1:  { label: "Mainly clear",         icon: "sun",     family: "clear"  },
  2:  { label: "Partly cloudy",        icon: "partly",  family: "cloudy" },
  3:  { label: "Overcast",             icon: "cloud",   family: "cloudy" },
  45: { label: "Foggy",                icon: "fog",     family: "fog"    },
  48: { label: "Depositing rime fog",  icon: "fog",     family: "fog"    },
  51: { label: "Light drizzle",        icon: "drizzle", family: "rain"   },
  53: { label: "Drizzle",              icon: "drizzle", family: "rain"   },
  55: { label: "Heavy drizzle",        icon: "rain",    family: "rain"   },
  56: { label: "Freezing drizzle",     icon: "rain",    family: "rain"   },
  57: { label: "Heavy freezing drizzle", icon: "rain",  family: "rain"   },
  61: { label: "Light rain",           icon: "drizzle", family: "rain"   },
  63: { label: "Rain",                 icon: "rain",    family: "rain"   },
  65: { label: "Heavy rain",           icon: "rain",    family: "rain"   },
  66: { label: "Freezing rain",        icon: "rain",    family: "rain"   },
  67: { label: "Heavy freezing rain",  icon: "rain",    family: "rain"   },
  71: { label: "Light snow",           icon: "snow",    family: "snow"   },
  73: { label: "Snow",                 icon: "snow",    family: "snow"   },
  75: { label: "Heavy snow",           icon: "snow",    family: "snow"   },
  77: { label: "Snow grains",          icon: "snow",    family: "snow"   },
  80: { label: "Light showers",        icon: "drizzle", family: "rain"   },
  81: { label: "Showers",              icon: "rain",    family: "rain"   },
  82: { label: "Violent showers",      icon: "storm",   family: "storm"  },
  85: { label: "Snow showers",         icon: "snow",    family: "snow"   },
  86: { label: "Heavy snow showers",   icon: "snow",    family: "snow"   },
  95: { label: "Thunderstorm",         icon: "storm",   family: "storm"  },
  96: { label: "Thunderstorm w/ hail", icon: "storm",   family: "storm"  },
  99: { label: "Severe thunderstorm",  icon: "storm",   family: "storm"  },
};

export function conditionFromWmo(code: number, isDay: boolean): NormalizedCondition {
  const entry = WMO_MAP[code] || { label: "Unknown", icon: "cloud", family: "cloudy" as WeatherFamily };
  // Swap icon for night variants
  const nightIcon = !isDay && entry.family === "clear" ? "moon" : entry.icon;
  return {
    family: entry.family,
    label: entry.label,
    icon: nightIcon,
    isDay,
  };
}
