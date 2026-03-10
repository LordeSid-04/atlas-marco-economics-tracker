import React, { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import TimelineConstellation from "@/components/historical/TimelineConstellation";
import historicalAtlasData from "@/components/historical/historicalAtlasData";

function getInitialSelection(events) {
  const preferred = events.find((item) => item.id === "supplychaincrisis");
  return preferred?.id || events[0]?.id || null;
}

export default function HistoricalAtlas() {
  const sceneRef = useRef(null);
  const events = useMemo(
    () =>
      [...historicalAtlasData].sort((a, b) => {
        if (a.startYear !== b.startYear) return a.startYear - b.startYear;
        return a.label.localeCompare(b.label);
      }),
    []
  );
  const [selectedId, setSelectedId] = useState(() => getInitialSelection(events));

  const selectedIndex = Math.max(0, events.findIndex((item) => item.id === selectedId));

  return (
    <div ref={sceneRef} className="relative min-h-[260vh] bg-black">
      <motion.div
        className="sticky top-24 h-[calc(100vh-96px)] overflow-hidden bg-black p-2 sm:p-3 lg:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <div className="relative z-20 mx-auto grid h-full max-w-[1500px] grid-cols-1 items-center gap-4 lg:grid-cols-[minmax(380px,1fr)_minmax(720px,1.45fr)]">
          <div className="px-4 lg:px-6">
            <h1 className="font-sans text-[48px] font-black leading-[0.9] tracking-[-0.03em] text-white sm:text-[68px] lg:text-[92px]">
              Historical
            </h1>
            <h1 className="font-sans text-[48px] font-black leading-[0.9] tracking-[-0.03em] text-white sm:text-[68px] lg:text-[92px]">
              Atlas
            </h1>
            <div className="mt-7 h-[2px] bg-white/90" style={{ maxWidth: "460px" }} />
          </div>

          <div className="h-full min-h-[560px] overflow-hidden rounded-[30px] border border-cyan-400/12 bg-black/95">
            <TimelineConstellation
              regimes={events}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onPrevious={() => selectedIndex > 0 && setSelectedId(events[selectedIndex - 1].id)}
              onNext={() => selectedIndex < events.length - 1 && setSelectedId(events[selectedIndex + 1].id)}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
