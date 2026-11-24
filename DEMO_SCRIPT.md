# 90-Second Demo Video Script — TransitPulse Delhi

**Format:** Screen Recording with Voiceover (or Subtitles)  
**Tool:** Loom / OBS / Ubuntu Screen Recorder (`Ctrl + Alt + Shift + R`)  
**Length:** Exactly 90 Seconds  
**Objective:** Prove end-to-end working software and directly address Problem 1 judging criteria.

---

### [00:00 - 00:15] Introduction & Problem Setup
* **Screen Action:** Show the browser on [http://localhost:3000](http://localhost:3000). Show the sleek dark interface with the live Delhi map, moving buses, and corridor ticker.
* **Voiceover:**
  > *"Hello! This is TransitPulse Delhi, our submission for Problem 1 of the Transport Stack Hackathon 2026. Delhi's public bus fleet faces high arrival uncertainty because static timetables assume buses travel at free-flow speeds, completely ignoring peak gridlock and stop dwell times. TransitPulse bridges this reality gap using a segment-level spatio-temporal traffic model."*

---

### [00:15 - 00:40] Live Journey Planning & Traffic Model
* **Screen Action:**
  1. Select Origin: **AIIMS Hospital (Ring Road)**.
  2. Select Destination: **Kashmere Gate ISBT**.
  3. Departure Time: set to **18:30 (Evening Peak)**.
  4. Click **"Compute Bus Reality ETA & Routes"**.
  5. Watch the map instantly render the route polyline color-coded by congestion level (green, amber, red through ITO).
* **Voiceover:**
  > *"Here, we plan an evening commute at 6:30 PM from AIIMS to Kashmere Gate. Our routing engine calculates segment-by-segment velocities based on Delhi's historical GPS congestion profiles. Notice how the segment passing through ITO and Vikas Marg turns red, dropping to 9 km/h."*

---

### [00:40 - 01:10] The Reality Check Benchmark (Judges' Highlight)
* **Screen Action:** Zoom in on the **"Hackathon Benchmark: ETA Reality Check"** card. Point the cursor to:
  1. Static DTC Timetable: ~32 mins
  2. Google Maps (Car): ~34 mins
  3. TransitPulse Model: ~82 mins
  4. The Physics Breakdown bar (Moving time vs Stop Boarding Dwell time).
* **Voiceover:**
  > *"This is the core insight: the static DTC timetable says this journey takes only 32 minutes—a massive 156% underestimate! Even car maps underestimate it by ignoring bus stops. TransitPulse models both the crawl in mixed traffic and the 2.5-minute passenger boarding delay at interchange hubs, predicting a realistic 82 minutes with a 90% confidence interval."*

---

### [01:10 - 01:30] Live Telemetry & Phase 2 Vision
* **Screen Action:**
  1. Click on one of the moving bus markers on the map to show the live popup: Vehicle ID, live GPS speed, next stop, and driver name.
  2. Click **"Inspect Stops & Speeds"** in the route list to show the segment breakdown.
* **Voiceover:**
  > *"Every active bus streams continuous GPS telemetry, which our model blends with historical data using an exponential decay filter. Everything you see is powered by our open-source REST API and verified Delhi transit geometry. In Phase 2, we will integrate this with full October 2026 DTC SQLite traces and metro AFC data. Thank you!"*
