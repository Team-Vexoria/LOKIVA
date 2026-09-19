# RFC-001: LOKIVA Core System Architecture & Platform Engineering Specification

**Document Status:** Approved for Implementation  
**Target Milestone:** National Hackathon Offline Finale (Sept 26–27, 2026)  
**Authors:** LOKIVA Core Engineering Team  
**Reviewers:** Hackathon Technical Jury & Architecture Council  

---

## 1. Executive Technical Summary

LOKIVA is an autonomous, hyper-personalized cultural travel discovery platform and two-sided artisan marketplace for India. Commercial travel engines (MakeMyTrip, EaseMyTrip, TripAdvisor) optimize strictly for hotel commissions and crowded tourist circuits, leaving rich local living heritage, GI-tagged artisan guilds, sacred stepwells, and vernacular street food fragmented across social media.

LOKIVA bridges this structural gap by combining:
1. **Deterministic Spatio-Temporal Constraint Solving:** Mathematical routing that factors in exact user hours, budget limits, traffic transit buffers, opening schedules, and physical exertion ratings (wheelchair/low-walking/rain-safe).
2. **Multimodal Generative AI (Gemini 1.5):** Context-aware itinerary generation, dialect-aware vernacular translation bridging rural artisans with global travelers, and zero-hallucination grounded cultural RAG.
3. **Curated Ground-Truth Heritage Catalog:** 1,080+ verified experiences spanning all 36 Indian States & Union Territories with manual photo verification, eliminating flaky third-party scraping APIs.
4. **Resilient Two-Sided Marketplace:** Non-technical artisan listing studio, simulated instant UPI / Razorpay payment modal, dynamic cryptographic QR ticket pass generation, and offline-first IndexedDB caching.

---

## 2. Global Architecture & Component Topology

```
+-----------------------------------------------------------------------------------------------+
|                                      CLIENT APPLICATION                                       |
|                  React 18.3 + TypeScript + Vite + Tailwind CSS + Framer Motion                |
|                                                                                               |
|  +---------------------------+  +---------------------------+  +---------------------------+  |
|  |   Editorial Landing Page  |  |     Faceted Explore UI    |  |  Dynamic Itinerary Engine |  |
|  |  - Storytelling Hero      |  |  - 36 State Grid          |  |  - Spatio-temporal solver |  |
|  |  - Device Frame Mockups   |  |  - 6 Heritage Perspectives|  |  - Minute-by-minute cards |  |
|  |  - GSAP Scroll Triggers   |  |  - Instant Filter Debounce|  |  - Transit buffer logic   |  |
|  +---------------------------+  +---------------------------+  +---------------------------+  |
|  +---------------------------+  +---------------------------+  +---------------------------+  |
|  |  Artisan Provider Console |  |   Checkout & Pass Engine  |  |   Offline Service Worker  |  |
|  |  - 3-Prompt AI Studio     |  |  - Simulated UPI / Razor  |  |  - Cache API (Shell/Fonts)|  |
|  |  - Vernacular Audio Chat  |  |  - Cryptographic QR Pass  |  |  - IndexedDB (1,080 places|  |
|  +---------------------------+  +---------------------------+  +---------------------------+  |
+-----------------------------------------------------------------------------------------------+
                                               │
                                               │ HTTPS / JSON & WebSockets
                                               ▼
+-----------------------------------------------------------------------------------------------+
|                                     API GATEWAY (Node.js)                                     |
|                      Express 4.19 / Fastify + TypeScript + CORS + Rate Limiter                |
|                                                                                               |
|  +--------------------+ +--------------------+ +--------------------+ +--------------------+  |
|  |    /api/auth       | |  /api/experiences  | |   /api/itinerary   | |   /api/providers   |  |
|  |  - Token Exchange  | |  - Spatial Queries | |  - Solver Pipeline | |  - Artisan Studio  |  |
|  |  - Profile State   | |  - Facet Aggregator| |  - Timeline Engine | |  - Booking Engine  |  |
|  +--------------------+ +--------------------+ +--------------------+ +--------------------+  |
+-----------------------------------------------------------------------------------------------+
                                               │
                      ┌────────────────────────┴────────────────────────┐
                      ▼                                                 ▼
+---------------------------------------------+   +---------------------------------------------+
|          GENERATIVE AI ORCHESTRATOR         |   |                 DATA LAYER                  |
|             Google Gemini 1.5               |   |          SQLite 3 / PostgreSQL 15           |
|                                             |   |                                             |
|  +---------------------------------------+  |   |  +---------------------------------------+  |
|  | Gemini 1.5 Flash: Sub-second Routing   |  |   |  | Core Tables:                          |  |
|  +---------------------------------------+  |   |  | - users, traveler_profiles            |  |
|  +---------------------------------------+  |   |  | - providers, experiences              |  |
|  | Gemini 1.5 Pro: Lore RAG & Multimodal |  |   |  | - bookings, reviews, saved_itineraries|  |
|  +---------------------------------------+  |   |  +---------------------------------------+  |
|  +---------------------------------------+  |   |  +---------------------------------------+  |
|  | Vernacular Dialect Translation Engine |  |   |  | Static Assets:                        |  |
|  +---------------------------------------+  |   |  | - /public/assets/states/*.jpg         |  |
|  +---------------------------------------+  |   |  | - userVerifiedPlacesData.ts (1,080)   |  |
|  | Deterministic Fallback Solver Cache   |  |   |  +---------------------------------------+  |
|  +---------------------------------------+  |   +---------------------------------------------+
+---------------------------------------------+
```

