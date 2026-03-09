import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Archive, BookCopy, Clock3, History } from "lucide-react";
import {
  fetchDailyBriefing,
  fetchThemeMemory,
  getCachedDailyBriefing,
  getCachedThemeMemory,
} from "@/api/atlasClient";

function buildSparklinePoints(points) {
  if (!Array.isArray(points) || points.length < 2) return [];
  const values = points.map((point) => Number(point.temperature || 0));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1, max - min);
  return values.map((value, index) => {
    const x = (index / (values.length - 1)) * 100;
    const y = 34 - ((value - min) / span) * 28;
    return `${x},${y}`;
  });
}

export default function HistoricalAtlas() {
  const cachedBrief = getCachedDailyBriefing();
  const [selectedThemeId, setSelectedThemeId] = useState("");
  const [themeFromUrl, setThemeFromUrl] = useState("");

  const { data: dailyBrief } = useQuery({
    queryKey: ["briefing-daily-for-memory"],
    queryFn: () => fetchDailyBriefing({ windowHours: 72, limit: 8 }),
    initialData: cachedBrief || undefined,
    staleTime: 30 * 1000,
    refetchInterval: 30000,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const themeId = params.get("theme_id");
    if (themeId) setThemeFromUrl(themeId);
  }, []);

  useEffect(() => {
    const themes = dailyBrief?.theme_board || [];
    if (!themes.length) {
      setSelectedThemeId("");
      return;
    }
    if (themeFromUrl && themes.some((item) => item.theme_id === themeFromUrl)) {
      setSelectedThemeId(themeFromUrl);
      return;
    }
    if (!selectedThemeId || !themes.some((item) => item.theme_id === selectedThemeId)) {
      setSelectedThemeId(themes[0].theme_id);
    }
  }, [dailyBrief, selectedThemeId, themeFromUrl]);

  const cachedThemeMemory = getCachedThemeMemory(selectedThemeId);
  const {
    data: themeMemory,
    isLoading: isLoadingThemeMemory,
    isError: isThemeMemoryError,
    error: themeMemoryError,
  } = useQuery({
    queryKey: ["theme-memory", selectedThemeId],
    queryFn: () => fetchThemeMemory(selectedThemeId, { windowHours: 720, limit: 30 }),
    initialData: cachedThemeMemory || undefined,
    staleTime: 60 * 1000,
    refetchInterval: 60000,
    enabled: Boolean(selectedThemeId),
  });

  const sparkline = useMemo(
    () => buildSparklinePoints(themeMemory?.timeline_points || []),
    [themeMemory?.timeline_points]
  );

  return (
    <div className="min-h-[calc(100vh-96px)] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px] space-y-4">
        <section className="atlas-glass-strong rounded-2xl border border-cyan-400/20 p-5 sm:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-cyan-200">
                <Archive className="h-3.5 w-3.5" />
                Memory Vault
              </div>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Institutional Memory For Macro Themes
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-300">
                Recover prior discussions, supporting sources, and historical analogues so research context is never lost across desks.
              </p>
            </div>
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Confidence</div>
              <div className="text-lg font-semibold text-cyan-200">{themeMemory?.confidence?.score ?? "--"}</div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="atlas-glass-strong rounded-2xl border border-white/[0.08] p-4">
            <div className="text-sm font-semibold text-white">Tracked Themes</div>
            <div className="mt-3 space-y-1.5">
              {(dailyBrief?.theme_board || []).map((theme) => {
                const active = theme.theme_id === selectedThemeId;
                return (
                  <button
                    key={theme.theme_id}
                    type="button"
                    onClick={() => setSelectedThemeId(theme.theme_id)}
                    className={`w-full rounded-xl border px-3 py-2.5 text-left transition ${
                      active
                        ? "border-cyan-400/40 bg-cyan-500/10"
                        : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.14]"
                    }`}
                  >
                    <div className="text-xs font-medium text-slate-100">{theme.label}</div>
                    <div className="mt-1 text-[11px] text-slate-400">
                      temp {theme.temperature} | {theme.state} | {theme.outlook_state}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="space-y-4">
            <div className="atlas-glass-strong rounded-2xl border border-white/[0.08] p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Clock3 className="h-4 w-4 text-cyan-300" />
                Discussion Timeline
              </div>
              <div className="mt-3 rounded-xl border border-white/[0.08] bg-[#0b1327] p-3">
                {sparkline.length > 1 ? (
                  <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-20 w-full">
                    <polyline
                      fill="none"
                      stroke="#22d3ee"
                      strokeWidth="1.3"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      points={sparkline.join(" ")}
                    />
                  </svg>
                ) : (
                  <div className="h-20 text-xs text-slate-500 flex items-center justify-center">Timeline builds as snapshots accumulate.</div>
                )}
              </div>
              <div className="mt-3 space-y-2">
                {(themeMemory?.discussion_history || []).slice(0, 8).map((item, idx) => (
                  <div key={`${item.as_of}-${idx}`} className="border-l border-cyan-400/30 pl-3">
                    <div className="text-[11px] text-slate-200">{item.title || "Theme Snapshot"}</div>
                    <div className="mt-0.5 text-[10px] text-slate-500">{new Date(item.as_of).toLocaleString()}</div>
                    <div className="mt-1 text-[11px] text-cyan-200">{item.summary}</div>
                    <div className="mt-1 text-[11px] text-slate-400">Primary action: {item.primary_action}</div>
                  </div>
                ))}
                {!themeMemory?.discussion_history?.length && (
                  <div className="text-xs text-slate-500">No historical discussion snapshots for this theme yet.</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="atlas-glass-strong rounded-2xl border border-white/[0.08] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <BookCopy className="h-4 w-4 text-cyan-300" />
                  Source Trail
                </div>
                <div className="mt-3 max-h-[320px] overflow-auto pr-1">
                  {(themeMemory?.source_articles || []).slice(0, 15).map((source) => (
                    <a
                      key={source.article_id}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block border-b border-white/[0.07] py-2 last:border-b-0"
                    >
                      <div className="text-xs text-cyan-200">{source.title}</div>
                      <div className="mt-1 text-[11px] text-slate-400">
                        {source.source} | {new Date(source.published_at).toLocaleString()}
                      </div>
                    </a>
                  ))}
                  {!themeMemory?.source_articles?.length && <div className="text-xs text-slate-500">No source records.</div>}
                </div>
              </div>

              <div className="atlas-glass-strong rounded-2xl border border-white/[0.08] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <History className="h-4 w-4 text-amber-300" />
                  Related Analogues
                </div>
                <div className="mt-3 space-y-2">
                  {(themeMemory?.related_analogues || []).map((regime) => (
                    <div key={regime.id} className="border-b border-white/[0.07] pb-2 last:border-b-0 last:pb-0">
                      <div className="text-xs text-slate-100">{regime.year} | {regime.label}</div>
                      <div className="mt-1 text-[11px] text-amber-200">Similarity {regime.similarity}%</div>
                      <div className="mt-1 text-[11px] text-slate-400">{regime.description}</div>
                    </div>
                  ))}
                  {!themeMemory?.related_analogues?.length && <div className="text-xs text-slate-500">No analogue matches yet.</div>}
                </div>
              </div>
            </div>
          </section>
        </section>

        {isLoadingThemeMemory && <div className="text-xs text-slate-400">Loading theme memory...</div>}
        {isThemeMemoryError && <div className="text-xs text-rose-300">Memory load failed: {themeMemoryError?.message || "Unknown error"}</div>}
      </div>
    </div>
  );
}
