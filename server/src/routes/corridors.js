const express = require("express");
const router = express.Router();
const DELHI_CORRIDORS = require("../data/corridors");

/**
 * GET /api/v1/corridors
 * Returns all monitored arterial corridors in Delhi with current congestion indices
 */
router.get("/", (req, res) => {
  res.json({
    success: true,
    count: DELHI_CORRIDORS.length,
    timestamp: new Date().toISOString(),
    corridors: DELHI_CORRIDORS
  });
});

module.exports = router;
