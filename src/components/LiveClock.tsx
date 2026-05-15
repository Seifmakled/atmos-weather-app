import { useLiveClock } from "@/hooks/useLiveClock";

export default function LiveClock() {
  const now = useLiveClock();

  const time = now.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  const seconds = now.toLocaleTimeString(undefined, { second: "2-digit" }).match(/\d+/)?.[0] ?? "00";
  const date = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col items-end gap-0.5">
      <div className="text-2xl font-display tabular text-ink leading-none">
        {time}
        <span className="ml-1 text-sm text-ink-faint align-baseline">{seconds}</span>
      </div>
      <div className="text-[11px] uppercase tracking-[0.18em] text-ink-faint">{date}</div>
    </div>
  );
}
