import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Minus, TrendingDown, TrendingUp } from "lucide-react";

export default function ScenarioResults({ result }) {
  if (!result) return null;

  const config = result.config;
  const impacts = result.impacts ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="atlas-glass rounded-2xl border border-white/[0.08] p-5"
    >
      <h3 className="mb-1 text-sm font-semibold text-white">Impact Assessment</h3>
      <p className="mb-1 text-xs text-slate-500">
        {config.event}
        {" -> "}
        {config.region} at {config.severity}% severity over {config.horizon}
      </p>
      <p className="mb-4 text-xs text-cyan-300">{result.summary}</p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {impacts.map((item, i) => {
          const severityPills = {
            low: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30",
            medium: "text-amber-300 bg-amber-500/10 border-amber-500/30",
            high: "text-orange-300 bg-orange-500/10 border-orange-500/30",
            critical: "text-red-300 bg-red-500/10 border-red-500/30",
          };

          return (
            <motion.div
              key={item.asset}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="truncate text-[11px] text-slate-200">{item.asset}</div>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.08em] ${
                    severityPills[item.severity] ?? severityPills.low
                  }`}
                >
                  {item.severity}
                </span>
              </div>

              <div className="mt-1.5 flex items-center gap-1">
                {item.impact > 1 ? (
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                ) : item.impact < -1 ? (
                  <TrendingDown className="h-3 w-3 text-red-400" />
                ) : (
                  <Minus className="h-3 w-3 text-slate-500" />
                )}

                <span className={`text-sm font-bold ${item.impact > 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {item.impact > 0 ? "+" : ""}
                  {item.impact}
                  {item.unit === "bp" ? "bp" : "%"}
                </span>
              </div>

              <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
                {item.severity === "critical" && <AlertTriangle className="h-2.5 w-2.5 text-red-400" />}
                <span className="capitalize">{item.severity} impact tier</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
