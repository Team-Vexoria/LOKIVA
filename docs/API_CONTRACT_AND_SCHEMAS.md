# REST API Specification & Endpoint Schema Contract

**Base URL:** `https://lokiva-backend.onrender.com/api` (Production) / `http://localhost:5000/api` (Local)  
**Content-Type:** `application/json; charset=utf-8`  
**Authentication:** Bearer Token (`Authorization: Bearer <token>`)  

---

## 1. Authentication & Session Services (`/api/auth`)

### 1.1 Demo & Fallback Login
* **Method:** `POST`
* **Route:** `/api/auth/demo-login/:role`
* **URL Params:** `role = 'traveler' | 'provider' | 'admin'`
* **Request Body:**
```json
{
  "full_name": "Piyush Kumar",
  "email": "piyush@lokiva.com"
}
```
* **Success Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "piyush@lokiva.com",
    "full_name": "Piyush Kumar",
    "role": "traveler",
    "is_active": true,
    "created_at": "2026-09-01T12:00:00.000Z",
    "profile": {
      "traveler_type": "Solo Explorer",
      "group_size": 1,
      "budget": 2500,
      "available_hours": 4,
      "interests": ["culture", "heritage", "food"],
      "location_name": "Jaipur",
      "hotel_lat": 26.9124,
      "hotel_lng": 75.7873
    }
  }
}
```

---

## 2. Experience & Heritage Services (`/api/experiences`)

### 2.1 Faceted Query
* **Method:** `GET`
* **Route:** `/api/experiences`
* **Query Parameters:**
  - `city` (string, optional): e.g., `Jaipur`, `Varanasi`
  - `state` (string, optional): e.g., `Rajasthan`
  - `category` (string, optional): e.g., `Art & Craft`
  - `max_price` (integer, optional): e.g., `1500`
  - `wheelchair` (boolean, optional): `true`
  - `low_walking` (boolean, optional): `true`
  - `is_hidden_gem` (boolean, optional): `true`
  - `search` (string, optional): Search query matching title, tagline, tags
  - `limit` (integer, optional, default: 50)
  - `offset` (integer, optional, default: 0)

* **Success Response (200 OK):**
```json
[
  {
    "id": 1094,
    "title": "Hawa Mahal (Palace of Winds)",
    "tagline": "Iconic 5-story pink honeycomb facade with 953 carved jharokhas",
    "description": "Built in 1799 by Maharaja Sawai Pratap Singh...",
    "category": "Heritage & History",
    "city": "Jaipur",
    "state": "Rajasthan",
    "area_name": "Badi Choupad, Old City",
    "price": 50,
    "rating": 4.91,
    "review_count": 860,
    "approx_duration_mins": 60,
    "image_url": "https://images.unsplash.com/photo-1650530777057-3a7dbc24bf6c?q=80&w=801&auto=format&fit=crop",
    "image_urls": ["https://images.unsplash.com/photo-1650530777057-3a7dbc24bf6c?q=80&w=801&auto=format&fit=crop"],
    "is_active": true,
    "wheelchair_accessible": false,
    "low_walking": true,
    "is_rain_safe": false,
    "is_hidden_gem": false,
    "tags": ["palace", "jaipur", "architecture", "heritage"]
  }
]
```

---

## 3. Generative AI Services (`/api/itinerary` & `/api/ai`)

### 3.1 Dynamic Itinerary Constraint Solver
* **Method:** `POST`
* **Route:** `/api/itinerary/plan`
* **Request Body:**
```json
{
  "city": "Jaipur",
  "available_hours": 4,
  "budget": 2000,
  "traveler_type": "Family with Kids",
  "accessibility_prefs": {
    "wheelchair": false,
    "low_walking": true
  },
  "interests": ["heritage", "art", "food"]
}
```

* **Success Response (200 OK):**
```json
{
  "title": "Jaipur Heritage & Royal Miniature Art Micro-Circuit",
  "summary": "A relaxed cultural exploration curated for family comfort, pairing the architectural facade of the Palace of Winds with contemporary Rajasthani canvas masters.",
  "total_duration_mins": 210,
  "total_cost": 400,
  "total_walking_meters": 550,
  "accessibility_score": "High (Level walking surfaces, minimal stairs)",
  "stops": [
    {
      "sequence": 1,
      "experience_id": 1094,
      "title": "Hawa Mahal (Palace of Winds)",
      "time_slot": "10:00 AM - 10:45 AM",
      "allocated_mins": 45,
      "cost": 50,
      "insider_tip": "Best viewed from the street cafe balcony opposite the facade to avoid crowds.",
      "transit_to_next": {
        "mode": "E-Rickshaw",
        "duration_mins": 15,
        "distance_km": 2.1
      }
    },
    {
      "sequence": 2,
      "experience_id": 781,
      "title": "Juneja Art Gallery",
      "time_slot": "11:00 AM - 12:00 PM",
      "allocated_mins": 60,
      "cost": 0,
      "insider_tip": "Ask for the folk miniature master collection in room 3.",
      "transit_to_next": null
    }
  ],
  "cultural_takeaway": "Understanding Rajput airflow architecture and its influence on folk canvas painting."
}
```

### 3.2 Vernacular Audio & Text Translation
* **Method:** `POST`
* **Route:** `/api/ai/vernacular-translate`
* **Request Body:**
```json
{
  "source_text": "हम 300 साल से यह रोगन कला कर रहे हैं।",
  "source_language": "hi",
  "target_language": "en"
}
```
* **Success Response (200 OK):**
```json
{
  "original": "हम 300 साल से यह रोगन कला कर रहे हैं।",
  "translated": "We have been practicing this Rogan castor-oil textile art for 300 years.",
  "cultural_notes": "Rogan art is an endangered Persian-origin craft preserved by the Khatri family in Kutch, using boiled castor oil paste mixed with natural stone pigments.",
  "phonetic_transliteration": "Hum teen sau saal se yeh Rogan kala kar rahe hain."
}
```

### 3.3 Artisan AI Listing Studio Generator
* **Method:** `POST`
* **Route:** `/api/provider/generate-listing`
* **Request Body:**
```json
{
  "craft_name": "Blue Pottery Tiles & Vases",
  "location": "Sanganer, Jaipur",
  "price_and_duration": "₹600 per person, 1.5 hours"
}
```
* **Success Response (200 OK):**
```json
{
  "title": "Traditional Jaipur Blue Pottery Hand-Glazing Workshop",
  "tagline": "Craft exquisite quartz and natural-gum glazed pottery alongside 4th-generation master artisans in Sanganer",
  "description": "Step inside a family-run heritage pottery courtyard where clay is replaced with a unique blend of powdered quartz, glass, and Multani mitti. Learn the secret cobalt blue glazing technique developed under Maharaja Sawai Ram Singh II, and shape your own traditional floral tile.",
  "category": "Art & Craft",
  "city": "Jaipur",
  "state": "Rajasthan",
  "approx_duration_mins": 90,
  "price": 600,
  "tags": ["blue-pottery", "jaipur", "craft", "sanganer", "workshop"]
}
```

---

## 4. Transactional & Booking Services (`/api/bookings`)

### 4.1 Simulated UPI & Razorpay Checkout
* **Method:** `POST`
* **Route:** `/api/bookings/simulate-checkout`
* **Request Body:**
```json
{
  "experience_id": 1094,
  "booking_date": "2026-09-27",
  "slot_time": "10:00 AM",
  "travelers_count": 2,
  "payment_method": "upi_simulated",
  "traveler_name": "Piyush Kumar",
  "traveler_phone": "+91 9876543210"
}
```
* **Success Response (201 Created):**
```json
{
  "booking_id": "LOK-2026-94812",
  "status": "confirmed",
  "total_amount": 100,
  "payment_hash": "sim_pay_948fbc921",
  "qr_data": "https://lokiva.vercel.app/verify/LOK-2026-94812?sig=84ace81",
  "provider": {
    "business_name": "Hawa Mahal Archaeological Caretaker Guild",
    "whatsapp_url": "https://wa.me/919876543210?text=Hello%20I%20have%20booked%20LOK-2026-94812"
  },
  "etiquette_advisory": "Modest clothing recommended; photography tripod requires ASI permit."
}
```
