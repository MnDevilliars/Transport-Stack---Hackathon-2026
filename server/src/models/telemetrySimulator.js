/**
 * Real-Time Bus Telemetry Simulator
 * Generates continuous GPS coordinates and speed telemetry for Delhi bus fleet
 * matching actual segment congestion speeds.
 */

const DELHI_ROUTES = require("../data/delhiRoutes");
const DELHI_STOPS = require("../data/delhiStops");

const BUS_FLEET = [
  { id: "DL-1PD-5021", routeId: "DTC_502", routeNumber: "502", segmentIndex: 2, progress: 0.45, occupancy: "Moderate", driver: "Rajesh Kumar" },
  { id: "DL-1PD-5028", routeId: "DTC_502", routeNumber: "502", segmentIndex: 6, progress: 0.70, occupancy: "Crowded", driver: "Sunil Meena" },
  { id: "DL-1PC-4192", routeId: "DTC_419", routeNumber: "419", segmentIndex: 3, progress: 0.20, occupancy: "Seats Available", driver: "Mohd. Arif" },
  { id: "DL-1PC-4199", routeId: "DTC_419", routeNumber: "419", segmentIndex: 7, progress: 0.85, occupancy: "Crowded", driver: "Amit Sharma" },
  { id: "DL-1PD-7640", routeId: "DTC_764", routeNumber: "764", segmentIndex: 4, progress: 0.35, occupancy: "Heavy Crowding", driver: "Sanjay Yadav" },
  { id: "DL-1PD-7648", routeId: "DTC_764", routeNumber: "764", segmentIndex: 9, progress: 0.60, occupancy: "Moderate", driver: "Vikram Singh" },
  { id: "DL-1PB-0851", routeId: "DTC_85", routeNumber: "85", segmentIndex: 3, progress: 0.50, occupancy: "Heavy Crowding", driver: "Pramod Tyagi" },
  { id: "DL-1PB-0857", routeId: "DTC_85", routeNumber: "85", segmentIndex: 5, progress: 0.15, occupancy: "Moderate", driver: "Deepak Rawat" },
  { id: "DL-1PC-9901", routeId: "DTC_MUDRIKA", routeNumber: "OMS", segmentIndex: 5, progress: 0.80, occupancy: "Crowded", driver: "Harish Chandra" },
  { id: "DL-1PC-9908", routeId: "DTC_MUDRIKA", routeNumber: "OMS", segmentIndex: 10, progress: 0.40, occupancy: "Seats Available", driver: "Manoj Bhati" }
];

function getLiveBusTelemetry() {
  const now = new Date();
  const timeOffsetSeconds = (now.getTime() / 1000) % 3600;

  return BUS_FLEET.map(bus => {
    const route = DELHI_ROUTES[bus.routeId];
    const stopsList = route.stops;
    const stopCount = stopsList.length;

    // Advance progress smoothly over time
    const dynamicProgress = (bus.progress + (timeOffsetSeconds * 0.005)) % 1;
    const currentSegment = bus.segmentIndex % (stopCount - 1);

    const fromStop = DELHI_STOPS[stopsList[currentSegment]];
    const toStop = DELHI_STOPS[stopsList[currentSegment + 1]];

    // Interpolate lat/lng
    const lat = fromStop.lat + (toStop.lat - fromStop.lat) * dynamicProgress;
    const lng = fromStop.lng + (toStop.lng - fromStop.lng) * dynamicProgress;

    // Realistic speed with variance
    const baseSpeed = bus.routeId === "DTC_MUDRIKA" ? 18 : 14;
    const jitter = Math.sin(timeOffsetSeconds + bus.segmentIndex) * 3;
    const currentSpeedKmh = Math.max(6.5, Number((baseSpeed + jitter).toFixed(1)));

    return {
      vehicleId: bus.id,
      routeId: bus.routeId,
      routeNumber: bus.routeNumber,
      routeName: route.name,
      routeColor: route.color,
      currentLat: Number(lat.toFixed(6)),
      currentLng: Number(lng.toFixed(6)),
      speedKmh: currentSpeedKmh,
      nextStop: toStop.name,
      previousStop: fromStop.name,
      occupancy: bus.occupancy,
      driverName: bus.driver,
      lastPingTimestamp: new Date().toISOString()
    };
  });
}

module.exports = {
  getLiveBusTelemetry
};