---

## 3. Detailed Subsystem Specifications

### 3.1 Network Topology & Protocol Flow
* **Transport:** All client-server communication runs over TLS 1.3. REST endpoints use JSON over HTTP/2.
* **Cold-Start Elimination:** Render backend cold-starts are insulated by an immediate client-side fallback state machine in `frontend/src/lib/auth-context.tsx` and `api.ts`, ensuring zero blank-screen crashes.
* **CORS Policy:** Strict origin whitelisting (`https://lokiva.vercel.app`, `http://localhost:5173`, `http://localhost:3000`).

### 3.2 Spatio-Temporal Constraint Solver Algorithm
The itinerary generation engine operates as a hybrid deterministic-stochastic pipeline:

```
[User Input: City, Total Hours (H), Budget (B), Physical Flags (W_wheelchair, W_low_walk), Interests (I)]
                                 │
                                 ▼
                     [Stage 1: Spatial Pruning]
  Query Candidate Pool C from DB where:
    - city == Input.city
    - is_active == 1
    - if W_wheelchair == true: wheelchair_accessible == 1
    - if W_low_walk == true: approx_duration_mins <= 60
    - current_time >= opening_time AND current_time <= closing_time
                                 │
                                 ▼
                    [Stage 2: Distance Matrix Calculation]
  Calculate Haversine Distance d(p_i, p_j) between all candidate pairs.
  Prune candidates with cluster distance > 12 km to minimize road transit.
                                 │
                                 ▼
               [Stage 3: Gemini 1.5 Flash Cognitive Sequencing]
  Pass structured candidate JSON payload (Top 6-8 places) to Gemini 1.5 Flash.
  Prompt enforces strict time-budgeting:
    Total_Time = sum(duration_i) + sum(transit_buffer_ij) <= H * 60 mins.
    Total_Cost = sum(ticket_price_i) <= B.
                                 │
                                 ▼
             [Stage 4: JSON Validation & Fallback Guard]
  Validate output against DayPlanResponse interface.
  If Gemini timeout (> 3500ms) or rate limit occurs:
    Engage Deterministic Topological Sorter from local cache.
```

---

## 4. Performance Budgets & Production Benchmarks

| Metric | Production Target | Failure Threshold | Strategy to Guarantee |
| :--- | :--- | :--- | :--- |
| **First Contentful Paint (FCP)** | < 0.8s | > 1.8s | Minimal initial JS bundle, inline critical CSS, WebP/JPG state banners. |
| **Time to Interactive (TTI)** | < 1.5s | > 3.0s | Code-split heavy routes (`AdminPage`, `ProviderPage`), defer non-critical GSAP. |
| **Faceted Filter Query Latency** | < 50ms | > 200ms | Client-side in-memory filter on pre-loaded 1,080 verified catalog. |
| **AI Itinerary Generation Time** | < 2.2s | > 4.5s | Gemini 1.5 Flash optimized system prompt with 3.5s timeout auto-fallback. |
| **Offline Resilience** | 100% Core Flow | Blank Screen | Service worker caches UI shell; IndexedDB caches place catalog. |

---

## 5. Security, Secrets & Environment Governance

1. **API Keys:** `GEMINI_API_KEY`, `JWT_SECRET`, and `DATABASE_URL` reside strictly on the server backend (`server/.env`). Never expose raw AI keys in the Vite client bundle.
2. **Authentication Tokens:** JSON Web Tokens (JWT) signed with HMAC-SHA256, expired after 7 days, stored in `localStorage` under `lokiva_token`.
3. **Session Fallback Safety:** In offline hackathon demonstrations, `createFallbackSession` creates a cryptographically valid client session for "Piyush Kumar" with active roles to prevent venue login lockouts.
