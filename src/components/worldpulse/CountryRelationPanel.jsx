import React from "react";
import { Activity, ArrowRightLeft, X } from "lucide-react";

export default function CountryRelationPanel({
  startCountry,
  endCountry,
  relation,
  isLoadingRelation,
  onClearSelection,
  onClearRelation,
}) {
  return (
    <div className="absolute top-4 right-4 z-[1200] w-[360px] max-w-[calc(100%-2rem)] space-y-2">
      <div className="atlas-glass-strong rounded-xl border border-white/[0.08] p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <ArrowRightLeft className="w-3.5 h-3.5 text-rose-300" />
            Country Link Builder
          </div>
          <button
            type="button"
            onClick={onClearSelection}
            className="text-[10px] text-slate-400 hover:text-white transition-colors"
          >
            Reset
          </button>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.04] p-2">
            <div className="text-[10px] text-slate-500">Start</div>
            <div className="text-xs text-slate-200 truncate">{startCountry?.name || "Select country"}</div>
          </div>
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.04] p-2">
            <div className="text-[10px] text-slate-500">End</div>
            <div className="text-xs text-slate-200 truncate">{endCountry?.name || "Select country"}</div>
          </div>
        </div>
        {isLoadingRelation && <div className="mt-2 text-[11px] text-cyan-300">Computing bilateral transmission...</div>}
      </div>

      {relation && (
        <div className="atlas-glass-strong rounded-xl border border-rose-400/25 p-3 shadow-[0_12px_30px_rgba(239,68,68,0.2)]">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-rose-200 font-semibold">Relation Intelligence</div>
            <button type="button" onClick={onClearRelation} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="mt-2 text-[11px] text-slate-300">{relation.narrative}</div>
          <RelationQualitySummary relation={relation} />
          <div className="grid grid-cols-2 gap-2 mt-3">
            <Metric label="Transmission Strength" value={`${relation.relation_strength}%`} tone="text-rose-200" />
            <Metric label="Spillover (bps)" value={relation.estimated_spillover_bps} tone="text-cyan-200" />
            <Metric label="Trade Intensity" value={relation.trade_intensity} tone="text-slate-100" />
            <Metric label="Financial Link" value={relation.financial_linkage} tone="text-slate-100" />
          </div>
          <div className="mt-3 rounded-lg bg-white/[0.03] border border-white/[0.04] p-2">
            <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-1">
              <Activity className="w-3 h-3" /> Dominant Channel
            </div>
            <div className="text-xs text-rose-200 uppercase tracking-wide">{relation.dominant_channel}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, tone }) {
  return (
    <div className="rounded-lg bg-white/[0.03] border border-white/[0.04] p-2">
      <div className="text-[10px] text-slate-500">{label}</div>
      <div className={`text-sm font-semibold ${tone}`}>{value}</div>
    </div>
  );
}

function RelationQualitySummary({ relation }) {
  const label = String(relation?.relation_quality_label || "mixed").toLowerCase();
  const score = Number(relation?.relation_quality_score ?? 0);
  const style = qualityStyle(label);

  return (
    <div className={`mt-2 rounded-lg border p-2 ${style.card}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="text-[10px] uppercase tracking-[0.08em] text-slate-400">Relation Quality</div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${style.badge}`}>
          {style.title} {score}/100
        </span>
      </div>
      <div className="mt-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div className={`h-full ${style.fill}`} style={{ width: `${Math.max(0, Math.min(score, 100))}%` }} />
      </div>
      <div className="mt-1 text-[10px] text-slate-500">Good: 67-100  |  Mixed: 40-66  |  Bad: 0-39</div>
    </div>
  );
}

function qualityStyle(label) {
  if (label === "good") {
    return {
      title: "Good",
      card: "border-emerald-400/35 bg-emerald-500/5",
      badge: "text-emerald-200 border-emerald-400/40 bg-emerald-500/10",
      fill: "bg-emerald-400",
    };
  }
  if (label === "bad") {
    return {
      title: "Bad",
      card: "border-amber-400/35 bg-amber-500/5",
      badge: "text-amber-200 border-amber-400/40 bg-amber-500/10",
      fill: "bg-amber-400",
    };
  }
  return {
    title: "Mixed",
    card: "border-cyan-400/30 bg-cyan-500/5",
    badge: "text-cyan-200 border-cyan-400/40 bg-cyan-500/10",
    fill: "bg-cyan-400",
  };
}
