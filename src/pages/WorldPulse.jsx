import React, { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowRight,
  BookOpenText,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  FlaskConical,
  Newspaper,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import GlobeMap from "@/components/worldpulse/GlobeMap";
import DevelopmentStoryGraph from "@/components/worldpulse/DevelopmentStoryGraph";
import CountryRelationPanel from "@/components/worldpulse/CountryRelationPanel";
import { createPageUrl } from "@/utils";
import {
  fetchBriefingFeedStatus,
  fetchCountryRelation,
  fetchDailyBriefing,
  fetchDevelopmentDetail,
  getCachedBriefingFeedStatus,
  getCachedDailyBriefing,
  getCachedDevelopmentDetail,
} from "@/api/atlasClient";

function scoreTone(value) {
  const score = Number(value || 0);
  if (score >= 75) return "text-rose-200";
  if (score >= 55) return "text-amber-200";
  return "text-cyan-200";
}

function stateTone(state) {
  const normalized = String(state || "").toLowerCase();
  if (normalized.includes("hot")) return "text-rose-200";
  if (normalized.includes("cool")) return "text-sky-200";
  if (normalized.includes("heat")) return "text-amber-200";
  return "text-slate-200";
}

function toNumeric(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatClock(value) {
  if (!value) return "--";
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function StatPill({ label, value, tone = "text-slate-200" }) {
  return (
    <div className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5">
      <span className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{label}</span>
      <span className={`ml-2 text-xs font-medium ${tone}`}>{value}</span>
    </div>
  );
}

export default function WorldPulse() {
  const cachedDailyBrief = getCachedDailyBriefing();
  const cachedFeedStatus = getCachedBriefingFeedStatus();

  const [selectedDevelopmentId, setSelectedDevelopmentId] = useState("");
  const [heatBoardOpen, setHeatBoardOpen] = useState(false);
  const [selectedGraphNode, setSelectedGraphNode] = useState(null);
  const [mapStartCountry, setMapStartCountry] = useState(null);
  const [mapEndCountry, setMapEndCountry] = useState(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["briefing-daily"],
    queryFn: () => fetchDailyBriefing({ windowHours: 72, limit: 6 }),
    initialData: cachedDailyBrief || undefined,
    staleTime: 12 * 1000,
    refetchInterval: 15000,
  });

  const { data: feedStatusData } = useQuery({
    queryKey: ["briefing-feed-status", 72],
    queryFn: () => fetchBriefingFeedStatus({ windowHours: 72 }),
    initialData: cachedFeedStatus || data?.feed_status || undefined,
    staleTime: 15 * 1000,
    refetchInterval: 20000,
  });

  const developments = data?.developments ?? [];
  const selectedDevelopmentBase = useMemo(() => {
    if (!developments.length) return null;
    if (!selectedDevelopmentId) return developments[0];
    return developments.find((item) => item.development_id === selectedDevelopmentId) || developments[0];
  }, [developments, selectedDevelopmentId]);

  const cachedDevelopmentDetail = selectedDevelopmentId ? getCachedDevelopmentDetail(selectedDevelopmentId) : null;
  const { data: developmentDetail, isFetching: isFetchingDevelopmentDetail } = useQuery({
    queryKey: ["briefing-development-detail", selectedDevelopmentId],
    queryFn: () => fetchDevelopmentDetail(selectedDevelopmentId),
    enabled: Boolean(selectedDevelopmentId),
    initialData: cachedDevelopmentDetail || undefined,
    staleTime: 20 * 1000,
    refetchInterval: selectedDevelopmentId ? 25000 : false,
  });

  useEffect(() => {
    if (!developments.length) {
      setSelectedDevelopmentId("");
      return;
    }
    if (!selectedDevelopmentId || !developments.some((item) => item.development_id === selectedDevelopmentId)) {
      setSelectedDevelopmentId(developments[0].development_id);
    }
  }, [developments, selectedDevelopmentId]);

  useEffect(() => {
    setSelectedGraphNode(null);
  }, [selectedDevelopmentId]);

  const selectedDevelopment = developmentDetail?.development || selectedDevelopmentBase;
  const deferredSelectedDevelopment = useDeferredValue(selectedDevelopment);
  const feedStatus = feedStatusData || data?.feed_status;
  const sourceRows = Array.isArray(feedStatus?.sources) ? feedStatus.sources : [];

  const derivedHealthySources = sourceRows.filter((row) => Boolean(row?.is_healthy ?? row?.isHealthy)).length;
  const healthySources = toNumeric(feedStatus?.healthy_sources ?? feedStatus?.healthySources, derivedHealthySources);
  const totalSources = toNumeric(feedStatus?.total_sources ?? feedStatus?.totalSources, sourceRows.length);
  const selectedProof = deferredSelectedDevelopment?.proof_bundle;

  const signalDeskRows = useMemo(() => {
    const rows = [];
    const seen = new Set();

    developments.forEach((development) => {
      (development?.proof_bundle?.source_evidence || []).forEach((item) => {
        const articleId = item?.article_id;
        if (!articleId || seen.has(articleId)) {
          return;
        }
        seen.add(articleId);
        rows.push({
          ...item,
          developmentLabel: development.label,
          publishedTs: Date.parse(item.published_at) || 0,
        });
      });
    });

    return rows.sort((a, b) => b.publishedTs - a.publishedTs).slice(0, 10);
  }, [developments]);

  const { data: relationData, isFetching: isFetchingRelation } = useQuery({
    queryKey: ["country-relation", mapStartCountry?.id, mapEndCountry?.id],
    queryFn: () => fetchCountryRelation(mapStartCountry.id, mapEndCountry.id),
    enabled: Boolean(mapStartCountry?.id && mapEndCountry?.id),
    staleTime: 20 * 1000,
  });

  const manualArc = useMemo(() => {
    if (relationData?.arc?.from && relationData?.arc?.to) {
      return relationData.arc;
    }
    if (mapStartCountry?.id && mapEndCountry?.id) {
      return {
        from: mapStartCountry.id,
        to: mapEndCountry.id,
        color: "#f59e0b",
      };
    }
    return null;
  }, [mapStartCountry, mapEndCountry, relationData]);

  const handleSelectCountry = (spot) => {
    if (!spot) return;
    if (!mapStartCountry || mapEndCountry) {
      setMapStartCountry(spot);
      setMapEndCountry(null);
      return;
    }
    if (mapStartCountry.id === spot.id) {
      setMapStartCountry(null);
      setMapEndCountry(null);
      return;
    }
    setMapEndCountry(spot);
  };

  const clearMapSelection = () => {
    setMapStartCountry(null);
    setMapEndCountry(null);
  };

  const clearMapRelation = () => {
    setMapEndCountry(null);
  };

  useEffect(() => {
    if (!isMapExpanded) return undefined;
    const onEscape = (event) => {
      if (event.key === "Escape") {
        setIsMapExpanded(false);
      }
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [isMapExpanded]);

  return (
    <div className="worldpulse-shell min-h-[calc(100vh-96px)] p-3 sm:p-4 lg:p-6">
      <div className="mx-auto max-w-[1680px] space-y-3">
        {isMapExpanded && <style>{`.atlas-top-nav { display: none !important; }`}</style>}

        {isMapExpanded && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center px-3 pb-6 pt-3 sm:px-5 sm:pb-8 sm:pt-5 lg:px-8 lg:pb-10 lg:pt-8">
            <button
              type="button"
              aria-label="Close expanded map overlay"
              className="absolute inset-0 bg-[#020617]/65 backdrop-blur-sm"
              onClick={() => setIsMapExpanded(false)}
            />
            <div className="relative w-[94vw] sm:w-[86vw] lg:w-[76vw] xl:w-[74vw]">
              <div className="mb-2 pl-1 text-base font-medium tracking-[0.08em] text-slate-100">
                Cross-Region Spillover
              </div>
              <div className="relative h-[75vh] min-h-[420px] overflow-hidden rounded-2xl border border-white/[0.12] bg-[#071124] shadow-[0_20px_70px_rgba(0,0,0,0.55)]">
                <GlobeMap
                  hotspots={data?.spillover_map?.hotspots || []}
                  arcs={data?.spillover_map?.arcs || []}
                  manualArc={manualArc}
                  onSelectCountry={handleSelectCountry}
                  isExpanded={isMapExpanded}
                  onToggleExpand={() => setIsMapExpanded(false)}
                />

                {(mapStartCountry || relationData) && (
                  <CountryRelationPanel
                    startCountry={mapStartCountry}
                    endCountry={mapEndCountry}
                    relation={relationData || null}
                    isLoadingRelation={isFetchingRelation}
                    onClearSelection={clearMapSelection}
                    onClearRelation={clearMapRelation}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: "easeOut" }}
          className="atlas-glass-strong rounded-2xl border border-cyan-400/20 px-4 py-4 sm:px-5"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-cyan-200">
                <Compass className="h-3.5 w-3.5" />
                Atlas Signal Desk
              </div>
              <h1 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                Real-Time Macro Intelligence With Model Proof
              </h1>
              <p className="mt-1 max-w-4xl text-xs text-slate-300 sm:text-sm">
                {data?.headline_brief || "Loading real-time global macro briefing..."}
              </p>
            </div>

            <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
              <StatPill label="As Of" value={formatClock(data?.as_of)} />
              <StatPill label="Confidence" value={data?.confidence?.score ?? "--"} tone="text-cyan-200" />
              <StatPill
                label="Healthy Sources"
                value={`${healthySources}/${totalSources || "--"}`}
                tone={healthySources > 0 ? "text-emerald-200" : "text-amber-200"}
              />
              <StatPill label="Status" value={isFetching ? "Refreshing" : "Live"} tone="text-cyan-200" />
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.46, delay: 0.08, ease: "easeOut" }}
          className="grid grid-cols-1 gap-3 xl:grid-cols-[320px_minmax(0,1fr)_390px]"
        >
          <aside className="space-y-3">
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.22 }} className="atlas-glass-strong rounded-2xl border border-white/[0.08] p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Activity className="h-4 w-4 text-amber-300" />
                Critical Developments
              </div>

              <div className="mt-2.5 space-y-1.5">
                {developments.map((dev) => {
                  const active = dev.development_id === deferredSelectedDevelopment?.development_id;
                  const impScore = dev.scorecard?.find((score) => score.metric === "importance")?.value ?? dev.importance;
                  return (
                    <button
                      key={dev.development_id}
                      type="button"
                      onClick={() =>
                        startTransition(() => {
                          setSelectedDevelopmentId(dev.development_id);
                        })
                      }
                      className={`w-full rounded-xl border p-2.5 text-left transition ${
                        active
                          ? "border-cyan-400/45 bg-cyan-500/10"
                          : "border-white/[0.08] bg-white/[0.01] hover:border-white/[0.16]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-xs font-medium text-slate-100">{dev.label}</div>
                        <span className={`text-xs font-semibold ${scoreTone(impScore)}`}>{impScore}</span>
                      </div>
                      <div className="mt-1 text-[11px] text-slate-400">
                        {dev.market_confirmation} confirmation | {dev.source_diversity} sources
                      </div>
                      <div className="mt-1 text-[10px] uppercase tracking-[0.08em] text-slate-500">
                        <span className={stateTone(dev.state)}>{dev.state}</span>
                        <span className="mx-1 text-slate-600">/</span>
                        <span className={stateTone(dev.outlook_state)}>{dev.outlook_state}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.22 }} className="atlas-glass-strong rounded-2xl border border-white/[0.08] p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Newspaper className="h-4 w-4 text-cyan-300" />
                Signal Desk
              </div>

              <div className="mt-2 max-h-[240px] overflow-auto pr-1">
                {signalDeskRows.length ? (
                  signalDeskRows.map((row) => (
                    <a
                      key={row.article_id}
                      href={row.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block border-b border-white/[0.07] py-2 last:border-b-0"
                    >
                      <div className="line-clamp-1 text-[11px] text-cyan-200">{row.title}</div>
                      <div className="mt-1 text-[10px] text-slate-500">
                        {row.source} | {row.developmentLabel} | {new Date(row.published_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </a>
                  ))
                ) : (
                  <div className="text-[11px] text-slate-500">No verified source evidence available yet.</div>
                )}
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.22 }} className="atlas-glass-strong rounded-2xl border border-white/[0.08] p-3">
              <button
                type="button"
                onClick={() => setHeatBoardOpen((prev) => !prev)}
                className="flex w-full items-center justify-between"
              >
                <span className="text-sm font-semibold text-white">Theme Heat Board</span>
                {heatBoardOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
              </button>

              {heatBoardOpen && (
                <div className="mt-2.5 space-y-2">
                  {(data?.theme_board || []).map((theme) => (
                    <div key={theme.theme_id} className="space-y-1">
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <div className="text-slate-200">{theme.label}</div>
                        <div className="text-cyan-200">{theme.temperature}</div>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.08]">
                        <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${theme.temperature}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </aside>

          <motion.section whileHover={{ y: -2 }} transition={{ duration: 0.22 }} className="atlas-glass-strong rounded-2xl border border-white/[0.08] p-3.5">
            {deferredSelectedDevelopment ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="text-base font-semibold text-white">{deferredSelectedDevelopment.title}</h2>
                    <p className="mt-1 text-xs text-cyan-200">{deferredSelectedDevelopment.narrative_story}</p>
                    {isFetchingDevelopmentDetail && <div className="mt-1 text-[10px] text-slate-500">Refreshing detailed proof...</div>}
                  </div>
                  <Link
                    to={`${createPageUrl("ScenarioLab")}?development_id=${encodeURIComponent(deferredSelectedDevelopment.development_id)}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-1.5 text-[11px] font-medium text-cyan-200 hover:bg-cyan-500/15"
                  >
                    <FlaskConical className="h-3.5 w-3.5" />
                    Run Scenario
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <DevelopmentStoryGraph graph={deferredSelectedDevelopment.story_graph} onSelectNode={setSelectedGraphNode} />

                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                      <BookOpenText className="h-4 w-4 text-cyan-300" />
                      What This Means
                    </div>

                    {selectedGraphNode ? (
                      <div className="rounded-lg border border-cyan-400/20 bg-cyan-500/5 p-2.5">
                        <div className="text-xs font-medium text-cyan-200">{selectedGraphNode.label}</div>
                        <div className="mt-1 text-xs text-slate-300">{selectedGraphNode.detail}</div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {deferredSelectedDevelopment.causal_chain.map((step) => (
                          <div key={`${deferredSelectedDevelopment.development_id}-${step.step}`} className="flex items-start gap-2">
                            <div className="mt-[2px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-cyan-400/35 text-[10px] font-semibold text-cyan-200">
                              {step.step}
                            </div>
                            <div className="text-xs text-slate-300">{step.detail}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                      <ShieldAlert className="h-4 w-4 text-amber-300" />
                      Risk Playbook
                    </div>

                    <div className="space-y-2">
                      {deferredSelectedDevelopment.risk_implications.map((item, idx) => (
                        <div key={`${deferredSelectedDevelopment.development_id}-risk-${idx}`} className="border-b border-white/[0.06] pb-2 text-[11px] last:border-b-0 last:pb-0">
                          <div className="text-slate-100">
                            <span className="font-semibold">{item.asset_class}</span> | {item.direction}
                          </div>
                          <div className="text-slate-400">{item.rationale}</div>
                        </div>
                      ))}

                      {deferredSelectedDevelopment.recommended_actions.slice(0, 2).map((action, idx) => (
                        <div key={`${deferredSelectedDevelopment.development_id}-action-${idx}`} className="flex items-start gap-2 text-xs text-cyan-200">
                          <Sparkles className="mt-[1px] h-3.5 w-3.5 shrink-0" />
                          <span>{action.action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500">Select a development to view analysis.</div>
            )}
          </motion.section>

          <aside className="space-y-3">
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.22 }} className="atlas-glass-strong overflow-hidden rounded-2xl border border-white/[0.08] p-2.5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="text-sm font-semibold text-white">Cross-Region Spillover</div>
                {mapStartCountry && !mapEndCountry && (
                  <div className="text-[10px] uppercase tracking-[0.1em] text-cyan-300">Select destination</div>
                )}
              </div>

              <div className="relative h-[300px] overflow-hidden rounded-xl border border-white/[0.08]">
                <GlobeMap
                  hotspots={data?.spillover_map?.hotspots || []}
                  arcs={data?.spillover_map?.arcs || []}
                  manualArc={manualArc}
                  onSelectCountry={handleSelectCountry}
                  isExpanded={isMapExpanded}
                  onToggleExpand={() => setIsMapExpanded((prev) => !prev)}
                />

                {!isMapExpanded && (mapStartCountry || relationData) && (
                  <CountryRelationPanel
                    startCountry={mapStartCountry}
                    endCountry={mapEndCountry}
                    relation={relationData || null}
                    isLoadingRelation={isFetchingRelation}
                    onClearSelection={clearMapSelection}
                    onClearRelation={clearMapRelation}
                  />
                )}
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.22 }} className="atlas-glass-strong rounded-2xl border border-white/[0.08] p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <CheckCircle2 className="h-4 w-4 text-cyan-300" />
                Proof Console
              </div>

              {selectedProof ? (
                <div className="mt-2.5 space-y-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Executive Readout</div>
                    <div className="mt-1 text-xs leading-relaxed text-cyan-200">{selectedProof.conclusion.story}</div>
                    <div className="mt-1 text-[11px] leading-relaxed text-slate-400">{selectedProof.conclusion.why_now}</div>
                  </div>

                  <div className="border-t border-white/[0.08] pt-2">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Source Evidence</div>
                    <div className="mt-1 max-h-[150px] space-y-2 overflow-auto pr-1">
                      {selectedProof.source_evidence.slice(0, 4).map((source) => (
                        <a
                          key={source.article_id}
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block rounded-md border border-white/[0.08] bg-[#0b1327] px-2.5 py-2 hover:border-cyan-400/25"
                        >
                          <div className="text-[11px] text-cyan-200">{source.title}</div>
                          <div className="mt-1 text-[10px] text-slate-400">
                            {source.source} | {new Date(source.published_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 border-t border-white/[0.08] pt-2 sm:grid-cols-2">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Model Validation</div>
                      {selectedProof.model_evidence.slice(0, 1).map((model) => (
                        <div key={model.model_name} className="mt-1 text-[11px] leading-relaxed text-slate-300">
                          <div className="break-all">{model.model_name}</div>
                          <div className="text-slate-500">{model.model_version}</div>
                          <div className="font-semibold text-cyan-200">Confidence {(model.score_confidence * 100).toFixed(0)}%</div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <div className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Market Signals</div>
                      <div className="mt-1 space-y-1">
                        {selectedProof.market_evidence.slice(0, 2).map((item, idx) => (
                          <div key={`${item.signal}-${idx}`} className="text-[11px] leading-relaxed text-slate-300">
                            <span className="font-medium text-cyan-200">{item.signal}</span>: {item.value} ({item.interpretation})
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/[0.08] pt-2 text-xs text-slate-300">
                    <span className={healthySources > 0 ? "text-emerald-200" : "text-amber-200"}>
                      {healthySources}/{totalSources || 0}
                    </span>{" "}
                    reliable sources healthy. Polling every {feedStatus?.polling_interval_seconds || 60}s.
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-xs text-slate-500">Proof data unavailable.</div>
              )}
            </motion.div>
          </aside>
        </motion.section>

        {isLoading && <div className="text-xs text-slate-400">Loading model-driven signal desk...</div>}
        {isError && <div className="text-xs text-rose-300">Failed to load briefing: {error?.message || "Unknown error"}</div>}
      </div>
    </div>
  );
}
