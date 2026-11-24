import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CorridorTicker from './components/CorridorTicker';
import JourneyPlannerCard from './components/JourneyPlannerCard';
import BenchmarkComparison from './components/BenchmarkComparison';
import RouteOptionsList from './components/RouteOptionsList';
import TransitMap from './components/TransitMap';
import ApiDocsPage from './components/ApiDocsPage';
import { AlertCircle, Bus, Map } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('map'); // 'map' | 'docs'
  const [mobileTab, setMobileTab] = useState('planner'); // 'planner' | 'map'
  const [stops, setStops] = useState([]);
  const [corridors, setCorridors] = useState([]);
  const [liveBuses, setLiveBuses] = useState([]);

  // Default query: AIIMS to Kashmere Gate ISBT during Evening Peak (18:30)
  const [originId, setOriginId] = useState('STP_AIIMS');
  const [destinationId, setDestinationId] = useState('STP_KG_ISBT');
  const [departureTime, setDepartureTime] = useState('18:30');
  const [activeMode, setActiveMode] = useState('bus');

  const [isLoading, setIsLoading] = useState(false);
  const [journeyPlan, setJourneyPlan] = useState(null);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Load Initial Metadata (Stops & Corridors)
  useEffect(() => {
    async function initData() {
      try {
        const [stopsRes, corridorsRes] = await Promise.all([
          fetch('/api/v1/routes/stops'),
          fetch('/api/v1/corridors')
        ]);

        const stopsData = await stopsRes.json();
        const corridorsData = await corridorsRes.json();

        if (stopsData.success) setStops(stopsData.stops);
        if (corridorsData.success) setCorridors(corridorsData.corridors);
      } catch (err) {
        console.error('Failed to load initial transit data:', err);
      }
    }
    initData();
  }, []);

  // Poll Live Telemetry every 3 seconds
  useEffect(() => {
    async function fetchLiveBuses() {
      try {
        const res = await fetch('/api/v1/telemetry/live-buses');
        const data = await res.json();
        if (data.success) {
          setLiveBuses(data.buses);
        }
      } catch (err) {
        console.error('Live telemetry polling error:', err);
      }
    }

    fetchLiveBuses();
    const interval = setInterval(fetchLiveBuses, 3000);
    return () => clearInterval(interval);
  }, []);

  // Journey Calculation Handler
  const handleCalculatePlan = async (customMode = null) => {
    if (!originId || !destinationId) return;
    setIsLoading(true);
    setErrorMsg(null);

    const modeToUse = customMode || activeMode;

    try {
      const res = await fetch('/api/v1/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originId,
          destinationId,
          departureTime,
          mode: modeToUse
        })
      });

      const json = await res.json();
      if (json.success && json.data) {
        setJourneyPlan(json.data);
        if (json.data.journeyOptions.length > 0) {
          setSelectedOptionId(json.data.journeyOptions[0].id);
        }
      } else {
        setErrorMsg(json.error || 'No feasible transit routes found between selected stops.');
        setJourneyPlan(null);
      }
    } catch (err) {
      setErrorMsg('Failed to communicate with Delhi routing engine. Is server running?');
    } finally {
      setIsLoading(false);
    }
  };

  // Run initial plan once stops are loaded, and when mode changes
  useEffect(() => {
    if (stops.length > 0) {
      handleCalculatePlan();
    }
  }, [stops, activeMode]);

  // Selected Option Helper
  const selectedOption = journeyPlan?.journeyOptions?.find(
    (opt) => opt.id === (selectedOptionId || journeyPlan.journeyOptions[0]?.id)
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-emerald-500/20 selection:text-emerald-800">
      <Navbar
        currentView={currentView}
        onToggleView={() => setCurrentView(currentView === 'map' ? 'docs' : 'map')}
      />

      {currentView === 'docs' ? (
        <ApiDocsPage onBackToMap={() => setCurrentView('map')} />
      ) : (
        <>
          <CorridorTicker corridors={corridors} />

          {/* Main Workspace Layout */}
          <main className="flex-1 max-w-[1920px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
            {/* Mobile Tab Segmented Switcher (Visible only on mobile/tablet < lg) */}
            <div className="lg:hidden col-span-1 w-full flex items-center p-1 bg-slate-200/90 rounded-2xl mb-1 font-bold text-xs shadow-inner sticky top-[58px] z-30 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setMobileTab('planner')}
                className={`flex-1 py-2 sm:py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition ${
                  mobileTab === 'planner'
                    ? 'bg-white text-emerald-800 shadow-md font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Bus className="w-3.5 h-3.5 text-emerald-600" />
                <span>Planner & Routes</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('map')}
                className={`flex-1 py-2 sm:py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition ${
                  mobileTab === 'map'
                    ? 'bg-emerald-600 text-white shadow-md font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>Live Map ({liveBuses.length} Buses)</span>
              </button>
            </div>

            {/* Left Column: Planner Controls & Analytics (4-5 Cols) */}
            <div
              className={`lg:col-span-5 xl:col-span-4 flex-col gap-4 sm:gap-5 lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto lg:pr-2 ${
                mobileTab === 'planner' ? 'flex' : 'hidden lg:flex'
              }`}
            >
              <JourneyPlannerCard
                stops={stops}
                originId={originId}
                setOriginId={setOriginId}
                destinationId={destinationId}
                setDestinationId={setDestinationId}
                departureTime={departureTime}
                setDepartureTime={setDepartureTime}
                onCalculate={() => handleCalculatePlan()}
                isLoading={isLoading}
              />

              {errorMsg && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {selectedOption && (
                <BenchmarkComparison
                  benchmarks={selectedOption.summary.benchmarks}
                  summary={selectedOption.summary}
                />
              )}

              {journeyPlan && (
                <RouteOptionsList
                  journeyOptions={journeyPlan.journeyOptions}
                  selectedOptionId={selectedOptionId}
                  onSelectOption={setSelectedOptionId}
                  liveBuses={liveBuses}
                  onViewOnMap={() => setMobileTab('map')}
                />
              )}
            </div>

            {/* Right Column: Live Interactive Delhi Transit Map (7-8 Cols) */}
            <div
              className={`lg:col-span-7 xl:col-span-8 flex-col h-[520px] lg:h-[calc(100vh-140px)] sticky top-16 lg:top-20 ${
                mobileTab === 'map' ? 'flex' : 'hidden lg:flex'
              }`}
            >
              {/* Mobile Back-to-Planner floating helper bar */}
              <div className="lg:hidden flex items-center justify-between mb-2 p-2 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-900">
                <span className="truncate pr-2">
                  📍 Tracking {selectedOption ? `Route ${selectedOption.routeNumber}` : 'Delhi Network'}
                </span>
                <button
                  type="button"
                  onClick={() => setMobileTab('planner')}
                  className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-bold text-[11px] shadow-sm active:scale-95 whitespace-nowrap"
                >
                  View Details ➔
                </button>
              </div>

              <TransitMap
                stops={stops}
                selectedOption={selectedOption}
                liveBuses={liveBuses}
                originId={originId}
                destinationId={destinationId}
                mobileTab={mobileTab}
              />
            </div>
          </main>
        </>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 font-medium">
        <p>
          TransitPulse Delhi • Built for <b>Transport Stack Hackathon 2026 (Problem 1)</b> • Data: Delhi Transport Corporation (DTC) & OpenStreetMap
        </p>
      </footer>
    </div>
  );
}

