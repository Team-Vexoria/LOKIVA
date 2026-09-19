# Technical Specification: LOKIVA Generative AI Core Engine

**Model Framework:** Google Gemini 1.5 Pro & Gemini 1.5 Flash  
**Execution Context:** Production Hackathon System  
**Target Capabilities:** Spatio-Temporal Itinerary Planning, Vernacular Dialect Translation, Artisan AI Listing Studio, Grounded Lore RAG  

---

## 1. AI Architecture Overview

Commercial trip planners rely on naive "chain of thought" prompts sent to generic LLMs, leading to geographical hallucinations, impossible transit timings, and closed venues. LOKIVA eliminates these pitfalls by using **Structured Constrained Prompting** where Gemini operates on pre-verified ground-truth JSON nodes.

```
+-----------------------------------------------------------------------------------------+
|                                  LOKIVA AI GATEWAY                                      |
|                                                                                         |
|  +-----------------------------------------------------------------------------------+  |
|  | Subsystem 1: Spatio-Temporal Constraint Router (Gemini 1.5 Flash)                 |  |
|  | - Takes candidate venues, user hours, budget, accessibility flags                 |  |
|  | - Outputs: Strict JSON timeline with transit buffers and cultural insider tips    |  |
|  +-----------------------------------------------------------------------------------+  |
|                                                                                         |
|  +-----------------------------------------------------------------------------------+  |
|  | Subsystem 2: Artisan Vernacular Audio & Text Bridge (Gemini 1.5 Multimodal)        |  |
|  | - Ingests regional audio/text (Hindi, Marwari, Bengali, Tamil)                   |  |
|  | - Outputs: Professional English inquiry + Romanized phonetic dialect translation  |  |
|  +-----------------------------------------------------------------------------------+  |
|                                                                                         |
|  +-----------------------------------------------------------------------------------+  |
|  | Subsystem 3: Artisan AI Listing Studio (Gemini 1.5 Flash)                          |  |
|  | - Ingests 3 simple inputs from rural host                                         |  |
|  | - Outputs: Global-standard cultural listing, heritage lore, pricing, policy      |  |
|  +-----------------------------------------------------------------------------------+  |
|                                                                                         |
|  +-----------------------------------------------------------------------------------+  |
|  | Subsystem 4: Grounded Heritage Lore RAG Concierge (Gemini 1.5 Pro)                |  |
|  | - Ingests user etiquette / ritual query + vector similarity search on corpus      |  |
|  | - Outputs: Verified cultural advice with zero factual hallucinations              |  |
|  +-----------------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Subsystem 1: Dynamic Spatio-Temporal Itinerary Solver

### 2.1 Prompt Engineering Contract
* **Model:** `gemini-1.5-flash`
* **Temperature:** `0.2` (Deterministic, low variance)
* **Response Format:** `application/json`

#### System Instruction
```text
You are the LOKIVA Chief Spatio-Temporal Cultural Navigator for India.
You receive a strictly validated list of candidate cultural places within a specific city enclave.
Every candidate has a known duration, entry price, geographic coordinate, and accessibility flags.

