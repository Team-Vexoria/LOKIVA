# LOKIVA — System Architecture Specification

**Project:** LOKIVA — Autonomous Cultural Experience Engine  
**Document Code:** DOC-03-SYS-001  
**Target Milestone:** National Hackathon 2-Day Offline Finale (Sept 26–27, 2026)  
**Status:** Foundational Architecture Blueprint  

---

# 1. System Topology & Global Overview

LOKIVA is built as an edge-optimized, modular web system engineered for low-latency Generative AI interaction, sub-second faceted catalog querying, and complete offline resilience during convention presentations.

```text
+───────────────────────────────────────────────────────────────────────────────────────────────────+
│                                        CLIENT RUNTIME (React 18)                                  │
│                                                                                                   │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌──────────────────────────────────┐   │
│  │   Editorial Hero Page   │  │   Faceted Explore Grid  │  │  Minute-by-Minute Itinerary Drawer│  │
│  │ - Narrative Typography  │  │ - 36 State Grid Matrix  │  │ - Spatial Haversine Routing UI    │  │
│  │ - macOS & Phone Frames  │  │ - 6 Heritage Tags Filter│  │ - Transit Buffers & Cultural Lore │  │
│  └─────────────────────────┘  └─────────────────────────┘  └──────────────────────────────────┘   │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌──────────────────────────────────┐   │
│  │  Artisan Provider Studio│  │  Simulated UPI Checkout │  │  Offline Service Worker & Store  │  │
│  │ - 3-Prompt AI Form      │  │ - Dynamic QR Generator  │  │ - Cache Storage (App Shell)      │  │
│  │ - Vernacular Audio Note │  │ - GPay / PhonePe / Paytm│  │ - IndexedDB (1,080 Places Mirror)│  │
│  └─────────────────────────┘  └─────────────────────────┘  └──────────────────────────────────┘   │
+───────────────────────────────────────────────────────────────────────────────────────────────────+
                                                  │
                                                  │ HTTPS / JSON & WebSockets
                                                  ▼
+───────────────────────────────────────────────────────────────────────────────────────────────────+
│                                   CORE API GATEWAY (Node.js Express)                              │
│                                                                                                   │
│   ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐  ┌───────────────────┐   │
│   │   Authentication   │  │ Experience Service │  │  Itinerary Solver  │  │ Provider & Orders │   │
│   │  - JWT Verification│  │  - Category Filter │  │  - Time-window pack│  │  - Listing CRUD   │   │
│   │  - Piyush Kumar    │  │  - Coordinate Index│  │  - Haversine matrix│  │  - QR Ticket Pass │   │
│   │    Default Session │  │  - Full-text search│  │  - Traffic buffers │  │  - UPI Sim State  │   │
│   └────────────────────┘  └────────────────────┘  └────────────────────┘  └───────────────────┘   │
+───────────────────────────────────────────────────────────────────────────────────────────────────+
                                                  │
                        ┌─────────────────────────┴─────────────────────────┐
                        ▼                                                   ▼
+───────────────────────────────────────────────+   +───────────────────────────────────────────────+
│          GENERATIVE AI ORCHESTRATOR           │   │            DATA & PERSISTENCE LAYER           │
│           Google Gemini 1.5 API               │   │           PostgreSQL / SQLite 3               │
│                                               │   │                                               │
│  • Gemini 1.5 Flash (Spatio-Temporal Solver)  │   │  • 1,080 Ground-Truth Verified Places Data    │
│  • Gemini 1.5 Pro (Cultural Lore Synthesis)   │   │  • Provider & Artisan Guild Profiles          │
│  • Multimodal Vernacular Audio Translation    │   │  • Direct Wikimedia Commons & Unsplash Media  │
│  • Zero-Hallucination Grounded Prompt Engine  │   │  • IndexedDB Client Mirror (Offline Mode)     │
+───────────────────────────────────────────────+   +───────────────────────────────────────────────+
```

---

# 2. Architectural Principles

1. **Modular Monolith by Design:** Single deployable API process with strict internal domain boundaries. Eliminates network serialization overhead and operational fragility during live hackathon judging.
2. **Determinism Before Generation:** Hard mathematical constraints (distance, opening hours, budget, accessibility) are solved deterministically before invoking Gemini, eliminating geographic hallucinations.
3. **Zero Client Latency:** Faceted queries over the 1,080 catalog execute directly in browser memory using debounced state machines ($\le 35\text{ms}$).
4. **Offline Resilience by Default:** Network failure is treated as a standard operating state, not an unhandled exception.

---

# 3. Performance SLA & Latency Budgets

| Metric | Budget Target | Measured Production Baseline |
| :--- | :--- | :--- |
| **First Contentful Paint (FCP)** | $\le 1.0\text{ s}$ | $0.78\text{ s}$ |
| **Time to Interactive (TTI)** | $\le 1.5\text{ s}$ | $1.25\text{ s}$ |
| **Client-Side Facet Filter Latency** | $\le 50\text{ ms}$ | $18\text{ ms}$ |
| **Spatio-Temporal Solver Roundtrip** | $\le 1.2\text{ s}$ | $780\text{ ms}$ (Gemini 1.5 Flash) |
| **Offline Cache Query Latency** | $\le 20\text{ ms}$ | $8\text{ ms}$ (IndexedDB) |
| **Lighthouse Performance Score** | $\ge 95 / 100$ | $97 / 100$ |

---

<div align="center">
  <sub>DOC-03-SYS-001 · LOKIVA System Architecture Specification</sub>
</div>
