const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const planRouter = require("./routes/plan");
const corridorsRouter = require("./routes/corridors");
const routesRouter = require("./routes/routes");
const telemetryRouter = require("./routes/telemetry");

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "TransitPulse Delhi - Real-Time Bus Traffic Model & Routing API",
    version: "1.0.0",
    hackathon: "Transport Stack Delhi 2026",
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use("/api/v1", planRouter);
app.use("/api/v1/corridors", corridorsRouter);
app.use("/api/v1/routes", routesRouter);
app.use("/api/v1/telemetry", telemetryRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({
    success: false,
    error: err.message || "Internal Server Error"
  });
});

app.listen(PORT, () => {
  console.log(`======================================================`);
  console.log(`🚀 TransitPulse Delhi Routing Engine is running on port ${PORT}`);
  console.log(`📍 API Health: http://localhost:${PORT}/health`);
  console.log(`📍 Journey Planner: POST http://localhost:${PORT}/api/v1/plan`);
  console.log(`======================================================`);
});

module.exports = app;

