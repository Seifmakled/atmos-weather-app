import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useWeatherStore } from "@/store/useWeatherStore";

export default function ErrorToast() {
  const error = useWeatherStore((s) => s.error);
  const clearError = useWeatherStore((s) => s.clearError);

  useEffect(() => {
    if (!error) return;
    const t = window.setTimeout(clearError, 5000);
    return () => window.clearTimeout(t);
  }, [error, clearError]);

  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-md px-4"
          role="alert"
        >
          <div className="glass-strong rounded-full px-5 py-3 flex items-center gap-3 shadow-2xl">
            <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
            <span className="text-sm text-ink">{error}</span>
            <button
              type="button"
              onClick={clearError}
              className="text-ink-faint hover:text-ink text-lg leading-none"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
