import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Play, RotateCcw } from "lucide-react";

export default function ScenarioControls({ config, setConfig, onRun, onReset, isRunning, options }) {
  const drivers = options?.drivers ?? [];
  const events = options?.events ?? [];
  const regions = options?.regions ?? [];
  const horizons = options?.horizons ?? [];

  return (
    <div className="atlas-glass rounded-2xl border border-white/[0.08] p-5 space-y-4">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white tracking-tight">Scenario Configuration</h2>
        <button onClick={onReset} className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors">
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      <div className="space-y-3.5">
        <div>
          <label className="text-[11px] uppercase tracking-wider text-slate-500 mb-1.5 block">Macro Driver</label>
          <Select value={config.driver} onValueChange={(v) => setConfig({ ...config, driver: v })}>
            <SelectTrigger className="h-10 bg-white/[0.03] border-white/[0.1] text-slate-200 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              {drivers.map((d) => (
                <SelectItem key={d} value={d} className="text-slate-200 focus:bg-white/10">
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-[11px] uppercase tracking-wider text-slate-500 mb-1.5 block">Trigger Event</label>
          <Select value={config.event} onValueChange={(v) => setConfig({ ...config, event: v })}>
            <SelectTrigger className="h-10 bg-white/[0.03] border-white/[0.1] text-slate-200 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              {events.map((e) => (
                <SelectItem key={e} value={e} className="text-slate-200 focus:bg-white/10">
                  {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-[11px] uppercase tracking-wider text-slate-500 mb-1.5 block">Origin Region</label>
          <Select value={config.region} onValueChange={(v) => setConfig({ ...config, region: v })}>
            <SelectTrigger className="h-10 bg-white/[0.03] border-white/[0.1] text-slate-200 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              {regions.map((r) => (
                <SelectItem key={r} value={r} className="text-slate-200 focus:bg-white/10">
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-[11px] uppercase tracking-wider text-slate-500 mb-1.5 block">Severity: {config.severity}%</label>
          <Slider
            value={[config.severity]}
            onValueChange={([v]) => setConfig({ ...config, severity: v })}
            min={10}
            max={100}
            step={5}
            className="mt-2"
          />
        </div>

        <div>
          <label className="text-[11px] uppercase tracking-wider text-slate-500 mb-1.5 block">Time Horizon</label>
          <Select value={config.horizon} onValueChange={(v) => setConfig({ ...config, horizon: v })}>
            <SelectTrigger className="h-10 bg-white/[0.03] border-white/[0.1] text-slate-200 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              {horizons.map((h) => (
                <SelectItem key={h} value={h} className="text-slate-200 focus:bg-white/10">
                  {h}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        onClick={onRun}
        disabled={isRunning}
        className="h-11 w-full gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500"
      >
        <Play className="w-4 h-4" />
        {isRunning ? "Simulating..." : "Run Scenario"}
      </Button>
    </div>
  );
}
