# LOKIVA

**Your day, planned for how it actually goes.**

LOKIVA is a local-experience discovery platform built around a single idea: a plan is only useful if it survives contact with reality. Every other discovery app in this space — GetYourGuide, TripAdvisor, Airbnb Experiences, Google Maps — generates an itinerary once and hands it to you. If it rains, a venue closes, or you run out of time, you're on your own. LOKIVA doesn't stop at recommending. It packs a feasible plan around your real constraints — time, budget, distance, group, accessibility — and rebuilds that plan the instant something changes.

On the other side, LOKIVA gives small local providers — guides, home chefs, workshop owners, artists — a way to get found by the travellers who actually want what they offer, without needing an ad budget or SEO team.

This is not a search engine with filters. It's a constraint solver with a live-adaptation loop, wrapped in an interface built for two very different people: someone standing in a new city with two hours to kill, and a business owner who has never built a website in their life.

---

## The problem, in one line each

**Traveller side.** Good local experiences are scattered across social media, booking sites, and review apps — and none of them know your time, budget, group, or accessibility needs *together*, as one problem to solve.

**Provider side.** A guide or home chef might be the perfect match for a traveller three streets away, and stay invisible anyway, because discovery platforms are catalogues you have to search, not systems that push the right traveller to the right small business.

LOKIVA treats both as the same underlying problem: matching under real-world constraints, live.

---

## What it does

### For travellers
- Turns a one-line request ("2 hours before my flight, want something fun and cheap near Bandra") or a quick guided quiz into a structured set of constraints
- Packs a feasible plan — not a ranked list — that fits your time, travel time, and budget *together*
- Explains every pick in one honest sentence: why this, why now, why it fits
- Rebuilds the plan instantly when something breaks — a closed venue, bad weather, less time, less money
- Treats accessibility needs as a hard constraint the plan can never violate, not a filter buried in Advanced Options
- Lets you paste an existing itinerary and fills the real gaps in it

### For providers
- Turns two lines of plain description into a full structured listing, using an LLM to fill in category, tags, accessibility flags, and a suggested price band
- Simple availability management — no more overselling a slot that's already gone
- A live dashboard, not a static profile page
- Demand alerts: *"3 families near you want a 2-hour food experience under ₹500 in the next 3 hours"* — the platform finds them, they don't have to buy their way to visibility

---

## Why this, not another travel app

Every major platform in this space has already shipped AI-assisted planning. What none of them have shipped is adaptation — a plan that changes when your day does. That gap, plus the fact that small providers are structurally invisible in a pay-to-list world, is what LOKIVA is built to close. If you're looking for the deeper research behind that claim, see [`architecture.md`](./architecture.md).

---

## Stack

| Layer | Choice |
|---|---|
| Frontend | React + Vite, Tailwind, Framer Motion + GSAP for the interaction layer |
| Recommendation engine | FastAPI (Python) — the constraint solver lives here |
| Real-time layer | Node.js + Express + Socket.io — re-plan triggers, demand alerts |
| Data | Firebase (Firestore + Auth) for the build; PostGIS-backed Postgres is the natural next step for real geo-distance queries |
| Maps | Google Maps / Mapbox Directions API — real travel time, not straight-line distance |
| AI / NLP | LLM API for free-text parsing, listing generation, and explanation sentences |
| Hosting | Vercel (frontend), Render/Railway (backend services) |

Full breakdown of how these layers talk to each other is in [`architecture.md`](./architecture.md).

---

## Repo layout

```
lokiva/
├── apps/
│   ├── web/              React + Vite frontend
│   └── provider-console/ (shares components with web, separate entry — see architecture.md)
├── services/
│   ├── solver-api/       FastAPI — constraint solver, explainability, itinerary logic
│   └── realtime-api/     Node/Express + Socket.io — re-plan triggers, demand-alert matching
├── packages/
│   └── design-tokens/    Shared color/type/spacing tokens, single source of truth
├── docs/
│   ├── architecture.md
│   ├── agents.md
│   └── setup.md
└── README.md
```

---

## Getting started

Full environment setup, prerequisites, and env vars are in [`setup.md`](./setup.md). Short version:

```bash
git clone <repo-url> lokiva && cd lokiva
npm install --workspaces
cp .env.example .env   # fill in Firebase, Maps, and LLM keys
npm run dev             # starts web + both services concurrently
```

---

## Design direction

LOKIVA is a consumer product, not an internal tool, and it's judged on sight before it's judged on function. The full design system — palette, type, motion, and the signature interaction — is documented in [`architecture.md#design-system`](./architecture.md#design-system). If you're touching any UI, read that section before writing a single class name; it's a short read and it's what keeps this looking like a designed product instead of a hackathon prototype.

---

## Team

Built for the Local & Experiences hackathon track. Contributor conventions and how AI coding assistance is used (and constrained) on this repo are documented in [`agents.md`](./agents.md).