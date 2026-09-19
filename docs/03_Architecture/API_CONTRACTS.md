# LOKIVA — REST API Contract & Endpoint Payloads

**Project:** LOKIVA — Autonomous Cultural Experience Engine  
**Document Code:** DOC-03-API-001  
**Target Milestone:** National Hackathon 2-Day Offline Finale (Sept 26–27, 2026)  
**Status:** Approved API Contract Specification  

---

# 1. Global Protocol & Standards

* **Base URL:** `https://lokiva.onrender.com/api` (Production) / `http://localhost:5000/api` (Development)
* **Content-Type:** `application/json; charset=utf-8`
* **Authentication:** `Authorization: Bearer <JWT_TOKEN>` (Required for protected provider & order routes)

---

# 2. Experience & Catalog Endpoints

### 2.1 Fetch Experiences (`GET /api/experiences`)
* **Query Parameters:**
  - `state` (string, optional): e.g. `"Uttar Pradesh"`
  - `category` (string, optional): e.g. `"Heritage & History"`
  - `maxBudget` (number, optional): e.g. `500`
  - `wheelchair` (boolean, optional): `true`
* **Response 200 OK:**
```json
{
  "status": "success",
  "count": 1,
  "data": [
    {
      "id": 737,
      "title": "Raja Ghat",
      "city": "Varanasi",
      "state": "Uttar Pradesh",
      "region": "North",
      "category": "Heritage & History",
      "tier": "Tier 2",
      "description": "An imposing stone ghat built in 1720 by Raja Balwant Singh featuring grand riverfront arches and generational stone carving.",
      "insiderLore": "Visit the southern stairs at 16:30 where classical musicians tune tanpuras before dusk.",
      "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Raja_Ghat%2C_Varanasi.JPG/250px-Raja_Ghat%2C_Varanasi.JPG",
      "admissionFee": 0,
      "timeRequiredMinutes": 50,
      "coordinates": { "lat": 25.3082, "lng": 83.0076 },
      "accessibility": {
        "wheelchairAccessible": true,
        "stepFreeAccess": false,
        "lowWalkingIntensity": true,
        "rainSafeIndoor": false
      }
    }
  ]
}
```

---

# 3. Spatio-Temporal Route Solver Endpoints

### 3.1 Solve Itinerary (`POST /api/itinerary/plan`)
* **Request Body:**
```json
{
  "city": "Varanasi",
  "state": "Uttar Pradesh",
  "availableHours": 3.5,
  "maxBudgetINR": 600,
  "wheelchairRequired": false,
  "originCoordinates": { "lat": 25.3176, "lng": 82.9739 }
}
```
* **Response 200 OK:**
```json
{
  "status": "success",
  "itinerary": {
    "totalDurationMinutes": 210,
    "totalCostINR": 250,
    "summary": "Curated 3.5-hour cultural walk through southern ghats and Madanpura silk handlooms.",
    "waypoints": [
      {
        "order": 1,
        "placeId": 737,
        "title": "Raja Ghat",
        "arrivalTime": "15:30",
        "departureTime": "16:20",
        "dwellMinutes": 50,
        "transitToNextMinutes": 15,
        "transitMode": "Walking",
        "insiderTip": "Catch the classical musicians tuning their tanpuras on the stone steps before 17:00."
      }
    ]
  }
}
```

---

# 4. Transactional Simulator & Pass Endpoints

### 4.1 Create UPI Order (`POST /api/orders/checkout-sim`)
* **Request Body:**
```json
{
  "placeId": 737,
  "amountINR": 350,
  "travelerName": "Piyush Kumar",
  "travelerEmail": "piyush@lokiva.com"
}
```
* **Response 200 OK:**
```json
{
  "orderId": "ORD-2026-9812",
  "status": "PENDING",
  "upiPayload": "upi://pay?pa=lokiva.artisan@icici&pn=Lokiva%20Cultural&am=350&tr=ORD-2026-9812"
}
```

---

<div align="center">
  <sub>DOC-03-API-001 · LOKIVA REST API Contract Specification</sub>
</div>
