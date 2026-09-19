# LOKIVA — Role-Based Access Control (RBAC) Matrix

**Project:** LOKIVA — Autonomous Cultural Experience Engine  
**Document Code:** DOC-03-RBAC-001  
**Target Milestone:** National Hackathon 2-Day Offline Finale (Sept 26–27, 2026)  
**Status:** Approved Access Control Specification  

---

# 1. Role Definitions

1. **`TRAVELER`:** Standard authenticated cultural explorer. Default demo session: **Piyush Kumar** (`piyush@lokiva.com`).
2. **`ARTISAN_HOST`:** Verified master craftsperson or workshop guide hosting travelers.
3. **`GUILD_MASTER`:** Lead coordinator of a multi-artisan craft cluster or cooperative.
4. **`ADMIN`:** Core engineering and verification team with unrestricted platform authority.

---

# 2. Granular Permissions Matrix

| Domain | Action / Capability | `TRAVELER` | `ARTISAN_HOST` | `GUILD_MASTER` | `ADMIN` |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Catalog** | Read Experience Catalog (1,080 Places) | Allow | Allow | Allow | Allow |
| | Create New Verified Heritage Place | Deny | Deny | Deny | Allow |
| | Edit Verified Venue Metadata | Deny | Deny | Deny | Allow |
| **Itinerary** | Run Spatio-Temporal Constraint Solver | Allow | Allow | Allow | Allow |
| | Save Itinerary to Profile / IndexedDB | Allow | Allow | Allow | Allow |
| **Marketplace**| Access 3-Prompt AI Listing Studio | Deny | Allow | Allow | Allow |
| | Record Vernacular Audio Note | Deny | Allow | Allow | Allow |
| | Edit Workshop Seat Capacity & Fee | Deny | Allow (Own) | Allow (Cluster)| Allow |
| | View Incoming Workshop Booking Roster | Deny | Allow (Own) | Allow (Cluster)| Allow |
| **Checkout** | Execute Simulated Dynamic UPI Payment | Allow | Allow | Allow | Allow |
| | Issue Cryptographic QR Ticket Pass | Allow (Own) | Deny | Deny | Allow (All)|
| | Scan / Verify Traveler QR Pass at Gate | Deny | Allow (Own) | Allow (Cluster)| Allow |
| **System** | Audit Image CDN Hashes & Resolution | Deny | Deny | Deny | Allow |
| | Inspect Gemini API Token Consumption | Deny | Deny | Deny | Allow |

---

<div align="center">
  <sub>DOC-03-RBAC-001 · LOKIVA Role-Based Access Control Specification</sub>
</div>
