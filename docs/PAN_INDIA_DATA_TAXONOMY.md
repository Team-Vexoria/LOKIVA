# Pan-India Ground-Truth Data Curation Protocol & Taxonomy Guide

**Scope:** 28 Indian States + 8 Union Territories = 36 Regional Entities  
**Target:** 1,080 Verified Ground-Truth Cultural Experiences  
**Execution Team:** 5-Member Engineering & Curation Squad  
**Milestone Deadline:** Sept 24, 2026 (Pre-Finale Data Lock)  

---

## 1. Mathematical Workload & Productivity Formula

To ensure LOKIVA presents a deeply populated, genuine platform to hackathon judges without relying on generic or hallucinated dummy data, the team executes this exact mathematical plan:

$$\text{Total Places Target} = 36 \text{ Entities} \times 30 \text{ Places/Entity} = 1,080 \text{ Verified Experiences}$$

$$\text{Per Member Allocation} = \frac{1,080 \text{ Places}}{5 \text{ Members}} = 216 \text{ Places per Member}$$

$$\text{Daily Output Rate (5 Days)} = \frac{216 \text{ Places}}{5 \text{ Days}} = 43.2 \text{ Places/Day/Member}$$

$$\text{Hourly Pacing (8-Hour Day)} = \frac{43.2 \text{ Places}}{8 \text{ Hours}} \approx 5.4 \text{ Places/Hour per Member}$$

*At a pace of one verified place every 11 minutes, a single member easily completes their quota of 43 places per day.*

---

## 2. Team Member Regional Assignment Matrix

### Member 1: North Heritage Belt (216 Places)
1. **Rajasthan** (Jaipur, Jodhpur, Udaipur, Jaisalmer, Pushkar) — 36 Places
2. **Delhi (NCT)** (Old Delhi, Central, Mehrauli, Nizamuddin) — 36 Places
3. **Uttar Pradesh** (Varanasi, Agra, Lucknow, Mathura, Ayodhya) — 36 Places
4. **Punjab** (Amritsar, Patiala, Anandpur Sahib) — 30 Places
5. **Haryana** (Kurukshetra, Pinjore, Surajkund) — 24 Places
6. **Himachal Pradesh** (Shimla, Kangra, Spiti, Dharamshala) — 30 Places
7. **Chandigarh (UT)** (Capitol Complex, Rock Garden, Rose Garden) — 24 Places

### Member 2: West & Central Gateway (216 Places)
1. **Maharashtra** (Mumbai, Pune, Aurangabad/Chhatrapati Sambhajinagar, Nashik, Kolhapur) — 40 Places
2. **Gujarat** (Ahmedabad, Kutch/Bhuj, Vadodara, Patan, Sidhpur) — 40 Places
3. **Goa** (Old Goa, Fontainhas, Divar Island, Ponda Spices) — 32 Places
4. **Madhya Pradesh** (Khajuraho, Gwalior, Orchha, Ujjain, Mandu) — 40 Places
5. **Chhattisgarh** (Bastar tribal crafts, Sirpur, Jagdalpur) — 32 Places
6. **Dadra & Nagar Haveli and Daman & Diu (UT)** — 32 Places

### Member 3: South Classical Corridor (216 Places)
1. **Karnataka** (Hampi, Mysore, Bengaluru, Badami, Coorg) — 40 Places
2. **Tamil Nadu** (Madurai, Thanjavur, Chettinad, Chennai, Kanchipuram) — 42 Places
3. **Kerala** (Fort Kochi, Alleppey, Wayanad, Thrissur, Aranmula) — 42 Places
4. **Telangana** (Hyderabad, Warangal, Pochampally) — 32 Places
5. **Andhra Pradesh** (Lepakshi, Tirupati, Amaravati, Machilipatnam) — 32 Places
6. **Puducherry (UT)** (White Town, Auroville, Bahour) — 28 Places

### Member 4: East & Himalayan Belt (216 Places)
1. **West Bengal** (Kolkata, Shantiniketan, Bishnupur, Darjeeling, Murshidabad) — 42 Places
2. **Odisha** (Puri, Konark, Raghurajpur heritage craft village, Bhubaneswar) — 38 Places
3. **Bihar** (Nalanda, Bodh Gaya, Rajgir, Madhubani village) — 34 Places
4. **Jharkhand** (Deoghar, Hazaribagh Sohrai painting villages) — 26 Places
5. **Uttarakhand** (Rishikesh, Almora, Kausani, Haridwar, Binsar) — 36 Places
6. **Jammu & Kashmir (UT)** (Srinagar Old City, Pahalgam, Gulmarg) — 24 Places
7. **Ladakh (UT)** (Leh Old Town, Hemis, Alchi, Thiksey) — 16 Places

