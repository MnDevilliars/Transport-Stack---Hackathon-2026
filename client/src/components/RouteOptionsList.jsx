import React, { useState } from 'react';
import {
  Bus,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  ArrowRight,
  CornerDownRight,
  Ticket,
  Activity,
  Navigation,
  Users,
  Gauge
} from 'lucide-react';

export default function RouteOptionsList({
  journeyOptions,
  selectedOptionId,
  onSelectOption,
  liveBuses = []
}) {
  const [expandedId, setExpandedId] = useState(null);

  if (!journeyOptions || journeyOptions.length === 0) return null;

  const toggleExpand = (id, e) => {
    e.stopPropagation();
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div>
          <h3 className="font-extrabold text-sm text-slate-800 tracking-tight flex items-center gap-2">
            <Bus className="w-4 h-4 text-emerald-600" />
            Aapke Liye Best Bus Routes ({journeyOptions.length})
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">
            Delhi ke ground traffic ke hisaab se sabse fast options
          </p>
        </div>
        <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 font-bold px-2 py-0.5 rounded-full">
          Sabse Fast Pehle
        </span>
      </div>

      {/* Route Cards */}
      <div className="space-y-3.5">
        {journeyOptions.map((opt, idx) => {
          const isSelected = selectedOptionId === opt.id || (!selectedOptionId && idx === 0);
          const isExpanded = expandedId === opt.id;

          // Find active live buses on this route
          const matchingBuses = liveBuses.filter(
            (b) => b.routeNumber === opt.routeNumber || b.routeId === opt.routeId
          );
          const primaryBus = matchingBuses[0];

          return (
            <div
              key={opt.id}
              onClick={() => onSelectOption(opt.id)}
              className={`rounded-2xl border transition-all cursor-pointer p-4 ${
                isSelected
                  ? 'bg-emerald-50/40 border-2 border-emerald-500 shadow-md shadow-emerald-500/10'
                  : 'bg-slate-50 border-slate-200/80 hover:border-slate-300'
              }`}
            >
              {/* Card Top: Route Badge, Name, ETA */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-3 py-1 rounded-xl text-xs font-black text-white shadow-sm font-mono"
                      style={{ backgroundColor: opt.routeColor || '#10b981' }}
                    >
                      {opt.routeNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {opt.type === 'direct' ? 'Direct Bus (Bina Badle)' : '1 Transfer (Bus Badlo)'}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-500 truncate" title={opt.routeName}>
                    {opt.routeName}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="flex items-baseline gap-1 justify-end">
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      {opt.summary.modelEtaMinutes}
                    </span>
                    <span className="text-xs font-bold text-slate-600">min</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono font-medium block">
                    {opt.summary.totalDistanceKm} km • {opt.summary.totalStops} stops
                  </span>
                </div>
              </div>

              {/* 🟢 Live Bus Location Status Card (User-Friendly Tracking) */}
              {primaryBus ? (
                <div className="mt-3 p-3 rounded-xl bg-white border border-emerald-200/90 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      Live Bus: <span className="font-mono font-black">{primaryBus.vehicleId}</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {primaryBus.speedKmh} km/h • {primaryBus.speedKmh < 15 ? 'Traffic me dheemi' : 'Normal Speed'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-600 pt-0.5">
                    <span className="flex items-center gap-1 text-slate-700">
                      <MapPin className="w-3 h-3 text-red-500 flex-shrink-0" />
                      <span>
                        Abhi: <b>{primaryBus.previousStop}</b> ➔ Agla: <b>{primaryBus.nextStop}</b>
                      </span>
                    </span>
                    <span className="text-slate-500 font-medium whitespace-nowrap pl-2">
                      Bheed: <b className="text-slate-700">{primaryBus.occupancy}</b>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-slate-100/80 text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-slate-400" />
                  <span>DTC fleet schedule active on this corridor</span>
                </div>
              )}

              {/* Action row with Ticket Pill & Expand */}
              <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <Ticket className="w-3 h-3" /> Kiraya: ₹15 - ₹25
                  </span>
                  <span className="text-[11px] text-emerald-600 font-bold hidden sm:inline">
                    {isSelected ? '✓ Map par dikh raha hai' : 'Is Bus ko Chunein'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => toggleExpand(opt.id, e)}
                  className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-emerald-700 transition"
                >
                  <span>{isExpanded ? 'Details Chhupayein' : 'Stops & Traffic Dekhein'}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Expanded Segment Detail */}
              {isExpanded && (
                <div className="mt-3.5 pt-3 border-t border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold pb-1">
                    <span>🛣️ Har Stop ke beech ka Traffic aur Samay:</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      (Speed + Stop Boarding Time shamil hai)
                    </span>
                  </div>

                  {opt.legs.map((leg, legIdx) => {
                    if (leg.type === 'Walk & Platform Transfer') {
                      return (
                        <div
                          key={`transfer_${legIdx}`}
                          className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 flex items-center gap-2"
                        >
                          <CornerDownRight className="w-4 h-4 text-orange-600 flex-shrink-0" />
                          <span className="font-medium text-xs">
                            Dusri bus yahan pakdein: <b>{leg.transferAt.name}</b> (~{leg.transferWaitTimeMin} min wait)
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div key={`leg_${legIdx}`} className="space-y-1.5">
                        {leg.segments &&
                          leg.segments.map((seg, sIdx) => {
                            // Check if primary live bus is currently on this segment
                            const isBusHere =
                              primaryBus &&
                              (primaryBus.nextStop === seg.to.name ||
                                primaryBus.previousStop === seg.from.name);

                            return (
                              <div
                                key={`seg_${sIdx}`}
                                className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 shadow-2xs transition ${
                                  isBusHere
                                    ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-300'
                                    : 'bg-white border-slate-200/90'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: seg.congestionColor }}
                                    title={seg.effectiveSpeedKmh < 15 ? 'Bhari Traffic (Jam)' : 'Normal'}
                                  />
                                  <div className="truncate">
                                    <span className="font-semibold text-slate-700 text-[11px]">
                                      {seg.from.name} ➔ {seg.to.name}
                                    </span>
                                    {isBusHere && (
                                      <span className="ml-2 px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider bg-emerald-600 text-white rounded-full">
                                        🚌 Bus Abhi Yahan Hai
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 text-[10px] whitespace-nowrap">
                                  <span className="font-mono text-slate-400 font-medium">
                                    {seg.distanceKm} km
                                  </span>
                                  <span
                                    className="font-mono font-bold px-2 py-0.5 rounded-full"
                                    style={{
                                      backgroundColor: `${seg.congestionColor}20`,
                                      color: seg.congestionColor,
                                    }}
                                  >
                                    {seg.effectiveSpeedKmh} km/h
                                  </span>
                                  <span className="text-slate-800 font-mono font-extrabold bg-slate-100 px-1.5 py-0.5 rounded">
                                    {Math.round(seg.totalTimeMin)}m
                                  </span>
                                </div>
                              </div>
                            );
                          })}
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
