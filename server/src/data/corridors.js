/**
 * Delhi Arterial Transit Corridors & Real-Time Congestion Index Data
 */

const DELHI_CORRIDORS = [
  {
    id: "CORR_RING_ROAD_SOUTH",
    name: "Ring Road (Dhaula Kuan - AIIMS - Ashram)",
    lengthKm: 14.2,
    baseFreeFlowSpeedKmh: 42,
    currentPeakSpeedKmh: 12.8,
    congestionLevel: "Heavy",
    congestionSeverity: 0.78, // 0 to 1
    activeBottlenecks: ["Ashram Underpass Junction", "AIIMS Flyover Merging"],
    busLanesOperational: true,
    avgDwellDelaySec: 95
  },
  {
    id: "CORR_VIKAS_MARG",
    name: "Vikas Marg (ITO - Laxmi Nagar - Anand Vihar)",
    lengthKm: 9.8,
    baseFreeFlowSpeedKmh: 38,
    currentPeakSpeedKmh: 9.4,
    congestionLevel: "Severe",
    congestionSeverity: 0.88,
    activeBottlenecks: ["ITO Yamuna Bridge", "Laxmi Nagar Metro Pillar Bottleneck"],
    busLanesOperational: false,
    avgDwellDelaySec: 120
  },
  {
    id: "CORR_MATHURA_ROAD",
    name: "Mathura Road (Delhi Gate - Pragati Maidan - Ashram)",
    lengthKm: 8.5,
    baseFreeFlowSpeedKmh: 40,
    currentPeakSpeedKmh: 14.1,
    congestionLevel: "Moderate",
    congestionSeverity: 0.62,
    activeBottlenecks: ["Bhairon Marg Merging Point"],
    busLanesOperational: true,
    avgDwellDelaySec: 75
  },
  {
    id: "CORR_OUTER_RING_WEST",
    name: "Outer Ring Road (Najafgarh - Janakpuri - Cantt)",
    lengthKm: 16.5,
    baseFreeFlowSpeedKmh: 48,
    currentPeakSpeedKmh: 18.5,
    congestionLevel: "Moderate",
    congestionSeverity: 0.52,
    activeBottlenecks: ["Uttam Nagar Terminal Crossing"],
    busLanesOperational: true,
    avgDwellDelaySec: 60
  },
  {
    id: "CORR_CENTRAL_VISTA",
    name: "Radial Arterial (CP - India Gate - Lodhi Road)",
    lengthKm: 6.2,
    baseFreeFlowSpeedKmh: 45,
    currentPeakSpeedKmh: 24.2,
    congestionLevel: "Low",
    congestionSeverity: 0.35,
    activeBottlenecks: ["Windsor Place Roundabout"],
    busLanesOperational: true,
    avgDwellDelaySec: 50
  }
];

module.exports = DELHI_CORRIDORS;
