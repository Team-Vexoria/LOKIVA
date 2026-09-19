# LOKIVA — Backend Architecture Specification

**Project:** LOKIVA — Autonomous Cultural Experience Engine  
**Document Code:** DOC-03-BE-001  
**Target Milestone:** National Hackathon 2-Day Offline Finale (Sept 26–27, 2026)  
**Status:** Approved Backend Engineering Blueprint  

---

# 1. Architectural Style & Runtime

The LOKIVA backend is implemented as a **Node.js (v18.18+ / v20.x LTS) Express application** structured as a modular monolith:
* **Framework:** Express 4.19+ with TypeScript / ES Modules.
* **Architecture:** Controller-Service-Repository pattern.
* **Process Boundary:** Single deployable HTTP server process running on port 5000 (local) or edge container (production).

```text
SERVER DIRECTORY & MODULE BOUNDARY
server/src/
├── controllers/                     # Request parsing & HTTP response formatting
│   ├── aiController.js              # Gemini 1.5 solver & translation handlers
│   ├── experienceController.js      # Faceted catalog & spatial query handlers
│   ├── orderController.js           # UPI checkout simulation & QR pass handlers
│   └── authController.js            # JWT session & profile handlers
├── routes/                          # Express router declarations
│   ├── ai.js                        # /api/ai endpoints
│   ├── experiences.js               # /api/experiences endpoints
│   ├── orders.js                    # /api/orders endpoints
│   └── auth.js                      # /api/auth endpoints
├── middleware/                      # Cross-cutting HTTP interceptors
│   ├── authMiddleware.js            # JWT bearer token verification
│   ├── rateLimiter.js               # In-memory IP rate limiter
│   └── errorHandler.js              # Centralized JSON error serialization
├── services/                        # Business logic & external SDKs
│   ├── geminiService.js             # @google/generative-ai interface
│   └── spatialService.js            # Haversine & transit buffer calculator
├── data/                            # Master ground-truth JSON datasets
│   └── pan_india_experiences.json   # 1,080 verified experiences
└── server.js                        # HTTP listener initialization
```

---

# 2. Middleware & Cross-Cutting Concerns

### 2.1 Centralized Error Handling Taxonomy
Every error thrown in the system is captured by `errorHandler.js` and formatted to standard JSON:
```json
{
  "error": {
    "code": "INVALID_TIME_CONSTRAINT",
    "message": "Available time must be between 60 and 720 minutes.",
    "status": 400,
    "timestamp": "2026-09-19T18:18:00.000Z"
  }
}
```

| HTTP Status | Error Code | Description |
| :--- | :--- | :--- |
| **400 Bad Request** | `INVALID_PAYLOAD` | Missing required coordinates or duration bounds. |
| **401 Unauthorized**| `TOKEN_EXPIRED` | Bearer token invalid or missing. |
| **404 Not Found** | `VENUE_NOT_FOUND` | Requested experience ID does not exist. |
| **429 Too Many Req**| `RATE_LIMIT_EXCEEDED`| Client exceeded 100 requests per 15-minute window. |
| **503 Unavailable** | `GEMINI_UNAVAILABLE`| Upstream AI timeout; fallback heuristics activated. |

### 2.2 Authentication & Local Fallback Session
To ensure zero friction during hackathon presentations:
* The backend exposes `POST /api/auth/demo-login/:role`.
* Automatically creates an authentic signed JWT for **Piyush Kumar** (`piyush@lokiva.com`).
* Eliminates the risk of OAuth redirect failures on venue networks.

---

<div align="center">
  <sub>DOC-03-BE-001 · LOKIVA Backend Architecture Specification</sub>
</div>
