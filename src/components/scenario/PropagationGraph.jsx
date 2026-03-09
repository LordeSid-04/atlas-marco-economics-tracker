import React, { useEffect, useMemo, useState } from "react";
import { Network } from "lucide-react";

export default function PropagationGraph({ isRunning, result, runId = 0 }) {
  const [activeNodes, setActiveNodes] = useState(new Set());
  const [activeEdges, setActiveEdges] = useState(new Set());

  const graphNodes = result?.graph?.nodes ?? [];
  const graphEdges = result?.graph?.edges ?? [];

  const nodeMap = useMemo(() => {
    return new Map(graphNodes.map((node) => [node.id, node]));
  }, [graphNodes]);

  useEffect(() => {
    const timers = [];

    if (!result || !graphNodes.length || !graphEdges.length) {
      setActiveNodes(new Set());
      setActiveEdges(new Set());
      return () => {};
    }

    setActiveNodes(new Set(["origin"]));
    setActiveEdges(new Set());

    const orderedNodes = [...graphNodes]
      .filter((node) => node.id !== "origin")
      .sort((a, b) => (a.activation_step ?? 99) - (b.activation_step ?? 99));

    const orderedEdges = graphEdges
      .map((edge, index) => ({ edge, index }))
      .sort((a, b) => (a.edge.activation_step ?? 99) - (b.edge.activation_step ?? 99));

    orderedNodes.forEach((node, index) => {
      timers.push(
        setTimeout(() => {
          setActiveNodes((prev) => new Set([...prev, node.id]));
        }, (index + 1) * 380)
      );
    });

    orderedEdges.forEach(({ index }, idx) => {
      timers.push(
        setTimeout(() => {
          setActiveEdges((prev) => new Set([...prev, index]));
        }, idx * 320 + 180)
      );
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [result, runId, graphNodes, graphEdges]);

  return (
    <div className="atlas-glass-strong rounded-2xl border border-cyan-500/20 overflow-hidden h-full flex flex-col">
      <div className="px-5 py-3 border-b border-white/[0.06] bg-gradient-to-r from-cyan-500/[0.09] to-transparent">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Network className={`w-4 h-4 ${isRunning ? "text-cyan-300 animate-pulse" : "text-slate-400"}`} />
            <h2 className="text-[13px] font-semibold text-slate-100 tracking-[0.06em] uppercase">Causal Propagation Network</h2>
          </div>
          <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-slate-400">
            nodes {graphNodes.length} | links {graphEdges.length}
          </div>
        </div>
      </div>

      <div className="flex-1 relative p-4 sm:p-5">
        <div className="absolute inset-4 sm:inset-5 rounded-xl border border-white/[0.04] bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.08),transparent_70%)] pointer-events-none" />
        {graphNodes.length > 0 && graphEdges.length > 0 && (
          <svg viewBox="-6 0 112 95" className="relative z-10 w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
              <filter id="node-glow">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {graphEdges.map((edge, index) => {
              const from = nodeMap.get(edge.from);
              const to = nodeMap.get(edge.to);
              if (!from || !to) return null;

              const isActive = activeEdges.has(index);
              const flowOpacity = Math.max(0.25, Math.min(0.9, (edge.flow ?? 0.35)));

              return (
                <g key={`${edge.from}-${edge.to}-${index}`}>
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={isActive ? "#38bdf8" : "#1e293b"}
                    strokeWidth={isActive ? "0.4" : "0.2"}
                    opacity={isActive ? flowOpacity : 0.3}
                    style={{ transition: "all 0.5s ease" }}
                  />
                  {isActive && (
                    <circle r="0.6" fill="#38bdf8" opacity="0.9">
                      <animateMotion
                        dur="2s"
                        repeatCount="indefinite"
                        path={`M${from.x},${from.y} L${to.x},${to.y}`}
                      />
                    </circle>
                  )}
                </g>
              );
            })}

            {graphNodes.map((node) => {
              const isActive = activeNodes.has(node.id);
              return (
                <g key={node.id}>
                  {isActive && (
                    <circle cx={node.x} cy={node.y} r="2.2" fill={node.color} opacity="0.12">
                      <animate attributeName="r" values="1.7;2.4;1.7" dur="2.2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.2;0.08;0.2" dur="2.2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isActive ? "2.3" : "1.7"}
                    fill={isActive ? node.color : "#1e293b"}
                    stroke={node.color}
                    strokeWidth="0.3"
                    opacity={isActive ? 0.9 : 0.3}
                    filter={isActive ? "url(#node-glow)" : undefined}
                    style={{ transition: "all 0.5s ease" }}
                  />
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="0.8"
                    fill={isActive ? "white" : node.color}
                    opacity={isActive ? 0.9 : 0.2}
                    style={{ transition: "all 0.5s ease" }}
                  />
                  <text
                    x={node.x}
                    y={node.y + (node.y < 30 ? -5.5 : 6.5)}
                    textAnchor="middle"
                    fill={isActive ? node.color : "#475569"}
                    fontSize="2.35"
                    fontWeight="700"
                    fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
                    letterSpacing="0.02em"
                    style={{ paintOrder: "stroke", stroke: "rgba(2,6,23,0.75)", strokeWidth: 0.28, transition: "all 0.5s ease" }}
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        )}

        {!isRunning && !result && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="text-center">
              <div className="text-slate-500 text-sm font-medium tracking-wide">Configure and run a scenario</div>
              <div className="text-slate-600 text-[11px] mt-1 font-mono">network animation will render after terminal run</div>
            </div>
          </div>
        )}

        {isRunning && !result && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="text-center text-cyan-300 text-sm font-mono tracking-wide">
              awaiting streamed execution logs before network playback...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
