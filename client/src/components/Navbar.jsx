import React, { useState, useEffect } from 'react';
import { Bus, Activity, ShieldCheck, Clock, Bell } from 'lucide-react';

export default function Navbar() {
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-md sticky top-0 z-50 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-[1920px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner ring-1 ring-white/40">
            <Bus className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white drop-shadow-sm">
                TransitPulse<span className="text-emerald-200">.Delhi</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white border border-white/30 rounded-full">
                Phase 1 Prototype
              </span>
            </div>
            <p className="text-xs text-emerald-100 font-medium">
              Transport Stack Delhi 2026 • Real-Time Bus Traffic Model & Engine
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-3 text-xs">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
            <Activity className="w-3.5 h-3.5 text-emerald-200" />
            <span className="font-semibold">DTC Bus GPS Live Stream (Active)</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white shadow-sm">
            <Clock className="w-3.5 h-3.5 text-emerald-200" />
            <span className="font-mono font-medium">{time} IST</span>
          </div>

          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/30 text-white">
            <Bell className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
}
