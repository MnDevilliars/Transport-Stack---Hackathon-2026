# Technical Note — TransitPulse Delhi (Problem 01)

**Author:** Md Noorain Ansari (MnDevilliars)  
**Hackathon:** Transport Stack Delhi 2026 (Phase 1 Submission)  

---

## 1. Mathematical Formulation & Routing Methodology

### 1.1 Network Representation
The transit network is modeled as a directed multi-graph $G = (S, E)$, where:
* $S = \{s_1, s_2, \dots, s_n\}$ represents the set of Delhi transit stops with geographic coordinates $(\text{lat}_i, \text{lng}_i)$.
* $E \subseteq S \times S \times R$ represents directed route segments between consecutive stops along route $r \in R$.

### 1.2 Geodesic Segment Distance
Segment length $d(s_i, s_j)$ is computed via the Haversine formula over the WGS84 ellipsoid:
$$\Delta\sigma = 2 \arcsin \left( \sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_i)\cos(\phi_j)\sin^2\left(\frac{\Delta\lambda}{2}\right)} \right)$$
$$d(s_i, s_j) = R \cdot \Delta\sigma \quad (R = 6371 \text{ km})$$

### 1.3 Effective Segment Velocity & Temporal Discretization
Transit speed $V(e, t)$ is modeled as a piece-wise continuous temporal function discretized into four traffic regimes:
$$V_{\text{historical}}(e, t) = V_{\text{free}} \cdot \gamma(t) \cdot \kappa(e)$$
where:
* $V_{\text{free}} = 38 \text{ km/h}$ (Delhi arterial road baseline).
* $\gamma(t)$ is the temporal speed attenuation factor:
  $$\gamma(t) = \begin{cases} 
  0.38 & \text{for } 08:00 \le t \le 11:30 \text{ (Morning Peak)} \\
  0.70 & \text{for } 11:30 < t < 16:30 \text{ (Midday)} \\
  0.30 & \text{for } 16:30 \le t \le 21:00 \text{ (Evening Peak)} \\
  0.88 & \text{otherwise (Night Free-Flow)}
  \end{cases}$$
* $\kappa(e)$ is the corridor specific friction multiplier (e.g., $\kappa = 0.82$ for Vikas Marg/ITO Yamuna bridge bottleneck).

When live telemetry speed $v_{\text{live}}$ is observed from vehicle GPS feeds, we apply a state blending filter:
$$v_{\text{eff}}(e, t) = 0.65 \cdot v_{\text{live}} + 0.35 \cdot V_{\text{historical}}(e, t)$$

### 1.4 Travel Time & Dwell Time Decomposition
Total travel time along an itinerary $\mathcal{P} = (e_1, e_2, \dots, e_k)$ is:
$$T_{\text{total}} = \sum_{i=1}^k \left( \frac{d(e_i)}{v_{\text{eff}}(e_i, t)} \cdot 60 + D(s_i, t) \right) + \sum_{m \in \text{Transfers}} W_m$$
where $D(s_i, t)$ is stop dwell time ($2.5\text{--}3.5\text{ mins}$ for major multimodal hubs, $0.8\text{ mins}$ for standard stops), and $W_m \approx 6.0\text{ mins}$ is the transfer walk/headway wait penalty.

---

## 2. Key Assumptions

1. **Bus Lane Compliance:** The model assumes buses operate in mixed traffic except where dedicated bus corridors exist (e.g., BRT segments).
2. **Headway Distribution:** Scheduled transfer wait time assumes a Poisson arrival with average headway of 5–8 minutes across high-frequency trunk lines.
3. **Weather & Incident Baseline:** Standard dry weather conditions. Extreme rainfall/waterlogging events require an additional exogenous multiplier.

---

## 3. Limitations & Phase 2 Roadmap

1. **Phase 1 GPS Telemetry Resolution:** The current prototype demonstrates real-time decay blending using simulated active vehicles calibrated to October 2026 DTC trace distributions. In Phase 2, this will be connected directly to the full 124 GB unpacked DTC SQLite database streams via an Apache Kafka / Redis pub-sub pipeline.
2. **Signal Timing Phase:** Current dwell time incorporates average signal delay implicitly. Phase 2 will explicitly model Delhi Traffic Police traffic signal cycle times (90–120s) at major intersections.
3. **Multi-Modal Transfer Matrix:** Phase 2 will integrate Delhi Metro AFC gate validation timestamps to create a seamless bus-metro integrated Origin-Destination transfer matrix.
