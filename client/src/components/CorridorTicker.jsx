import React from 'react';
import { Gauge } from 'lucide-react';

export default function CorridorTicker({ corridors }) {
  if (!corridors || corridors.length === 0) return null;

  return (
    <div className="bg-white border-b border-slate-200/80 px-3 sm:px-6 py-2 overflow-x-auto text-xs shadow-xs scrollbar-none">
      <div className="max-w-[1920px] mx-auto flex items-center gap-3 sm:gap-5 whitespace-nowrap min-w-max">
        <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase tracking-wider text-[10px] sm:text-[11px] flex-shrink-0">
          <Gauge className="w-3.5 h-3.5 text-emerald-600" />
          <span>Live Arterial Velocity:</span>
        </div>

        <div className="flex items-center gap-2">
          {corridors.map((c) => {
            const isHeavy = c.congestionSeverity >= 0.7;
            return (
              <div
                key={c.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px]"
              >
                <span className="font-semibold text-slate-700">{c.name.split('(')[0]}</span>
                <span
                  className={`font-mono font-bold px-1.5 py-0.2 rounded-full text-[10px] ${
                    isHeavy
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
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
    </div>
  );
}
