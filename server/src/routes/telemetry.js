const express = require("express");
const router = express.Router();
const { getLiveBusTelemetry } = require("../models/telemetrySimulator");

/**
 * GET /api/v1/telemetry/live-buses
 * Real-time GPS stream of active DTC buses on the Delhi transit network
 */
router.get("/live-buses", (req, res) => {
  const liveBuses = getLiveBusTelemetry();
  res.json({
    success: true,
    activeVehiclesCount: liveBuses.length,
    timestamp: new Date().toISOString(),
    buses: liveBuses
  });
});

module.exports = router;

