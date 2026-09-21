# LOKIVA Engineering & Product Guidelines

> **MANDATORY RULE:** Zero Hollow UI. Never render purely cosmetic buttons or action controls without real `onClick` handlers, state-modifying logic, and observable DOM/data updates.

---

## 1. Zero Hollow UI Directive
- Every button, tab, toggle pill, modal trigger, and action control rendered in the UI must be wired directly to real, reactive state handlers (Zustand, React state, or URL params).
- Clicking any filter, replanner mode, or day tab must immediately trigger observable DOM/data updates, re-calculating timings, routes, metrics, and cards.
- Static mock placeholders without functional callbacks are strictly prohibited in production.

---

## 2. Zero Tolerance Typography & Formatting Mandates
- **Zero Double Dashes (`--`) and Zero Em Dashes (`—`)**:
  - Never use double dashes or em dashes anywhere in UI copy, micro-labels, headers, markdown, or code comments.
  - Use commas, colons, parentheses, clean single hyphens (`-`), or natural sentences instead.
- **Strict Figma Typography Triad**:
  - Display / Hero: `Josefin Sans` (`font-display`)
  - Section Headers & Buttons: `Raleway` (`font-heading`)
  - Body Copy & Narrative: `Nunito` (`font-sans`)
  - Telemetry, Timings, Coordinates: `JetBrains Mono` (`font-mono`)
  - No serif fonts.
- **Sandstone Ivory Theme**:
  - Cards and containers remain Sandstone Ivory (`#FAF7F2`, `#FFFFFF`, `#FAF8F5`) with crisp ink typography (`#12213B`), warm borders (`#E5DFD5`), and terracotta (`#C1443B`) / marigold (`#FFC067`) accents.
  - Never use dark block card fills (`bg-[#12213B]`).