### Member 5: Northeast Seven Sisters & Island Territories (216 Places)
1. **Assam** (Majuli Island mask making, Sualkuchi silk, Kaziranga) — 36 Places
2. **Meghalaya** (Shillong, Mawlynnong, Cherrapunji root bridges) — 30 Places
3. **Sikkim** (Gangtok Thangka painting, Rumtek, Yuksom) — 30 Places
4. **Arunachal Pradesh** (Tawang, Ziro Apatani valley, Dirang) — 28 Places
5. **Nagaland** (Kohima heritage, Kisama, Khonoma green village) — 26 Places
6. **Manipur** (Imphal Ima Keithel women's market, Loktak, Andro pottery) — 24 Places
7. **Mizoram & Tripura** (Aizawl, Reiek, Agartala Ujjayanta Palace, Unakoti) — 24 Places
8. **Andaman & Nicobar Islands (UT)** (Cellular Jail, Ross Island, Havelock) — 18 Places

---

## 3. Strict 3-Tier Entity Breakdown (30 Places per State)

For every assigned state, members must maintain this exact balance:

* **Tier 1: Iconic Capital / Major Metro Enclave (14 Places)**
  - 6 Historic & Architectural Monuments
  - 4 Authentic Food & Culinary Trails (historic sweetmakers, iconic cafes, spice markets)
  - 2 Music, Dance or Spiritual Evening Rituals
  - 2 Nature / Scenic Promenades
* **Tier 2: Living Heritage & Craft District (10 Places)**
  - 4 Master Artisan / Guild Workshops (e.g. handloom weaving, brass casting, pottery)
  - 3 Sacred Stepwells / Ancient Shrines
  - 3 Traditional Flea Walks & Bazaars
* **Tier 3: Off-Beat Hidden Gems (6 Places)**
  - Lesser-known sanctuaries, forest monastic retreats, or GI-tagged craft hamlets.

---

## 4. Universal Experience Data Schema (JSON Contract)

Each curated experience must strictly populate this interface:

```typescript
export interface Experience {
  id: number;                          // Unique 4-digit integer
  title: string;                       // Full official name with descriptors
  tagline: string;                     // 1-line crisp poetic summary (max 120 chars)
  description: string;                 // 2-3 sentences of deep cultural context
  category: 
    | 'Heritage & History'
    | 'Art & Craft'
    | 'Food & Culinary'
    | 'Spiritual & Wellness'
    | 'Nature & Wildlife'
    | 'Music & Dance';
  city: string;                        // Official city/district name
  state: string;                       // Official State / UT name
  area_name: string;                   // Neighborhood, ward or landmark road
  latitude: number;                    // Float coordinate (e.g. 26.9239)
  longitude: number;                   // Float coordinate (e.g. 75.8267)
  price: number;                       // In INR (0 if free admission)
  approx_duration_mins: number;        // Realistic visit duration (e.g. 45, 60, 90)
  image_url: string;                   // Primary high-res direct image URL
  image_urls: string[];                // Array containing primary + secondary URLs
  is_active: boolean;                  // Always true for verified places
  wheelchair_accessible: boolean;      // Ground-verified ramp or level entry
  low_walking: boolean;                // True if total walking < 500m
  is_rain_safe: boolean;               // True if covered/indoor pavilion
  is_hidden_gem: boolean;              // True for off-beat/artisan places
  rating: number;                      // Float between 4.80 and 4.99
  review_count: number;                // Realistic count (e.g. 140 to 2400)
  tags: string[];                      // 4-6 lowercase search tokens
  source: 'user_curated_link';         // Provenance tracking tag
}
```

---

## 5. High-Resolution Verified Image Sourcing Rules

To ensure zero broken links, zero cartoon mockups, and zero irrelevant photos:

1. **Direct Image URLs Only:** Must link directly to a `.jpg`, `.jpeg`, `.png`, or `.webp` file. Never use webpage links (e.g., `jaipurlove.com/place/` is invalid).
2. **Approved Direct Providers:**
   - **Wikimedia Commons Direct Media:** `https://upload.wikimedia.org/wikipedia/commons/...`
   - **Unsplash Verified Direct IDs:** `https://images.unsplash.com/photo-...?auto=format&fit=crop&w=1200&q=80`
   - **Incredible India Official CDN:** `https://s7ap1.scene7.com/is/image/incredibleindia/...`
   - **Local Asset Storage:** `/assets/states/<state_name>.jpg` (stored in `frontend/public/assets/states/`).
3. **Minimum Resolution:** Minimum 1200x800 pixels.
4. **Visual Quality Rule:** The image must show the actual architecture, craft process, or food dish. No cartoon vector art or generic stock corporate images.
