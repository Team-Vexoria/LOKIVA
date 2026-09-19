# LOKIVA — GIS & Spatio-Temporal Routing Architecture

**Project:** LOKIVA — Autonomous Cultural Experience Engine  
**Document Code:** DOC-03-GIS-001  
**Target Milestone:** National Hackathon 2-Day Offline Finale (Sept 26–27, 2026)  
**Status:** Approved Spatial & Routing Specification  

---

# 1. Geographic Coordinate Framework

All geographic entities in LOKIVA are mapped in the **WGS 84 (EPSG:4326)** coordinate reference system.

### Coordinate Vector Invariant:
```typescript
interface GeoCoordinate {
  lat: number; // Latitude: 8.0° N to 37.0° N (Indian territory)
  lng: number; // Longitude: 68.0° E to 97.0° E (Indian territory)
}
```

---

# 2. Mathematical Haversine Distance Engine

The distance between consecutive waypoints $p_i = (\phi_1, \lambda_1)$ and $p_j = (\phi_2, \lambda_2)$ is calculated via the Haversine formula:

$$\Delta \phi = \phi_2 - \phi_1$$
$$\Delta \lambda = \lambda_2 - \lambda_1$$
$$a = \sin^2\left(\frac{\Delta \phi}{2}\right) + \cos \phi_1 \cdot \cos \phi_2 \cdot \sin^2\left(\frac{\Delta \lambda}{2}\right)$$
$$c = 2 \cdot \text{atan2}\left(\sqrt{a}, \sqrt{1-a}\right)$$
$$d(p_i, p_j) = R \cdot c \quad \text{where } R = 6,371 \text{ km}$$

---

# 3. Indian Urban Transit Friction & Buffer Model

Standard routing APIs assume uniform vehicular speeds that fail catastrophically in historic Indian old quarters. LOKIVA applies **modal urban friction multipliers**:

| Transit Mode | Applicable Enclaves | Base Speed ($v$) | Friction Multiplier ($\gamma$) | Minimum Buffer |
| :--- | :--- | :---: | :---: | :---: |
| **Pedestrian / Walking** | River ghats, narrow chowk galis, fort courtyards | $3.5 \text{ km/h}$ | $1.25$ | $15\text{ mins}$ |
| **Auto-Rickshaw** | Historic city core, craft districts | $15.0 \text{ km/h}$ | $1.50$ | $20\text{ mins}$ |
| **Cycle Rickshaw** | Bazaar lanes, heritage residential corridors | $8.0 \text{ km/h}$ | $1.30$ | $15\text{ mins}$ |
| **Boat Ferry** | Riverbanks (Varanasi, Kolkata, Kochi) | $10.0 \text{ km/h}$ | $1.20$ | $25\text{ mins}$ |

### Transit Time Formula:
$$\tau(p_i, p_j) = \max \left( \text{Buffer}_{min}, \, \gamma \cdot \frac{d(p_i, p_j)}{v_{mode}} \cdot 60 \right) \text{ minutes}$$

---

# 4. Opening Hours & Time-Window Intersection

Before candidate venues are passed to Gemini 1.5 Flash, the spatial gateway performs a **temporal feasibility check**:
$$\text{Overlap}([t_{arrival}, t_{arrival} + V_i], \, [O_i, C_i]) = \text{true}$$
Venues that are closed during the projected time window are pruned with zero AI token consumption.

---

<div align="center">
  <sub>DOC-03-GIS-001 · LOKIVA GIS & Routing Specification</sub>
</div>
