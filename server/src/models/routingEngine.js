/**
 * TransitPulse Delhi - Core Graph Routing & Journey Planning Engine
 * Computes multi-option bus routes with spatio-temporal speed adjustments,
 * stop dwell times, transfer penalties, and 3-way benchmark comparisons.
 */

const DELHI_STOPS = require("../data/delhiStops");
const DELHI_ROUTES = require("../data/delhiRoutes");
const { evaluateSegmentTransit, calculateHaversineDistance } = require("./trafficModel");

/**
 * Find journey plans between Origin and Destination stops
 */
function planJourney(originId, destinationId, departureTime = "18:30") {
  const originStop = DELHI_STOPS[originId];
  const destStop = DELHI_STOPS[destinationId];

  if (!originStop || !destStop) {
    throw new Error(`Invalid stop IDs provided. Origin: ${originId}, Dest: ${destinationId}`);
  }

  if (originId === destinationId) {
    throw new Error("Origin and Destination cannot be the same stop.");
  }

  const journeyOptions = [];

  // ==========================================
  // 1. Check for DIRECT ROUTES
  // ==========================================
  for (const routeId in DELHI_ROUTES) {
    const route = DELHI_ROUTES[routeId];
    const stopsList = route.stops;

    const originIdx = stopsList.indexOf(originId);
    const destIdx = stopsList.indexOf(destinationId);

    if (originIdx !== -1 && destIdx !== -1 && originIdx !== destIdx) {
      // Determine direction
      const isForward = originIdx < destIdx;
      const sequence = isForward
        ? stopsList.slice(originIdx, destIdx + 1)
        : stopsList.slice(destIdx, originIdx + 1).reverse();

      const segmentDetails = [];
      let totalDistanceKm = 0;
      let totalRunningTimeMin = 0;
      let totalDwellTimeMin = 0;
      let totalModelTimeMin = 0;

      for (let i = 0; i < sequence.length - 1; i++) {
        const fromStp = DELHI_STOPS[sequence[i]];
        const toStp = DELHI_STOPS[sequence[i + 1]];

        const segEval = evaluateSegmentTransit(fromStp, toStp, departureTime);

        segmentDetails.push({
          segmentIndex: i + 1,
          from: { id: fromStp.id, name: fromStp.name, lat: fromStp.lat, lng: fromStp.lng },
          to: { id: toStp.id, name: toStp.name, lat: toStp.lat, lng: toStp.lng },
          distanceKm: segEval.distanceKm,
          effectiveSpeedKmh: segEval.effectiveSpeedKmh,
          runningTimeMin: segEval.runningTimeMinutes,
          dwellTimeMin: segEval.dwellTimeMinutes,
          totalTimeMin: segEval.totalSegmentTimeMinutes,
          congestionLevel: segEval.congestionLevel,
          congestionColor: segEval.congestionColor
        });

        totalDistanceKm += segEval.distanceKm;
        totalRunningTimeMin += segEval.runningTimeMinutes;
        totalDwellTimeMin += segEval.dwellTimeMinutes;
        totalModelTimeMin += segEval.totalSegmentTimeMinutes;
      }

      totalDistanceKm = Number(totalDistanceKm.toFixed(2));
      totalRunningTimeMin = Math.round(totalRunningTimeMin);
      totalDwellTimeMin = Math.round(totalDwellTimeMin);
      totalModelTimeMin = Math.round(totalModelTimeMin);

      // Benchmarks:
      // 1. Static Schedule: Assumes ideal 26 km/h speed with fixed 30s dwell per stop
      const staticScheduleEtaMin = Math.round(
        (totalDistanceKm / 26) * 60 + (sequence.length - 1) * 0.5
      );

      // 2. Google Maps / Private Car Benchmark:
      // Cars don't stop at bus stops. Peak hour car speed ~24 km/h vs free flow ~42 km/h
      const carSpeedKmh = departureTime >= "17:00" && departureTime <= "20:30" ? 22 : 36;
      const carGoogleMapsEtaMin = Math.round((totalDistanceKm / carSpeedKmh) * 60);

      // Confidence Interval based on traffic severity
      const confidenceMarginMin = Math.max(3, Math.round(totalModelTimeMin * 0.1));

      journeyOptions.push({
        id: `OPT_DIRECT_${route.id}`,
        type: "Direct Service",
        routeNumber: route.routeNumber,
        routeName: route.name,
        routeColor: route.color,
        legs: [
          {
            legNumber: 1,
            routeNumber: route.routeNumber,
            routeName: route.name,
            routeColor: route.color,
            from: { id: originStop.id, name: originStop.name, lat: originStop.lat, lng: originStop.lng },
            to: { id: destStop.id, name: destStop.name, lat: destStop.lat, lng: destStop.lng },
            stopsCount: sequence.length,
            stopsSequence: sequence.map(id => DELHI_STOPS[id]),
            distanceKm: totalDistanceKm,
            travelTimeMin: totalModelTimeMin,
            segments: segmentDetails
          }
        ],
        summary: {
          totalDistanceKm,
          totalStops: sequence.length,
          transfersCount: 0,
          modelEtaMinutes: totalModelTimeMin,
          confidenceInterval: `${totalModelTimeMin - confidenceMarginMin} - ${totalModelTimeMin + confidenceMarginMin} mins`,
          runningTimeMin: totalRunningTimeMin,
          dwellTimeMin: totalDwellTimeMin,
          benchmarks: {
            staticDtcScheduleEtaMin: staticScheduleEtaMin,
            googleMapsCarEtaMin: carGoogleMapsEtaMin,
            transitPulseModelEtaMin: totalModelTimeMin,
            scheduleUnderestimatePercentage: Math.max(
              0,
              Math.round(((totalModelTimeMin - staticScheduleEtaMin) / staticScheduleEtaMin) * 100)
            )
          }
        }
      });
    }
  }

  // ==========================================
  // 2. Check for 1-TRANSFER ROUTES
  // ==========================================
  // If user needs to interchange at a major hub (e.g. AIIMS, CP, Kashmere Gate)
  if (journeyOptions.length < 3) {
    const routeKeys = Object.keys(DELHI_ROUTES);

    for (let i = 0; i < routeKeys.length; i++) {
      const routeA = DELHI_ROUTES[routeKeys[i]];
      const originIdx = routeA.stops.indexOf(originId);
      if (originIdx === -1) continue;

      for (let j = 0; j < routeKeys.length; j++) {
        if (i === j) continue;
        const routeB = DELHI_ROUTES[routeKeys[j]];
        const destIdx = routeB.stops.indexOf(destinationId);
        if (destIdx === -1) continue;

        // Find intersection stops
        const commonStops = routeA.stops.filter(stopId => routeB.stops.includes(stopId));
        if (commonStops.length > 0) {
          const transferStopId = commonStops[0];
          const transferStop = DELHI_STOPS[transferStopId];

          if (transferStopId !== originId && transferStopId !== destinationId) {
            // Leg 1: origin -> transfer
            const seq1 = getSubSequence(routeA.stops, originId, transferStopId);
            // Leg 2: transfer -> destination
            const seq2 = getSubSequence(routeB.stops, transferStopId, destinationId);

            if (seq1.length > 1 && seq2.length > 1) {
              const leg1Eval = calculateLegMetrics(seq1, departureTime);
              const leg2Eval = calculateLegMetrics(seq2, departureTime);

              // Transfer wait time at interchange stop (~6 minutes average headway/transfer)
              const transferWaitTimeMin = 6;
              const totalDistance = Number((leg1Eval.distanceKm + leg2Eval.distanceKm).toFixed(2));
              const totalTime = leg1Eval.totalTimeMin + transferWaitTimeMin + leg2Eval.totalTimeMin;

              const staticScheduleEta = Math.round(
                (totalDistance / 26) * 60 + (seq1.length + seq2.length - 2) * 0.5 + 4
              );
              const carEta = Math.round((totalDistance / 24) * 60);

              journeyOptions.push({
                id: `OPT_TRANSFER_${routeA.id}_${routeB.id}`,
                type: "1 Interchange Transfer",
                routeNumber: `${routeA.routeNumber} ➔ ${routeB.routeNumber}`,
                routeName: `Take ${routeA.routeNumber} to ${transferStop.name}, transfer to ${routeB.routeNumber}`,
                routeColor: routeA.color,
                legs: [
                  {
                    legNumber: 1,
                    routeNumber: routeA.routeNumber,
                    routeName: routeA.name,
                    routeColor: routeA.color,
                    from: DELHI_STOPS[originId],
                    to: transferStop,
                    stopsCount: seq1.length,
                    stopsSequence: seq1.map(id => DELHI_STOPS[id]),
                    distanceKm: leg1Eval.distanceKm,
                    travelTimeMin: leg1Eval.totalTimeMin,
                    segments: leg1Eval.segments
                  },
                  {
                    legNumber: "Transfer",
                    type: "Walk & Platform Transfer",
                    transferAt: transferStop,
                    transferWaitTimeMin: transferWaitTimeMin
                  },
                  {
                    legNumber: 2,
                    routeNumber: routeB.routeNumber,
                    routeName: routeB.name,
                    routeColor: routeB.color,
                    from: transferStop,
                    to: DELHI_STOPS[destinationId],
                    stopsCount: seq2.length,
                    stopsSequence: seq2.map(id => DELHI_STOPS[id]),
                    distanceKm: leg2Eval.distanceKm,
                    travelTimeMin: leg2Eval.totalTimeMin,
                    segments: leg2Eval.segments
                  }
                ],
                summary: {
                  totalDistanceKm: totalDistance,
                  totalStops: seq1.length + seq2.length - 1,
                  transfersCount: 1,
                  transferHub: transferStop.name,
                  modelEtaMinutes: totalTime,
                  confidenceInterval: `${totalTime - 5} - ${totalTime + 6} mins`,
                  runningTimeMin: leg1Eval.runningTimeMin + leg2Eval.runningTimeMin,
                  dwellTimeMin: leg1Eval.dwellTimeMin + leg2Eval.dwellTimeMin + transferWaitTimeMin,
                  benchmarks: {
                    staticDtcScheduleEtaMin: staticScheduleEta,
                    googleMapsCarEtaMin: carEta,
                    transitPulseModelEtaMin: totalTime,
                    scheduleUnderestimatePercentage: Math.max(
                      0,
                      Math.round(((totalTime - staticScheduleEta) / staticScheduleEta) * 100)
                    )
                  }
                }
              });
            }
          }
        }
      }
    }
  }

  // Sort by total travel time
  journeyOptions.sort((a, b) => a.summary.modelEtaMinutes - b.summary.modelEtaMinutes);

  return {
    origin: originStop,
    destination: destStop,
    departureTime,
    timestamp: new Date().toISOString(),
    resultsCount: journeyOptions.length,
    journeyOptions
  };
}

