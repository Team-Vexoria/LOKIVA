# LOKIVA — Offline-First Resilience Architecture

**Project:** LOKIVA — Autonomous Cultural Experience Engine  
**Document Code:** DOC-03-OFF-001  
**Target Milestone:** National Hackathon 2-Day Offline Finale (Sept 26–27, 2026)  
**Status:** Approved Offline Engineering Blueprint  

---

# 1. The Hackathon Stage Disconnect Risk

In large hackathon convention auditoriums, hundreds of laptops, smartphones, and routers create extreme 2.4GHz / 5GHz radio congestion. Live stage demonstrations frequently collapse due to:
* DNS resolution failures.
* Dropped Wi-Fi associations.
* Upstream API socket timeouts.

LOKIVA implements an **Unbreakable Offline Guarantee**: the entire 1,080-place catalog, search filter engine, and local greedy route planner operate at a smooth 60 FPS without active internet connectivity.

```text
OFFLINE ARCHITECTURAL FALLBACK PIPELINE

[Browser Fires 'offline' Event]
               │
               ▼
[UI Renders Amber Banner: '⚡ Offline Resilient Mode Active']
               │
               ▼
[Service Worker Intercepts HTTP Fetch]
               │
       ┌───────┴───────┐
       │               │
       ▼               ▼
[Static Assets]   [API Request: /api/experiences]
Cache Storage     IndexedDB Object Store (lokiva_db)
       │               │
       └───────┬───────┘
               │
               ▼
[Zero Network Dependency · 60 FPS Maintained]
```

---

# 2. Service Worker Caching Policies (`public/sw.js`)

| Resource Type | Matching Pattern | Caching Strategy | Cache Name | Max Age |
| :--- | :--- | :--- | :--- | :--- |
| **Application Shell** | `/`, `/index.html`, `/assets/*.js`, `/assets/*.css` | `Cache-First` (with background refresh) | `lokiva-shell-v1` | 30 Days |
| **Direct CDN Media** | `upload.wikimedia.org/*`, `images.unsplash.com/*` | `Stale-While-Revalidate` | `lokiva-media-v1` | 60 Days |
| **Catalog API** | `/api/experiences*` | `Network-First, Fallback-to-IndexedDB` | `lokiva-api-v1` | 7 Days |

---

# 3. Client IndexedDB Synchronization Engine (`useOfflineCatalog.ts`)

During browser idle time (`requestIdleCallback`), the client checks if the local IndexedDB contains the current catalog schema version:

```typescript
export async function syncCatalogToIndexedDB(places: GroundTruthPlace[]) {
  const db = await openDB('lokiva_db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('experiences')) {
        const store = db.createObjectStore('experiences', { keyPath: 'id' });
        store.createIndex('by_state', 'state');
        store.createIndex('by_category', 'category');
        store.createIndex('by_budget', 'admissionFee');
      }
    },
  });

  const tx = db.transaction('experiences', 'readwrite');
  for (const place of places) {
    await tx.store.put(place);
  }
  await tx.done;
  console.log(`[IndexedDB] Synced ${places.length} ground-truth places for offline resilience.`);
}
```

---

# 4. Live Judging Disconnect Verification Protocol

To demonstrate technical superiority during the 3-minute hackathon pitch:
1. Open Chrome DevTools $\to$ Network tab.
2. Select **"Offline"** in the throttling dropdown.
3. Reload or navigate across states in the LOKIVA explorer.
4. **Validation Result:** Amber offline pill appears, all 1,080 places filter in $<20\text{ms}$, and no browser error screens appear.

---

<div align="center">
  <sub>DOC-03-OFF-001 · LOKIVA Offline-First Resilience Architecture</sub>
</div>
