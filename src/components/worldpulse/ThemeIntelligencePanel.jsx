import React, { useMemo } from "react";
import { BookText, Flame, TrendingUp } from "lucide-react";

export default function ThemeIntelligencePanel({
  themes = [],
  selectedThemeId = "",
  onSelectTheme,
  timelinePoints = [],
  sources = [],
  isLoadingThemes = false,
  isLoadingDetails = false,
  error = "",
}) {
  const selectedTheme = themes.find((theme) => theme.theme_id === selectedThemeId) || themes[0] || null;
  const sparklinePoints = useMemo(() => buildSparklinePoints(timelinePoints), [timelinePoints]);

  return (
    <aside className="atlas-glass-strong rounded-2xl border border-cyan-500/15 p-4 h-full min-h-0 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-300" />
          <h2 className="text-sm font-semibold text-white tracking-wide">Theme Intelligence</h2>
        </div>
      </div>

      {isLoadingThemes && <div className="text-[11px] text-slate-400">Loading live macro themes...</div>}
      {!isLoadingThemes && !!error && <div className="text-[11px] text-rose-300">Theme feed unavailable: {error}</div>}

      {!isLoadingThemes && !error && (
        <div className="space-y-3 min-h-0 flex flex-col overflow-hidden">
          <div className="space-y-1.5 max-h-[44%] min-h-[115px] overflow-auto pr-1">
            {themes.slice(0, 5).map((theme) => {
              const tone = stateTone(theme.state);
              const isActive = theme.theme_id === selectedTheme?.theme_id;
              return (
                <button
                  key={theme.theme_id}
                  type="button"
                  onClick={() => onSelectTheme?.(theme.theme_id)}
                  className={`w-full text-left rounded-lg border px-2.5 py-2 transition-all ${
                    isActive
                      ? "border-cyan-400/40 bg-cyan-500/10 shadow-[0_0_18px_rgba(34,211,238,0.12)]"
                      : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[11px] text-slate-200 truncate">{theme.label}</div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${tone.badge}`}>
                      {tone.label}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className={`h-full ${tone.fill}`} style={{ width: `${theme.temperature}%` }} />
                  </div>
                  <div className="mt-1 text-[10px] text-slate-500">
                    Temp {theme.temperature} | Mentions {theme.mention_count} | Sources {theme.source_diversity}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedTheme && (
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 space-y-2 min-h-0 flex-1 overflow-hidden">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[10px] uppercase tracking-[0.1em] text-slate-500 truncate">{selectedTheme.label}</div>
                <div className="text-[10px] text-cyan-200 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {selectedTheme.momentum > 0 ? "+" : ""}
                  {selectedTheme.momentum}
                </div>
              </div>

              <div className="h-[58px] rounded-md border border-white/[0.05] bg-[#081125] px-1.5 py-1">
                {sparklinePoints.length > 1 ? (
                  <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full">
                    <polyline
                      fill="none"
                      stroke="#22d3ee"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      points={sparklinePoints.map((p) => `${p.x},${p.y}`).join(" ")}
                    />
                    <circle
                      cx={sparklinePoints[sparklinePoints.length - 1].x}
                      cy={sparklinePoints[sparklinePoints.length - 1].y}
                      r="1.7"
                      fill="#22d3ee"
                    />
                  </svg>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500">
                    Timeline fills as snapshots accumulate
                  </div>
                )}
              </div>

              <div className="pt-1 border-t border-white/[0.05] min-h-0 flex-1 overflow-hidden">
                <div className="flex items-center gap-1 text-[10px] uppercase tracking-[0.1em] text-slate-500 mb-1.5">
                  <BookText className="w-3 h-3" /> Evidence Sources
                </div>
                {isLoadingDetails && <div className="text-[10px] text-cyan-300">Refreshing timeline and sources...</div>}
                {!isLoadingDetails && sources.length === 0 && <div className="text-[10px] text-slate-500">No source articles available.</div>}
                {!isLoadingDetails && sources.length > 0 && (
                  <div className="space-y-1.5 h-full overflow-auto pr-1">
                    {sources.slice(0, 5).map((source) => (
                      <a
                        key={source.article_id}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-md border border-white/[0.05] bg-white/[0.02] px-2 py-1.5 hover:border-cyan-400/25 transition-colors"
                      >
                        <div className="text-[10px] text-cyan-200 truncate">{source.title}</div>
                        <div className="text-[9px] text-slate-500">
                          {source.source} | relevance {(Number(source.relevance_score || 0) * 100).toFixed(0)}%
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

function stateTone(state) {
  const normalized = String(state || "neutral").toLowerCase();
  if (normalized === "hot") {
    return {
      label: "HOT",
      badge: "border-rose-400/40 bg-rose-500/10 text-rose-200",
      fill: "bg-rose-400",
    };
  }
  if (normalized === "warming") {
    return {
      label: "WARMING",
      badge: "border-amber-400/40 bg-amber-500/10 text-amber-200",
      fill: "bg-amber-400",
    };
  }
  if (normalized === "cooling") {
    return {
      label: "COOLING",
      badge: "border-sky-400/40 bg-sky-500/10 text-sky-200",
      fill: "bg-sky-400",
    };
  }
  if (normalized === "cold") {
    return {
      label: "COLD",
      badge: "border-indigo-400/40 bg-indigo-500/10 text-indigo-200",
      fill: "bg-indigo-400",
    };
  }
  return {
    label: "NEUTRAL",
    badge: "border-slate-400/30 bg-slate-500/10 text-slate-200",
    fill: "bg-cyan-300",
  };
}

function buildSparklinePoints(points) {
  if (!Array.isArray(points) || points.length === 0) return [];
  const values = points.map((point) => Number(point.temperature || 0));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1, max - min);
  const count = points.length;
  return values.map((value, index) => {
    const x = count === 1 ? 50 : (index / (count - 1)) * 100;
    const normalized = (value - min) / span;
    const y = 34 - normalized * 28;
    return { x, y };
  });
}
