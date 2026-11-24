import React from 'react';
import { Gauge } from 'lucide-react';

export default function CorridorTicker({ corridors }) {
  if (!corridors || corridors.length === 0) return null;

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-2 overflow-x-auto text-xs shadow-sm">
      <div className="max-w-[1920px] mx-auto flex items-center gap-6 whitespace-nowrap min-w-max">
        <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
          <Gauge className="w-3.5 h-3.5 text-emerald-600" />
          <span>Live Arterial Velocity:</span>
        </div>

        {corridors.map((c) => {
          const isHeavy = c.congestionSeverity >= 0.7;
          return (
            <div key={c.id} className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200">
              <span className="font-semibold text-slate-700">{c.name.split('(')[0]}</span>
              <span className={`font-mono font-bold px-2 py-0.5 rounded-full text-[11px] ${
                isHeavy ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}>
                {c.currentPeakSpeedKmh} km/h
              </span>
              <span className="text-[10px] text-slate-400">
                ({c.congestionLevel})
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
