# LOKIVA — Architecture & Engineering Design

## 1. High-Level System Architecture

```
                                  +-----------------------+
                                  |     Web Frontend      |
                                  | (Next.js / TypeScript)|
                                  +-----------+-----------+
                                              |
                                              | REST JSON / JWT
                                              v
                              +---------------+---------------+
                              |    FastAPI Modular Monolith   |
                              +---------------+---------------+
                                              |
     +-------------------+--------------------+--------------------+--------------------+
     |                   |                    |                    |                    |
     v                   v                    v                    v                    v
+----+----+      +-------+-------+    +-------+-------+    +-------+-------+    +-------+-------+
|  Auth   |      | AI Intent &   |    | Recommendation|    |  Feasibility  |    | Dynamic       |
| Service |      | Explanation   |    | Scoring Engine|    | Timeline Eng. |    | Re-Planner    |
+----+----+      +-------+-------+    +-------+-------+    +-------+-------+    +-------+-------+
     |                   |                    |                    |                    |
     +-------------------+--------------------+--------------------+--------------------+
                                              |
                                              v
                              +---------------+---------------+
                              | SQLAlchemy Database Layer     |
                              | (SQLite / PostgreSQL+PostGIS) |
                              +-------------------------------+
```

## 2. Core Intelligent Engines

### A. Intent Extraction Engine (`app/services/ai_service.py`)
Converts unstructured traveler requests into strongly typed `StructuredIntent`:
- **Input**: `"I'm with my parents in the city center. We have 4 hours, ₹2,000 total, want local food and something cultural, and don't want much walking."`
- **Output**:
  ```json
  {
    "location": "city center",
    "duration_minutes": 240,
    "budget": 2000.0,
    "currency": "INR",
    "interests": ["food", "culture"],
    "group_type": "family",
    "group_size": 4,
    "accessibility": { "low_walking": true, "wheelchair": false, "family_friendly": true },
    "hidden_gem_preference": false
  }
  ```

### B. Transparent Recommendation Engine (`app/services/recommendation_engine.py`)
1. **Stage 1 — Hard Filter**:
   - Removes closed venues, exceeded total budgets, wrong party capacities, and strictly inaccessible spots.
2. **Stage 2 — Multi-Factor Scoring**:
   $$\text{Score} = 0.30 P_{\text{pref}} + 0.20 F_{\text{feas}} + 0.15 D_{\text{dist}} + 0.10 B_{\text{budg}} + 0.10 A_{\text{avail}} + 0.05 R_{\text{rate}} + 0.05 T_{\text{fresh}} + 0.05 V_{\text{div}}$$

### C. Feasibility & Transit Engine (`app/services/feasibility_engine.py`)
- Models realistic urban road curvature (1.3x Euclidean) and local transit speeds (Auto-rickshaw: 18 km/h, Walking: 4 km/h).
- Injects 10–15 min rest/buffer intervals between activities.
- Computes schedule tightness status: `excellent` (≥85%), `good` (≥70%), `tight` (≥50%), `not_feasible` (<50%).

### D. Dynamic Re-planning Engine (`app/services/replan_engine.py`)
Preserves unimpacted stops while solving live constraints:
- **Weather Scenario (Rain)**: Replaces outdoor activities with covered cultural workshops in the same radius.
- **Availability Scenario**: Hot-swaps sold-out venues with verified neighborhood alternatives.
- **Reduced Time (4h → 2h)**: Rebalances the schedule to highest-rated compact stops.
- **Reduced Budget (₹2000 → ₹1000)**: Swaps ticketed stops with free community landmarks & authentic street delicacies.
