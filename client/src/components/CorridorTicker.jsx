import React from 'react';
import { AlertTriangle, TrendingDown, Gauge } from 'lucide-react';

export default function CorridorTicker({ corridors }) {
  if (!corridors || corridors.length === 0) return null;

  return (
    <div className="bg-slate-950/80 border-b border-slate-800/80 px-4 py-2 overflow-x-auto text-xs">
      <div className="max-w-7xl mx-auto flex items-center gap-6 whitespace-nowrap min-w-max">
        <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
          <Gauge className="w-3.5 h-3.5 text-blue-400" />
          <span>Live Arterial Velocity:</span>
        </div>

        {corridors.map((c) => {
          const isHeavy = c.congestionSeverity >= 0.7;
          return (
            <div key={c.id} className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
              <span className="font-medium text-slate-300">{c.name.split('(')[0]}</span>
              <span className={`font-mono font-bold px-1.5 py-0.2 rounded text-[11px] ${
                isHeavy ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {c.currentPeakSpeedKmh} km/h
              </span>
              <span className="text-[10px] text-slate-500">
                ({c.congestionLevel})
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

