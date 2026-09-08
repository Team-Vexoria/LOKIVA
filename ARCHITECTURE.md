# LOKIVA — Architecture

This document covers how LOKIVA is built: the system layers, the data model, the constraint solver at the center of the product, the real-time re-planning loop, and the design system that governs every screen. Read this before you touch the solver or the UI — both have opinions baked in on purpose.

---

## 1. The reframe this architecture is built around

LOKIVA is not a search-and-filter product. It's two connected problems:

1. **Feasibility packing** — given a traveller's time, budget, travel-time tolerance, group, and accessibility needs, find a *combination* of experiences that can actually be done together, not just individually good options.
2. **Live re-solving** — when one variable changes (less time left, a venue goes unavailable, weather turns), re-run the same solve with the updated state and return a new feasible plan in under a second.

Everything below exists to make those two things fast, explainable, and honest — an itinerary the app can defend, not a black box.

---

## 2. System layers

```
┌─────────────────────────────────────────────────────────────┐
│  Presentation layer                                          │
│  React (web) — traveller app, provider console                │
│  Map view · itinerary timeline · chat/voice entry · dashboard │
└───────────────┬─────────────────────────────┬────────────────┘
                │                              │
      REST / WebSocket                REST / WebSocket
                │                              │
┌───────────────▼───────────────┐  ┌───────────▼────────────────┐
│  solver-api (FastAPI)          │  │  realtime-api (Node/Express) │
│  · Context engine               │  │  · Socket.io re-plan channel │
│  · Recommendation & solver      │  │  · Demand-alert matching job │
│  · Explainability module        │  │  · Disruption event bus      │
│  · Provider AI co-pilot         │  └───────────┬────────────────┘
└───────────────┬─────────────────┘              │
                │                              │
        ┌───────▼──────────────────────────────▼───────┐
        │  Data layer — Firestore (build) / Postgres+PostGIS (next) │
        │  Experiences · Providers · Travellers · Itineraries        │
        └──────────────────────────────────────────────┘
                │
        ┌───────▼────────┐
        │  External APIs   │
        │  Maps/Directions │
        │  LLM provider    │
        └─────────────────┘
```

**Why two backend services instead of one.** The solver is CPU-bound, synchronous, and benefits from Python's ecosystem for scoring and packing logic. The real-time layer is I/O-bound, connection-heavy (every open traveller session and every subscribed provider holds a socket), and Node/Socket.io is the more natural fit there. Splitting them means a spike in concurrent re-plan requests never starves the solver, and vice versa. If judges ask why two services in a hackathon: it's a deliberate separation of concerns, not scope creep — each does one job well.

---

## 3. Data model

Kept deliberately flat for a fast build. Field names below are the contract between solver-api and the frontend — don't rename casually.

### `Experience`
```
id, provider_id
title, description, category[]           // weighted interest tags, not a single tag
price, currency
duration_minutes
geo: { lat, lng }
opening_hours: [{ day, open, close }]
accessibility: { wheelchair, sensory_friendly, dietary[], elderly_friendly }
rating, review_count
availability_slots: [{ start, end, capacity_remaining }]
local_impact_score                        // 0–1, heuristic — see §6
is_hidden_gem: bool                       // unlisted/community-submitted flag
```

### `TravellerContext` (built by the context engine, never hand-typed by the traveller)
```
interests: { food: 0.8, culture: 0.4, ... }   // weighted, not boolean
location: { lat, lng } | "near <landmark>"
time_window: { start, end }                    // e.g. "next 2 hours"
budget_ceiling
group: { size, type }                          // solo, couple, family, elderly, friends
accessibility_requirements[]                   // hard constraints, never soft-ranked
existing_itinerary: [{ start, end, label }]    // gaps get solved into
```

### `Plan`
```
id, traveller_context_id
stops: [{ experience_id, arrival, departure, travel_time_to_next }]
total_cost, total_time, feasible: bool
explanation_per_stop: { experience_id: "Picked because: fits your 2 hrs, 400m away..." }
generation: int          // increments on every re-plan; used for the UI's "rebuilt" animation
```

### `Provider`
```
id, name, listings[], views_7d, clicks_7d, demand_alerts_sent, demand_alerts_converted
```

---

## 4. The constraint solver

This is the part of the product that's actually being judged. Two stages, deliberately not machine-learned — see §7 for why.

**Stage 1 — Scoring.** Every candidate experience gets a score from interest-match (cosine similarity between traveller interest vector and experience category weights), rating, and a distance/travel-time penalty. Accessibility requirements are **not** part of the score — they're a pre-filter. An experience that fails a hard accessibility constraint never reaches scoring.

**Stage 2 — Packing.** A greedy-with-backtracking pass over the scored candidates: accept a candidate into the plan only if `total_time + travel_time ≤ time_window` and `total_cost ≤ budget_ceiling` hold for the whole set, not just the new addition. Backtrack one level when a high-scoring candidate can't fit, rather than falling back to a naive greedy fill — this is the difference between "ranked list" and "actually feasible plan," and it's worth the extra complexity.

**Why not an ML model.** A judge can ask "why did it pick this?" and get a real answer in one sentence, because the scoring weights are legible and the packing logic is deterministic. A model that can't explain itself in a 5-minute demo is a liability, not a feature — see `agents.md` for the standing rule against black-box shortcuts in this codebase.

### Re-planning
`realtime-api` listens for a disruption event — a weather flag, a "this venue just closed" toggle, a "running late" tap — and calls `solver-api` again with exactly one field of `TravellerContext` updated (usually `time_window` or an `unavailable_experience_id`). The response is a new `Plan` with `generation` incremented. The frontend animates the transition between generations rather than hard-swapping the itinerary — this is the single moment the whole pitch hinges on, so the transition itself is design-reviewed, not an afterthought.

