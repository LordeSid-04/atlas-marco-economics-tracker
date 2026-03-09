import React, { useState, useEffect } from "react";
import { FlaskConical, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ScenarioControls from "../components/scenario/ScenarioControls";
import PropagationGraph from "../components/scenario/PropagationGraph";
import SimulationLog from "../components/scenario/SimulationLog";
import ScenarioResults from "../components/scenario/ScenarioResults";
import {
  fetchDailyBriefing,
  fetchScenarioOptions,
  getCachedDailyBriefing,
  getCachedScenarioOptions,
  runScenarioStream,
} from "@/api/atlasClient";

const DEFAULT_CONFIG = {
  driver: "Interest Rates",
  event: "Rate Hike +100bp",
  region: "United States",
  severity: 70,
  horizon: "12 Months",
};

const REGION_MAP = {
  us: "United States",
  europe: "Europe",
  china: "China",
  middleeast: "Middle East",
  em: "Emerging Markets",
  japan: "Japan",
};

export default function ScenarioLab() {
  const cachedOptions = getCachedScenarioOptions();
  const cachedDailyBrief = getCachedDailyBriefing();
  const { data: options, isLoading: isLoadingOptions, isError: optionsError } = useQuery({
    queryKey: ["scenario-options"],
    queryFn: fetchScenarioOptions,
    initialData: cachedOptions || undefined,
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [executionLogs, setExecutionLogs] = useState([]);
  const [runError, setRunError] = useState("");
  const [graphRunId, setGraphRunId] = useState(0);
  const [regionFromUrl, setRegionFromUrl] = useState("");
  const [developmentIdFromUrl, setDevelopmentIdFromUrl] = useState("");
  const [presetDevelopment, setPresetDevelopment] = useState(null);

  const { data: dailyBrief } = useQuery({
    queryKey: ["briefing-daily-for-scenario"],
    queryFn: () => fetchDailyBriefing({ windowHours: 72, limit: 8 }),
    initialData: cachedDailyBrief || undefined,
    staleTime: 30 * 1000,
    refetchInterval: 30000,
    enabled: Boolean(developmentIdFromUrl),
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const region = params.get("region");
    const developmentId = params.get("development_id");
    if (region && REGION_MAP[region]) {
      setRegionFromUrl(REGION_MAP[region]);
    }
    if (developmentId) {
      setDevelopmentIdFromUrl(developmentId);
    }
  }, []);

  useEffect(() => {
    if (!options) return;
    setConfig((prev) => {
      const next = {
        ...prev,
        driver: options.drivers?.includes(prev.driver) ? prev.driver : options.drivers?.[0] ?? prev.driver,
        event: options.events?.includes(prev.event) ? prev.event : options.events?.[0] ?? prev.event,
        region: options.regions?.includes(regionFromUrl || prev.region)
          ? (regionFromUrl || prev.region)
          : options.regions?.[0] ?? prev.region,
        horizon: options.horizons?.includes(prev.horizon) ? prev.horizon : options.horizons?.[0] ?? prev.horizon,
      };
      return next;
    });
  }, [options, regionFromUrl]);

  useEffect(() => {
    if (!developmentIdFromUrl || !options || !dailyBrief?.developments?.length) return;
    const development = dailyBrief.developments.find((item) => item.development_id === developmentIdFromUrl);
    if (!development?.scenario_preset) return;

    const preset = development.scenario_preset;
    setPresetDevelopment(development);
    setConfig((prev) => ({
      ...prev,
      driver: options.drivers?.includes(preset.driver) ? preset.driver : prev.driver,
      event: options.events?.includes(preset.event) ? preset.event : prev.event,
      region: options.regions?.includes(preset.region) ? preset.region : prev.region,
      severity: Number.isFinite(Number(preset.severity)) ? Number(preset.severity) : prev.severity,
      horizon: options.horizons?.includes(preset.horizon) ? preset.horizon : prev.horizon,
    }));
  }, [developmentIdFromUrl, dailyBrief, options]);

  const handleRun = async () => {
    setIsRunning(true);
    setResults(null);
    setExecutionLogs([]);
    setRunError("");
    try {
      const response = await runScenarioStream(config, {
        onLog: (log) => {
          setExecutionLogs((prev) => [...prev, log]);
        },
      });
      await new Promise((resolve) => setTimeout(resolve, 260));
      setResults(response);
      setGraphRunId((prev) => prev + 1);
    } catch (error) {
      setRunError(error?.message || "Failed to run scenario.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    if (presetDevelopment?.scenario_preset) {
      const preset = presetDevelopment.scenario_preset;
      setConfig({
        driver: options?.drivers?.includes(preset.driver) ? preset.driver : options?.drivers?.[0] ?? DEFAULT_CONFIG.driver,
        event: options?.events?.includes(preset.event) ? preset.event : options?.events?.[0] ?? DEFAULT_CONFIG.event,
        region: options?.regions?.includes(preset.region) ? preset.region : options?.regions?.[0] ?? DEFAULT_CONFIG.region,
        severity: Number.isFinite(Number(preset.severity)) ? Number(preset.severity) : DEFAULT_CONFIG.severity,
        horizon: options?.horizons?.includes(preset.horizon) ? preset.horizon : options?.horizons?.[0] ?? DEFAULT_CONFIG.horizon,
      });
      setIsRunning(false);
      setResults(null);
      setExecutionLogs([]);
      setRunError("");
      return;
    }

    setConfig({
      driver: options?.drivers?.[0] ?? DEFAULT_CONFIG.driver,
      event: options?.events?.[0] ?? DEFAULT_CONFIG.event,
      region: regionFromUrl || options?.regions?.[0] || DEFAULT_CONFIG.region,
      severity: DEFAULT_CONFIG.severity,
      horizon: options?.horizons?.[0] ?? DEFAULT_CONFIG.horizon,
    });
    setIsRunning(false);
    setResults(null);
    setExecutionLogs([]);
    setRunError("");
  };

  return (
    <div className="min-h-[calc(100vh-96px)] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px] space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/20 to-blue-600/20">
              <FlaskConical className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Scenario Lab</h1>
              <p className="text-xs text-slate-500">Simulate macro shocks and inspect cross-asset propagation paths</p>
            </div>
          </div>
          <div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-cyan-200">
            Pipeline Simulation
          </div>
        </div>

        {presetDevelopment && (
          <div className="atlas-glass rounded-xl border border-cyan-400/25 px-4 py-3">
            <div className="text-[10px] uppercase tracking-[0.12em] text-cyan-300">Live Preset Loaded</div>
            <div className="mt-1 flex items-start gap-2 text-sm text-slate-100">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-300" />
              <span>{presetDevelopment.title}</span>
            </div>
            <div className="mt-1 text-xs text-slate-400">
              {presetDevelopment.label} | importance {presetDevelopment.importance} | state {presetDevelopment.state}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[340px_1fr]">
          <ScenarioControls
            config={config}
            setConfig={setConfig}
            onRun={handleRun}
            onReset={handleReset}
            isRunning={isRunning}
            options={options}
          />
          <div className="space-y-5">
            <SimulationLog logs={executionLogs} isRunning={isRunning} />
            <div className="min-h-[450px]">
              <PropagationGraph isRunning={isRunning} result={results} runId={graphRunId} />
            </div>
            {isLoadingOptions && <div className="text-xs text-slate-400">Loading scenario options...</div>}
            {optionsError && <div className="text-xs text-rose-300">Failed to load scenario options.</div>}
            {runError && <div className="text-xs text-rose-300">{runError}</div>}
            {results && <ScenarioResults result={results} />}
          </div>
        </div>
      </div>
    </div>
  );
}
