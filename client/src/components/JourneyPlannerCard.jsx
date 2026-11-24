import React from 'react';
import { MapPin, Navigation, ArrowUpDown, Clock, Sparkles, Bus, Car, Train, Footprints } from 'lucide-react';

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
  activeMode,
  setActiveMode,
  onCalculate,
  isLoading
}) {
  const handleSwap = () => {
    const temp = originId;
    setOriginId(destinationId);
    setDestinationId(temp);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
      {/* Mode Selector Tabs (Fully Functional Multi-Modal Transit) */}
      <div className="flex items-center gap-2 mb-5 p-1 bg-slate-100/80 rounded-2xl">
        <button
          type="button"
          onClick={() => setActiveMode('bus')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
            activeMode === 'bus'
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bus className="w-4 h-4" />
          <span>DTC Bus</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveMode('cab')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
            activeMode === 'cab'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Cab / Auto</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveMode('metro')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
            activeMode === 'metro'
              ? 'bg-red-500 text-white shadow-md shadow-red-500/25'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Train className="w-4 h-4" />
          <span>Metro</span>
        </button>
      </div>

      <div className="space-y-3.5">
        {/* Origin Input (Card Style like Image 2) */}
        <div className="relative p-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-emerald-500 focus-within:bg-white transition-all">
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-full bg-blue-500 ring-4 ring-blue-100 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                From (My Boarding Location)
              </span>
              <select
                value={originId}
                onChange={(e) => setOriginId(e.target.value)}
                className="w-full bg-transparent text-sm font-bold text-slate-800 focus:outline-none cursor-pointer truncate"
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

        {/* Destination Input (Orange Dot like Image 2) */}
        <div className="relative p-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-orange-500 focus-within:bg-white transition-all">
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-full bg-orange-500 ring-4 ring-orange-100 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                To (Alighting Destination)
              </span>
              <select
                value={destinationId}
                onChange={(e) => setDestinationId(e.target.value)}
                className="w-full bg-transparent text-sm font-bold text-slate-800 focus:outline-none cursor-pointer truncate"
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
                className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 text-slate-600 transition-all"
              >
                {hub.label}
              </button>
            ))}
          </div>
        </div>

        {/* Departure Time & Peak Hour Selector */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
          <label className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              Departure Time (Spatio-Temporal Model)
            </span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="time"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-emerald-500 font-mono shadow-sm"
            />
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setDepartureTime("18:30")}
                className={`flex-1 text-[11px] py-1.5 px-1 rounded-xl border font-bold transition ${
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
                className={`flex-1 text-[11px] py-1.5 px-1 rounded-xl border font-bold transition ${
                  departureTime === "09:15"
                    ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Morning
              </button>
            </div>
          </div>
        </div>

        {/* Action Button (Vibrant Orange / Emerald Gradient like Image 2) */}
        <button
          type="button"
          onClick={onCalculate}
          disabled={isLoading || !originId || !destinationId}
          className="w-full mt-2 py-3.5 px-4 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 active:scale-[0.99] text-white shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Analyzing Delhi Congestion...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Compute Bus Reality ETA & Routes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
