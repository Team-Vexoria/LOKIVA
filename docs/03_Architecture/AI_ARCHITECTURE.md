# LOKIVA — Generative AI Architecture Specification

**Project:** LOKIVA — Autonomous Cultural Experience Engine  
**Document Code:** DOC-03-AI-001  
**Target Milestone:** National Hackathon 2-Day Offline Finale (Sept 26–27, 2026)  
**Status:** Approved Generative AI Engineering Specification  

---

# 1. Purpose & Core AI Principles

This document defines how Google Gemini 1.5 Pro and Gemini 1.5 Flash participate in the LOKIVA cultural discovery and marketplace engine.

### Foundational Invariant:
> **AI recommends and optimizes. Deterministic filters enforce boundaries. The platform records verified ground truth.**

Under no circumstances may the AI engine hallucinate unverified places or violate user physical time and budget constraints.

```text
AI ARCHITECTURAL BOUNDARY
┌─────────────────────────────────────────────────────────────┐
│  USER INPUT: Hours: 3.5 | Budget: ₹600 | Wheelchair: True   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  DETERMINISTIC SPATIAL GATEWAY                              │
│  - Filters strictly within ground-truth 1,080 catalog       │
│  - Validates opening hours & wheelchair ramp access         │
│  - Selects top 12 valid candidate venues                    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  GEMINI 1.5 FLASH SOLVER (Bounded Neural Optimization)      │
│  - Sequences waypoints into minute-by-minute timeline       │
│  - Injects realistic urban transit friction & insider tips  │
│  - Emits strict structured JSON                             │
└─────────────────────────────────────────────────────────────┘
```

---

# 2. Subsystem 1: Spatio-Temporal Itinerary Solver

### 2.1 Model & Configuration
* **Model:** `gemini-1.5-flash`
* **Temperature:** `0.2` (Low variance, deterministic scheduling)
* **Response Format:** `application/json`
* **Token Budget:** Max 1,200 output tokens per request.

### 2.2 Complete System Instruction
```text
You are the LOKIVA Chief Spatio-Temporal Cultural Navigator for India.
You receive a strictly validated list of candidate cultural places within a specific city.
Every candidate has a known duration, entry price, geographic coordinate, and accessibility flags.

YOUR MANDATE:
1. Synthesize a sequential, minute-by-minute itinerary fitting precisely within the user's available hours.
2. NEVER introduce venues that are not present in the provided candidates array.
3. Calculate realistic transit buffers between stops: minimum 15 minutes for walking within 1km, 25 minutes for vehicular transit between 1km and 5km.
4. Total cumulative time (dwell times + transit buffers) MUST NOT exceed the user's total available minutes.
5. Total ticket fees MUST NOT exceed the user's budget ceiling.
6. Provide an authentic, non-generic "Insider Tip" for every stop (e.g. photography vantage point, ritual etiquette, or authentic food stall nearby).
7. Respond ONLY with valid JSON conforming to the DayPlanResponse schema.
```

### 2.3 Input & Output JSON Schema Contract
```typescript
export interface SolverCandidateInput {
  id: number;
  title: string;
  city: string;
  dwellMinutes: number;
  admissionFeeINR: number;
  coordinates: { lat: number; lng: number };
  category: string;
}

export interface ItineraryWaypoint {
  order: number;
  placeId: number;
  title: string;
  arrivalTime: string;    // e.g. "15:30"
  departureTime: string;  // e.g. "16:15"
  dwellMinutes: number;
  transitToNextMinutes: number;
  transitMode: 'Walking' | 'Auto-Rickshaw' | 'Cycle Rickshaw' | 'Boat Ferry';
  insiderTip: string;
}

export interface DayPlanResponse {
  totalDurationMinutes: number;
  totalCostINR: number;
  summary: string;
  waypoints: ItineraryWaypoint[];
}
```

---

# 3. Subsystem 2: Artisan Vernacular Voice Bridge

### 3.1 Multimodal Ingestion Pipeline
* **Model:** `gemini-1.5-pro`
* **Input:** Spoken audio buffer (WebM / Ogg Opus, $\le 60\text{ seconds}$).
* **Task:** Transcribe regional Indic dialect, extract commercial intent, and normalize into professional English copy.

### 3.2 Regional Dialect Normalization Matrix

| Spoken Dialect | Target States | Key Colloquial Identifiers | Extracted Taxonomy |
| :--- | :--- | :--- | :--- |
| **Bhojpuri / Maithili** | Eastern UP, Bihar | *"Bunkar logan", "Ghaat pa"* | Silk Handloom Guild & Sacred Ghats |
| **Dhundhari / Marwari** | Rajasthan | *"Chhapaai", "Kachchi mitti"* | Hand Block Print & Blue Pottery |
| **Kutchi / Gujarati** | Gujarat | *"Rogan", "Bandhani bandhej"* | Castor Oil Fabric Art & Tie-Dye |
| **Tamil (Madurai)** | Tamil Nadu | *"Thari nesavu", "Kovil sirpam"* | Temple Stone Sculpting & Silk Weaving |

---

# 4. Subsystem 3: Artisan 3-Prompt AI Listing Studio

### 4.1 Input Specification
The rural artisan answers 3 plain-language prompts:
1. `craftLineage`: (e.g. *"5th generation blue pottery tile maker"*)
2. `location`: (e.g. *"Kot Jewar village, Jaipur"*)
3. `feeAndCapacity`: (e.g. *"₹450 per person, max 6 people, 2 hours"*)

### 4.2 Output Synthesis Prompt
```text
SYSTEM INSTRUCTION:
Transform the 3 rural artisan inputs into a high-converting, respectful cultural workshop listing.
Include:
1. Engaging editorial title highlighting heritage lineage.
2. 120-word historical context of the craft.
3. Specific take-home craft item created by the traveler.
4. Mandatory visitor etiquette (footwear rules, photography consent, modest dress).
5. Output structured JSON.
```

---

# 5. Error Containment & Fallback Heuristics

1. **Gemini API Timeout ($\ge 2.5\text{s}$):** Backend aborts the upstream fetch and executes a local deterministic greedy-routing heuristic based on Haversine proximity.
2. **Quota Exceeded (HTTP 429):** Backend serves cached popular itineraries and alerts the client with zero UI disruption.
3. **Strict JSON Schema Validation:** Every Gemini response is validated with Zod before being emitted to the frontend.

---

<div align="center">
  <sub>DOC-03-AI-001 · LOKIVA Generative AI Architecture Specification</sub>
</div>
