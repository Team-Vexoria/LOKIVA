# LOKIVA — Actors, Roles & Responsibilities

**Project:** LOKIVA — Autonomous Cultural Experience Engine  
**Document Code:** DOC-02-ACT-001  
**Target Milestone:** National Hackathon 2-Day Offline Finale (Sept 26–27, 2026)  
**Status:** Foundational Actor Specification  

---

# 1. Purpose & Philosophy

LOKIVA is a **multi-sided cultural ecosystem**, not a single-user travel blog. It connects two fundamentally distinct groups:
1. **Conscious Cultural Travelers:** Seeking authentic living heritage, verified cultural context, and constraint-optimized micro-itineraries.
2. **Grassroots Master Artisans & Guilds:** Custodians of generational Indian craft traditions who have historically been excluded from digital travel economics.

LOKIVA enforces strict role boundaries: an artisan host cannot be treated like a software developer, and a traveler must never have authority to alter ground-truth historical records.

```text
ECOSYSTEM ACTOR TOPOLOGY

    ┌───────────────────────────────────┐
    │   CONSCIOUS CULTURAL TRAVELER     │
    │   - Time-crunched layovers        │
    │   - Accessibility requirements    │
    │   - Books workshops & passes      │
    └─────────────────┬─────────────────┘
                      │
                      ▼
    ┌───────────────────────────────────┐
    │          LOKIVA PLATFORM          │
    │  - Spatio-temporal solver         │
    │  - Vernacular voice bridge        │
    │  - Dynamic UPI payment simulator  │
    └─────────────────┬─────────────────┘
                      │
                      ▼
    ┌───────────────────────────────────┐
    │    GRASSROOTS MASTER ARTISAN      │
    │    - Generational craft guild     │
    │    - Speaks regional dialect      │
    │    - Manages workshop rosters     │
    └───────────────────────────────────┘
```

---

# 2. Detailed Actor Profiles & Personas

---

## 2.1 Actor 1: Conscious Cultural Traveler (`TRAVELER`)

### Profile Summary
* **Primary Persona:** Piyush Kumar (31, Cultural Explorer & Systems Engineer).
* **Motivations:** Bypassing tourist traps; discovering GI-tagged craft workshops; maximizing 3-to-4 hour layover intervals; finding step-free access for family members.
* **Technical Proficiency:** High (smartphones, web apps, UPI payments).
* **Authentication:** Authenticated via JWT or one-click fallback session.

### What the Traveler CAN Do:
1. Browse and filter the 1,080 ground-truth experiences across all 36 Indian States & UTs.
2. Input spatio-temporal constraints (Origin coordinates, Available Hours, Budget INR, Wheelchair requirements).
3. Generate and view minute-by-minute micro-itineraries computed by Gemini 1.5 Flash.
4. Launch simulated UPI QR checkout (Google Pay, PhonePe, Paytm).
5. Receive, view, and print high-resolution cryptographic digital admission passes.
6. Initiate direct WhatsApp chat with verified artisan hosts.

### What the Traveler CANNOT Do:
1. Cannot edit venue metadata, operating hours, or admission prices.
2. Cannot view other travelers' private booking hashes or contact numbers.
3. Cannot approve or badge new artisan listings.

---

## 2.2 Actor 2: Grassroots Master Artisan (`ARTISAN_HOST`)

### Profile Summary
* **Primary Persona:** Ramswaroop Sharma (58, 5th-Generation Blue Pottery Artisan, Kot Jewar, Jaipur).
* **Motivations:** Preserving his ancestral craft lineage; earning fair compensation without middlemen; hosting small conscious traveler groups.
* **Technical Proficiency:** Low (basic smartphone, WhatsApp, UPI audio speaker box).
* **Linguistic Background:** Speaks regional Rajasthani/Hindi; does not read or write formal English.

