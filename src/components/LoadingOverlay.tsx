import { motion } from "framer-motion";

export default function LoadingOverlay({ message }: { message?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md"
      role="status"
      aria-live="polite"
    >
      {/* Pulsing concentric rings */}
      <div className="relative w-24 h-24">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute inset-0 rounded-full border border-white/40"
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeOut",
            }}
          />
        ))}
        <span className="absolute inset-0 flex items-center justify-center text-3xl">
          {/* Animated dot */}
          <motion.span
            className="w-3 h-3 rounded-full bg-white"
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </span>
      </div>
      <p className="mt-6 text-sm text-white/80 font-display italic">
        {message || "Reading the skies…"}
      </p>
    </motion.div>
  );
}
