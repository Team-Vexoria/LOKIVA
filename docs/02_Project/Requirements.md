# LOKIVA — Requirements Specification

**Project:** LOKIVA — Autonomous Cultural Experience Engine  
**Document Code:** DOC-02-REQ-001  
**Target Milestone:** National Hackathon 2-Day Offline Finale (Sept 26–27, 2026)  
**Status:** Approved Functional & Non-Functional Specification  

---

# 1. Purpose & Scope

This specification defines the functional, non-functional, and architectural requirements for the LOKIVA platform. LOKIVA connects conscious travelers with living cultural heritage and rural artisan guilds through deterministic spatio-temporal route solving, multimodal vernacular translation, and an offline-resilient two-sided marketplace.

Requirements are categorized by domain and tagged with explicit priority and source maturity.

---

# 2. Requirement Classification Framework

Every requirement in this specification is assigned a unique identifier and classified according to the following taxonomy:

### HK — Hackathon Core Mandate
Capabilities directly assessed by the national hackathon jury (AI sophistication, technical polish, real-world utility, live demo reliability).

### CR — Cultural & Marketplace Requirement
Capabilities necessary to operate an authentic, two-sided heritage marketplace without exploiting local artisans or providing generic tourist advice.

### AI — Generative AI & Constraint Requirement
Capabilities governing Google Gemini 1.5 Pro and Flash orchestration, prompt contracts, and deterministic spatial filters.

### UX — Frontend & Design Requirement
Capabilities governing typography, motion design, device mockup frames, faceted filtering, and responsive layouts.

### NF — Non-Functional Requirement
Performance SLAs, offline resilience, security, data integrity, and accessibility benchmarks.

### TD — Technical Decision
Implementation architecture choices (e.g. Express vs. Fastify, Vite vs. Next.js, IndexedDB vs. LocalStorage).

---

# 3. Requirement Priority Levels

* **P0 (Must Have for Finale):** Core blockers. Without these, the platform cannot be demonstrated to the jury (e.g. Spatio-temporal solver, verified 36-state catalog, device mockups, UPI checkout simulation, offline IndexedDB sync).
* **P1 (Should Have):** High-impact polish features that differentiate LOKIVA from competitors (e.g. Vernacular voice audio playback, printable pass CSS, animated transit timeline).
* **P2 (Nice to Have):** Enhancements scheduled for post-hackathon commercial deployment (e.g. Live SMS gateway, real Razorpay merchant KYC).

---

# 4. Functional Requirements: Catalog & Discovery Engine

### [FR-CAT-001] [HK / P0] 36 Indian States & Union Territories Coverage
The platform shall provide complete, verified cultural experience coverage across all 28 States and 8 Union Territories of India. Under no circumstances may coverage be limited to golden triangle tourist circuits (Delhi-Agra-Jaipur).

### [FR-CAT-002] [CR / P0] 1,080 Verified Places Minimum Quota
The catalog service shall store and serve a minimum of 30 curated cultural experiences per state and union territory, resulting in a total baseline of at least 1,080 verified places.

### [FR-CAT-003] [CR / P0] Tiered Granularity Distribution
Each state or union territory catalog shall adhere to the following distribution:
* **Tier 1 (Capital / Major Cultural Hub):** Exactly 14 verified places.
* **Tier 2 (Secondary Craft District / Temple Town):** Exactly 10 verified places.
* **Tier 3 (Hidden Hamlet / Sacred Natural Enclave):** Exactly 6 verified places.

### [FR-CAT-004] [CR / P0] Zero Dummy Data Guarantee
The dataset shall contain 0% placeholder text (*Lorem Ipsum*, *"Sample Title"*, *"Test Venue"*). Every record must represent a verifiable real-world heritage monument, active artisan guild, or traditional culinary institution.

### [FR-CAT-005] [CR / P0] Direct Image CDN Verification
Every place record must link directly to high-resolution photography ($\ge 1200\times 800\text{px}$) hosted on verified direct CDNs (Wikimedia Commons direct media or verified Unsplash photo IDs). Arbitrary keyword search scrapers are strictly prohibited.

### [FR-CAT-006] [UX / P0] Sub-Second Multi-Faceted Filtering
The discovery interface shall allow travelers to filter places simultaneously across:
1. State / Union Territory (36 options)
2. Macro-Region (North, South, East, West, Central, NorthEast, Islands)
3. Cultural Perspective (Heritage, Artisan, Culinary, Spiritual, Nature, Nightlife)
4. Budget Ceiling Slider (₹0 to ₹5,000+)
5. Duration Ceiling Slider (30 mins to 8 hours)
6. Accessibility Badges (Wheelchair accessible, Step-free, Low walking, Rain-safe)

### [FR-CAT-007] [UX / P0] Instant Debounced Filtering
Client-side filtering must execute in $\le 35\text{ milliseconds}$ through memory-cached collections without triggering unnecessary network fetches.

---

# 5. Functional Requirements: Spatio-Temporal Constraint Solver

### [FR-ST-001] [AI / P0] Two-Stage Hybrid Solver Pipeline
Itinerary generation shall execute through a strict two-stage pipeline:
* **Stage 1 (Deterministic):** Backend filters candidate venues within the target city using Haversine distance, operational opening hours, and hard budget bounds.
* **Stage 2 (Neural Optimization):** Google Gemini 1.5 Flash ingests the pre-filtered candidate subset to calculate minute-by-minute waypoint sequencing.

