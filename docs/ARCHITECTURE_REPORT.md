# LOKIVA — Comprehensive Architecture Report

> **Project:** LOKIVA — Autonomous Cultural Experience Engine & Two-Sided Artisan Marketplace  
> **Target Milestone:** National Hackathon 2-Day Offline Finale (Sept 26–27, 2026)  
> **Scope:** System Architecture · Backend Architecture · Database Design · API Contracts · AI Architecture · RBAC Matrix · GIS & Routing · Frontend & Device Frames · Transactional Realism · Offline Resilience  
> **Generated:** 2026-09-19  
> **Authors:** LOKIVA Core Systems & Architecture Engineering Council  

---

## Table of Contents

1. [Executive System Overview](#1-executive-system-overview)
2. [Architectural Style: Modular Monolith with Edge AI Gateway](#2-architectural-style-modular-monolith-with-edge-ai-gateway)
3. [The 12 Core Business Modules](#3-the-12-core-business-modules)
4. [Lifecycle State Machines](#4-lifecycle-state-machines)
5. [Generative AI Orchestration (Google Gemini 1.5)](#5-generative-ai-orchestration-google-gemini-15)
6. [Data Architecture & Ground-Truth Heritage Catalog](#6-data-architecture--ground-truth-heritage-catalog)
7. [GIS & Spatio-Temporal Constraint Solver](#7-gis--spatio-temporal-constraint-solver)
8. [Transactional Realism & Digital QR Pass Engine](#8-transactional-realism--digital-qr-pass-engine)
9. [Offline-First Resilience Architecture](#9-offline-first-resilience-architecture)
10. [Security & Role-Based Access Control](#10-security--role-based-access-control)
11. [Source Code Structure & Component Map](#11-source-code-structure--component-map)

---

## 1. Executive System Overview

### 1.1 Core Identity
LOKIVA is an **intelligent, hyper-personalized cultural discovery platform and two-sided artisan marketplace** designed to bridge India's \$45 Billion fragmented experiential heritage economy. Mainstream Online Travel Aggregators (MakeMyTrip, EaseMyTrip, TripAdvisor) prioritize hotel commissions and high-density commercial tourist hubs, leaving generational handloom guilds, ancient stepwells, GI-tagged crafts, and vernacular food trails scattered across unindexed oral lore and social media reels.

LOKIVA transforms this landscape through an authoritative end-to-end lifecycle:

```text
Traveler Intent (Time, Budget, Mobility)
      ↓
Deterministic Spatial Pre-Filtering (Haversine & Opening Hours)
      ↓
Gemini 1.5 Spatio-Temporal Solver (Minute-by-Minute Micro-Circuit)
      ↓
Faceted Discovery & Ground-Truth Verification (36 States & UTs)
      ↓
Artisan Vernacular Audio Connection (Dialect Normalization & Chat)
      ↓
Simulated Dynamic UPI QR Checkout (GPay / PhonePe / Paytm)
      ↓
Cryptographic Admission Ticket Pass (Dynamic QR & Print PDF)
      ↓
Offline Client Mirror Sync (Service Worker & IndexedDB Caching)
```

This lifecycle is enforced by strict TypeScript data contracts, deterministic constraint algorithms, and resilient offline storage.

---

## 2. Architectural Style: Modular Monolith with Edge AI Gateway

LOKIVA is architected as a **modular monolith** on the backend paired with an **isomorphic React SPA client**:

1. **Single Deployable Process:** Eliminates distributed network overhead, RPC serialization latency, and deployment complexity during rapid hackathon iteration.
2. **Strict Module Boundaries:** Every feature domain (Auth, Experiences, Itinerary, Provider Studio, Orders, AI Gateway) encapsulates its own routes, controllers, and validation logic.
3. **Edge Generative AI Gateway:** Decoupled LLM orchestration routing deterministic and generative workloads through Google Gemini 1.5 Pro and Gemini 1.5 Flash.
4. **Resilient Local Persistence:** Dual-layer storage consisting of a relational server-side database (SQLite / PostgreSQL) and a client-side IndexedDB mirror enabling full offline execution.

---

## 3. The 12 Core Business Modules

| # | Module | Core Responsibility | Invariant / Security Boundary |
| :-: | :--- | :--- | :--- |
| 1 | **Auth & Identity** | JWT token lifecycle, Google OAuth validation, and fallback session management (`Piyush Kumar`). | Never exposes password hashes; enforces role scopes in middleware. |
| 2 | **Catalog Service** | 1,080 verified cultural places across all 36 Indian States and Union Territories. | 0% dummy data; all images verified against direct CDN allowlist. |
| 3 | **Faceted Filter Engine** | Sub-second multi-dimensional querying (Region, State, Category, Budget, Time, Wheelchair). | Client-side debounced execution ($\le 35\text{ms}$) over local cache. |
| 4 | **Spatio-Temporal Solver** | Constrained m-TSPTW route optimization packing minute-by-minute itineraries into exact time windows. | Total duration (dwell + transit) must never exceed user time ceiling. |
| 5 | **AI Gateway** | Manages prompt templates, temperature controls, safety guardrails, and Gemini 1.5 calls. | AI recommendations are strictly bounded by pre-verified candidates. |
| 6 | **Vernacular Voice Bridge**| Multimodal Indic audio ingestion, dialect normalization, and English reverse-translation. | Audio payloads stream safely; transcripts carry confidence scores. |
| 7 | **Artisan AI Studio** | 3-prompt automated catalog generator synthesizing heritage copy, visitor etiquette, and pricing. | Enforces mandatory safety, footwear, and photo consent notices. |
| 8 | **Provider Management** | Artisan host onboarding, verification badging, workshop rosters, and earnings summaries. | Artisans only view their own booking rosters and payout records. |
| 9 | **Transactional Simulator**| Simulated dynamic UPI QR code generator (GPay, PhonePe, Paytm) and webhook state machine. | Emits realistic order hashes; simulates payment confirmation events. |
| 10| **Pass Engine** | Cryptographically signed digital admission passes with dynamic 2D QR codes and print styles. | High-resolution scannable QR ticket; strict `@media print` layout. |
| 11| **GIS & Routing** | Haversine distance matrix computation with Indian urban traffic friction multipliers ($\gamma = 1.35$).| Pedestrian paths through old market alleys vs. vehicular transit. |
| 12| **Offline Resilience** | Service Worker asset caching (`sw.js`) and IndexedDB ground-truth data mirror (`lokiva_db`). | Guarantees full UI filtering and itinerary generation when offline. |

---

## 4. Lifecycle State Machines

### 4.1 The Micro-Itinerary State Machine
```text
[IDLE: No Request]
       │
       ▼ (User submits: Time, Budget, Origin, Wheelchair)
[DETERMINISTIC_PRUNING]
       │ ──> Computes Haversine distances to local candidates
       │ ──> Prunes closed venues and over-budget places
       ▼ (Top K=12 candidates selected)
[NEURAL_SOLVING: Gemini 1.5 Flash]
       │ ──> Optimizes route sequence & injects transit buffers
       │ ──> Generates insider tips and etiquette alerts
       ▼
[ITINERARY_RESOLVED]
       │ ──> Renders interactive timeline with transit nodes
       ▼ (User edits waypoints or adds to booking)
[CHECKOUT_TRIGGERED]
```

### 4.2 The Artisan Booking & UPI Payment State Machine
```text
[ORDER_INITIALIZED]
       │ (User selects artisan workshop)
       ▼
[PENDING_PAYMENT]
       │ ──> Dynamic UPI QR string generated
       │ ──> Modal renders GPay / PhonePe / Paytm triggers
       ▼ (Simulated payment button clicked)
[PAYMENT_PROCESSING]
       │ ──> Webhook fires payment confirmation event
       ▼
[CONFIRMED_PAID]
       │ ──> Issues cryptographic ticket pass (LOK-2026-IND-XXXX)
       │ ──> Updates artisan dashboard workshop roster
       ▼
[PASS_ISSUED] ──> Enables Print PDF & Dynamic QR scanning
```

---

## 5. Generative AI Orchestration (Google Gemini 1.5)

LOKIVA uses a **hybrid deterministic + neural architecture** to prevent hallucinations:

```text
USER CONSTRAINTS                  GROUND-TRUTH CATALOG
(Time: 3.5h, Budget: ₹600)        (1,080 Verified Places)
         │                                  │
         └────────────────┬─────────────────┘
                          │
                          ▼
            [Deterministic Spatial Pre-Filter]
            - Haversine distance threshold
            - Operational hours filter
            - Accessibility matching
                          │
                          ▼ (12 Valid Candidates)
            [Gemini 1.5 Flash Solver]
            - Minute-by-minute scheduling
            - Real-world transit buffers
            - Structured JSON output schema
                          │
                          ▼
            [Verified Timeline Rendered]
```

### 5.1 Model Allocations
- **`gemini-1.5-flash`:** Sub-second spatio-temporal route solving, fast JSON formatting, and 3-prompt listing generation.
- **`gemini-1.5-pro`:** Multimodal vernacular audio translation, dialect normalization (Bhojpuri, Marwari, Kutchi, Tamil), and grounded cultural lore RAG.

---

## 6. Data Architecture & Ground-Truth Heritage Catalog

### 6.1 Geographic Scope
- Complete coverage of all **28 Indian States and 8 Union Territories** (36 regional entities).
- Exactly **30 verified places per state/UT**, totaling **1,080 places**.
- Standardized distribution: **14 Tier-1 Capital Hubs**, **10 Tier-2 Craft Guilds**, and **6 Tier-3 Hidden Hamlets**.

### 6.2 Zero Dummy Data Standard
- No placeholder titles, dummy text (*Lorem Ipsum*), or broken search URLs.
- All photography validated via direct CDN media links from Wikimedia Commons and verified Unsplash collections with permanent image hashes.

---

## 7. GIS & Spatio-Temporal Constraint Solver

### 7.1 Mathematical Routing Model
Given candidate places $P = \{p_1, p_2, \dots, p_n\}$, Haversine distance $d(p_i, p_j)$, and Indian urban traffic friction factor $\gamma \ge 1.35$:
$$\tau(p_i, p_j) = \gamma \cdot \frac{d(p_i, p_j)}{v_{transit}}$$
Subject to:
$$\sum_{i \in \text{Route}} V_i + \sum_{i=1}^{k} \tau(p_{i-1}, p_i) \le T_{total}$$
$$\sum_{i \in \text{Route}} \text{Cost}(p_i) \le B_{max}$$

---

## 8. Transactional Realism & Digital QR Pass Engine

1. **Simulated UPI Flow:** Renders authentic UPI QR codes (`upi://pay?pa=lokiva.artisan@icici&pn=Lokiva...`) with one-click simulation buttons for Google Pay, PhonePe, and Paytm.
2. **Cryptographic Admission Pass:** Issues high-resolution ticket passes featuring scannable dynamic QR codes, verification hashes, and dedicated `@media print` styles for venue admission demonstrations.

---

## 9. Offline-First Resilience Architecture

1. **Service Worker (`sw.js`):** Pre-caches the complete frontend application shell, stylesheets, icons, and JavaScript chunks using a `Cache-First` strategy.
2. **IndexedDB Mirror (`lokiva_db`):** Mirrored copy of the 1,080-place catalog stored in client browser storage. If convention Wi-Fi drops, search and itinerary calculations continue operating at 60 FPS without throwing network errors.

---

## 10. Security & Role-Based Access Control

LOKIVA enforces four distinct actor roles:
1. **Traveler (Authenticated):** Can browse, filter, plan itineraries, execute simulated UPI checkout, and view issued passes. Default session is **Piyush Kumar** (`piyush@lokiva.com`).
2. **Artisan Host:** Can access the Provider Studio, record vernacular audio notes, manage workshop capacity, and view booking rosters.
3. **Guild Master:** Can manage group masterclasses and oversee multiple artisan workshops in a craft cluster.
4. **Platform Admin / Verifier:** Can audit place submissions, approve direct image CDNs, and verify GI-tag credentials.

---

## 11. Source Code Structure & Component Map

```text
LOKIVA/
├── frontend/                                # Client Application (React 18 + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── landing/                     # Editorial Storytelling & Device Frames
│   │   │   ├── experience/                  # Faceted Grid & Venue Modals
│   │   │   ├── itinerary/                   # Route Solver & Timeline Drawer
│   │   │   ├── marketplace/                 # Artisan Studio & Voice Bridge
│   │   │   └── checkout/                    # UPI Simulator & Digital Pass
│   │   ├── data/                            # 1,080 Ground-Truth Places & Taxonomy
│   │   └── hooks/                           # Faceted search, Solver & Offline hooks
├── server/                                  # API Gateway (Node.js + Express)
│   ├── src/
│   │   ├── routes/                          # ai.js, experiences.js, orders.js, auth.js
│   │   ├── controllers/                     # Business logic handlers
│   │   └── data/                            # Ground-truth JSON catalogs
└── docs/                                    # Modular Specification Suite
    ├── 01_Problem/                          # Market failure analysis
    ├── 02_Project/                          # Requirements, Actors & Workflows
    └── 03_Architecture/                     # Deep domain architectural specs
```

---

<div align="center">
  <sub>LOKIVA Architecture Report · National Hackathon Finale Specification · Standardized to Nivaaran Excellence.</sub>
</div>