---

## 5. Explainability module

Reuses the exact scoring signals from Stage 1 and fills a template — deliberately not a second LLM call for every stop, because that's slower and less honest about what actually drove the pick:

`"Picked because: fits your {time_window}, {distance}m away, {rating_tier} for {group_type}, within budget."`

The LLM is used for *free-text parsing into constraints* and for *provider listing generation* — genuine natural-language problems. It is not used to explain the solver's own math back to the user; the solver already knows why it picked something, so LOKIVA says that plainly instead of asking a model to guess.

---

## 6. Provider layer

**AI co-pilot.** Provider types 1–2 sentences describing what they offer. An LLM call structures that into `title`, `description`, `category[]`, `accessibility` flags, and a suggested price band drawn from similar nearby listings already in the data layer — never invented from nothing.

**Demand-aware matching.** A scheduled job in `realtime-api` compares anonymised, aggregated live traveller queries (by category + geo-radius + time-window) against provider listings and geo-radius, and pushes a socket event to matching providers. No individual traveller identity is ever exposed to a provider through this channel.

**Local-impact score.** A transparent heuristic (ownership type, business size, listing age) — never a black box, shown as a small badge, computed the same way every time so a provider can understand and dispute it.

---

## 7. Build-under-pressure principles

- No real ML model gets trained for the hackathon build. Transparent rule-based scoring beats a half-trained model that breaks on stage, and it's the only version of this system a judge can trust the explanation of.
- One end-to-end flow (search → solve → itinerary → re-plan) fully working beats five partially-working differentiators.
- The provider side is not an afterthought bolted on the night before — it's a full third of the product and is built in parallel with the traveller side from Phase 2 onward.

---

## 8. Design system

LOKIVA is a consumer product first. The interface has to be something people would screenshot, not just something that works. This is the single source of truth for every visual decision on the project — `packages/design-tokens` implements exactly this.

### Palette

| Token | Hex | Use |
|---|---|---|
| `--lokiva-ink` | `#12213B` | Primary text, dark hero/section backgrounds |
| `--lokiva-paper` | `#EEF1EE` | Base background — a cool, pale sage-grey, not cream |
| `--lokiva-marigold` | `#F0A63B` | Primary accent — CTAs, active states, the "solved" moment |
| `--lokiva-teal` | `#1F7A6C` | Secondary accent — trust signals, provider-side UI, live badges |
| `--lokiva-clay` | `#C1443B` | Reserved *only* for disruption events — the rain icon, the re-plan trigger flash. Never used decoratively; if it's on screen, something changed |
| `--lokiva-dusk` | `#5B6B8C` | Secondary text, borders, muted UI |

The palette is deliberately not the two most common AI-generated defaults (warm cream + terracotta, or near-black + acid accent). `--lokiva-marigold` reads as saffron/local-market gold, not clay — it's a different hue family on purpose, and it ties to the "local" framing of the product rather than being an arbitrary accent choice.

### Type

- **Display — Fraunces.** Used at large sizes only, for the hero line and section headers. It has real personality (warm, slightly editorial) and is used with restraint — one or two words per screen at display size, never a paragraph.
- **Body — General Sans.** Everything readable: descriptions, explanations, UI copy. Chosen over the more ubiquitous default sans for a slightly warmer, more considered feel without sacrificing legibility.
- **Data/mono — JetBrains Mono.** Reserved for numbers that mean something precise: countdown timers, prices, distances, durations. This ties directly into the "time-boxed" nature of the product — when a number is in mono, it's a constraint, not decoration.

### Layout concept

No stock photography anywhere in the traveller flow. The hero is not a headline over a photo of a smiling tourist — it's a live, interactive version of the re-plan moment: a horizontal thread connecting 2–3 experience nodes, with a single visible toggle ("it just started raining"). Tapping it re-knits the thread live, in the hero, before the visitor has scrolled at all. This is the same interaction that closes the 5-minute demo — the landing page and the live product make the same promise the same way.

### Signature element — the ReKnit Thread

A dotted, hand-drawn-feeling path connecting stops, used consistently as:
- The hero's live re-plan demo
- The connector between stops in the itinerary timeline (not numbered 01/02/03 badges — the thread itself carries the sequence, because the order is a route, not an arbitrary list)
- The loading/transition state whenever a plan is being rebuilt, so a re-plan never looks like a blank-screen reload — it looks like the thread visibly re-tying itself

This is the one place LOKIVA spends its design boldness. Everything else on the page — spacing, card treatment, provider dashboard tables — stays quiet and disciplined around it.

### Motion

Framer Motion handles page-level transitions and the re-plan sequence (the thread re-knit is the one orchestrated, deliberate animation moment on the product). GSAP is reserved for the marketing/landing scroll sequence only, where a more scroll-driven, timeline-based animation approach fits better than component-level transitions. Motion is never scattered decoratively — a hover state either communicates something (this is interactive, this just changed) or it doesn't exist. Reduced-motion preferences are respected throughout; the re-plan moment degrades to a fast crossfade rather than the full thread animation when `prefers-reduced-motion` is set.

### Writing

Copy is written from the traveller's or provider's side of the screen, not the system's. "Rebuild my plan," not "Trigger re-optimization." Errors state what happened and what to do about it, in the product's voice, never with an apology. The explanation sentence template in §5 is the model for every other piece of microcopy on the platform: specific, plain, and never generic marketing language.