### [FR-ST-002] [AI / P0] Strict Candidate Hallucination Ban
The AI solver is strictly prohibited from introducing outside venues that do not exist within the pre-filtered candidate array passed in the prompt payload.

### [FR-ST-003] [AI / P0] Urban Transit Friction Multipliers
The routing engine shall apply realistic transit friction buffers based on Indian urban conditions:
* Pedestrian navigation through market alleys and river ghats: $v_{walk} = 3.5 \text{ km/h}$.
* Auto-rickshaw transit in old historic quarters: $v_{auto} = 15 \text{ km/h}$ with a mandatory 10-minute traffic buffer.
* Minimum buffer between stops: 15 minutes.

### [FR-ST-004] [AI / P0] Total Time Hard Ceiling
The total itinerary duration ($\sum \text{Dwell Time} + \sum \text{Transit Buffers}$) must never exceed the traveler's declared available hours.

### [FR-ST-005] [AI / P0] Total Budget Hard Ceiling
The total admission and workshop fees ($\sum \text{Admission Fee}$) must never exceed the traveler's declared budget ceiling.

### [FR-ST-006] [AI / P1] Cultural Insider Tip Injection
Every generated waypoint must include a verified `insiderTip` highlighting local cultural etiquette, photography rules, or optimal lighting angles.

---

# 6. Functional Requirements: Artisan Vernacular Voice Bridge

### [FR-VB-001] [AI / P1] Multimodal Audio Ingestion
The platform shall allow rural artisan hosts to record spoken audio notes (up to 60 seconds) directly in the browser using the Web MediaRecorder API.

### [FR-VB-002] [AI / P1] Regional Dialect Normalization
Gemini 1.5 Multimodal shall transcribe and normalize regional Indic speech patterns (Hindi, Bhojpuri, Marwari, Dhundhari, Kutchi, Tamil) into structured English text.

### [FR-VB-003] [CR / P1] Direct WhatsApp Connect
Every verified artisan profile shall provide a direct WhatsApp click-to-chat link pre-populated with inquiry details in the artisan's local tongue.

---

# 7. Functional Requirements: Artisan AI Listing Studio

### [FR-ART-001] [AI / P0] 3-Prompt Listing Synthesis
The Provider Studio shall enable an artisan to create a complete global-standard cultural listing by answering only 3 basic prompts:
1. Craft technique and lineage name.
2. Workshop village / studio location.
3. Per-person workshop fee and session duration.

### [FR-ART-002] [AI / P0] Cultural Etiquette Synthesis
The AI generator must automatically synthesize mandatory visitor etiquette guidelines (footwear policies, photography consent, modest dress guidelines).

---

# 8. Functional Requirements: Transactional Simulator & Pass Engine

### [FR-CHK-001] [HK / P0] Dynamic UPI QR Code Generation
The checkout modal shall generate an authentic dynamic UPI QR code containing a valid `upi://pay` intent string with the merchant name, order hash, and INR amount.

### [FR-CHK-002] [HK / P0] One-Click Payment Simulation
The UI shall provide simulated payment trigger buttons for **Google Pay**, **PhonePe**, and **Paytm** that simulate realistic payment confirmation webhooks.

### [FR-CHK-003] [HK / P0] Cryptographic QR Digital Admission Pass
Upon payment confirmation, the system shall generate a digital admission pass featuring:
* Cryptographic booking hash (`LOK-2026-IND-XXXX`).
* Authenticated traveler name (`Piyush Kumar`).
* High-density 2D QR code scannable by smartphone cameras.
* Venue coordinates and dress code advisories.

### [FR-CHK-004] [UX / P1] Printable Pass Styling (`@media print`)
The digital pass shall implement dedicated CSS `@media print` rules that hide UI chrome and format the pass into a clean 300 DPI physical ticket voucher.

---

# 9. Non-Functional Requirements (NFRs)

### [NFR-PERF-001] Page Load Performance
The landing page shall achieve a First Contentful Paint (FCP) of $\le 0.8 \text{ seconds}$ and a Time to Interactive (TTI) of $\le 1.4 \text{ seconds}$ on standard 4G networks.

### [NFR-OFF-001] Unbreakable Offline Resilience
In the event of total network disconnection during live stage judging:
1. The Service Worker (`sw.js`) shall serve cached static assets from Cache Storage.
2. The catalog service shall retrieve places from client IndexedDB (`lokiva_db`).
3. The UI shall display an amber `⚡ Offline Resilient Mode Active` status badge without crashing.

### [NFR-ACC-001] WCAG 2.1 AA Accessibility
All interactive elements, buttons, and form inputs must maintain a minimum contrast ratio of 4.5:1 against their backgrounds and support full keyboard navigation.

### [NFR-SEC-001] Session & Identity Security
User authentication shall use signed JWT tokens with 24-hour expiration. Demo session fallback shall authenticate as **Piyush Kumar** (`piyush@lokiva.com`).

---

<div align="center">
  <sub>DOC-02-REQ-001 · LOKIVA Requirements Specification</sub>
</div>
