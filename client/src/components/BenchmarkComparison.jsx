import React from 'react';
import { Clock, Car, Bus, TrendingUp, AlertTriangle } from 'lucide-react';

export default function BenchmarkComparison({ benchmarks, summary }) {
  if (!benchmarks) return null;

  const {
    staticDtcScheduleEtaMin,
    googleMapsCarEtaMin,
    transitPulseModelEtaMin,
    scheduleUnderestimatePercentage
  } = benchmarks;

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
        <div>
          <h3 className="font-extrabold text-sm text-slate-800 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Hackathon Benchmark: ETA Reality Check
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">
            Static Timetable vs Car Traffic vs TransitPulse Bus GPS Model
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-black bg-orange-100 text-orange-700 border border-orange-200 shadow-sm">
          +{scheduleUnderestimatePercentage}% Reality Lag
        </span>
      </div>

      {/* 3-Way Benchmark Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {/* 1. Static Schedule */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Static Timetable
            </span>
            <span className="text-[10px] text-red-700 font-extrabold bg-red-100 px-2 py-0.5 rounded-full">
              Unrealistic
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-700 font-mono">
              {staticDtcScheduleEtaMin}
            </span>
            <span className="text-xs font-semibold text-slate-400">mins</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Assumes free-flow speed & ignores real-world stop queues.
          </p>
        </div>

        {/* 2. Google Maps Car */}
        <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-sky-800 mb-2">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-sky-500" />
              Google Maps (Car)
            </span>
            <span className="text-[10px] text-sky-700 font-extrabold bg-sky-100 px-2 py-0.5 rounded-full">
              Car Baseline
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-sky-900 font-mono">
              {googleMapsCarEtaMin}
            </span>
            <span className="text-xs font-semibold text-sky-600">mins</span>
          </div>
          <p className="text-[10px] text-sky-600/80 mt-1">
            Private vehicle speed without bus stops & boarding delays.
          </p>
        </div>

        {/* 3. TransitPulse Model */}
        <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-500/80 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-emerald-900 mb-2">
            <span className="text-xs font-black flex items-center gap-1.5">
              <Bus className="w-3.5 h-3.5 text-emerald-600" />
              TransitPulse Model
            </span>
            <span className="text-[10px] text-white font-extrabold bg-emerald-600 px-2 py-0.5 rounded-full shadow-sm">
              True Bus Reality
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-emerald-900 font-mono">
              {transitPulseModelEtaMin}
            </span>
            <span className="text-xs font-bold text-emerald-700">mins</span>
            <span className="text-[11px] text-emerald-700 font-mono ml-auto">
              (±{Math.round(transitPulseModelEtaMin * 0.1)}m)
            </span>
          </div>
          <p className="text-[10px] text-emerald-800 mt-1 font-medium">
            Accounts for bus lane bottlenecks + 2.5m dwell delay per interchange.
          </p>
        </div>
      </div>

      {/* Physics Breakdown: Running vs Dwell Time */}
      {summary && (
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
          <div className="flex items-center justify-between text-slate-600 mb-1.5 text-[11px] font-semibold">
            <span>Travel Physics Breakdown:</span>
            <span className="font-mono text-slate-800">
              {summary.runningTimeMin}m Moving + {summary.dwellTimeMin}m Dwell Time
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full"
              style={{
                width: `${Math.round((summary.runningTimeMin / (summary.runningTimeMin + summary.dwellTimeMin || 1)) * 100)}%`
              }}
              title="Bus In-Motion Run Time"
            />
            <div
              className="bg-orange-500 h-full"
              style={{
                width: `${Math.round((summary.dwellTimeMin / (summary.runningTimeMin + summary.dwellTimeMin || 1)) * 100)}%`
              }}
              title="Stop Boarding & Dwell Delay"
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Segment Transit Time
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Passenger Boarding Dwell
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
