import React from 'react';
import { MapPin, Navigation, ArrowUpDown, Clock, Sparkles } from 'lucide-react';

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
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-sm">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-blue-400" />
          <h2 className="font-bold text-base text-white tracking-tight">Plan Delhi Transit Journey</h2>
        </div>
        <span className="text-[11px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 font-medium">
          DTC Reality Engine
        </span>
      </div>

      <div className="space-y-4">
        {/* Origin Input */}
        <div>
          <label className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
              Origin Stop / Terminal
            </span>
            <span className="text-[10px] text-slate-500">Boarding Point</span>
          </label>
          <select
            value={originId}
            onChange={(e) => setOriginId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
          >
            <option value="" disabled>Select Starting Stop</option>
            {stops.map((s) => (
              <option key={`orig_${s.id}`} value={s.id}>
                {s.name} ({s.zone})
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-2 relative z-10">
          <button
            type="button"
            onClick={handleSwap}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition shadow-md active:scale-95"
            title="Swap Origin and Destination"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        {/* Destination Input */}
        <div>
          <label className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400 ring-4 ring-red-400/20" />
              Destination Stop / Terminal
            </span>
            <span className="text-[10px] text-slate-500">Alighting Point</span>
          </label>
          <select
            value={destinationId}
            onChange={(e) => setDestinationId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
          >
            <option value="" disabled>Select Destination Stop</option>
            {stops.map((s) => (
              <option key={`dest_${s.id}`} value={s.id}>
                {s.name} ({s.zone})
              </option>
            ))}
          </select>
        </div>

        {/* Quick Hub Chips */}
        <div>
          <span className="text-[11px] text-slate-500 font-medium block mb-1.5">Quick Hubs:</span>
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
                className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800/80 hover:bg-blue-600/20 hover:text-blue-300 hover:border-blue-500/40 border border-slate-700/60 text-slate-300 transition-all"
              >
                {hub.label}
              </button>
            ))}
          </div>
        </div>

        {/* Departure Time & Peak Hour Selector */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            Departure Time (Spatio-Temporal Model)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="time"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
            />
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setDepartureTime("18:30")}
                className={`flex-1 text-[11px] py-2 px-1 rounded-lg border font-medium transition ${
                  departureTime === "18:30"
                    ? "bg-red-500/20 border-red-500/40 text-red-300"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                }`}
              >
                Evening Peak (18:30)
              </button>
              <button
                type="button"
                onClick={() => setDepartureTime("09:15")}
                className={`flex-1 text-[11px] py-2 px-1 rounded-lg border font-medium transition ${
                  departureTime === "09:15"
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
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
          className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] text-white shadow-lg shadow-blue-600/30 border border-blue-400/20 flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Evaluating Delhi Road Network...</span>
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

