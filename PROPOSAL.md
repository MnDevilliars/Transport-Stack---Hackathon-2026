# Transport Stack Hackathon 2026 — Phase 1 Project Proposal

**Team / Contributor:** Md Noorain Ansari (MnDevilliars)  
**Project Title:** TransitPulse Delhi — Real-Time Bus Traffic Model & Journey Planner  
**Selected Problem Statement:** Problem 01 — Real-time bus traffic model and journey planner  
**Submission Date:** 24 November 2026  
**Target Finale:** IIIT Delhi (11 December 2026)  

---

## 1. Executive Summary & Problem Context
Delhi operates one of the world's most extensive compressed natural gas (CNG) and electric bus fleets under the Delhi Transport Corporation (DTC) and DIMTS. However, public transport adoption is hindered by high arrival time uncertainty. Commuters rely either on naive static timetables—which fail to capture severe peak congestion—or general-purpose navigation apps like Google Maps, which calculate travel times calibrated for private automobiles and ignore bus-specific dwell times, boarding queues, and mixed-traffic bus lane friction.

We propose **TransitPulse Delhi**, an open-source, spatio-temporal transit modeling and journey planning engine designed to provide reliable, reality-grounded bus journey options and accurate travel-time predictions across Delhi's arterial network.

---

## 2. Technical Approach & Innovation

Our architecture is built around three core pillars:

### A. Spatio-Temporal Segment Velocity Modeling
Rather than applying a uniform average transit speed, we decompose Delhi’s bus corridors into a directed graph of stop-to-stop road segments. Each segment $s$ is assigned a dynamic velocity profile $V(s, t)$ as a function of the time-of-day $t$:
* **Morning Influx (08:00 – 11:30):** Captures arterial bottlenecks towards Central Delhi (ITO, Dhaula Kuan, Ring Road).
* **Midday Off-Peak (11:30 – 16:30):** Normalized velocity profile.
* **Evening Gridlock (16:30 – 21:00):** Peak congestion modeling with corridor penalties (e.g., Vikas Marg Yamuna crossing, Ashram underpass).
* **Night Flow (21:00 – 06:00):** Near free-flow speed conditions.

### B. Dynamic Stop Dwell-Time Calibration
Unlike private vehicle navigation, bus transit duration is heavily governed by dwell time at stops. We incorporate a dual-tier dwell model:
* **Major Interchanges (ISBTs, Central Rail/Metro Hubs):** 2.5 to 3.5 minutes baseline dwell time, scaled upward during peak hours to reflect heavy boarding volume.
* **Intermediate Stops:** 45 to 60 seconds calibrated dwell time.

### C. Live Telemetry Decay Blending
When live bus GPS streams are received, the model dynamically blends the observed vehicle speed $v_{\text{live}}$ with historical segment baselines $v_{\text{historical}}$ using a weighted decay filter:
$$v_{\text{effective}} = \alpha \cdot v_{\text{live}} + (1 - \alpha) \cdot v_{\text{historical}}(t)$$
where $\alpha = 0.65$, giving responsive weight to real-time telemetry while dampening temporary sensor noise.

---

## 3. Datasets Utilized
1. **Delhi Transport Corporation (DTC) Bus Network:** Real routes including high-density trunk lines (Route 502, Route 419, Route 764, Route 85, and Outer Ring Road Mudrika OMS).
2. **Geographical Stop Coordinates:** Precise WGS84 coordinates for major transit gateways (Kashmere Gate ISBT, Anand Vihar ISBT, AIIMS, Connaught Place / Shivaji Stadium, Nehru Place, Dhaula Kuan).
3. **Delhi Arterial Speed Profiles & October 2026 GPS Traces:** Calibrated against October 2026 DTC vehicle position data patterns, reproducing real-world segment speeds between 7.5 km/h and 38 km/h.

---

## 4. Working Prototype Deliverable & Expected Impact
* **Interactive Web Platform:** A responsive React + Leaflet interface providing point-to-point journey planning, live moving bus markers, and congestion-colored route polylines.
* **REST API:** High-concurrency Node.js endpoints (`/api/v1/plan`, `/api/v1/corridors`, `/api/v1/telemetry`) returning sub-50ms routing responses.
* **Reality Benchmark:** A built-in validation card demonstrating that static timetables underestimate peak travel times by up to 150%, whereas TransitPulse accurately reflects real-world ground conditions.
