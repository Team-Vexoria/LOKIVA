# LOKIVA — Security Architecture & Threat Model

**Project:** LOKIVA — Autonomous Cultural Experience Engine  
**Document Code:** DOC-03-SEC-001  
**Target Milestone:** National Hackathon 2-Day Offline Finale (Sept 26–27, 2026)  
**Status:** Approved Security Architecture Specification  

---

# 1. Threat Modeling (STRIDE Methodology)

| Threat Category | Potential Attack Vector | LOKIVA Architectural Countermeasure |
| :--- | :--- | :--- |
| **Spoofing** | Forged traveler identity or fake QR admission passes. | Cryptographic HMAC-SHA256 signature on all digital ticket passes; verified JWT claims. |
| **Tampering** | Modifying admission prices or coordinates in transit. | Immutable database constraints; server-side price validation prior to order creation. |
| **Repudiation** | Denying an executed artisan booking or payout. | Append-only order audit log recording transaction hashes and timestamps. |
| **Information Disclosure** | Exposing rural artisan personal phone numbers or traveler emails. | Masked contact links; direct WhatsApp routing using pre-formatted encoded parameters. |
| **Denial of Service** | Flooding Gemini 1.5 endpoints to exhaust API quotas. | IP-based rate limiting (100 req/15min) + in-memory response caching for popular itineraries. |
| **Elevation of Privilege**| Unauthorized traveler editing artisan workshop rosters. | Express middleware enforcing strict RBAC verification on all `/api/provider/*` routes. |

---

# 2. Cryptographic Digital Ticket Pass Signature

Every digital pass issued upon simulated UPI checkout contains a tamper-evident cryptographic signature:

```text
Payload: { orderId: "ORD-2026-9812", traveler: "Piyush Kumar", venueId: 737, timestamp: 1789815000 }
                       │
                       ▼
HMAC-SHA256(Payload, SERVER_SECRET_KEY)
                       │
                       ▼
Verification Hash: "8f7e2a1b9c4d5e6f708192a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3"
```

Any alteration to the ticket name, order ID, or venue in the QR code causes instantaneous signature mismatch during scanning.

---

# 3. Content Security Policy (CSP) & CDN Allowlist

To prevent malicious cross-site script injection and ensure high image availability:
```http
Content-Security-Policy: default-src 'self'; img-src 'self' data: https://images.unsplash.com https://upload.wikimedia.org; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;
```

---

<div align="center">
  <sub>DOC-03-SEC-001 · LOKIVA Security Architecture Specification</sub>
</div>
