const express = require("express");
const router = express.Router();
const DELHI_ROUTES = require("../data/delhiRoutes");
const DELHI_STOPS = require("../data/delhiStops");

/**
 * GET /api/v1/routes
 * List all active Delhi DTC bus routes with full stop sequences & coordinates
 */
router.get("/", (req, res) => {
  const routesList = Object.values(DELHI_ROUTES).map(r => ({
    id: r.id,
    routeNumber: r.routeNumber,
    name: r.name,
    type: r.type,
    color: r.color,
    headwayMinutes: r.headwayMinutes,
    operatingHours: r.operatingHours,
    stopsCount: r.stops.length,
    stops: r.stops.map(sid => DELHI_STOPS[sid])
  }));

  res.json({
    success: true,
    count: routesList.length,
    routes: routesList
  });
});

/**
 * GET /api/v1/routes/stops
 * List all Delhi transit stops with coordinates for dropdown selector
 */
router.get("/stops", (req, res) => {
  res.json({
    success: true,
    count: Object.keys(DELHI_STOPS).length,
    stops: Object.values(DELHI_STOPS)
  });
});

module.exports = router;