function getSubSequence(stopsList, fromId, toId) {
  const i1 = stopsList.indexOf(fromId);
  const i2 = stopsList.indexOf(toId);
  if (i1 === -1 || i2 === -1) return [];
  return i1 < i2
    ? stopsList.slice(i1, i2 + 1)
    : stopsList.slice(i2, i1 + 1).reverse();
}

function calculateLegMetrics(seq, departureTime) {
  let distanceKm = 0;
  let runningTimeMin = 0;
  let dwellTimeMin = 0;
  let totalTimeMin = 0;
  const segments = [];

  for (let i = 0; i < seq.length - 1; i++) {
    const fromStp = DELHI_STOPS[seq[i]];
    const toStp = DELHI_STOPS[seq[i + 1]];
    const seg = evaluateSegmentTransit(fromStp, toStp, departureTime);

    segments.push({
      segmentIndex: i + 1,
      from: fromStp,
      to: toStp,
      distanceKm: seg.distanceKm,
      effectiveSpeedKmh: seg.effectiveSpeedKmh,
      runningTimeMin: seg.runningTimeMinutes,
      dwellTimeMin: seg.dwellTimeMinutes,
      totalTimeMin: seg.totalSegmentTimeMinutes,
      congestionLevel: seg.congestionLevel,
      congestionColor: seg.congestionColor
    });

    distanceKm += seg.distanceKm;
    runningTimeMin += seg.runningTimeMinutes;
    dwellTimeMin += seg.dwellTimeMinutes;
    totalTimeMin += seg.totalSegmentTimeMinutes;
  }

  return {
    distanceKm: Number(distanceKm.toFixed(2)),
    runningTimeMin: Math.round(runningTimeMin),
    dwellTimeMin: Math.round(dwellTimeMin),
    totalTimeMin: Math.round(totalTimeMin),
    segments
  };
}

module.exports = {
  planJourney
};
