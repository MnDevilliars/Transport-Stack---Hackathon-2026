/**
 * Spatio-Temporal Speed Modeling & Stop Dwell Time Calculation Engine
 * Designed for Problem 01 of Transport Stack Delhi Hackathon
 */

const DELHI_CORRIDORS = require("../data/corridors");

// Haversine formula for exact geodesic distance in kilometers
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(3));
}

// Convert "HH:MM" string or Date to fractional hours (e.g., "18:30" -> 18.5)
function parseTimeToFractionalHours(timeStr) {
  if (!timeStr) {
    const now = new Date();
    return now.getHours() + now.getMinutes() / 60;
  }
  const [hours, mins] = timeStr.split(":").map(Number);
  return (isNaN(hours) ? 12 : hours) + (isNaN(mins) ? 0 : mins) / 60;
}

/**
 * Get Temporal Congestion Factor based on Delhi Traffic Patterns
 * 08:00 - 11:30 -> Morning Peak (Office Influx)
 * 11:30 - 16:30 -> Midday Off-Peak
 * 16:30 - 21:00 -> Evening Peak (Severe Gridlock at ITO, Ring Road, AIIMS)
 * 21:00 - 08:00 -> Night & Early Morning Free Flow
 */
function getTemporalSpeedFactor(fractionalHours) {
  if (fractionalHours >= 8.0 && fractionalHours <= 11.5) {
    // Morning Peak: Average speed factor 0.38
    return {
      period: "Morning Peak (Office Commute)",
      factor: 0.38,
      severityText: "Heavy Commuter Congestion"
    };
  } else if (fractionalHours > 11.5 && fractionalHours < 16.5) {
    // Afternoon Off-Peak: Average speed factor 0.70
    return {
      period: "Midday Off-Peak",
      factor: 0.70,
      severityText: "Moderate Flow"
    };
  } else if (fractionalHours >= 16.5 && fractionalHours <= 21.0) {
    // Evening Peak: Average speed factor 0.30
    return {
      period: "Evening Peak (Major Gridlock)",
      factor: 0.30,
      severityText: "Severe Bottleneck Hours"
    };
  } else {
    // Night / Early Morning
    return {
      period: "Late Night / Early Morning Free-Flow",
      factor: 0.88,
      severityText: "Near Free Flow"
    };
  }
}

/**
 * Calculate Segment Travel Time with Dwell Time & Real-time GPS Decay Blending
 */
function evaluateSegmentTransit(fromStop, toStop, timeStr, liveGpsSpeed = null) {
  const distanceKm = calculateHaversineDistance(
    fromStop.lat,
    fromStop.lng,
    toStop.lat,
    toStop.lng
  );

  const fractionalHours = parseTimeToFractionalHours(timeStr);
  const temporal = getTemporalSpeedFactor(fractionalHours);

  // Baseline free-flow transit speed for arterial roads in Delhi (~38 km/h)
  let baseFreeFlowSpeed = 38.0;

  // Specific corridor bottleneck checks:
  const isVikasMarg = (fromStop.id === "STP_ITO" || toStop.id === "STP_ITO" || fromStop.id === "STP_LAXMI_NAGAR");
  const isRingRoad = (fromStop.id === "STP_AIIMS" || toStop.id === "STP_AIIMS" || fromStop.id === "STP_ASHRAM" || fromStop.id === "STP_DHAULA_KUAN");
  
  let corridorPenalty = 1.0;
  if (isVikasMarg) corridorPenalty = 0.82; // Yamuna bridge slow-down
  if (isRingRoad) corridorPenalty = 0.88; // Flyover bottlenecks

  const historicalEstimatedSpeedKmh = Math.max(
    7.5,
    Number((baseFreeFlowSpeed * temporal.factor * corridorPenalty).toFixed(1))
  );

  // Blend live GPS telemetry if available: v_eff = alpha * v_live + (1 - alpha) * v_historical
  let effectiveSpeedKmh = historicalEstimatedSpeedKmh;
  if (liveGpsSpeed && typeof liveGpsSpeed === "number" && liveGpsSpeed > 0) {
    const alpha = 0.65; // Weight given to real-time telemetry
    effectiveSpeedKmh = Number((alpha * liveGpsSpeed + (1 - alpha) * historicalEstimatedSpeedKmh).toFixed(1));
  }

  // Running time in minutes = (distance / speed) * 60
  const runningTimeMinutes = Number(((distanceKm / effectiveSpeedKmh) * 60).toFixed(2));

  // Dwell time calculation at the departing stop:
  // Major transit interchange: 2.5 - 3.2 minutes, normal stop: 0.75 - 1.0 minute
  let dwellTimeMinutes = fromStop.isMajorHub ? 2.5 : 0.8;
  if (temporal.factor < 0.4) {
    // During peak hours, boarding crowd increases dwell time by 40%
    dwellTimeMinutes = Number((dwellTimeMinutes * 1.4).toFixed(2));
  }

  const totalSegmentTimeMinutes = Number((runningTimeMinutes + dwellTimeMinutes).toFixed(2));

  // Categorize congestion level
  let congestionLevel = "Free Flow";
  let congestionColor = "#22c55e"; // Green
  if (effectiveSpeedKmh < 12) {
    congestionLevel = "Severe Congestion";
    congestionColor = "#ef4444"; // Red
  } else if (effectiveSpeedKmh < 22) {
    congestionLevel = "Moderate Delay";
    congestionColor = "#f59e0b"; // Amber
  }

  return {
    distanceKm,
    effectiveSpeedKmh,
    runningTimeMinutes,
    dwellTimeMinutes,
    totalSegmentTimeMinutes,
    congestionLevel,
    congestionColor,
    period: temporal.period,
    severityText: temporal.severityText
  };
}

module.exports = {
  calculateHaversineDistance,
  parseTimeToFractionalHours,
  getTemporalSpeedFactor,
  evaluateSegmentTransit
};

