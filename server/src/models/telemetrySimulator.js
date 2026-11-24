/**
 * Real-Time Bus Telemetry Simulator
 * Generates continuous GPS coordinates and speed telemetry for Delhi bus fleet
 * matching actual segment congestion speeds.
 */

const DELHI_ROUTES = require("../data/delhiRoutes");
const DELHI_STOPS = require("../data/delhiStops");
const ROUTE_GEOMETRIES = require("../data/routeGeometries.json");

const BUS_FLEET = [
  { id: "DL-1PD-5021", routeId: "DTC_502", routeNumber: "502", segmentIndex: 2, progress: 0.35, occupancy: "Moderate", driver: "Rajesh Kumar" },
  { id: "DL-1PD-5028", routeId: "DTC_502", routeNumber: "502", segmentIndex: 6, progress: 0.72, occupancy: "Crowded", driver: "Sunil Meena" },
  { id: "DL-1PC-4192", routeId: "DTC_419", routeNumber: "419", segmentIndex: 3, progress: 0.25, occupancy: "Seats Available", driver: "Mohd. Arif" },
  { id: "DL-1PC-4199", routeId: "DTC_419", routeNumber: "419", segmentIndex: 7, progress: 0.88, occupancy: "Crowded", driver: "Amit Sharma" },
  { id: "DL-1PD-7640", routeId: "DTC_764", routeNumber: "764", segmentIndex: 4, progress: 0.42, occupancy: "Heavy Crowding", driver: "Sanjay Yadav" },
  { id: "DL-1PD-7648", routeId: "DTC_764", routeNumber: "764", segmentIndex: 9, progress: 0.65, occupancy: "Moderate", driver: "Vikram Singh" },
  { id: "DL-1PB-0851", routeId: "DTC_85", routeNumber: "85", segmentIndex: 3, progress: 0.55, occupancy: "Heavy Crowding", driver: "Pramod Tyagi" },
  { id: "DL-1PB-0857", routeId: "DTC_85", routeNumber: "85", segmentIndex: 5, progress: 0.18, occupancy: "Moderate", driver: "Deepak Rawat" },
  { id: "DL-1PC-9901", routeId: "DTC_MUDRIKA", routeNumber: "OMS", segmentIndex: 5, progress: 0.82, occupancy: "Crowded", driver: "Harish Chandra" },
  { id: "DL-1PC-9908", routeId: "DTC_MUDRIKA", routeNumber: "OMS", segmentIndex: 10, progress: 0.45, occupancy: "Seats Available", driver: "Manoj Bhati" }
];

function getLiveBusTelemetry() {
  const now = new Date();
  const timeOffsetSeconds = (now.getTime() / 1000) % 3600;

  return BUS_FLEET.map(bus => {
    const route = DELHI_ROUTES[bus.routeId];
    const roadCoords = ROUTE_GEOMETRIES[bus.routeId];
    const stopsList = route.stops;

    // Smooth movement along actual road-snapped coordinates
    const dynamicProgress = (bus.progress + (timeOffsetSeconds * 0.002)) % 1;

    let lat, lng;
    if (roadCoords && roadCoords.length > 0) {
      const idx = Math.floor(dynamicProgress * (roadCoords.length - 1));
      lat = roadCoords[idx][0];
      lng = roadCoords[idx][1];
    } else {
      const currentSegment = bus.segmentIndex % (stopsList.length - 1);
      const fromStop = DELHI_STOPS[stopsList[currentSegment]];
      const toStop = DELHI_STOPS[stopsList[currentSegment + 1]];
      lat = fromStop.lat + (toStop.lat - fromStop.lat) * dynamicProgress;
      lng = fromStop.lng + (toStop.lng - fromStop.lng) * dynamicProgress;
    }

    const currentSegment = Math.floor(dynamicProgress * (stopsList.length - 1));
    const toStop = DELHI_STOPS[stopsList[Math.min(currentSegment + 1, stopsList.length - 1)]];
    const fromStop = DELHI_STOPS[stopsList[currentSegment]];

    const baseSpeed = bus.routeId === "DTC_MUDRIKA" ? 18 : 13.5;
    const jitter = Math.sin(timeOffsetSeconds + bus.segmentIndex) * 2.5;
    const currentSpeedKmh = Math.max(7.2, Number((baseSpeed + jitter).toFixed(1)));

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

