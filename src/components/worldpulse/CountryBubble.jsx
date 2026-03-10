import React from "react";
import { motion } from "framer-motion";
import { X, Link2 } from "lucide-react";

export default function CountryBubble({ country, onClose, onSetStart, onSetEnd, startId, endId }) {
  if (!country) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.96 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="absolute left-4 bottom-4 z-[1200] w-[340px] max-w-[calc(100%-2rem)]"
    >
      <div className="rounded-2xl atlas-glass-strong border border-rose-400/25 shadow-[0_14px_35px_rgba(239,68,68,0.22)] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white">{country.name}</h3>
            <div className="text-[10px] text-slate-400 uppercase tracking-[0.1em]">{country.cluster}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="rounded-lg bg-white/[0.04] p-2">
            <div className="text-[10px] text-slate-500">Heat</div>
            <div className="text-lg font-bold text-rose-300">{country.heat}</div>
          </div>
          <div className="rounded-lg bg-white/[0.04] p-2">
            <div className="text-[10px] text-slate-500">Confidence</div>
            <div className="text-lg font-bold text-slate-100">{country.confidence}%</div>
          </div>
          <div className="rounded-lg bg-white/[0.04] p-2">
            <div className="text-[10px] text-slate-500">GDP</div>
            <div className="text-sm font-semibold text-cyan-200">${country.profile.gdp_trillion_usd}T</div>
          </div>
          <div className="rounded-lg bg-white/[0.04] p-2">
            <div className="text-[10px] text-slate-500">Population</div>
            <div className="text-sm font-semibold text-cyan-200">{country.profile.population_millions}M</div>
          </div>
        </div>

        <div className="mt-3 rounded-lg bg-white/[0.03] p-2.5">
          <div className="text-[10px] text-slate-500 mb-1">Narrative</div>
          <div className="text-xs text-slate-200">{country.narrative}</div>
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          {country.profile.key_sectors.slice(0, 3).map((sector) => (
            <span key={sector} className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
              {sector}
            </span>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onSetStart(country.id)}
            className={`text-xs rounded-lg px-2.5 py-2 border transition-colors ${
              startId === country.id
                ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
                : "border-white/10 bg-white/[0.02] text-slate-300 hover:bg-white/[0.06]"
            }`}
          >
            <Link2 className="w-3.5 h-3.5 inline mr-1" />
            Set As Start
          </button>
          <button
            type="button"
            onClick={() => onSetEnd(country.id)}
            className={`text-xs rounded-lg px-2.5 py-2 border transition-colors ${
              endId === country.id
                ? "border-amber-400/40 bg-amber-500/15 text-amber-200"
                : "border-white/10 bg-white/[0.02] text-slate-300 hover:bg-white/[0.06]"
            }`}
          >
            <Link2 className="w-3.5 h-3.5 inline mr-1" />
            Set As End
          </button>
        </div>
      </div>
    </motion.div>
  );
}
