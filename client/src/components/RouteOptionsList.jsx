import React, { useState } from 'react';
import { Bus, ChevronDown, ChevronUp, Clock, MapPin, ArrowRight, CornerDownRight } from 'lucide-react';

export default function RouteOptionsList({ journeyOptions, selectedOptionId, onSelectOption }) {
  const [expandedId, setExpandedId] = useState(null);

  if (!journeyOptions || journeyOptions.length === 0) return null;

  const toggleExpand = (id, e) => {
    e.stopPropagation();
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-sm space-y-3">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 className="font-bold text-sm text-white tracking-tight flex items-center gap-2">
          <Bus className="w-4 h-4 text-blue-400" />
          Recommended Delhi Transit Itineraries ({journeyOptions.length})
        </h3>
        <span className="text-[11px] text-slate-400">Sorted by Model ETA</span>
      </div>

      <div className="space-y-3">
        {journeyOptions.map((opt, idx) => {
          const isSelected = selectedOptionId === opt.id || (!selectedOptionId && idx === 0);
          const isExpanded = expandedId === opt.id;

          return (
            <div
              key={opt.id}
              onClick={() => onSelectOption(opt.id)}
              className={`rounded-xl border transition-all cursor-pointer p-4 ${
                isSelected
                  ? 'bg-blue-950/30 border-blue-500/60 ring-1 ring-blue-500/30 shadow-lg shadow-blue-500/10'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2.5 py-0.5 rounded-md text-xs font-black text-white shadow-sm font-mono"
                      style={{ backgroundColor: opt.routeColor || '#2563eb' }}
                    >
                      {opt.routeNumber}
                    </span>
                    <span className="text-xs font-semibold text-slate-300">
                      {opt.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">
                    {opt.routeName}
                  </p>
                </div>

                <div className="text-right">
                  <div className="flex items-baseline gap-1 justify-end">
                    <span className="text-xl font-extrabold text-white font-mono">
                      {opt.summary.modelEtaMinutes}
                    </span>
                    <span className="text-xs text-slate-400">mins</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    {opt.summary.totalDistanceKm} km • {opt.summary.totalStops} stops
                  </span>
                </div>
              </div>

              {/* Expand Toggle */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <span className="text-[11px] text-blue-400 font-medium">
                  {isSelected ? '✓ Active on Live Map' : 'Click to view on Map'}
                </span>
                <button
                  type="button"
                  onClick={(e) => toggleExpand(opt.id, e)}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition"
                >
                  <span>{isExpanded ? 'Hide Segments' : 'Inspect Stops & Speeds'}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Expanded Segment Detail */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-800 space-y-2 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Segment-by-Segment Speed & Dwell Telemetry:
                  </span>
                  {opt.legs.map((leg, legIdx) => {
                    if (leg.type === 'Walk & Platform Transfer') {
                      return (
                        <div key={`transfer_${legIdx}`} className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center gap-2">
                          <CornerDownRight className="w-4 h-4" />
                          <span>Platform Transfer at <b>{leg.transferAt.name}</b> (~{leg.transferWaitTimeMin} mins wait)</span>
                        </div>
                      );
                    }

                    return (
                      <div key={`leg_${legIdx}`} className="space-y-1.5">
                        {leg.segments && leg.segments.map((seg, sIdx) => (
                          <div
                            key={`seg_${sIdx}`}
                            className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: seg.congestionColor }} />
                              <span className="font-medium text-slate-300 truncate text-[11px]">
                                {seg.from.name} ➔ {seg.to.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2.5 text-[10px] whitespace-nowrap">
                              <span className="font-mono text-slate-400">
                                {seg.distanceKm} km
                              </span>
                              <span
                                className="font-mono font-bold px-1.5 py-0.5 rounded"
                                style={{
                                  backgroundColor: `${seg.congestionColor}20`,
                                  color: seg.congestionColor
                                }}
                              >
                                {seg.effectiveSpeedKmh} km/h
                              </span>
                              <span className="text-slate-400 font-mono">
                                {Math.round(seg.totalTimeMin)}m
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
