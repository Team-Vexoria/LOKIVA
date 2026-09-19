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

# 5. ⚠️ STRICT MANDATORY DESIGN DIRECTIVES & ANTI-PATTERNS (ZERO TOLERANCE)

### 5.1 Absolute Ban on Dark Color Block Fills (Navy Blue, Purple, Dark Green)
Under no circumstances may any engineer or AI render content cards, feature highlights, or comparison boxes in heavy dark blue (`bg-[#12213B]`), purple, or dark green fills.
* Such dark block fills create jarring, high-friction visual clutter that destroys editorial flow.
* **Mandated Aesthetic:** The entire platform strictly adheres to a **Sandstone Ivory Luxury** surface (`#FAF7F2`, `#FFFFFF`, `#FAF8F5`) with crisp ink typography (`#12213B`), warm architectural borders (`#E5DFD5`, `#D8CFC0`), and selective terracotta accents (`#C1443B`). Highlighted cards must use elevated white surfaces with subtle terracotta borders and soft warm drop shadows.

### 5.2 Absolute Ban on Clunky Black Capsule Pills & Dated Capsule Badges
* Strictly prohibited from using harsh black box pills (`bg-black text-white px-3 py-1 font-mono`) or dated low-opacity pastel pill capsules (`bg-teal-50`, `bg-clay-50`).
* **Mandated Micro-Label Standard:** Use elegant, architectural typographical labels:
  - Format: `<div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#C1443B]" /><span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#C1443B]">Label Name</span></div>`
  - Or refined warm badges: `bg-[#FAF4ED] text-ink-700 text-xs font-heading font-bold px-2.5 py-0.5 rounded-full border border-[#E8DCCB]`.

### 5.3 Strict Typography Triad (Figma Verified Standard)
Every single text element across the application must strictly adhere to the designated role from the approved triad:
1. **Hero & Large Display Titles:** `Josefin Sans` (`font-display font-black tracking-tight`).
2. **Section Subheadings, Card Titles, Step Numbers, Action Buttons:** `Raleway` (`font-heading font-bold` or `font-black`).
3. **Body Text, Narrative Copy, Itinerary Descriptions, Chat Messages:** `Nunito` (`font-sans font-medium leading-relaxed`).
4. **Telemetry, Prices, Durations, Coordinates:** `JetBrains Mono` (`font-mono font-bold`).
* Absolutely NO serif fonts (`Fraunces`, `Georgia`, `Playfair`) or generic thin system fonts may ever be introduced.

### 5.4 Realistic iPhone 16 Pro Dimensions & Interactive Chat Standards
* **Strict Physical Dimensions:** The iPhone mockup must NEVER expand or stretch horizontally. It is strictly locked to `w-[310px] min-w-[310px] max-w-[310px]` with an inner screen height of `550px` (~19.5:9 authentic ratio).
* **Live In-Device AI Concierge Chat:** The phone screen is NOT static marketing text. Users must be able to directly chat with the AI Concierge by typing in the message input or tapping interactive quick query chips, receiving animated real-time guidance and actionable circuit buttons.
* **Camera Notch Swipe-Down Gesture:** Pulling down or clicking the top camera notch / Dynamic Island must smoothly trigger the iOS Control & Notification Shade with spring physics (`initial={{ y: '-100%' }} animate={{ y: 0 }}`), displaying real-time transit alerts, guild confirmations, and UPI tickets.
* **Hardware Notch Integrity:** The Dynamic Island is a pure hardware sensor cutout. Never render text or logos inside the camera pill.

---

<div align="center">
  <sub>DOC-03-FE-001 · LOKIVA Frontend Architecture Specification</sub>
</div>