### What the Artisan Host CAN Do:
1. Use the **3-Prompt AI Listing Studio** to generate a global-standard listing in 60 seconds.
2. Record vernacular audio notes in regional Indic dialects (Hindi, Bhojpuri, Marwari, Kutchi, Tamil).
3. Set and adjust workshop seat capacity and per-person fee in INR.
4. View incoming traveler booking rosters and confirmed UPI payment hashes.
5. Receive direct inquiries via pre-formatted WhatsApp chat links.

### What the Artisan Host CANNOT Do:
1. Cannot alter platform-wide verification standards or review algorithms.
2. Cannot modify administrative system configurations or Gemini prompt parameters.

---

## 2.3 Actor 3: Guild Master / Craft Cooperative Lead (`GUILD_MASTER`)

### Profile Summary
* **Primary Persona:** Fatima Begum (46, Madanpura Silk Handloom Cooperative Director, Varanasi).
* **Motivations:** Representing a cluster of 25+ weaver families; negotiating group heritage walks; managing collective raw silk material funds.
* **Technical Proficiency:** Medium (uses tablet, manages cooperative bank account).

### What the Guild Master CAN Do:
1. Manage multiple artisan workshop listings under a unified guild badge.
2. Coordinate multi-artisan heritage walk schedules.
3. View aggregated cluster earnings and visitor demographics.

---

## 2.4 Actor 4: Platform Administrator & Heritage Verifier (`ADMIN_VERIFIER`)

### Profile Summary
* **Primary Persona:** LOKIVA Core Engineering & Editorial Council.
* **Motivations:** Enforcing the 0% dummy data mandate; auditing image CDN links; verifying GI-tag certifications; maintaining 60 FPS platform performance.

### What the Admin Verifier CAN Do:
1. Create, edit, or delete places in the master ground-truth catalog.
2. Verify venue direct CDN images against high-resolution standards.
3. Review and approve pending artisan listings generated via the AI Studio.
4. Inspect system performance logs, Gemini API token utilization, and cache health.

---

## 2.5 Actor 5: Autonomous AI Orchestration Agent (`SYSTEM_AI`)

### Profile Summary
* **Identity:** Google Gemini 1.5 Pro & Gemini 1.5 Flash engine.
* **Role:** Operates as an untrusted recommendation engine strictly bounded by deterministic rules.

### Capabilities & Guardrails:
1. Generates minute-by-minute itinerary route sequences from pre-filtered candidate arrays.
2. Translates and normalizes vernacular voice notes into English.
3. Synthesizes cultural lore and visitor etiquette guidelines.
4. **Hard Guardrail:** AI never directly mutates database records without human or client confirmation.

---

# 3. Role Authority Matrix

| Action / Capability | `TRAVELER` | `ARTISAN_HOST` | `GUILD_MASTER` | `ADMIN_VERIFIER` |
| :--- | :---: | :---: | :---: | :---: |
| **Browse & Filter 1,080 Places** | ✅ Full Access | ✅ Full Access | ✅ Full Access | ✅ Full Access |
| **Run Spatio-Temporal Solver** | ✅ Full Access | ❌ | ❌ | ✅ Full Access |
| **Execute Simulated UPI Checkout** | ✅ Full Access | ❌ | ❌ | ✅ Full Access |
| **Download / Print Digital QR Pass** | ✅ Own Passes | ❌ | ❌ | ✅ All Passes |
| **Create 3-Prompt AI Listing** | ❌ | ✅ Own Studio | ✅ Cluster Studios | ✅ Full Access |
| **Record Vernacular Audio Note** | ❌ | ✅ Full Access | ✅ Full Access | ❌ |
| **View Workshop Booking Rosters** | ❌ | ✅ Own Roster | ✅ Cluster Roster | ✅ Full Access |
| **Audit Image CDN & Provenance** | ❌ | ❌ | ❌ | ✅ Full Access |
| **Modify Ground-Truth Database** | ❌ | ❌ | ❌ | ✅ Full Access |

---

<div align="center">
  <sub>DOC-02-ACT-001 · LOKIVA Actors & Roles Specification</sub>
</div>
