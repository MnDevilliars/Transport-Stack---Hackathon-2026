import React, { useState } from 'react';
import { Bus, ChevronDown, ChevronUp, Clock, MapPin, ArrowRight, CornerDownRight, Ticket } from 'lucide-react';

export default function RouteOptionsList({ journeyOptions, selectedOptionId, onSelectOption }) {
  const [expandedId, setExpandedId] = useState(null);

  if (!journeyOptions || journeyOptions.length === 0) return null;

  const toggleExpand = (id, e) => {
    e.stopPropagation();
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-3.5">
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <h3 className="font-extrabold text-sm text-slate-800 tracking-tight flex items-center gap-2">
          <Bus className="w-4 h-4 text-emerald-600" />
          Recommended Delhi Transit Itineraries ({journeyOptions.length})
        </h3>
        <span className="text-[11px] text-slate-400 font-semibold">Sorted by Model ETA</span>
      </div>

      <div className="space-y-3">
        {journeyOptions.map((opt, idx) => {
          const isSelected = selectedOptionId === opt.id || (!selectedOptionId && idx === 0);
          const isExpanded = expandedId === opt.id;

          return (
            <div
              key={opt.id}
              onClick={() => onSelectOption(opt.id)}
              className={`rounded-2xl border transition-all cursor-pointer p-4 ${
                isSelected
                  ? 'bg-emerald-50/50 border-2 border-emerald-500 shadow-md shadow-emerald-500/10'
                  : 'bg-slate-50 border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-3 py-1 rounded-xl text-xs font-black text-white shadow-sm font-mono"
                      style={{ backgroundColor: opt.routeColor || '#10b981' }}
                    >
                      {opt.routeNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {opt.type}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-500 line-clamp-1">
                    {opt.routeName}
                  </p>
                </div>

                <div className="text-right">
                  <div className="flex items-baseline gap-1 justify-end">
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      {opt.summary.modelEtaMinutes}
                    </span>
                    <span className="text-xs font-bold text-slate-500">mins</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono font-medium block">
                    {opt.summary.totalDistanceKm} km • {opt.summary.totalStops} stops
                  </span>
                </div>
              </div>

              {/* Action row with Ticket Pill & Expand */}
              <div className="mt-3.5 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <Ticket className="w-3 h-3" /> DTC Fare: ₹15 - ₹25
                  </span>
                  <span className="text-[11px] text-emerald-600 font-bold hidden sm:inline">
                    {isSelected ? '✓ Showing on Map' : 'Select Itinerary'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => toggleExpand(opt.id, e)}
                  className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-emerald-700 transition"
                >
                  <span>{isExpanded ? 'Hide Segments' : 'Stops & Speeds'}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Expanded Segment Detail */}
              {isExpanded && (
                <div className="mt-3.5 pt-3 border-t border-slate-200 space-y-2 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Segment-by-Segment Speed & Dwell Telemetry:
                  </span>
                  {opt.legs.map((leg, legIdx) => {
                    if (leg.type === 'Walk & Platform Transfer') {
                      return (
                        <div key={`transfer_${legIdx}`} className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 flex items-center gap-2">
                          <CornerDownRight className="w-4 h-4 text-orange-600" />
                          <span className="font-medium">Platform Transfer at <b>{leg.transferAt.name}</b> (~{leg.transferWaitTimeMin} mins wait)</span>
                        </div>
                      );
                    }

                    return (
                      <div key={`leg_${legIdx}`} className="space-y-1.5">
                        {leg.segments && leg.segments.map((seg, sIdx) => (
                          <div
                            key={`seg_${sIdx}`}
                            className="p-2.5 rounded-xl bg-white border border-slate-200/90 flex items-center justify-between gap-2 shadow-2xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.congestionColor }} />
                              <span className="font-semibold text-slate-700 truncate text-[11px]">
                                {seg.from.name} ➔ {seg.to.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2.5 text-[10px] whitespace-nowrap">
                              <span className="font-mono text-slate-400 font-medium">
                                {seg.distanceKm} km
                              </span>
                              <span
                                className="font-mono font-bold px-2 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: `${seg.congestionColor}20`,
                                  color: seg.congestionColor
                                }}
                              >
                                {seg.effectiveSpeedKmh} km/h
                              </span>
                              <span className="text-slate-600 font-mono font-bold">
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