YOUR MANDATE:
1. Synthesize a sequential, minute-by-minute itinerary fitting precisely within the user's available hours.
2. NEVER introduce venues that are not present in the provided candidates array.
3. Calculate realistic transit buffers between stops: minimum 15 minutes for walking within 1km, 25 minutes for vehicular transit between 1km and 5km.
4. Total cumulative time (stops + transit) MUST NOT exceed the user's total available minutes.
5. Total ticket fees MUST NOT exceed the user's budget.
6. Provide an authentic, non-generic "Insider Tip" for every stop (e.g. photography vantage point, ritual etiquette, or authentic food stall nearby).
7. Respond ONLY with valid JSON conforming to the DayPlanResponse schema.
```

#### Complete Few-Shot Prompt & Response Example

**User Prompt Payload:**
```json
{
  "city": "Jaipur",
  "available_hours": 3.5,
  "budget": 1200,
  "traveler_type": "Family with Grandparents",
  "accessibility_prefs": {
    "low_walking": true,
    "wheelchair": false
  },
  "interests": ["heritage", "artisan_craft", "food"],
  "candidates": [
    {
      "id": 1094,
      "title": "Hawa Mahal (Palace of Winds)",
      "approx_duration_mins": 45,
      "price": 50,
      "category": "Heritage & History",
      "lat": 26.9239,
      "lng": 75.8267
    },
    {
      "id": 781,
      "title": "Juneja Art Gallery",
      "approx_duration_mins": 50,
      "price": 0,
      "category": "Heritage & History",
      "lat": 26.9085,
      "lng": 75.8012
    },
    {
      "id": 4003,
      "title": "Nahargarh Fort Sunset Point",
      "approx_duration_mins": 120,
      "price": 50,
      "category": "Heritage & History",
      "lat": 26.9372,
      "lng": 75.8155
    }
  ]
}
```

**Gemini Expected Output Payload:**
```json
{
  "title": "Jaipur Heritage & Royal Miniature Art Micro-Circuit",
  "summary": "A relaxed, low-walking cultural exploration curated for family comfort, pairing the architectural facade of the Palace of Winds with contemporary Rajasthani canvas masters.",
  "total_duration_mins": 190,
  "total_cost": 50,
  "total_walking_meters": 420,
  "accessibility_score": "High (Level walking surfaces, elevator at gallery)",
  "stops": [
    {
      "sequence": 1,
      "experience_id": 1094,
      "title": "Hawa Mahal (Palace of Winds)",
      "time_slot": "09:30 AM - 10:15 AM",
      "allocated_mins": 45,
      "cost": 50,
      "insider_tip": "View the honeycomb facade from the first-floor cafe across the street to avoid roadside pedestrian crowds and steps.",
      "transit_to_next": {
        "mode": "Cab / Auto-rickshaw",
        "duration_mins": 20,
        "distance_km": 3.8
      }
    },
    {
      "sequence": 2,
      "experience_id": 781,
      "title": "Juneja Art Gallery",
      "time_slot": "10:35 AM - 11:35 AM",
      "allocated_mins": 60,
      "cost": 0,
      "insider_tip": "Ask the curator for the revivalist miniature section; seated viewing lounges are available for seniors.",
      "transit_to_next": null
    }
  ],
  "cultural_takeaway": "Understanding how Rajput architectural cooling principles connect with contemporary desert color palettes."
}
```

---

## 3. Subsystem 2: Artisan Vernacular Audio & Text Bridge

### 3.1 Problem Statement
Rural craftsmen (e.g. Rogan textile artists in Nirona, Kutch or Dokra brass casters in Bikna, West Bengal) speak local dialects. International travelers and non-native domestic tourists cannot communicate directly, forcing them to rely on commercial middlemen who extract 40–50% commission cuts.

### 3.2 Solution Architecture
* **Frontend:** MediaRecorder API captures 16kHz audio blobs in browser -> sends base64 to `/api/ai/vernacular-translate`.
* **Gemini 1.5 Multimodal:** Processes audio directly:
  1. Transcribes regional dialect (Hindi, Marwari, Bhojpuri, Gujarati, Bengali, Tamil, etc.).
  2. Translates to clean, polite English with cultural idiom explanations.
  3. Translates English traveler replies into colloquial Hindi + Romanized transliteration (Hinglish) so both parties understand nuances.

#### Gemini Translation Prompt Template
```text
You are the LOKIVA Vernacular Cultural Bridge.
You are facilitating a conversation between a local Indian heritage artisan/host and a traveler.

TRANSLATION RULES:
1. Translate accurately while preserving regional hospitality terms (e.g. "Pranam", "Khamma Ghani", "Aadab", "Dhanyavad").
2. When the artisan speaks in Hindi/regional dialect, output:
   - "original_transcript": Exact spoken words.
   - "english_translation": Polished English explanation for traveler.
   - "cultural_context": Any craft-specific nuance (e.g. explaining what "Kadhwa" or "Gharana" means).
3. When traveler replies in English, output:
   - "devanagari_hindi": Polite Devanagari text.
   - "phonetic_romanized": Romanized phonetics for easy reading on phone.
```

---

## 4. Subsystem 3: Artisan AI Listing Studio

### 4.1 Input Specification (Artisan Mobile Console)
Artisan fills 3 conversational fields:
1. `craft_name`: "Kadhwa Silk Sari Weaving"
2. `location`: "Madanpura, Varanasi near old mosque"
3. `price_and_duration`: "₹500 per person, 1.5 hours with tea"

### 4.2 Output Generated by Gemini 1.5 Flash
```json
{
  "title": "Ancient Kadhwa Handloom Silk Weaving Masterclass with the Ansari Guild",
  "tagline": "Discover the centuries-old hand-interlocking Zari technique passed down through 5 generations in Old Kashi",
  "description": "Step into a living heritage handloom workshop in the historic textile quarter of Madanpura. Master weaver Ansari demonstrates the meticulous Kadhwa technique where each gold and silver motif is engraved into pure mulberry silk without floats on the reverse. Enjoy traditional Banarasi adrak chai while observing the rhythmic clatter of wooden pit looms.",
  "category": "Art & Craft",
  "city": "Varanasi",
  "state": "Uttar Pradesh",
  "approx_duration_mins": 90,
  "price": 500,
  "tags": ["silk", "weaving", "varanasi", "kadhwa", "artisan", "handloom"],
  "etiquette_rules": [
    "Please remove shoes before stepping onto the handloom wooden platform.",
    "Photography of loom weaving patterns is welcomed."
  ],
  "take_home": "Woven silk bookmark sample with raw zari thread card."
}
```

---

## 5. Subsystem 4: Deterministic Lore RAG Concierge

### 5.1 Knowledge Corpus Design
A pre-indexed, vector-embedded JSON corpus (`server/src/data/heritage_corpus.json`) containing:
* Temple and monument dress codes (e.g., leather item bans at Akshardham and Meenakshi Temple).
* Camera, mobile phone, and footwear rules.
* Optimal lighting and twilight times for ghats and stepwells.
* Tipping, bargaining, and community respectful photography norms.

### 5.2 Anti-Hallucination Guardrails
If user queries: *"Can I fly a drone over Taj Mahal at night?"*
Gemini evaluates grounded lore:
* Flag: Strictly prohibited under Archaeological Survey of India (ASI) regulations; red security zone.
* Returns clear, authoritative legal answer with zero ambiguity.
