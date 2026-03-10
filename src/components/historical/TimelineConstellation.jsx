import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function CornerFrame({ className = "" }) {
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`}>
      <div className="absolute left-4 top-4 h-5 w-5 border-l border-t border-white/30" />
      <div className="absolute right-4 top-4 h-5 w-5 border-r border-t border-white/30" />
      <div className="absolute bottom-4 left-4 h-5 w-5 border-b border-l border-white/30" />
      <div className="absolute bottom-4 right-4 h-5 w-5 border-b border-r border-white/30" />
    </div>
  );
}

function PreviewCard({ event, align = "left", onClick }) {
  const alignmentClass =
    align === "left"
      ? "left-3 sm:left-5 md:left-8 lg:left-4 xl:left-6"
      : "right-3 sm:right-5 md:right-8 lg:right-4 xl:right-6";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute top-1/2 hidden h-[170px] w-[220px] -translate-y-1/2 overflow-hidden rounded-[22px] border border-white/10 bg-black/70 p-4 text-left opacity-55 shadow-[0_0_32px_rgba(7,10,18,0.9)] backdrop-blur-sm transition duration-300 hover:opacity-80 md:block ${alignmentClass}`}
    >
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: event.color }} />
        <span className="truncate text-lg font-semibold text-white">{event.label}</span>
      </div>
      <div className="mt-2 text-sm text-slate-400">{event.year}</div>
      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-400">{event.description}</p>
    </button>
  );
}

export default function TimelineConstellation({
  regimes = [],
  selectedId,
  onSelect,
  onPrevious,
  onNext,
}) {
  const selectedIndex = useMemo(
    () => Math.max(0, regimes.findIndex((item) => item.id === selectedId)),
    [regimes, selectedId]
  );
  const selected = regimes[selectedIndex] || null;
  const previous = selectedIndex > 0 ? regimes[selectedIndex - 1] : null;
  const next = selectedIndex < regimes.length - 1 ? regimes[selectedIndex + 1] : null;
  const progress = regimes.length > 1 ? (selectedIndex / (regimes.length - 1)) * 100 : 0;
  const handleSliderChange = (event) => {
    const nextIndex = Number(event.target.value);
    const nextItem = regimes[nextIndex];
    if (nextItem && nextItem.id !== selectedId) onSelect(nextItem.id);
  };

  if (!selected) {
    return (
      <div className="flex h-full min-h-[560px] items-center justify-center text-sm text-slate-500">
        No historical events available.
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[560px] overflow-hidden rounded-[30px] border border-cyan-400/15 bg-[#02060c] p-4 sm:p-5 lg:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_65%_50%,rgba(15,118,185,0.08),transparent_25%)]" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-cyan-400/10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-cyan-400/10" />

      <div className="relative z-10 mx-auto mb-2 max-w-[860px] pt-1">
        <div className="grid grid-cols-[40px_minmax(0,1fr)_40px] items-center gap-4">
          <button
            type="button"
            onClick={onPrevious}
            disabled={!previous}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black text-slate-200 transition hover:border-cyan-300/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="relative h-10">
            <div className="pointer-events-none absolute left-1/2 -top-1 -translate-x-1/2 text-[22px] font-semibold tracking-tight text-white sm:text-[24px]">
              {selected.year}
            </div>
            <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-[4px] -translate-y-1/2 rounded-full bg-white/15" />
            <motion.div
              className="pointer-events-none absolute left-0 top-1/2 h-[4px] -translate-y-1/2 rounded-full"
              style={{ backgroundColor: selected.color }}
              animate={{ width: `${progress}%` }}
            />
            <input
              type="range"
              min="0"
              max={Math.max(regimes.length - 1, 0)}
              step="1"
              value={selectedIndex}
              onChange={handleSliderChange}
              className="atlas-year-slider absolute inset-x-0 bottom-0 z-10 h-6 w-full cursor-pointer appearance-none bg-transparent"
              aria-label="Historical atlas year slider"
            />
            <motion.div
              className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_18px_rgba(103,232,249,0.85)]"
              style={{ backgroundColor: selected.color }}
              animate={{ left: `calc(${progress}% - 8px)` }}
            />
          </div>

          <button
            type="button"
            onClick={onNext}
            disabled={!next}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black text-slate-200 transition hover:border-cyan-300/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative z-10 h-[470px] pt-[72px] sm:h-[500px] sm:pt-[78px]">
        {previous && <PreviewCard event={previous} align="left" onClick={() => onSelect(previous.id)} />}
        {next && <PreviewCard event={next} align="right" onClick={() => onSelect(next.id)} />}

        <AnimatePresence mode="sync">
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="absolute inset-x-0 top-0 mx-auto w-full max-w-[540px] rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,11,18,0.98),rgba(3,5,9,0.96))] px-5 py-4 shadow-[0_0_60px_rgba(3,10,19,0.88)] sm:max-w-[560px] sm:px-6 sm:py-4"
          >
            <CornerFrame />

            <div className="absolute inset-y-7 right-5 w-[4px] rounded-full bg-[#06111d]" />
            <div className="absolute right-5 top-7 h-[34%] w-[4px] rounded-full" style={{ backgroundColor: `${selected.color}aa` }} />
            <div
              className="pointer-events-none absolute right-[60px] top-[48px] h-24 w-24 rounded-full blur-3xl"
              style={{ backgroundColor: `${selected.color}22` }}
            />

            <div className="pr-7">
              <div className="flex items-center gap-3">
                <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: selected.color }} />
                <h3 className="text-[24px] font-semibold tracking-tight text-white sm:text-[26px]">{selected.label}</h3>
              </div>

              <div className="mt-1.5 text-[14px] text-slate-300">{selected.year}</div>

              <p className="mt-5 max-w-[26ch] text-[14px] leading-[1.5] text-slate-100 sm:text-[15px]">
                {selected.description}
              </p>

              <div className="mt-5">
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Key Drivers</div>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {selected.drivers.map((driver) => (
                    <Badge
                      key={driver}
                      variant="outline"
                      className="rounded-xl border-white/15 bg-white/[0.03] px-3 py-1 text-[12px] font-normal text-white"
                    >
                      {driver}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-5 border-t border-white/8 pt-4">
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Market Impact</div>
                <p className="mt-3 text-[14px] leading-[1.55] text-white sm:text-[15px]">{selected.markets}</p>
              </div>

              <div className="mt-5 border-t border-white/8 pt-4">
                <div className="mb-2.5 flex items-center justify-between gap-3">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Current Similarity</div>
                  <div className="text-[16px] font-semibold tracking-tight" style={{ color: selected.color }}>
                    {selected.similarity}%
                  </div>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: selected.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${selected.similarity}%` }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <style>{`
        .atlas-year-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: transparent;
          border: 0;
        }

        .atlas-year-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: transparent;
          border: 0;
        }
      `}</style>
    </div>
  );
}
