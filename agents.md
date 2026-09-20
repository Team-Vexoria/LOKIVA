<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes: APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev`: verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# LOKIVA STRICT UI & TYPOGRAPHY MANDATES (ZERO TOLERANCE)

1. **NEVER USE DARK BLUE, PURPLE, OR DARK GREEN BACKGROUND FILLS ON CARDS:**
   - Cards and containers MUST remain light Sandstone Ivory (`#FAF7F2`, `#FFFFFF`, `#FAF8F5`) with crisp ink typography (`#12213B`), warm borders (`#E5DFD5`), and terracotta (`#C1443B`) accents.
   - Do NOT create dark block cards like `bg-[#12213B]` in feature grids or comparisons.

2. **NEVER USE CLUNKY BLACK CAPSULE PILLS OR DATED CAPSULES:**
   - Ban `bg-black text-white px-3 py-1 font-mono` and `bg-teal-50` / `bg-clay-50` pastel capsules.
   - Micro-labels must use clean typography: `<span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#C1443B]">`.

3. **STRICT FIGMA TYPOGRAPHY TRIAD:**
   - **Hero & Large Display:** `Josefin Sans` (`font-display`)
   - **Section Headers, Card Titles, Action Buttons:** `Raleway` (`font-heading`)
   - **Body Copy, Narrative Text, Chat:** `Nunito` (`font-sans`)
   - **Telemetry, Prices, Durations, Coordinates:** `JetBrains Mono` (`font-mono`)
   - Strictly ban any serif fonts (`Fraunces`, `Georgia`, `serif`).

4. **DEVICE MOCKUPS INTEGRITY:**
   - iPhone mockup must strictly preserve `w-[310px] min-w-[310px] max-w-[310px]` (never allow it to stretch wide).
   - In-device AI Concierge MUST be interactive: support live messaging, typing states, and quick prompt chips.
   - Camera notch must support swipe/pull-down animation into iOS Notification Center with realistic spring physics.

5. **STRICTLY BAN DOUBLE DASHES (`--`) AND EM DASHES (`-`):**
   - NEVER use double dashes (`--`) or em dashes (`-`) anywhere in UI copy, micro-labels, section descriptions, headers, documentation, or markdown files.
   - Replace with commas, colons, parentheses, clean hyphens (`-`), or rewrite into natural sentences.
