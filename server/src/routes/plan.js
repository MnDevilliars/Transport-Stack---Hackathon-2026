const express = require("express");
const router = express.Router();
const { planJourney } = require("../models/routingEngine");
const DELHI_STOPS = require("../data/delhiStops");

/**
 * POST /api/v1/plan
 * Body: { originId: "STP_AIIMS", destinationId: "STP_KG_ISBT", departureTime: "18:30" }
 */
router.post("/plan", (req, res) => {
  try {
    const { originId, destinationId, departureTime, mode } = req.body;

    if (!originId || !destinationId) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters: originId and destinationId are mandatory."
      });
    }

    if (!DELHI_STOPS[originId]) {
      return res.status(404).json({
        success: false,
        error: `Origin stop '${originId}' not found in Delhi transit stops registry.`
      });
    }

    if (!DELHI_STOPS[destinationId]) {
      return res.status(404).json({
        success: false,
        error: `Destination stop '${destinationId}' not found in Delhi transit stops registry.`
      });
    }

    const plan = planJourney(originId, destinationId, departureTime, mode || "bus");
    return res.json({
      success: true,
      data: plan
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;

