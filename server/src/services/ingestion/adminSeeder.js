import { dbRun, dbGet, dbAll } from '../../db/db.js';
import { resolveExperiencesForLocation } from './ingestionEngine.js';

let isQueueRunning = false;
let queueTimeoutId = null;

const USER_AGENT = 'LOKIVA-India-Admin-Seeder/1.0 (contact: discovery@lokiva.in)';
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Discovers India's administrative boundaries dynamically from OpenStreetMap
 * (admin_level=4 for States/UTs, admin_level=5/6 for Districts) — zero hardcoding.
 */
export async function discoverIndiaAdminBoundaries(adminLevel = 4) {
  // Overpass query for Indian administrative boundaries
  const ql = `
    [out:json][timeout:45];
    area["ISO3166-1"="IN"][admin_level=2]->.india;
    (
      relation["boundary"="administrative"]["admin_level"="${adminLevel}"](area.india);
    );
    out tags center;
  `;

  const url = 'https://overpass-api.de/api/interpreter';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'User-Agent': USER_AGENT,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: `data=${encodeURIComponent(ql)}`,
  });

  if (!response.ok) {
    throw new Error(`Failed to discover administrative boundaries: ${response.statusText}`);
  }

  const data = await response.json();
  const elements = data.elements || [];

  let queuedCount = 0;

  for (const el of elements) {
    const tags = el.tags || {};
    const name = tags['name:en'] || tags['name'] || tags['int_name'];
    if (!name) continue;

    const osmId = `relation/${el.id}`;
    const centerLat = el.center?.lat || 0;
    const centerLng = el.center?.lon || 0;

    // Default priority based on population or capital status
    let priority = 10;
    if (tags['capital'] === 'yes' || tags['admin_level'] === '4') priority = 1;
    if (tags['population']) priority = Math.max(1, 10 - Math.round(parseInt(tags['population'], 10) / 1000000));

    const existing = await dbGet('SELECT id FROM admin_boundaries_queue WHERE osm_id = ?', [osmId]);
    if (!existing) {
      await dbRun(
        `INSERT INTO admin_boundaries_queue (
           osm_id, name, admin_level, state_name, center_lat, center_lng, priority, status
         ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [osmId, name, adminLevel, tags['is_in:state'] || name, centerLat, centerLng, priority]
      );
      queuedCount++;
    }
  }

  return {
    discovered: elements.length,
    enqueued: queuedCount,
  };
}

/**
 * Starts the sequential background ingestion worker
 */
export async function startBackgroundSeedingWorker(intervalMs = 4000) {
  if (isQueueRunning) return { status: 'already_running' };

  isQueueRunning = true;
  runQueueStep(intervalMs);
  return { status: 'started' };
}

export function pauseBackgroundSeedingWorker() {
  isQueueRunning = false;
  if (queueTimeoutId) clearTimeout(queueTimeoutId);
  return { status: 'paused' };
}

export function getSeedingWorkerStatus() {
  return { isRunning: isQueueRunning };
}

async function runQueueStep(intervalMs) {
  if (!isQueueRunning) return;

  try {
    // Pick the next highest-priority pending administrative area
    const nextItem = await dbGet(
      `SELECT * FROM admin_boundaries_queue
       WHERE status = 'pending'
       ORDER BY priority ASC, id ASC
       LIMIT 1`
    );

    if (nextItem) {
      await dbRun("UPDATE admin_boundaries_queue SET status = 'processing', last_attempt_at = CURRENT_TIMESTAMP WHERE id = ?", [nextItem.id]);

      try {
        const result = await resolveExperiencesForLocation(
          nextItem.center_lat && nextItem.center_lng
            ? { lat: nextItem.center_lat, lng: nextItem.center_lng }
            : `${nextItem.name}, India`,
          { limit: 40 }
        );

        await dbRun(
          "UPDATE admin_boundaries_queue SET status = 'completed', places_ingested = ?, error_message = NULL WHERE id = ?",
          [result.experiences.length, nextItem.id]
        );
      } catch (err) {
        await dbRun(
          "UPDATE admin_boundaries_queue SET status = 'failed', error_message = ? WHERE id = ?",
          [err.message, nextItem.id]
        );
      }
    }
  } catch (err) {
    console.error('Queue runner error:', err);
  }

  if (isQueueRunning) {
    queueTimeoutId = setTimeout(() => runQueueStep(intervalMs), intervalMs);
  }
}
