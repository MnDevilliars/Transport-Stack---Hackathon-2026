import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CorridorTicker from './components/CorridorTicker';
import JourneyPlannerCard from './components/JourneyPlannerCard';
import BenchmarkComparison from './components/BenchmarkComparison';
import RouteOptionsList from './components/RouteOptionsList';
import TransitMap from './components/TransitMap';
import ApiDocsPage from './components/ApiDocsPage';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('map'); // 'map' | 'docs'
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
          <main className="flex-1 max-w-[1920px] w-full mx-auto px-4 lg:px-8 py-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Planner Controls & Analytics (4-5 Cols) */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-5 lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto lg:pr-2">
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
                />
              )}
            </div>

            {/* Right Column: Live Interactive Delhi Transit Map (7-8 Cols) */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col h-[600px] lg:h-[calc(100vh-140px)] sticky top-20">
              <TransitMap
                stops={stops}
                selectedOption={selectedOption}
                liveBuses={liveBuses}
                originId={originId}
                destinationId={destinationId}
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

