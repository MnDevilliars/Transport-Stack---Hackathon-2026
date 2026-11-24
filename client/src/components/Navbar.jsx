import React, { useState, useEffect } from 'react';
import { Bus, Activity, ShieldCheck, Clock, Bell, Code2, Map } from 'lucide-react';

export default function Navbar({ currentView = 'map', onToggleView }) {
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-md sticky top-0 z-50 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 transition-all">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner ring-1 ring-white/40 flex-shrink-0">
            <Bus className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-extrabold text-base sm:text-xl tracking-tight text-white drop-shadow-sm truncate">
                TransitPulse<span className="text-emerald-200">.Delhi</span>
              </span>
              <span className="px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white border border-white/30 rounded-full flex-shrink-0">
                Phase 1
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-emerald-100 font-medium truncate hidden xs:block sm:block">
              Transport Stack Delhi 2026 • Real-Time Bus Engine
            </p>
          </div>
        </div>

        {/* Action Button & Status Indicators */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs flex-shrink-0">
          {/* Hackathon APIs & Docs CTA Button */}
          <button
            onClick={onToggleView}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-emerald-800 hover:bg-emerald-50 active:scale-95 font-bold shadow-md transition border border-emerald-200 text-[11px] sm:text-xs whitespace-nowrap"
            title="View API Endpoints, Mathematical Models, and Hackathon Documentation"
          >
            {currentView === 'map' ? (
              <>
                <Code2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">⚡ APIs & Hackathon Spec</span>
                <span className="sm:hidden">⚡ API Docs</span>
              </>
            ) : (
              <>
                <Map className="w-3.5 h-3.5 text-emerald-600" />
                <span>🗺️ Live Map</span>
              </>
            )}
          </button>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
            <Activity className="w-3.5 h-3.5 text-emerald-200" />
            <span className="font-semibold">Live GPS Active</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-[11px] font-mono">
            <Clock className="w-3 h-3 text-emerald-200" />
            <span>{time}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
