# LOKIVA — Database Design & Schema Specification

**Project:** LOKIVA — Autonomous Cultural Experience Engine  
**Document Code:** DOC-03-DB-001  
**Target Milestone:** National Hackathon 2-Day Offline Finale (Sept 26–27, 2026)  
**Status:** Approved Database & Persistence Specification  

---

# 1. Entity-Relationship Overview

LOKIVA uses a relational schema (SQLite 3 for development and hackathon demonstration, PostgreSQL 15 for production cloud deployment) mirrored into browser IndexedDB for offline resilience.

```text
ENTITY-RELATIONSHIP TOPOLOGY

  ┌──────────────────┐               ┌──────────────────┐
  │      USERS       │ 1           * │      ORDERS      │
  │ id (PK)          ├───────────────┤ id (PK)          │
  │ email, full_name │               │ user_id (FK)     │
  │ role             │               │ amount_inr       │
  └────────┬─────────┘               │ status (PAID...) │
           │ 1                       └────────┬─────────┘
           │                                  │ 1
           │ *                                │ 1
  ┌────────┴─────────┐               ┌────────┴─────────┐
  │   ITINERARIES    │               │  DIGITAL_PASSES  │
  │ id (PK)          │               │ id (PK)          │
  │ user_id (FK)     │               │ order_id (FK)    │
  │ waypoints_json   │               │ qr_payload_hash  │
  │ total_duration   │               │ print_voucher_url│
  └──────────────────┘               └──────────────────┘
           ▲
           │ *
           │ 1
  ┌────────┴─────────┐ 1           * ┌──────────────────┐
  │   EXPERIENCES    ├───────────────┤  ARTISAN_PROFILES│
  │ id (PK)          │               │ id (PK)          │
  │ title, city      │               │ experience_id(FK)│
  │ state, region    │               │ craft_lineage    │
  │ category, price  │               │ dialect_language │
  │ lat, lng, image  │               │ whatsapp_phone   │
  └──────────────────┘               └──────────────────┘
```

---

# 2. Table Schemas & Data Dictionaries

### 2.1 Table: `experiences` (Ground-Truth Catalog)
```sql
CREATE TABLE experiences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    region VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    tier VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    insider_lore TEXT NOT NULL,
    image_url TEXT NOT NULL,
    admission_fee_inr INTEGER NOT NULL DEFAULT 0,
    time_required_minutes INTEGER NOT NULL DEFAULT 60,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    wheelchair_accessible BOOLEAN NOT NULL DEFAULT 0,
    step_free_access BOOLEAN NOT NULL DEFAULT 0,
    low_walking_intensity BOOLEAN NOT NULL DEFAULT 0,
    rain_safe_indoor BOOLEAN NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exp_state_category ON experiences (state, category);
CREATE INDEX idx_exp_coordinates ON experiences (latitude, longitude);
CREATE INDEX idx_exp_budget ON experiences (admission_fee_inr);
```

### 2.2 Table: `orders` (Transactional Simulator)
```sql
CREATE TABLE orders (
    id VARCHAR(64) PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    experience_id INTEGER NOT NULL REFERENCES experiences(id),
    amount_inr INTEGER NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    upi_transaction_hash VARCHAR(128),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.3 Table: `digital_passes` (Cryptographic Pass Engine)
```sql
CREATE TABLE digital_passes (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL REFERENCES orders(id),
    ticket_hash VARCHAR(256) NOT NULL,
    traveler_name VARCHAR(150) NOT NULL,
    venue_title VARCHAR(255) NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT 0,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

# 3. Client-Side IndexedDB Offline Schema (`lokiva_db`)

* **Database Name:** `lokiva_db`
* **Version:** `1`
* **Object Stores:**
  1. `experiences`: Keypath `id`, indexes: `by_state`, `by_category`, `by_budget`.
  2. `saved_itineraries`: Keypath `id`, index: `by_created_at`.
  3. `offline_passes`: Keypath `id`, index: `by_ticket_hash`.

---

<div align="center">
  <sub>DOC-03-DB-001 · LOKIVA Database Design & Schema Specification</sub>
</div>
