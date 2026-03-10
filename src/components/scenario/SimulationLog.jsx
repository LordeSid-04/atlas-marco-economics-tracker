import React, { useEffect, useMemo, useRef } from "react";
import { TerminalSquare } from "lucide-react";

const STAGE_COLORS = {
  validation: "text-cyan-300",
  baseline: "text-emerald-300",
  shock_injection: "text-amber-300",
  propagation: "text-fuchsia-300",
  spillover_adjustment: "text-violet-300",
  asset_mapping: "text-lime-300",
  confidence: "text-sky-300",
  finalization: "text-rose-300",
};

function toTerminalLine(log) {
  const stage = String(log.stage || "stage").replaceAll("_", "-");
  return `[step ${log.step}] ${stage} :: ${log.message}`;
}

export default function SimulationLog({ logs, isRunning }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs, isRunning]);

  const terminalLines = useMemo(() => logs.map((log, index) => ({ ...log, __index: index, line: toTerminalLine(log) })), [logs]);
  const latest = terminalLines[terminalLines.length - 1];

  return (
    <div className="atlas-glass rounded-2xl border border-cyan-500/15 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TerminalSquare className={`w-4 h-4 ${isRunning ? "text-cyan-300 animate-pulse" : "text-slate-400"}`} />
          <h3 className="text-sm font-semibold text-white tracking-tight">Simulation Terminal</h3>
        </div>
        <div className="text-[10px] uppercase tracking-[0.12em] text-slate-500">pipeline-terminal</div>
      </div>

      <div ref={scrollRef} className="h-52 overflow-y-auto bg-[#030712]/95 px-4 py-3 font-mono">
        {terminalLines.map((log) => (
          <div key={`${log.step}-${log.stage}-${log.__index}`} className="mb-2 border-b border-white/[0.04] pb-2 last:border-b-0 last:pb-0">
            <div className={`break-words text-[12px] leading-relaxed ${STAGE_COLORS[log.stage] || "text-cyan-200"}`}>
              <span className="text-slate-500 mr-1">&gt;</span>
              {log.line}
            </div>
            {log.details && Object.keys(log.details).length > 0 && (
              <div className="mt-1 ml-4 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-400">
                {Object.entries(log.details)
                  .slice(0, 4)
                  .map(([key, value]) => (
                    <span key={`${log.__index}-${key}`} className="break-all">
                      {key}={String(value)}
                    </span>
                  ))}
              </div>
            )}
          </div>
        ))}

        {isRunning && (
          <div className="text-[12px] text-emerald-300 flex items-center gap-1">
            <span className="text-slate-500">&gt;</span>awaiting next model event
            <span className="inline-block w-2 h-4 bg-emerald-300 animate-pulse" />
          </div>
        )}

        {!isRunning && !terminalLines.length && (
          <div className="text-[12px] text-slate-500">
            <span className="text-slate-600 mr-1">&gt;</span>run a scenario to stream model execution logs
          </div>
        )}
      </div>

      <div className="px-4 py-2 text-[10px] text-slate-500 border-t border-white/[0.04] bg-black/30">
        status: {isRunning ? "streaming" : "ready"} | lines: {terminalLines.length} | latest: {latest?.stage || "none"}
      </div>
    </div>
  );
}
