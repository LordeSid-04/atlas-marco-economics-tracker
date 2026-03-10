import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Landmark, Newspaper, ShieldCheck, Sparkles } from "lucide-react";

const NODE_TYPE_META = {
  source: {
    title: "Source",
    tone: "text-sky-100",
    iconTone: "text-sky-200",
    border: "border-sky-400/45",
    bg: "from-sky-500/35 to-sky-400/10",
    icon: Newspaper,
  },
  theme: {
    title: "Theme",
    tone: "text-cyan-100",
    iconTone: "text-cyan-200",
    border: "border-cyan-400/45",
    bg: "from-cyan-500/35 to-cyan-400/10",
    icon: Sparkles,
  },
  policy: {
    title: "Policy",
    tone: "text-amber-100",
    iconTone: "text-amber-200",
    border: "border-amber-400/45",
    bg: "from-amber-500/35 to-amber-400/10",
    icon: Landmark,
  },
  asset: {
    title: "Market",
    tone: "text-rose-100",
    iconTone: "text-rose-200",
    border: "border-rose-400/45",
    bg: "from-rose-500/35 to-rose-400/10",
    icon: BarChart3,
  },
  action: {
    title: "Action",
    tone: "text-emerald-100",
    iconTone: "text-emerald-200",
    border: "border-emerald-400/45",
    bg: "from-emerald-500/35 to-emerald-400/10",
    icon: ShieldCheck,
  },
};

const NODE_TYPE_ORDER = ["source", "theme", "policy", "asset", "action"];

function clipLabel(value, max = 24) {
  const label = String(value || "").trim();
  if (!label) return "Untitled";
  if (label.length <= max) return label;
  return `${label.slice(0, max - 3)}...`;
}

export default function DevelopmentStoryGraph({ graph, onSelectNode }) {
  const [activeNodeId, setActiveNodeId] = useState("");

  const nodes = graph?.nodes || [];
  const edges = graph?.edges || [];

  const pipelineNodes = useMemo(() => {
    const ordered = [];
    const used = new Set();
    NODE_TYPE_ORDER.forEach((type) => {
      const match = nodes.find((node) => node.node_type === type);
      if (match) {
        ordered.push(match);
        used.add(match.node_id);
      }
    });
    nodes.forEach((node) => {
      if (!used.has(node.node_id)) {
        ordered.push(node);
      }
    });
    return ordered;
  }, [nodes]);

  const edgeByLink = useMemo(() => {
    const map = new Map();
    edges.forEach((edge) => {
      map.set(`${edge.from}->${edge.to}`, edge);
    });
    return map;
  }, [edges]);

  const displayedNodes = useMemo(() => pipelineNodes.slice(0, 5), [pipelineNodes]);

  const stageLabels = useMemo(() => {
    const fallback = ["Evidence", "Policy Path", "Market Transmission", "Portfolio Response"];
    return displayedNodes.slice(0, -1).map((node, index) => {
      const next = displayedNodes[index + 1];
      const edge = edgeByLink.get(`${node.node_id}->${next.node_id}`);
      return edge?.label || fallback[index] || "Transmission";
    });
  }, [displayedNodes, edgeByLink]);

  const handleSelect = (node) => {
    setActiveNodeId(node.node_id);
    onSelectNode?.(node);
  };

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#091022] px-3 py-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs uppercase tracking-[0.12em] text-slate-500">Story Pipeline</div>
        <div className="text-[10px] uppercase tracking-[0.12em] text-slate-500">click a node</div>
      </div>

      {displayedNodes.length ? (
        <div className="relative h-[272px] overflow-hidden rounded-lg border border-white/[0.05] bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.1),transparent_62%)]">
          <div className="absolute inset-x-7 top-6 bottom-6 flex flex-col justify-between">
            <div className="grid grid-cols-5 gap-3">
              {displayedNodes.map((node, index) => {
                const isActive = activeNodeId === node.node_id;
                const meta = NODE_TYPE_META[node.node_type] || NODE_TYPE_META.theme;
                const Icon = meta.icon;

                return (
                  <motion.button
                    key={node.node_id}
                    type="button"
                    onClick={() => handleSelect(node)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                    className="flex flex-col items-center text-center"
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl border bg-gradient-to-br shadow-[0_8px_24px_rgba(2,6,23,0.45)] transition ${
                        isActive ? `${meta.border} ${meta.bg}` : "border-white/[0.12] from-slate-700/20 to-slate-900/20"
                      }`}
                    >
                      <Icon className={`h-6 w-6 ${isActive ? meta.iconTone : "text-slate-300"}`} />
                    </div>
                    <div className={`mt-2 text-[9px] uppercase tracking-[0.12em] ${isActive ? meta.tone : "text-slate-500"}`}>{meta.title}</div>
                    <div className={`mt-1 min-h-[30px] max-w-[110px] text-center text-[10px] leading-tight ${isActive ? "text-slate-100" : "text-slate-300"}`}>
                      {clipLabel(node.label, 22)}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="px-2">
              <div className="h-[2px] rounded-full bg-gradient-to-r from-cyan-400/70 via-slate-300/60 to-cyan-400/70" />
              <div className="mt-2 flex items-center justify-center gap-2 text-[9px] uppercase tracking-[0.08em] text-slate-500">
                {stageLabels.map((label, idx) => (
                  <React.Fragment key={`${label}-${idx}`}>
                    <span>{label}</span>
                    {idx < stageLabels.length - 1 && <ArrowRight className="h-3 w-3 text-cyan-200" />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-[220px] items-center justify-center text-xs text-slate-500">No graph data available.</div>
      )}
    </div>
  );
}

