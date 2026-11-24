# 🚌 TransitPulse Delhi — Real-Time Bus Traffic Model & Journey Planner

[![Transport Stack Delhi 2026](https://img.shields.io/badge/Hackathon-Transport%20Stack%20Delhi%202026-blue.svg)](https://delhi.transportstack.in)
[![Problem Statement](https://img.shields.io/badge/Problem%2001-Real--Time%20Bus%20Traffic%20Model-emerald.svg)](https://delhi.transportstack.in)
[![Phase 1 Prototype](https://img.shields.io/badge/Submission-Phase%201%20Working%20Prototype-indigo.svg)](https://whereuelevate.in)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Built for Transport Stack Hackathon 2026 (IIIT Delhi & Where U Elevate)**  
> **Problem Statement 01:** Real-time bus traffic model and journey planner.  
> An open-source, production-grade transit intelligence engine that models Delhi's road congestion using historical and real-time DTC bus telemetry, estimating realistic bus travel times and bridging the gap between naive static schedules and ground reality.

---

## 🌟 The Core Problem & Our Solution

### The Delhi Transit Reality Gap
Traditional journey planners (and standard static schedules) assume buses travel at optimistic average speeds (25–30 km/h) and ignore dwell times. In Delhi:
1. **Severe Peak Bottlenecks:** Arterial corridors like ITO, Ring Road (AIIMS to Ashram), and Vikas Marg experience drops in bus velocity down to **7–12 km/h** during morning and evening rush hours.
2. **Stop Dwell Delays:** Heavy passenger boarding at interchange hubs (Kashmere Gate ISBT, Anand Vihar, CP, AIIMS) adds **2.5 to 3.5 minutes per major stop**.
3. **Static Schedules are Off by up to 150%:** A journey scheduled for 32 minutes actually takes 75–85 minutes in peak traffic.

### How TransitPulse Solves It
* **Segment-Level Dynamic Velocity Modeling:** Instead of global speed estimates, we model Delhi's road network as an edge-weighted directed graph where each road segment possesses a dynamic speed profile $V(s, t)$ dependent on the time-of-day.
* **Real-time GPS Decay Blending:** Live vehicle telemetry is continuously blended with historical baselines:
  $$v_{\text{effective}} = \alpha \cdot v_{\text{live}} + (1 - \alpha) \cdot v_{\text{historical}}(t)$$
* **Dwell-Time Physics Correction:** Major hubs and ordinary stops have calibrated passenger exchange dwell formulas.
* **3-Way Benchmark Reality Check:** Directly validates against static DTC timetables and private car speeds (Google Maps proxy).

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Data Layer
        A1["Delhi DTC Transit Network (Routes 502, 419, 764, 85, OMS)"]
        A2["Authentic WGS84 Delhi Bus Stops (ISBTs, Ring Road, Central Vista)"]
        A3["Real-Time Bus GPS Telemetry Simulator"]
    end

    subgraph Spatio-Temporal Traffic Engine
        B1["Segment-Level Speed Profiler (Peak vs Off-Peak Velocity)"]
        B2["Stop Dwell-Time Calculator (Interchanges vs Regular Stops)"]
        B3["Velocity Decay Blending Engine"]
    end

    subgraph Routing & Planning API
        C1["Multi-Option Graph Traversal (Direct & 1-Transfer Routes)"]
        C2["Benchmark Comparison (Static Timetable vs Google Maps vs TransitPulse)"]
        C3["REST API Endpoints (/api/v1/plan, /api/v1/corridors, /api/v1/telemetry)"]
    end

    subgraph Interactive UI Dashboard
        D1["React 18 + Vite Responsive Telemetry Interface"]
        D2["Interactive Leaflet Map (Dark Tile Layer + Congestion Polylines)"]
        D3["Live Moving DTC Bus Markers with Telemetry Ticker"]
        D4["Reality-Check Benchmark Card"]
    end

    A1 & A2 & A3 --> B1 & B2 & B3
    B1 & B2 & B3 --> C1 & C2 & C3
    C1 & C2 & C3 --> D1 & D2 & D3 & D4
```

---

## ⚡ Quick Start & Setup Guide

### Prerequisites
* **Node.js:** v18.x or higher
* **npm:** v9.x or higher

### 1. Clone & Enter Repository
```bash
git clone https://github.com/MnDevilliars/Transport-Stack---Hackathon-2026.git
cd "Transport-Stack---Hackathon-2026"
```

### 2. Install Dependencies
```bash
# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
cd ..
```

### 3. Run the Full Stack Application
From the root directory, run:
```bash
npm start
```
* **Frontend Web App:** [http://localhost:3000](http://localhost:3000)
* **Backend REST API:** [http://localhost:5001](http://localhost:5001)
* **API Health Check:** [http://localhost:5001/health](http://localhost:5001/health)

---

## 📡 REST API Reference

### 1. Plan Journey
`POST /api/v1/plan`

**Request Payload:**
```json
{
  "originId": "STP_AIIMS",
  "destinationId": "STP_KG_ISBT",
  "departureTime": "18:30"
}
```

**Response Sample:**
```json
{
  "success": true,
  "data": {
    "origin": { "id": "STP_AIIMS", "name": "AIIMS Hospital (Ring Road)" },
    "destination": { "id": "STP_KG_ISBT", "name": "Kashmere Gate ISBT" },
    "departureTime": "18:30",
    "journeyOptions": [
      {
        "id": "OPT_DIRECT_DTC_502",
        "routeNumber": "502",
        "routeName": "Mehrauli Terminal ⇄ Kashmere Gate ISBT",
        "summary": {
          "totalDistanceKm": 18.4,
          "totalStops": 10,
          "modelEtaMinutes": 82,
          "confidenceInterval": "74 - 90 mins",
          "benchmarks": {
            "staticDtcScheduleEtaMin": 32,
            "googleMapsCarEtaMin": 34,
            "transitPulseModelEtaMin": 82,
            "scheduleUnderestimatePercentage": 156
          }
        }
      }
    ]
  }
}
```

### 2. Monitored Arterial Corridors
`GET /api/v1/corridors`
Returns real-time speeds and bottleneck warnings for Ring Road, Vikas Marg, Mathura Road, etc.

### 3. Live Bus Fleet Telemetry
`GET /api/v1/telemetry/live-buses`
Returns real-time GPS coordinates, route assignment, speed, and occupancy for active DTC buses.

---

## 📊 Phase 1 Submission Documents
* 📄 **Problem Proposal:** [PROPOSAL.md](./PROPOSAL.md)
* 📝 **Technical Note & Methodology:** [TECHNICAL_NOTE.md](./TECHNICAL_NOTE.md)
* 🎬 **Demo Video Script:** [DEMO_SCRIPT.md](./DEMO_SCRIPT.md)
* 📜 **Engineering Rules:** [PROJECT_RULES.md](./PROJECT_RULES.md)

---

## 👥 Authors & Team
* **Md Noorain Ansari** ([@MnDevilliars](https://github.com/MnDevilliars))
* Submitted for **Transport Stack Hackathon 2026** (Delhi).
