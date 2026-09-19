# Frontend UI/UX Design System & Landing Page Engineering Specification

**Design Standards:** Architectural Digest Heritage Aesthetic + Stripe/Linear Motion Polish  
**Core Frameworks:** React 18, TypeScript, Tailwind CSS, Framer Motion, GSAP ScrollTrigger  
**Typography Hierarchy:**  
- Display & Headings: `Cinzel` / `Playfair Display` (Royal Heritage Tone)  
- Body & Controls: `Plus Jakarta Sans` / Inter (Clean Readability)  
- Metrics & Technical Metadata: `JetBrains Mono` (High-density Monospace)  

---

## 1. Landing Page Narrative Flow (Anti-Congested Editorial)

Commercial websites fail by dumping hundreds of items onto the hero screen. LOKIVA adopts an **editorial narrative progression** that tells a compelling story, demonstrates value visually through device frame mockups, and guides the traveler smoothly into the experience:

```
[Level 1: Storytelling Hero] 
  "Discover India Not Found in Guidebooks" + 3-Parameter Quick Context Bar
       │
       ▼ (Scroll Trigger 1)
[Level 2: Dual Device Frame Showcase]
  Desktop macOS Frame: Live Interactive 4-Hour Itinerary Circuit
  Mobile iPhone Frame: Live Vernacular Voice Translation with Rural Artisan
       │
       ▼ (Scroll Trigger 2)
[Level 3: 3-Pillar Value Bento Grid]
  1. Spatio-Temporal Precision | 2. Direct Grassroots Guilds | 3. Zero Hallucinations
       │
       ▼ (Scroll Trigger 3)
[Level 4: Curated Pan-India Cultural Catalog Preview]
  30 Ground-Truth Verified Places with Filter Pills & Lokiva Moments Carousel
       │
       ▼ (Scroll Trigger 4)
[Level 5: The Artisan Empowerment Manifesto & Provider CTA]
       │
       ▼
[Level 6: Interactive Cultural FAQ & Footer]
```

---

## 2. High-Resolution Device Frame Mockup Specifications

### 2.1 The Desktop Browser Frame (macOS Metallic Shell)
* **Visual Styling:**
  - Outer Wrapper: `bg-slate-900/5 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.15)]`
  - Window Header: 3 macOS window control circles (Red `#EF4444`, Amber `#F59E0B`, Green `#10B981`) followed by a clean URL pill `https://lokiva.com/jaipur/live-circuit`.
* **Internal Graphic Preview (High-Res Render):**
  - Displays the **4-Hour Jaipur Heritage Itinerary**:
    - Step 1: Hawa Mahal (Facade & Honeycomb photography).
    - Step 2: Transit via E-rickshaw (15 min buffer).
    - Step 3: Juneja Art Gallery (Contemporary Rajput canvas masters).
  - Floating badges: `Step-Free Entry Verified`, `Total Budget: ₹400`, `Time Remaining: 45 mins`.

### 2.2 The Mobile Device Frame (iPhone 16 Pro Graphic Preview)
* **Visual Styling:**
  - Dynamic Island pill cutout at top.
  - Slim 4px matte black outer bezel with realistic glass glare.
  - Tilted at a subtle `-4deg` angle overlapping the bottom-right corner of the desktop frame.
* **Internal Graphic Preview (High-Res Render):**
  - Displays the **Artisan Voice Translation Interface**:
    - Top: Artisan Profile (Ramswaroop Khatri, Master Rogan Artist, Kutch).
    - Speech Bubble (Hindi): *"हम प्राकृतिक रंगों और उबले हुए अरंडी के तेल से यह कला बनाते हैं।"*
    - Audio waveform animation indicator.
    - AI Live Translation Card (English): *"We hand-craft this art using natural stone pigments and boiled castor-oil paste. No stencil or brush is ever used."*
    - Quick Action: `[ Book 1-Hour Workshop - ₹600 ]`.

---

## 3. Preserved Architecture & Visual Guardrails

1. **Top Navbar Unchanged:**
   - The desktop persona switcher (`Traveler Flow`, `Provider Console`, `Admin Dashboard`).
   - The mobile slide-out drawer menu.
   - The verified user state (`Piyush Kumar`).
   - All active CSS hover transitions and font classes are preserved verbatim.
2. **Zero Image Distortion:**
   - All verified image links from `userVerifiedPlacesData.ts` remain intact with `object-cover` and rounded aspect containers.

---

## 4. Simulated Checkout & Pass Generation Workflow

```
[Click "Book Slot"] 
        │
        ▼
[Step 1: Modal Traveler Details & Time Slot Selection]
        │
        ▼
[Step 2: Simulated UPI / Razorpay Payment Modal]
  - Animated Dynamic QR Code (Simulating GPay / PhonePe / Paytm)
  - Realistic 1.5s verification spinner with green checkmark chime
        │
        ▼
[Step 3: Digital Heritage Ticket Pass Generation]
  - High-res printable pass with dynamic cryptographic QR code
  - Google Maps GPS coordinates to venue doorstep
  - Local dress code & photography rules
  - Direct WhatsApp link to artisan host
```
