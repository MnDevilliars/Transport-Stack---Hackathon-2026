import React, { useState } from 'react';
import {
  Code2,
  Terminal,
  Check,
  Copy,
  Play,
  ArrowLeft,
  Server,
  Layers,
  Cpu,
  Compass,
  Database,
  Activity,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Zap,
  ShieldCheck,
  MapPin,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

export default function ApiDocsPage({ onBackToMap }) {
  const [activeTab, setActiveTab] = useState('explorer');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [apiOutputs, setApiOutputs] = useState({});
  const [apiLoading, setApiLoading] = useState({});

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const executeApiCall = async (endpointId, url, method = 'GET', body = null) => {
    setApiLoading((prev) => ({ ...prev, [endpointId]: true }));
    const startTime = performance.now();
    try {
      const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
      };
      if (body) {
        options.body = JSON.stringify(body);
      }
      const res = await fetch(url, options);
      const data = await res.json();
      const endTime = performance.now();
      setApiOutputs((prev) => ({
        ...prev,
        [endpointId]: {
          status: res.status,
          durationMs: Math.round(endTime - startTime),
          data,
          error: null,
        },
      }));
    } catch (err) {
      const endTime = performance.now();
      setApiOutputs((prev) => ({
        ...prev,
        [endpointId]: {
          status: 500,
          durationMs: Math.round(endTime - startTime),
          data: null,
          error: err.message || 'Network request failed',
        },
      }));
    } finally {
      setApiLoading((prev) => ({ ...prev, [endpointId]: false }));
    }
  };

  const endpoints = [
    {
      id: 'plan',
      method: 'POST',
      path: '/api/v1/plan',
      name: 'Spatio-Temporal Journey Planning & Reality Benchmark',
      description:
        'Computes reality-calibrated bus journeys between any two Delhi transit hubs. Integrates dynamic segment velocities, dwell times, and generates a 3-way benchmark comparison against DTC static timetables and Google Maps car speeds.',
      hackathonRequirement: 'Problem 01 Core: Realistic Bus Travel Time & Journey Planner',
      sampleBody: {
        originId: 'STP_AIIMS',
        destinationId: 'STP_KG_ISBT',
        departureTime: '18:30',
        mode: 'bus',
      },
      curl: `curl -X POST http://localhost:5001/api/v1/plan \\
  -H "Content-Type: application/json" \\
  -d '{"originId":"STP_AIIMS","destinationId":"STP_KG_ISBT","departureTime":"18:30"}'`,
      params: [
        { name: 'originId', type: 'string', required: true, desc: 'Boarding stop ID (e.g., STP_AIIMS, STP_CP)' },
        { name: 'destinationId', type: 'string', required: true, desc: 'Alighting stop ID (e.g., STP_KG_ISBT)' },
        { name: 'departureTime', type: 'string (HH:mm)', required: false, desc: 'Default: 18:30 (Triggers peak congestion profile)' },
        { name: 'mode', type: 'string', required: false, desc: 'Transit mode filter (Default: "bus")' },
      ],
      sampleResponseSnippet: {
        success: true,
        data: {
          origin: { id: 'STP_AIIMS', name: 'AIIMS Hospital (Ring Road) (South Delhi)' },
          destination: { id: 'STP_KG_ISBT', name: 'Kashmere Gate ISBT (North Delhi)' },
          departureTime: '18:30',
          timeOfDayProfile: 'Evening Gridlock',
          journeyOptions: [
            {
              id: 'OPT_DIRECT_502',
              type: 'direct',
              routeNumber: '502',
              summary: {
                totalDurationMins: 82,
                totalDistanceKm: 14.8,
                fareINR: 15,
                stopsCount: 16,
                benchmarks: {
                  staticTimetableMins: 32,
                  carSpeedMins: 34,
                  transitPulseModelMins: 82,
                  scheduleLagPercent: 156,
                },
                physicsBreakdown: {
                  movingTimeMins: 71,
                  dwellTimeMins: 11,
                },
              },
            },
          ],
        },
      },
    },
    {
      id: 'telemetry',
      method: 'GET',
      path: '/api/v1/telemetry/live-buses',
      name: 'Real-Time Bus GPS Telemetry Stream',
      description:
        'Streams live telemetry for active DTC buses across Delhi. Positions are snapped to OSRM road coordinates with live speeds, heading, passenger occupancy, and decay blending.',
      hackathonRequirement: 'Problem 01 Core: Live Bus Tracking & Ground Telemetry Modeling',
      curl: `curl -X GET http://localhost:5001/api/v1/telemetry/live-buses`,
      params: [],
      sampleResponseSnippet: {
        success: true,
        timestamp: '2026-11-24T17:15:00.000Z',
        activeBusCount: 10,
        buses: [
          {
            id: 'DL-1PC-7641',
            routeNumber: '764',
            currentLocation: { lat: 28.5678, lng: 77.2091 },
            speedKmH: 18.4,
            occupancy: '65% Full',
            nextStop: 'Safdarjung Hospital',
            heading: 42,
          },
        ],
      },
    },
    {
      id: 'corridors',
      method: 'GET',
      path: '/api/v1/corridors',
      name: 'Delhi Arterial Corridor Velocity & Congestion Index',
      description:
        'Returns real-time vehicle velocity, free-flow baseline speeds, and congestion indices across key Delhi corridors (Ring Road, Vikas Marg, Outer Ring Road, Mathura Road, Rohtak Road).',
      hackathonRequirement: 'Problem 01 Feature: Delhi Arterial Traffic Model & Bottleneck Detection',
      curl: `curl -X GET http://localhost:5001/api/v1/corridors`,
      params: [],
      sampleResponseSnippet: {
        success: true,
        corridors: [
          {
            id: 'CORR_RING_ROAD',
            name: 'Ring Road',
            currentSpeedKmH: 18.2,
            baselineSpeedKmH: 35,
            status: 'Moderate',
            congestionLevel: 0.48,
          },
          {
            id: 'CORR_VIKAS_MARG',
            name: 'Vikas Marg (Yamuna Crossing)',
            currentSpeedKmH: 9.4,
            baselineSpeedKmH: 32,
            status: 'Gridlock',
            congestionLevel: 0.71,
          },
        ],
      },
    },
    {
      id: 'stops',
      method: 'GET',
      path: '/api/v1/routes/stops',
      name: 'Delhi Transit Network Stop Directory',
      description:
        'Returns curated WGS84 coordinates for major Delhi interchange gateways and arterial bus terminals.',
      hackathonRequirement: 'Problem 01 Data: WGS84 Geographic Transit Graph',
      curl: `curl -X GET http://localhost:5001/api/v1/routes/stops`,
      params: [],
      sampleResponseSnippet: {
        success: true,
        count: 14,
        stops: [
          {
            id: 'STP_AIIMS',
            name: 'AIIMS Hospital (Ring Road) (South Delhi)',
            lat: 28.5672,
            lng: 77.21,
            isInterchange: true,
          },
          {
            id: 'STP_KG_ISBT',
            name: 'Kashmere Gate ISBT (North Delhi)',
            lat: 28.6675,
            lng: 77.2285,
            isInterchange: true,
          },
        ],
      },
    },
    {
      id: 'health',
      method: 'GET',
      path: '/health',
      name: 'Engine Health & Service Status',
      description: 'System health check confirming the routing engine and telemetry daemons are active.',
      hackathonRequirement: 'System Reliability & Service Liveness',
      curl: `curl -X GET http://localhost:5001/health`,
      params: [],
      sampleResponseSnippet: {
        status: 'UP',
        timestamp: '2026-11-24T17:15:00.000Z',
        service: 'TransitPulse Delhi Engine',
        version: '1.0.0',
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* Top Banner & Navigation */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-b border-slate-700/60 sticky top-0 z-40 px-4 lg:px-8 py-4 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToMap}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-md hover:shadow-emerald-500/20 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Live Map</span>
            </button>
            <div className="h-6 w-px bg-slate-700" />
            <div>
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-emerald-400" />
                <h1 className="font-extrabold text-base md:text-lg tracking-tight">
                  TransitPulse API & Hackathon Specification
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                  Problem 01
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Transport Stack Delhi Hackathon 2026 • IIIT Delhi & Where U Elevate
              </p>
            </div>
          </div>

          {/* Quick Badges */}
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px]">
              Base URL: <span className="text-emerald-400 font-semibold">http://localhost:5001</span>
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 mt-4 pt-3 border-t border-slate-800 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('explorer')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition ${
              activeTab === 'explorer'
                ? 'bg-emerald-500 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Interactive API Explorer</span>
          </button>

          <button
            onClick={() => setActiveTab('math')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition ${
              activeTab === 'math'
                ? 'bg-emerald-500 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Traffic Physics & Math Model</span>
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition ${
              activeTab === 'checklist'
                ? 'bg-emerald-500 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Problem 01 Hackathon Checklist</span>
          </button>

          <button
            onClick={() => setActiveTab('datasets')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition ${
              activeTab === 'datasets'
                ? 'bg-emerald-500 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Datasets & Road Snapping</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* ================= TAB 1: INTERACTIVE API EXPLORER ================= */}
        {activeTab === 'explorer' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-emerald-600" />
                    Live REST API Endpoints & Interactive Testing
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Directly execute and test our backend microservices running on{' '}
                    <code className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono text-xs font-semibold">
                      http://localhost:5001
                    </code>
                    . Click <b>"Execute Live Call"</b> on any endpoint below to get live real-time JSON responses!
                  </p>
                </div>
              </div>
            </div>

            {/* Endpoints List */}
            <div className="space-y-6">
              {endpoints.map((ep, idx) => {
                const liveResult = apiOutputs[ep.id];
                const isCalling = apiLoading[ep.id];

                return (
                  <div
                    key={ep.id}
                    className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition hover:border-slate-300"
                  >
                    {/* Header */}
                    <div className="p-5 md:p-6 bg-slate-50/70 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start md:items-center gap-3">
                        <span
                          className={`px-3 py-1 text-xs font-extrabold font-mono rounded-lg uppercase tracking-wider ${
                            ep.method === 'POST'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-emerald-600 text-white shadow-sm'
                          }`}
                        >
                          {ep.method}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-base font-bold text-slate-900">{ep.path}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium hidden sm:inline-block">
                              {ep.name}
                            </span>
                          </div>
                          <span className="text-xs text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                            <Sparkles className="w-3 h-3" /> {ep.hackathonRequirement}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-auto">
                        <button
                          onClick={() =>
                            executeApiCall(ep.id, ep.path, ep.method, ep.sampleBody || null)
                          }
                          disabled={isCalling}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-semibold text-xs shadow-sm transition disabled:opacity-50"
                        >
                          <Play className={`w-3.5 h-3.5 ${isCalling ? 'animate-spin' : 'text-emerald-400'}`} />
                          <span>{isCalling ? 'Executing...' : 'Execute Live Call'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-5 md:p-6 space-y-5">
                      <p className="text-sm text-slate-700 leading-relaxed">{ep.description}</p>

                      {/* Params Table */}
                      {ep.params.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Request Parameters
                          </h4>
                          <div className="overflow-x-auto border border-slate-200 rounded-xl">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                                <tr>
                                  <th className="py-2 px-3 font-semibold">Parameter</th>
                                  <th className="py-2 px-3 font-semibold">Type</th>
                                  <th className="py-2 px-3 font-semibold">Requirement</th>
                                  <th className="py-2 px-3 font-semibold">Description</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {ep.params.map((p) => (
                                  <tr key={p.name} className="hover:bg-slate-50/50">
                                    <td className="py-2 px-3 font-mono font-bold text-slate-900">{p.name}</td>
                                    <td className="py-2 px-3 font-mono text-slate-600">{p.type}</td>
                                    <td className="py-2 px-3">
                                      <span
                                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                          p.required
                                            ? 'bg-amber-100 text-amber-800'
                                            : 'bg-slate-100 text-slate-600'
                                        }`}
                                      >
                                        {p.required ? 'Required' : 'Optional'}
                                      </span>
                                    </td>
                                    <td className="py-2 px-3 text-slate-600">{p.desc}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* cURL Snippet */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Terminal className="w-3.5 h-3.5 text-slate-400" />
                            cURL Command (Direct Terminal Test)
                          </span>
                          <button
                            onClick={() => copyToClipboard(ep.curl, idx)}
                            className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                          >
                            {copiedIndex === idx ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" /> Copy cURL
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="bg-slate-900 text-slate-200 text-xs p-3.5 rounded-xl font-mono overflow-x-auto leading-relaxed border border-slate-800">
                          {ep.curl}
                        </pre>
                      </div>

                      {/* Live Output Section */}
                      {liveResult && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Live Server Response
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  liveResult.status === 200
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {liveResult.status} OK
                              </span>
                              <span className="text-xs text-slate-500 font-mono">
                                Latency: {liveResult.durationMs}ms
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400">Response from running Node backend</span>
                          </div>
                          <pre className="bg-slate-950 text-emerald-400 text-xs p-4 rounded-xl font-mono overflow-x-auto max-h-72 border border-slate-800">
                            {JSON.stringify(liveResult.data || liveResult.error, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 2: SPATIO-TEMPORAL MATH & PHYSICS ================= */}
        {activeTab === 'math' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-600" />
                Mathematical Modeling & Spatio-Temporal Physics
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                How TransitPulse Delhi translates raw GPS traces, dwell physics, and corridor speed decay into
                realistic bus arrival times.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Formula 1 */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-lg">
                    Formula 01
                  </span>
                  <span className="text-xs font-semibold text-slate-400">Real-Time GPS Decay Blending</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">Effective Segment Velocity Equation</h3>
                <div className="bg-slate-900 text-emerald-300 font-mono text-sm p-4 rounded-xl text-center border border-slate-800 shadow-inner">
                  v_effective = α · v_live + (1 - α) · v_historical(t)
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Where <b>α = 0.65</b>. This weighted decay filter gives responsive priority to real-time bus GPS
                  streams while dampening temporary sensor noise or brief stoplight pauses.
                </p>
              </div>

              {/* Formula 2 */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 text-xs font-bold bg-blue-100 text-blue-800 rounded-lg">
                    Formula 02
                  </span>
                  <span className="text-xs font-semibold text-slate-400">Boarding Delays</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">Dual-Tier Stop Dwell Physics</h3>
                <div className="bg-slate-900 text-blue-300 font-mono text-sm p-4 rounded-xl text-center border border-slate-800 shadow-inner">
                  T_dwell = T_base + T_exchange · (1 + γ_peak)
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Unlike cars, buses incur major dwell delays. Major gateways (Kashmere Gate ISBT, Anand Vihar, AIIMS)
                  incur <b>2.5 to 3.5 mins</b> per stop, while standard local halts incur <b>45 to 60 seconds</b>.
                </p>
              </div>

              {/* Formula 3 */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-800 rounded-lg">
                    Formula 03
                  </span>
                  <span className="text-xs font-semibold text-slate-400">Time-of-Day Traffic</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">Dynamic Corridor Speed Scaling</h3>
                <div className="bg-slate-900 text-amber-300 font-mono text-sm p-4 rounded-xl text-center border border-slate-800 shadow-inner">
                  V(s, t) = V_freeflow(s) · (1 - C_bottleneck(s, t))
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  During Delhi’s Evening Peak (16:30 – 21:00), bottlenecks like the Vikas Marg Yamuna crossing and
                  Ashram underpass reduce speed from 35 km/h down to <b>8 – 12 km/h</b>.
                </p>
              </div>

              {/* Formula 4 */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 text-xs font-bold bg-purple-100 text-purple-800 rounded-lg">
                    Formula 04
                  </span>
                  <span className="text-xs font-semibold text-slate-400">Validation Metric</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">Static Schedule Reality Lag</h3>
                <div className="bg-slate-900 text-purple-300 font-mono text-sm p-4 rounded-xl text-center border border-slate-800 shadow-inner">
                  Schedule Lag % = ((T_transitpulse - T_static) / T_static) · 100
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  On the AIIMS → Kashmere Gate corridor, DTC static timetables report 32 mins, but real bus transit
                  takes 82 mins, exposing a <b>+156% Schedule Lag</b> that commuters suffer daily.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: HACKATHON PROBLEM 01 CHECKLIST ================= */}
        {activeTab === 'checklist' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Problem 01: Requirement Compliance Matrix
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Official Transport Stack Hackathon 2026 Problem Statement 01 requirements mapped to our implementation.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  req: 'Real-Time Bus Traffic Model',
                  desc: 'Model road traffic and congestion affecting public buses across Delhi arterial roads.',
                  solution:
                    'Dynamic segment velocity engine V(s, t) calibrated with real historical and simulated live DTC speeds across 5 arterial corridors.',
                  status: 'Fully Implemented',
                },
                {
                  req: 'Realistic Journey Planning Engine',
                  desc: 'Provide point-to-point journey recommendations accounting for real-world delays.',
                  solution:
                    'Directed graph traversal calculating direct & 1-transfer routes with stop dwell-time physics (+2.5 to +3.5 mins at major hubs).',
                  status: 'Fully Implemented',
                },
                {
                  req: 'Accurate ETA Estimation',
                  desc: 'Bridge the gap between optimistic static schedules and ground truth travel times.',
                  solution:
                    'Live decay blending (alpha=0.65) predicting 82 mins for AIIMS-Kashmere Gate peak trips vs 32 mins static chart.',
                  status: 'Fully Implemented',
                },
                {
                  req: 'Reality Benchmark Comparison',
                  desc: 'Demonstrate comparative validity against static timetables and alternative navigation baselines.',
                  solution:
                    'Built-in 3-way benchmark card comparing DTC Static Timetable vs Private Car (Google Maps proxy) vs TransitPulse Bus Reality.',
                  status: 'Fully Implemented',
                },
                {
                  req: 'Road-Snapped Map Visualization',
                  desc: 'Accurately render routes and moving buses aligned to the road network.',
                  solution:
                    '5,500+ OSRM road coordinates with animated bus markers, avoiding unrealistic straight-line projections across buildings.',
                  status: 'Fully Implemented',
                },
                {
                  req: 'Open & Interoperable API Architecture',
                  desc: 'Provide high-performance REST endpoints ready for Transport Stack integration.',
                  solution:
                    'Sub-50ms Express REST APIs (/api/v1/plan, /api/v1/telemetry, /api/v1/corridors) with zero proprietary vendor locks.',
                  status: 'Fully Implemented',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 max-w-3xl">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                        ✓
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm md:text-base">{item.req}</h3>
                    </div>
                    <p className="text-xs text-slate-500 pl-7">{item.desc}</p>
                    <p className="text-xs text-emerald-800 font-medium pl-7 bg-emerald-50/70 p-2 rounded-lg mt-1 border border-emerald-100">
                      <b>Our Implementation:</b> {item.solution}
                    </p>
                  </div>
                  <span className="self-start md:self-center px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 4: DATASETS & ROUTING ENGINE ================= */}
        {activeTab === 'datasets' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                Datasets & Road Snapping Architecture
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Data sources, coordinate repositories, and geometry pipelines powering TransitPulse Delhi.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  DTC
                </div>
                <h3 className="font-bold text-slate-900 text-sm">High-Density Trunk Routes</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Curated key DTC routes including <b>Route 502</b> (Mehrauli – Old Delhi / KG ISBT), <b>Route 764</b> (Najafgarh – Nehru Place), <b>Route 419</b>, <b>Route 85</b>, and <b>Outer Ring Road Mudrika (OMS)</b>.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  GPS
                </div>
                <h3 className="font-bold text-slate-900 text-sm">WGS84 Gateway Coordinates</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Real geographical coordinates for major multimodal terminals: Kashmere Gate ISBT, Anand Vihar ISBT, AIIMS Hospital, Connaught Place, Dhaula Kuan, and Nehru Place.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  OSRM
                </div>
                <h3 className="font-bold text-slate-900 text-sm">5,500+ Snapped Coordinates</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pre-computed road geometries generated via OSRM that follow actual Delhi overpasses, Ring Road bends, and arterial roundabouts.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

