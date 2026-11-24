import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CorridorTicker from './components/CorridorTicker';
import JourneyPlannerCard from './components/JourneyPlannerCard';
import BenchmarkComparison from './components/BenchmarkComparison';
import RouteOptionsList from './components/RouteOptionsList';
import TransitMap from './components/TransitMap';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [stops, setStops] = useState([]);
  const [corridors, setCorridors] = useState([]);
  const [liveBuses, setLiveBuses] = useState([]);

  // Default query: AIIMS to Kashmere Gate ISBT during Evening Peak (18:30)
  const [originId, setOriginId] = useState('STP_AIIMS');
  const [destinationId, setDestinationId] = useState('STP_KG_ISBT');
  const [departureTime, setDepartureTime] = useState('18:30');

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
  const handleCalculatePlan = async () => {
    if (!originId || !destinationId) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/v1/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originId, destinationId, departureTime })
      });

      const json = await res.json();
      if (json.success && json.data) {
        setJourneyPlan(json.data);
        if (json.data.journeyOptions.length > 0) {
          setSelectedOptionId(json.data.journeyOptions[0].id);
        }
      } else {
        setErrorMsg(json.error || 'No feasible bus routes found between selected stops.');
        setJourneyPlan(null);
      }
    } catch (err) {
      setErrorMsg('Failed to communicate with Delhi routing engine. Is server running?');
    } finally {
      setIsLoading(false);
    }
  };

  // Run initial plan once stops are loaded
  useEffect(() => {
    if (stops.length > 0 && !journeyPlan) {
      handleCalculatePlan();
    }
  }, [stops]);

  // Selected Option Helper
  const selectedOption = journeyPlan?.journeyOptions?.find(
    (opt) => opt.id === (selectedOptionId || journeyPlan.journeyOptions[0]?.id)
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#0b0f19] text-slate-100 selection:bg-blue-500/30 selection:text-blue-200">
      <Navbar />
      <CorridorTicker corridors={corridors} />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Planner Controls & Analytics (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <JourneyPlannerCard
            stops={stops}
            originId={originId}
            setOriginId={setOriginId}
            destinationId={destinationId}
            setDestinationId={setDestinationId}
            departureTime={departureTime}
            setDepartureTime={setDepartureTime}
            onCalculate={handleCalculatePlan}
            isLoading={isLoading}
          />

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
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
            />
          )}
        </div>

        {/* Right Column: Live Interactive Delhi Transit Map (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col min-h-[500px]">
          <TransitMap
            stops={stops}
            selectedOption={selectedOption}
            liveBuses={liveBuses}
            originId={originId}
            destinationId={destinationId}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-4 px-6 text-center text-xs text-slate-500">
        <p>
          TransitPulse Delhi • Built for <b>Transport Stack Hackathon 2026 (Problem 1)</b> • Data: Delhi Transport Corporation (DTC) & OpenStreetMap
        </p>
      </footer>
    </div>
  );
}
