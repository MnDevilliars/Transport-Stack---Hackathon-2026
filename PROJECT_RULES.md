# TransitPulse Delhi - Project Architecture & Ground Rules

## 1. Project Mission & Hackathon Scope
- **Hackathon:** Transport Stack Delhi 2026 (Where U Elevate & IIIT Delhi)
- **Problem Statement 01:** Real-Time Bus Traffic Model & Journey Planner
- **Target:** Deliver a production-grade, working journey planner powered by real Delhi DTC bus network data, spatio-temporal speed matrices, dwell-time estimations, and live GPS telemetry simulation.

## 2. Strict Engineering Rules (Zero Hallucination / No Mock Placeholders)
1. **Real Transit Network Only:**
   - All bus stops must have authentic Delhi latitude/longitude coordinates (EPSG:4326).
   - Real DTC routes must be used:
     - Route 502: Mehrauli Terminal <-> Kashmere Gate ISBT
     - Route 419: Dr. Ambedkar Nagar <-> Kashmere Gate ISBT
     - Route 764: Najafgarh Terminal <-> Nehru Place Terminal
     - Route 85: Punjabi Bagh Terminal <-> Anand Vihar ISBT
     - Route OMS (Mudrika): Outer Ring Road Circular Service
2. **Deterministic Distance Calculation:**
   - Geodesic distances between consecutive stops calculated using the Haversine formula (km).
3. **Spatio-Temporal Speed Modeling:**
   - Segments must reflect Delhi traffic realities:
     - Morning Peak (08:00 - 11:30): 8 - 14 km/h (heavy congestion around ITO, Ring Road, AIIMS)
     - Afternoon Off-Peak (12:00 - 16:30): 18 - 26 km/h
     - Evening Peak (17:00 - 21:30): 7 - 12 km/h (peak bottleneck)
     - Night (22:00 - 06:00): 30 - 45 km/h
4. **Dwell Time Physics:**
   - Major transit interchanges (ISBTs, Central Hubs, Metro Interchanges): 2.5 - 3.5 minutes.
   - Standard stops: 45 - 60 seconds.
5. **Decoupled Production Architecture:**
   - `server/`: Node.js / Express microservice providing high-performance REST APIs.
   - `client/`: React 18 + Vite + Tailwind CSS + Leaflet for a responsive, interactive transit UI.
   - Clean API contracts with full payload validation and error handling.
6. **Benchmark Validation:**
   - Every planned journey must output a 3-way benchmark comparison:
     - Static DTC Timetable ETA
     - Generic Car Speed (Google Maps proxy)
     - TransitPulse Dynamic Bus Model ETA
