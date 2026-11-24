import React from 'react';
import { MapPin, Navigation, ArrowUpDown, Clock, Sparkles, Bus } from 'lucide-react';

const POPULAR_HUBS = [
  { id: 'STP_AIIMS', label: 'AIIMS' },
  { id: 'STP_KG_ISBT', label: 'Kashmere Gate ISBT' },
  { id: 'STP_CP_SHIVAJI', label: 'Connaught Place' },
  { id: 'STP_ANAND_VIHAR', label: 'Anand Vihar ISBT' },
  { id: 'STP_NEHRU_PLACE', label: 'Nehru Place' },
  { id: 'STP_DHAULA_KUAN', label: 'Dhaula Kuan' }
];

export default function JourneyPlannerCard({
  stops,
  originId,
  setOriginId,
  destinationId,
  setDestinationId,
  departureTime,
  setDepartureTime,
  onCalculate,
  isLoading
}) {
  const handleSwap = () => {
    const temp = originId;
    setOriginId(destinationId);
    setDestinationId(temp);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all">
      {/* Problem 01 Dedicated Focus Banner */}
      <div className="flex items-center justify-between p-3 sm:p-3.5 mb-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/40 border border-emerald-200/80 rounded-2xl gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shadow-emerald-600/20 flex-shrink-0">
            <Bus className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="font-extrabold text-xs text-emerald-950 block truncate">
              DTC Bus Journey Planner
            </span>
            <span className="text-[10px] text-emerald-700 font-bold block truncate">
              Problem 01 • Spatio-Temporal Speed Engine
            </span>
          </div>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white shadow-sm whitespace-nowrap flex-shrink-0">
          Active DTC GPS
        </span>
      </div>

      <div className="space-y-3.5">
        {/* Origin Input */}
        <div className="relative p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-emerald-500 focus-within:bg-white transition-all">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-3.5 h-3.5 rounded-full bg-blue-500 ring-4 ring-blue-100 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                From (Boarding Stop)
              </span>
              <select
                value={originId}
                onChange={(e) => setOriginId(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-800 focus:outline-none cursor-pointer truncate pr-2"
              >
                <option value="" disabled>Select Starting Stop</option>
                {stops.map((s) => (
                  <option key={`orig_${s.id}`} value={s.id}>
                    {s.name} ({s.zone})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Swap Button (Floating Circle) */}
        <div className="flex justify-center -my-2 relative z-10">
          <button
            type="button"
            onClick={handleSwap}
            className="p-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-emerald-600 transition shadow-sm active:scale-95"
            title="Swap Origin and Destination"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Destination Input */}
        <div className="relative p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-orange-500 focus-within:bg-white transition-all">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-3.5 h-3.5 rounded-full bg-orange-500 ring-4 ring-orange-100 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                To (Destination Stop)
              </span>
              <select
                value={destinationId}
                onChange={(e) => setDestinationId(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-800 focus:outline-none cursor-pointer truncate pr-2"
              >
                <option value="" disabled>Select Destination Stop</option>
                {stops.map((s) => (
                  <option key={`dest_${s.id}`} value={s.id}>
                    {s.name} ({s.zone})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quick Hub Chips */}
        <div>
          <span className="text-[11px] text-slate-400 font-semibold block mb-1.5">Delhi Transit Hubs:</span>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_HUBS.map((hub) => (
              <button
                key={hub.id}
                type="button"
                onClick={() => {
                  if (!originId) setOriginId(hub.id);
                  else if (!destinationId && originId !== hub.id) setDestinationId(hub.id);
                  else setDestinationId(hub.id);
                }}
                className="px-2.5 py-1 text-[10px] sm:text-[11px] font-medium rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 text-slate-600 transition-all active:scale-95"
              >
                {hub.label}
              </button>
            ))}
          </div>
        </div>

        {/* Departure Time & Peak Hour Selector */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <label className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              Departure Time:
            </span>
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="time"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-emerald-500 font-mono shadow-sm flex-1"
            />
            <div className="flex items-center gap-1.5 flex-1">
              <button
                type="button"
                onClick={() => setDepartureTime("18:30")}
                className={`flex-1 text-[11px] py-1.5 px-2 rounded-xl border font-bold transition whitespace-nowrap text-center ${
                  departureTime === "18:30"
                    ? "bg-red-500 text-white border-red-500 shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Peak (18:30)
              </button>
              <button
                type="button"
                onClick={() => setDepartureTime("09:15")}
                className={`flex-1 text-[11px] py-1.5 px-2 rounded-xl border font-bold transition whitespace-nowrap text-center ${
                  departureTime === "09:15"
                    ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Morning (09:15)
              </button>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onCalculate}
          disabled={isLoading || !originId || !destinationId}
          className="w-full mt-2 py-3 sm:py-3.5 px-4 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 active:scale-[0.99] text-white shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Analyzing Delhi Traffic...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Find Best Bus Routes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
