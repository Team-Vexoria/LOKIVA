# 🌍 LOKIVA

### Discover India Beyond the Tourist Map · Feasibility-Packed Cultural Travel Engine

**LOKIVA** is an AI-powered local discovery and deterministic travel packing platform designed to help travelers discover **authentic local experiences, hidden crafts, heirloom cuisine, heritage corridors, workshops, and community-hosted traditions across India**.

Instead of commercial ranking algorithms, pay-to-play listings, and scattered recommendations, LOKIVA uses a **deterministic constraint solver** to pack feasible day plans that honor real travel buffers, opening hours, budget ceilings, and verified step-free accessibility.

---

## ✨ Key Capabilities & Highlights

### ⚡ 1. One Connected Ecosystem
LOKIVA connects traveler intent with grassroots cultural masters in one continuous loop:
- **Traveler**: *"I tell LOKIVA what I want."* — Express natural desires, time windows, and physical accessibility without endless search.
- **LOKIVA AI**: *"Understands intent & matches feasible craft."* — Algorithmic feasibility matching without commercial advertising bias.
- **Local Provider**: *"Fulfills demand & earns 100% directly."* — Grassroots artisans and heritage guides get discovered with zero commission ad-tax.

### ⏱️ 2. "I Have Exactly ___ Hours" Micro-Moment Solver
- **Context City**: Dynamic destination selector covering verified cultural hubs across India (Mumbai, Jaipur, Kochi, Goa, Delhi, Varanasi, Udaipur, Bengaluru, Kolkata, Agra, Amritsar, Rishikesh).
- **Available Window**: Continuous slider (1 to 8 hours) with automated transit buffers.
- **Hard Budget Ceiling**: Strict price filter (₹300 to ₹5,000) ensuring plans stay within reality.
- **Hard Pre-Filters**: Certified step-free wheelchair ramp verification and low-walking accessibility filters.

### 🤖 3. Dedicated Providers Console & AI Co-Pilot Studio (`/provider`)
- **Natural Language Listing Assembly**: Artisans and guides describe their craft or walking tours in plain words (voice or text).
- **Structured Feasibility Extraction**: Auto-extracts title, duration, local fair price benchmark, category, and step-free accessibility constraints.
- **Draft & Publish**: Review, edit, save drafts, and publish listings directly to the live verified catalog.

### 🧭 4. Chronological Feasibility Itinerary (`/itinerary`)
- **Sequenced Timeline**: Detailed stop-by-stop schedule windows (e.g. `10:00 AM – 11:15 AM`).
- **Transit Buffer Indicators**: Automated auto-rickshaw and walking transit buffers between stops.
- **Explainability Receipts**: Every recommendation provides an algorithmic receipt explaining *"Why this fits your day"*.

### 🎲 5. Surprise Me Engine
- Discover spontaneous verified cultural experiences matching current GPS/city, budget limit, and available hours in a single click.

---

## 🏛️ Scalable Pan-India Coverage

LOKIVA is built to scale across all **28 Indian States and 8 Union Territories**:

```text
India
 └── State / Union Territory
      └── City / Hub (e.g., Mumbai, Jaipur, Kochi, Varanasi, Goa, Delhi)
           └── Heritage Corridors & Neighborhoods (e.g., Bandra, Fort, Pink City)
                └── Verified Community Experiences & Workshops
```

### Verified Cultural Catalog Hubs (with authentic photography):
- **Mumbai**: Bandra West Hand-Block Printing, Koli Coastal Cuisine, Heritage Bazaars
- **Jaipur**: Sanganer Block-Printing, Amber Fort Walking Corridors, Blue Pottery
- **Kochi**: Fort Kochi Spice Trails, Mattancherry Kathakali Guilds
- **Delhi**: Old Delhi Culinary Corridors, Mehrauli Architectural Walks
- **Goa**: Fontainhas Latin Quarter Trails, Ancestral Konkan Culinary Workshops
- **Varanasi**: Ancient Ghat Weaving Guilds, Morning Classical Sangeet
- **Udaipur, Bengaluru, Kolkata, Agra, Amritsar, Rishikesh, and beyond**.

---

## 🏗️ Technical Architecture

```text
                       ┌───────────────────────────────┐
                       │          LOKIVA UI            │
                       │     (React + TypeScript)      │
                       └───────────────┬───────────────┘
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            ▼                          ▼                          ▼
   Experience Exchange        Micro-Moment Solver        Providers Console
 (Traveler ↔ Host Loop)     (Deterministic Packing)      (AI Co-Pilot Studio)
            │                          │                          │
            └──────────────────────────┼──────────────────────────┘
                                       │ HTTP / REST
                                       ▼
                       ┌───────────────────────────────┐
                       │       Node.js / Express       │
                       │          API Backend          │
                       └───────────────┬───────────────┘
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            ▼                          ▼                          ▼
     SQLite Database             AI Parsing            Feasibility Engine
  (400+ Cultural Hubs)       (NLP Intent & Pricing)     (Buffers & Timelines)
```

### Technology Stack:
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite, Lucide Icons, Framer Motion, GSAP ScrollTrigger
- **Backend**: Node.js, Express, Better-SQLite3
- **Database**: `server/lokiva.sqlite` (pre-seeded with 437+ verified pan-India listings, tags, and coordinates)
- **Design System**: Warm paper tones (`bg-paper`), rich ink typography (`font-display`), marigold gold accents, and teal feasibility indicators.

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm`

### 1. Clone the Repository
```bash
git clone https://github.com/Team-Vexoria/LOKIVA.git
cd LOKIVA
```

### 2. Start the Backend API Server
```bash
cd server
npm install
npm run dev
```
*The backend server will run on `http://localhost:8000` with the SQLite database pre-configured.*

### 3. Start the Frontend Application
In a separate terminal window:
```bash
cd frontend
npm install
npm run dev
```
*The React application will launch on `http://localhost:3000`.*

---

## 📱 Core Pages & Routes

| Route | Purpose |
| :--- | :--- |
| `/` | **Home Landing Page**: Hero, One Connected Ecosystem, Interactive Proofs, Micro-Moment Solver, Catalog |
| `/explore` | **Full Catalogue Explorer**: Dynamic search, state & city filters, budget ceilings, accessibility toggles |
| `/itinerary` | **Chronological Day Itinerary**: Feasibility schedule, transit buffers, time windows, and explainability callouts |
| `/provider` | **Providers Console & AI Co-Pilot**: Artisan onboarding studio, listing generator, pricing benchmark, draft & publishing |
| `/experience/:id` | **Experience Detail Page**: Full cultural context, timings, host credentials, and instant booking |

---

## 🛡️ Algorithmic Guarantees

LOKIVA checks **11 core context signals** simultaneously before finalizing any itinerary recommendation:
1. **Available Time Window**: Strict boundaries before dinner or transit departure.
2. **Real Travel Buffer**: Traffic-aware transit between neighboring stops.
3. **Hard Budget Ceiling**: Strict max price threshold rather than a loose sort order.
4. **Certified Accessibility**: Wheelchair step-free and ramp access validation.
5. **Live Opening Hours**: Verification that venues are open during the assigned slot.
6. **Zero Ad-Tax**: Organic matching based on feasibility and cultural authenticity, not ad spend.
7. **Direct Payout**: 100% direct traveler payments to grassroots local hosts.
8. **Explainability**: Clear reason codes detailing why each stop fits the user's constraints.

---

## 👥 Team & License

Developed with ❤️ by **Team Vexoria**.  
Dedicated to preserving grassroots cultural heritage and empowering local artisans across India.
