# LOKIVA — Agent & Contributor Guidelines

This file governs how code gets written in this repo — by a teammate, or by an AI coding assistant (Claude Code, Cursor, Copilot, whatever anyone's using). Read it before your first commit. The short version: this has to ship looking like a product a small, opinionated team built on purpose, not like a hackathon scaffold that happened to run. Everything below exists to protect that.

---

## 1. The standing rule

If a change makes the product easier to explain to a judge in one sentence, it belongs here. If it makes the codebase "more impressive" without changing what the user experiences, it doesn't. This applies equally to solver logic and to UI — a clever abstraction nobody asked for is scope creep, not craftsmanship.

---

## 2. Anti-slop checklist — read this before writing UI or copy

This is the part that matters most given how this product is judged: on sight, in the first ten seconds. A few concrete rules, because "make it not look AI-made" is otherwise impossible to act on:

- **No lorem ipsum, ever.** Every string of placeholder copy in a commit is a tell. Write real LOKIVA copy from the start, even in a WIP component — use the traveller/provider persona from `architecture.md §7 demo script` context (the Sharma family, Bandra, ₹1,500 budget) as your source of real example data, not "John Doe" or "Sample Experience 1."
- **No default component names.** `FeatureCard1`, `Section2`, `HeroV3` are all rejected on sight. Name things for what they are: `ReKnitThread`, `DisruptionToggle`, `AccessibilityFilterBar`.
- **No stock photography in the traveller flow.** If a design needs an image and there's no real photo available yet, use an illustrated placeholder in the palette, not a generic Unsplash travel photo — those are the single fastest way a screen reads as templated.
- **No decorative numbered badges (01 / 02 / 03) unless the content is genuinely sequential.** The ReKnit Thread already carries sequence for the itinerary; don't duplicate it with a numbering system that doesn't mean anything.
- **No gradient-and-blob backgrounds "just because."** If a background treatment doesn't come from `architecture.md §8`, it doesn't go in.
- **No over-commented, tutorial-style code.** A comment explains *why*, not *what* — `// loop through experiences` above a `for` loop gets deleted in review, every time.
- **No leftover scaffold.** `TODO: implement this later`, commented-out blocks "just in case," and unused imports don't survive a PR. If it's not done, it's not merged.
- **Match `architecture.md §8` exactly** for color, type, and motion. Don't introduce a new accent color or a new font because it "looked nice" in isolation — every visual decision on this project traces back to that section on purpose.

---

## 3. Repo conventions

**Branches.** `feature/<short-name>`, `fix/<short-name>`. No `claude/`, `ai/`, or `bot/` prefixes — a branch name shouldn't advertise how it was written, only what it does.

**Commits.** Plain, specific, present tense. `Add feasibility packer backtracking` not `✨ Implement amazing new solver feature!!`. No emoji in commit messages or PR titles. No AI-tool attribution footers in commits — commit history describes the change, not the tool.

**PRs.** State what changed and why in two or three sentences, in your own words. If a PR touches the design system, screenshot the before/after. If it touches the solver, include one worked example (input constraints → output plan) in the description — this is the fastest way for a reviewer to trust the change without re-deriving it.

**File naming.** `PascalCase` for React components, `camelCase` for functions and variables, `snake_case` for Python (solver-api) and for Firestore field names — matches the field names in `architecture.md §3` exactly. Don't rename a solver field without updating both the frontend type and the doc in the same PR.

---

## 4. Solver-specific rules

- Every scoring weight lives in one config file (`solver-api/config/weights.py`), not scattered as magic numbers through the packing logic. A judge asking "why did distance matter more than rating here" should be answerable by opening one file.
- Any change to the packing algorithm needs a before/after trace on the demo scenario (Sharma family, 2 hrs, ₹1,500, Bandra, wheelchair access) attached to the PR. If that scenario stops producing a feasible plan, the PR doesn't merge regardless of what else it improves.
- Accessibility constraints are filtered, never scored. If you find yourself adding an accessibility field to the scoring function instead of the pre-filter, stop — that's a hard constraint being treated as a preference, and it's the exact mistake `architecture.md §2` calls out competitors for making.
- The explanation template (`architecture.md §5`) is not allowed to silently fall back to an LLM call. If the template can't produce a sentence for a given plan, that's a bug to fix in the template, not a reason to route around it.

---

## 5. Frontend-specific rules

- New UI work reads `architecture.md §8` first, every time — not "I remember the palette," actually re-open the file. Design tokens change; memory of them doesn't get updated automatically.
- Motion is deliberate. If you're adding an animation, name in the PR description which single interaction it's serving (per `architecture.md §8`'s "one orchestrated moment" principle). "Looks cool" is not a justification.
- `prefers-reduced-motion` gets checked for every new animated component, not just the hero. This isn't optional polish — it's a baseline the design system commits to.
- Copy goes through the same voice check every time: does this sentence say what the user controls, in plain language, the way `architecture.md §8`'s writing section describes? If a string reads like marketing copy ("Unlock the power of AI-driven discovery!") it gets rewritten before merge.

---

## 6. What "done" looks like for a feature

A feature is done when: it works end-to-end on the demo scenario, its copy is real (not placeholder), its visual treatment traces back to the design system doc, and a teammate who didn't write it can explain what it does in one sentence without reading the code. If any of those four aren't true, it's not done — it's in progress, and that's fine, just say so in the PR.

---

## 7. Using AI coding assistants on this repo

Assistance is fine and expected — this doc exists so the *output* is indistinguishable from work the team did carefully by hand, not to discourage using the tools. Practically:

- Review every AI-generated UI suggestion against §2 before accepting it. The defaults most tools reach for (generic gradients, stock numbering, cream-and-terracotta palettes, Inter-everywhere typography) are exactly the tells this doc exists to catch.
- Don't accept generated copy verbatim — rewrite it in LOKIVA's voice per §5, every time.
- Don't let an assistant introduce a new dependency, a new color, or a new architectural pattern without checking it against `architecture.md` first. The docs are the source of truth; a suggestion that contradicts them gets rejected, not merged and reconciled later.
- If an assistant generates a large block of scaffolding you didn't ask for (extra abstraction layers, speculative config, unused utility functions), cut it before committing. Smaller and legible beats "complete."