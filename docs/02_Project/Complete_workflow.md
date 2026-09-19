# LOKIVA — Complete System Workflows & State Machines

**Project:** LOKIVA — Autonomous Cultural Experience Engine  
**Document Code:** DOC-02-WFL-001  
**Target Milestone:** National Hackathon 2-Day Offline Finale (Sept 26–27, 2026)  
**Status:** Approved Workflow & State Machine Specification  

---

# 1. Global End-to-End Platform Workflow

LOKIVA connects conscious travelers and grassroots artisans through five integrated operational phases:

```text
                               GLOBAL END-TO-END FLOW
                               
  PHASE 1: LANDING & DISCOVERY
  Traveler arrives at editorial hero ──> Views live macOS / iPhone 16 Pro device frames
  ──> Explores 36-state faceted catalog (0% dummy data, 1,080 verified places)
                            │
                            ▼
  PHASE 2: SPATIO-TEMPORAL CONSTRAINT SOLVING
  Traveler specifies: Origin, Hours (e.g. 3.5h), Budget (₹600), Wheelchair needs
  ──> Deterministic Haversine & opening hours filter selects 12 candidate venues
  ──> Gemini 1.5 Flash generates minute-by-minute itinerary with realistic transit buffers
                            │
                            ▼
  PHASE 3: ARTISAN ENGAGEMENT & VERNACULAR CHAT
  Traveler selects silk handloom or pottery workshop ──> Listens to artisan voice note
  ──> Directly connects via pre-formatted WhatsApp link in artisan's local dialect
                            │
                            ▼
  PHASE 4: TRANSACTIONAL REALISM & DIGITAL QR PASS
  Traveler clicks "Book Workshop" ──> Launches dynamic UPI QR checkout modal
  ──> Simulates instant GPay / PhonePe / Paytm payment ──> Issues cryptographic QR pass
                            │
                            ▼
  PHASE 5: OFFLINE PERSISTENCE & CONVENTION RESILIENCE
  Service Worker pre-caches assets ──> IndexedDB mirrors 1,080 places
  ──> Full application functions at 60 FPS even if hackathon Wi-Fi disconnects
```

---

# 2. Workflow 1: Spatio-Temporal Itinerary Route Engine

### 2.1 State Transition Diagram
```text
┌──────────────┐
│     IDLE     │ <── No itinerary requested
└──────┬───────┘
       │ [User submits: hours, budget, origin, mobility]
       ▼
┌─────────────────────────┐
│ DETERMINISTIC_FILTERING │
│ - Haversine clustering  │
│ - Opening hours check   │
│ - Budget ceiling prune  │
└──────┬──────────────────┘
       │ [Candidates count K >= 1]
       ▼
┌─────────────────────────┐
│     AI_SOLVER_INVOKED   │
│ - Calls Gemini 1.5 Flash│
│ - Enforces JSON schema  │
│ - Adds transit buffers  │
└──────┬──────────────────┘
       │
       ├─────────────────────────────────┐
       │ [Success: 200 OK JSON]          │ [Gemini Timeout / Error]
       ▼                                 ▼
┌─────────────────────────┐       ┌─────────────────────────┐
│    TIMELINE_RENDERED    │       │   DETERMINISTIC_FALLBACK│
│ - Interactive nodes     │       │ - Greedy distance sort  │
│ - Minute-by-minute cards│       │ - Basic time allocation │
│ - Transit friction tags │       └────────────┬────────────┘
└──────┬──────────────────┘                    │
       │                                       ▼
       └───────────────────────────────────────┘
```

### 2.2 Detailed Step-by-Step Execution
1. **Input Submission:** Traveler declares origin $(lat_0, lng_0)$, available time $T_{avail}$ (minutes), budget limit $B_{max}$ (INR), and accessibility requirements.
2. **Spatial Pre-Filter (Deterministic):**
   - Backend scans all places in the target city/state from the 1,080-place catalog.
   - Calculates Haversine distance $d(p_0, p_i)$ for all venues.
   - Prunes venues where opening time window $[O_i, C_i]$ does not overlap with $t_{start}$.
   - Prunes venues where admission fee exceeds $B_{max}$.
   - Selects top 12 nearest candidates.
3. **Neural Optimization (Gemini 1.5 Flash):**
   - Passes 12 candidates to Gemini with the strict system constraint prompt.
   - Computes sequence maximizing cultural diversity while guaranteeing:
     $$\sum V_i + \sum \tau(p_{i-1}, p_i) \le T_{avail}$$
4. **Interactive Timeline Rendering:**
   - Frontend renders the minute-by-minute timeline drawer with walking/auto transit nodes and insider lore badges.

---

# 3. Workflow 2: Transactional Simulation & Pass Generation

### 3.1 State Transition Diagram
```text
┌──────────────────────┐
│  BOOK_CLICKED        │ Traveler clicks "Book Pass" on venue/workshop
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  ORDER_INITIALIZED   │ Backend creates order row: ORD-2026-XXXX
│                      │ Sets status = "PENDING"
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  UPI_MODAL_ACTIVE    │ Renders dynamic UPI QR code
│                      │ Displays [Google Pay], [PhonePe], [Paytm] buttons
└──────────┬───────────┘
           │ [Traveler clicks simulated payment trigger]
           ▼
┌──────────────────────┐
│  PAYMENT_VERIFYING   │ Simulates gateway webhook response
│                      │ Spinner active, 400ms haptic delay
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  ORDER_CONFIRMED     │ Status updated to "PAID"
│                      │ Cryptographic ticket hash signed
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  PASS_GENERATED      │ Renders DigitalPassModal with scannable QR
│                      │ Enables "Print / Save PDF" with @media print
└──────────────────────┘
```

---

# 4. Workflow 3: Artisan Onboarding & 3-Prompt AI Studio

```text
┌───────────────────────────────┐
│ Artisan visits /provider-studio│
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│ Prompts 1-3 Completed:        │
│ 1. Craft lineage & technique  │
│ 2. Village / studio location  │
│ 3. Per-person workshop fee    │
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│ Gemini 1.5 Flash Synthesis:   │
│ - Compelling cultural hook    │
│ - Take-home craft item        │
│ - Mandatory visitor etiquette │
│ - Transparent price breakdown │
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│ Listing Live & Direct WhatsApp│
│ Connect Link Generated        │
└───────────────────────────────┘
```

---

# 5. Workflow 4: Offline Resilience & Network Degradation

```text
┌──────────────────────────────┐
│ Normal Operation (Online)    │
│ - API fetch resolves online  │
│ - Service Worker caches app  │
│ - IndexedDB mirrors catalog  │
└──────────────┬───────────────┘
               │
               ▼ [Wi-Fi disconnected / Venue blackout]
┌──────────────────────────────┐
│ 'offline' Event Intercepted  │
│ - UI renders amber badge     │
│ - HTTP requests routed to SW │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Fallback to IndexedDB Store  │
│ - Faceted search continues   │
│ - Local distance calculated  │
│ - 60 FPS performance upheld  │
└──────────────────────────────┘
```

---

<div align="center">
  <sub>DOC-02-WFL-001 · LOKIVA Complete System Workflows</sub>
</div>
