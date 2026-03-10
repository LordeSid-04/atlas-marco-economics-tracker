import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";

export default function WorldPulseDataProof({ proof, isLoading = false }) {
  const [expanded, setExpanded] = useState(false);
  const providerEntries = useMemo(
    () => Object.entries(proof?.provider_mix || {}).sort((a, b) => b[1] - a[1]),
    [proof]
  );

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1300] w-[360px] max-w-[calc(100%-1.5rem)]">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full atlas-glass-strong rounded-xl border border-cyan-400/25 px-3 py-2 flex items-center justify-between text-left"
      >
        <span className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-300" />
          <span className="text-xs font-semibold text-cyan-200 uppercase tracking-[0.12em]">Data Proof</span>
        </span>
        <span className="text-slate-400">{expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</span>
      </button>

      {expanded && (
        <div className="mt-2 atlas-glass-strong rounded-xl border border-cyan-400/20 p-3">
          {!proof && !isLoading && <div className="text-[11px] text-slate-400">No proof context available.</div>}
          {isLoading && <div className="text-[11px] text-cyan-300">Refreshing context-specific references...</div>}
          {proof && (
            <>
              <div className="text-[10px] uppercase tracking-[0.1em] text-slate-500">{proof.context}</div>
              <div className="text-[11px] text-slate-300 mt-1">{proof.methodology}</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Metric label="Deterministic" value={proof.deterministic ? "Yes" : "No"} />
                <Metric label="Market Inputs" value={proof.market_inputs_used} />
              </div>
              <div className="mt-2 rounded-lg bg-white/[0.03] border border-white/[0.04] p-2">
                <div className="text-[10px] text-slate-500 mb-1">Provider mix</div>
                <div className="flex flex-wrap gap-1">
                  {providerEntries.map(([provider, count]) => (
                    <span key={provider} className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-200">
                      {provider}: {count}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-2 text-[10px] text-slate-500">
                Latest market observation: <span className="text-slate-300">{proof.latest_market_observation || "n/a"}</span>
              </div>
              <div className="mt-2">
                <div className="text-[10px] text-slate-500 mb-1">Source references</div>
                <div className="space-y-1 max-h-36 overflow-auto pr-1">
                  {(proof.sources || []).map((source) => (
                    <a
                      key={`${source.name}-${source.url}`}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-[10px] text-cyan-300 hover:text-cyan-200"
                    >
                      {source.name} - {source.coverage}
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg bg-white/[0.03] border border-white/[0.04] p-2">
      <div className="text-[10px] text-slate-500">{label}</div>
      <div className="text-xs text-slate-200 font-semibold">{value}</div>
    </div>
  );
}
