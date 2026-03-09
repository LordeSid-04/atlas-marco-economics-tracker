import React from "react";
import { ShieldAlert } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import RadialRiskChart from "../components/radar/RadialRiskChart";
import RiskSummaryCards from "../components/radar/RiskSummaryCards";
import { fetchRiskRadar, getCachedRiskRadar } from "@/api/atlasClient";

export default function RiskRadar() {
  const cachedRisk = getCachedRiskRadar();
  const { data, isError } = useQuery({
    queryKey: ["risk-radar-live"],
    queryFn: fetchRiskRadar,
    initialData: cachedRisk || undefined,
    staleTime: 15 * 1000,
    refetchInterval: 15000,
  });

  return (
    <div className="min-h-[calc(100vh-96px)] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1200px] space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/20 to-red-600/20">
            <ShieldAlert className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Risk Radar</h1>
            <p className="text-xs text-slate-500">Global macro risk architecture | real-time threat assessment</p>
          </div>
        </div>

        <RiskSummaryCards items={data?.summary_cards ?? []} />

        <div className="atlas-glass-strong rounded-2xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Radial Risk Architecture</h2>
            <span className="text-[10px] uppercase tracking-wider text-slate-500">Click nodes for detail</span>
          </div>
          <RadialRiskChart categories={data?.categories ?? []} />
        </div>
        {isError && <div className="text-xs text-rose-300">Failed to load risk radar data.</div>}

        <div className="atlas-glass flex items-start gap-3 rounded-xl p-4">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <h3 className="mb-1 text-sm font-semibold text-white">Risk Assessment Summary</h3>
            <p className="text-xs leading-relaxed text-slate-400">
              {data?.assessment_summary || "Loading assessment summary..."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
