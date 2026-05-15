import { motion } from "framer-motion";

interface Props {
  icon: string;
  size?: number;
  className?: string;
}

const easeOut = [0.22, 1, 0.36, 1] as const;

/**
 * A small library of animated SVG weather icons.
 * Each icon is a self-contained <svg> with framer-motion driven micro-animations.
 */
export default function WeatherIcon({ icon, size = 64, className }: Props) {
  const props = { width: size, height: size, viewBox: "0 0 64 64", fill: "none", className };

  if (icon === "sun") {
    return (
      <svg {...props}>
        <motion.circle
          cx="32" cy="32" r="12"
          fill="#FFD166"
          initial={{ scale: 0.8 }}
          animate={{ scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.g
          stroke="#FFD166" strokeWidth="2.5" strokeLinecap="round"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "32px 32px" }}
        >
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
            const r1 = 18, r2 = 24;
            const rad = (deg * Math.PI) / 180;
            return (
              <line
                key={deg}
                x1={32 + Math.cos(rad) * r1}
                y1={32 + Math.sin(rad) * r1}
                x2={32 + Math.cos(rad) * r2}
                y2={32 + Math.sin(rad) * r2}
              />
            );
          })}
        </motion.g>
      </svg>
    );
  }

  if (icon === "moon") {
    return (
      <svg {...props}>
        <motion.path
          d="M40 12a20 20 0 1 0 12 36 16 16 0 0 1-12-36z"
          fill="#E8EEF8"
          initial={{ opacity: 0.7 }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    );
  }

  if (icon === "partly") {
    return (
      <svg {...props}>
        <motion.circle cx="22" cy="22" r="9" fill="#FFD166"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.path
          d="M20 38c0-7 5.5-12.5 12.5-12.5 5.5 0 10 3.5 11.6 8.5h2.4c4.4 0 8 3.6 8 8s-3.6 8-8 8H22c-4 0-7-3-7-7 0-3 1.5-5 5-7z"
          fill="white" fillOpacity="0.9"
          animate={{ x: [0, 2, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </svg>
    );
  }

  if (icon === "cloud") {
    return (
      <svg {...props}>
        <motion.path
          d="M16 42c-5 0-9-4-9-9s4-9 9-9c1 0 2 .2 3 .5C21 18 26.5 14 33 14c8.5 0 15.5 7 15.5 15.5h.5c5 0 9 4 9 9s-4 9-9 9H16z"
          fill="white" fillOpacity="0.9"
          animate={{ x: [0, 3, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    );
  }

  if (icon === "drizzle") {
    return (
      <svg {...props}>
        <path d="M16 32c-5 0-9-4-9-9s4-9 9-9c1 0 2 .2 3 .5C21 8 26.5 4 33 4c8.5 0 15.5 7 15.5 15.5h.5c5 0 9 4 9 9s-4 9-9 9H16z"
          fill="white" fillOpacity="0.9" transform="translate(0,8)" />
        {[
          { x: 22, delay: 0 }, { x: 32, delay: 0.4 }, { x: 42, delay: 0.8 }
        ].map((d, i) => (
          <motion.line
            key={i}
            x1={d.x} y1="42" x2={d.x - 2} y2="50"
            stroke="#9CC8E8" strokeWidth="2" strokeLinecap="round"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: [0, 1, 0], y: [0, 6, 12] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: d.delay, ease: "easeIn" }}
          />
        ))}
      </svg>
    );
  }

  if (icon === "rain") {
    return (
      <svg {...props}>
        <path d="M16 32c-5 0-9-4-9-9s4-9 9-9c1 0 2 .2 3 .5C21 8 26.5 4 33 4c8.5 0 15.5 7 15.5 15.5h.5c5 0 9 4 9 9s-4 9-9 9H16z"
          fill="white" fillOpacity="0.9" transform="translate(0,6)" />
        {[
          { x: 18, delay: 0 }, { x: 26, delay: 0.25 }, { x: 34, delay: 0.5 },
          { x: 42, delay: 0.15 }, { x: 50, delay: 0.4 }
        ].map((d, i) => (
          <motion.line
            key={i}
            x1={d.x} y1="42" x2={d.x - 3} y2="56"
            stroke="#7DB8E0" strokeWidth="2.2" strokeLinecap="round"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: [0, 1, 0], y: [0, 6, 14] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: d.delay, ease: "easeIn" }}
          />
        ))}
      </svg>
    );
  }

  if (icon === "snow") {
    return (
      <svg {...props}>
        <path d="M16 32c-5 0-9-4-9-9s4-9 9-9c1 0 2 .2 3 .5C21 8 26.5 4 33 4c8.5 0 15.5 7 15.5 15.5h.5c5 0 9 4 9 9s-4 9-9 9H16z"
          fill="white" fillOpacity="0.9" transform="translate(0,4)" />
        {[
          { cx: 22, cy: 50, delay: 0 },
          { cx: 32, cy: 54, delay: 0.4 },
          { cx: 42, cy: 50, delay: 0.8 },
          { cx: 28, cy: 58, delay: 1.2 },
          { cx: 38, cy: 58, delay: 0.6 },
        ].map((d, i) => (
          <motion.circle
            key={i}
            cx={d.cx} cy={d.cy} r="2"
            fill="white"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: [0, 1, 0], y: [0, 4, 8] }}
            transition={{ duration: 2, repeat: Infinity, delay: d.delay, ease: "easeInOut" }}
          />
        ))}
      </svg>
    );
  }

  if (icon === "storm") {
    return (
      <svg {...props}>
        <path d="M16 32c-5 0-9-4-9-9s4-9 9-9c1 0 2 .2 3 .5C21 8 26.5 4 33 4c8.5 0 15.5 7 15.5 15.5h.5c5 0 9 4 9 9s-4 9-9 9H16z"
          fill="#5A5F75" fillOpacity="0.95" transform="translate(0,2)" />
        <motion.path
          d="M30 38l-6 12h6l-3 10 10-14h-6l4-8z"
          fill="#FFD166"
          initial={{ opacity: 0.4 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    );
  }

  if (icon === "fog") {
    return (
      <svg {...props}>
        <motion.g
          fill="white" fillOpacity="0.85"
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <rect x="6" y="18" width="52" height="4" rx="2" />
          <rect x="10" y="30" width="44" height="4" rx="2" />
          <rect x="14" y="42" width="36" height="4" rx="2" />
        </motion.g>
      </svg>
    );
  }

  // Fallback
  return (
    <svg {...props}>
      <circle cx="32" cy="32" r="12" fill="currentColor" opacity="0.4" />
    </svg>
  );
}
