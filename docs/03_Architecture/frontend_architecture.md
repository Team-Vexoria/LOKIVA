# LOKIVA — Frontend Architecture & UI/UX Specification

**Project:** LOKIVA — Autonomous Cultural Experience Engine  
**Document Code:** DOC-03-FE-001  
**Target Milestone:** National Hackathon 2-Day Offline Finale (Sept 26–27, 2026)  
**Status:** Approved Frontend Design System & Architecture  

---

# 1. Frontend Runtime & Technology Stack

* **Core Framework:** React 18.3 with StrictMode and Concurrent Features.
* **Build Tooling:** Vite 5.x with ESBuild and Hot Module Replacement ($\le 120\text{ms}$).
* **Type System:** TypeScript 5.0 with strict null checks (`strict: true`).
* **Styling & CSS:** Tailwind CSS 3.4 with custom heritage design tokens.
* **Animation & Physics:** Framer Motion 11.x (micro-interactions) + GSAP 3.12 (ScrollTrigger reveals).
* **Iconography:** Lucide React.

---

# 2. Design Tokens & Visual Hierarchy

### 2.1 Color Palette
```css
:root {
  --color-terracotta: #C85A32;       /* Primary CTA & Brand Ochre */
  --color-twilight-indigo: #1B2A4A;  /* Deep Nocturnal Background */
  --color-sacred-turmeric: #D97706;  /* Accent Badge & Marigold */
  --color-sandstone-ivory: #FBF9F5;  /* Soft Reading Surface */
  --color-slate-dark: #0F172A;       /* High-contrast Typography */
}
```

### 2.2 Typography Hierarchy
* **Display Titles:** `Playfair Display`, `serif` — Literary, timeless, evoking editorial publications.
* **UI Elements & Data:** `Plus Jakarta Sans` or `Inter`, `sans-serif` — Modern geometric legibility.
* **Timestamps & Codes:** `JetBrains Mono`, `monospace`.

---

# 3. Component Hierarchy & Layout Tree

```text
App
└── HomePage
    ├── Navbar (Preserved structure & animations)
    ├── LokivaLandingHero
    │   ├── NarrativeHeadline & ValueProps
    │   └── DeviceMockupSection
    │       ├── MacOsSafariFrame (Faceted explorer preview)
    │       └── IPhone16ProFrame (Minute-by-minute itinerary preview)
    ├── ExperienceSection
    │   ├── FilterSidebar (State, category, budget, wheelchair)
    │   └── ExperienceGrid (Faceted responsive cards)
    ├── ItineraryDrawer (Sliding timeline sheet)
    ├── UpiPaymentModal (Dynamic QR simulator)
    ├── DigitalPassModal (Cryptographic printable voucher)
    └── Footer (36 States Directory)
```

---

# 4. Device Mockup Frame Specifications

### 4.1 macOS Safari Desktop Window
* **Aspect Ratio:** $16:10$ ($1280 \times 800\text{px}$).
* **Frame Features:** Dark titanium header with functional-styled window controls (red, yellow, green), active URL bar showing `lokiva.in/explore?state=Rajasthan`, and responsive scrollable viewport.

### 4.2 iPhone 16 Pro Dynamic Island Frame
* **Aspect Ratio:** $19.5:9$ ($393 \times 852\text{px}$).
* **Frame Features:** Titanium curved bezels, Dynamic Island pill cutout, live status bar (09:41, 5G, 100% battery), and live interactive 3-hour micro-itinerary with auto-rickshaw transit nodes.

---

<div align="center">
  <sub>DOC-03-FE-001 · LOKIVA Frontend Architecture Specification</sub>
</div>
