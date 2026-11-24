import React from 'react';
import { Clock, Car, Bus, AlertOctagon, CheckCircle2, TrendingUp } from 'lucide-react';

export default function BenchmarkComparison({ benchmarks, summary }) {
  if (!benchmarks) return null;

  const {
    staticDtcScheduleEtaMin,
    googleMapsCarEtaMin,
    transitPulseModelEtaMin,
    scheduleUnderestimatePercentage
  } = benchmarks;

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-sm">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div>
          <h3 className="font-bold text-sm text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Hackathon Benchmark: ETA Reality Check
          </h3>
          <p className="text-[11px] text-slate-400">
            Comparing Static Timetable vs Car Traffic vs TransitPulse Bus GPS Model
          </p>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          +{scheduleUnderestimatePercentage}% Schedule Lag
        </span>
      </div>

      {/* 3-Way Benchmark Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {/* 1. Static Schedule */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Static Timetable
            </span>
            <span className="text-[10px] text-red-400 font-bold bg-red-500/10 px-1.5 py-0.5 rounded">
              Unrealistic
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-slate-300 font-mono">
              {staticDtcScheduleEtaMin}
            </span>
            <span className="text-xs text-slate-500">mins</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Assumes free-flow speed & ignores real-world stop queues.
          </p>
        </div>

        {/* 2. Google Maps Car */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-blue-400" />
              Google Maps (Car)
            </span>
            <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 px-1.5 py-0.5 rounded">
              Car Baseline
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-blue-300 font-mono">
              {googleMapsCarEtaMin}
            </span>
            <span className="text-xs text-slate-500">mins</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Private vehicle speed without bus stops & boarding delays.
          </p>
        </div>

        {/* 3. TransitPulse Model */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-950/40 via-indigo-950/30 to-slate-950 border border-blue-500/40 ring-1 ring-blue-500/20 flex flex-col justify-between shadow-lg shadow-blue-500/10">
          <div className="flex items-center justify-between text-blue-300 mb-2">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <Bus className="w-3.5 h-3.5 text-blue-400" />
              TransitPulse Model
            </span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
              True Bus Reality
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-white font-mono">
              {transitPulseModelEtaMin}
            </span>
            <span className="text-xs text-blue-300 font-semibold">mins</span>
            <span className="text-[11px] text-slate-400 font-mono ml-auto">
              (±{Math.round(transitPulseModelEtaMin * 0.1)}m)
            </span>
          </div>
          <p className="text-[10px] text-blue-200/80 mt-1">
            Accounts for bus lane bottlenecks + 2.5m dwell delay per interchange.
          </p>
        </div>
      </div>

      {/* Physics Breakdown: Running vs Dwell Time */}
      {summary && (
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5 text-[11px]">
            <span>Travel Physics Breakdown:</span>
            <span className="font-mono text-slate-300">
              {summary.runningTimeMin}m Moving + {summary.dwellTimeMin}m Dwell Time
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
            <div
              className="bg-blue-500 h-full"
              style={{
                width: `${Math.round((summary.runningTimeMin / (summary.runningTimeMin + summary.dwellTimeMin || 1)) * 100)}%`
              }}
              title="Bus In-Motion Run Time"
            />
            <div
              className="bg-amber-500 h-full"
              style={{
                width: `${Math.round((summary.dwellTimeMin / (summary.runningTimeMin + summary.dwellTimeMin || 1)) * 100)}%`
              }}
              title="Stop Boarding & Dwell Delay"
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Segment Transit Time
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Passenger Boarding Dwell
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
