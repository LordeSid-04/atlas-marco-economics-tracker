import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TimelineConstellation({ regimes = [], connections = [] }) {
  const [selected, setSelected] = useState(null);

  const getNode = (id) => regimes.find((r) => r.id === id);

  return (
    <div className="relative h-full min-h-[500px]">
      {regimes.length > 0 && (
        <svg viewBox="-10 0 120 90" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <filter id="constellation-glow">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {connections.map((conn, i) => {
            const from = getNode(conn.from);
            const to = getNode(conn.to);
            if (!from || !to) return null;
            return (
              <line
                key={i}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="#38bdf8"
                strokeWidth="0.15"
                opacity="0.15"
                strokeDasharray="1 1"
              />
            );
          })}

          {regimes.map((regime) => {
            const isSelected = selected?.id === regime.id;
            const nodeRadius = Math.min(regime.size * 0.62, 2.8);
            const glowRadius = nodeRadius * 1.55;
            return (
              <g key={regime.id} className="cursor-pointer" onClick={() => setSelected(isSelected ? null : regime)}>
                <circle cx={regime.x} cy={regime.y} r={Math.max(glowRadius * 0.72, 1.6)} fill={regime.color} opacity={0.1}>
                  <animate
                    attributeName="r"
                    values={`${Math.max(glowRadius * 0.58, 1.4)};${Math.max(glowRadius * 0.8, 2)};${Math.max(glowRadius * 0.58, 1.4)}`}
                    dur="2.6s"
                    repeatCount="indefinite"
                  />
                  <animate attributeName="opacity" values="0.16;0.06;0.16" dur="2.6s" repeatCount="indefinite" />
                </circle>
                <circle
                  cx={regime.x}
                  cy={regime.y}
                  r={nodeRadius}
                  fill={regime.color}
                  opacity={isSelected ? 0.9 : 0.5}
                  filter="url(#constellation-glow)"
                  style={{ transition: "all 0.3s" }}
                />
                <circle cx={regime.x} cy={regime.y} r={nodeRadius * 0.32} fill="white" opacity={0.8} />
                <text x={regime.x} y={regime.y - nodeRadius - 1.6} textAnchor="middle" fill={regime.color} fontSize="2" fontWeight="600">
                  {regime.label}
                </text>
                <text x={regime.x} y={regime.y - nodeRadius + 0.1} textAnchor="middle" fill="#64748b" fontSize="1.4">
                  {regime.year}
                </text>
              </g>
            );
          })}
        </svg>
      )}

      {regimes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">Loading historical analogues...</div>
      )}

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-[400px] atlas-glass-strong rounded-2xl p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selected.color }} />
                  <h3 className="text-base font-bold text-white">{selected.label}</h3>
                </div>
                <span className="text-xs text-slate-500">{selected.year}</span>
              </div>
              <button onClick={() => setSelected(null)} className="p-1 hover:bg-white/10 rounded-lg">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-3">{selected.description}</p>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500">Key Drivers</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {(selected.drivers || []).map((d, i) => (
                    <Badge key={i} variant="outline" className="text-xs border-white/10 text-slate-300">
                      {d}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500">Asset Impact</span>
                <p className="text-xs text-slate-400 mt-1">{selected.assets}</p>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                <span className="text-[10px] uppercase tracking-wider text-slate-500">Current Similarity</span>
                <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${selected.similarity}%`, backgroundColor: selected.color }} />
                </div>
                <span className="text-xs font-bold" style={{ color: selected.color }}>
                  {selected.similarity}%
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
