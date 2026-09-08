import express from 'express';
import { dbAll, dbGet } from '../db/db.js';
import { resolveExperiencesForLocation } from '../services/ingestion/ingestionEngine.js';
import {
  discoverIndiaAdminBoundaries,
  startBackgroundSeedingWorker,
  pauseBackgroundSeedingWorker,
  getSeedingWorkerStatus,
} from '../services/ingestion/adminSeeder.js';

export const router = express.Router();

/**
 * GET /api/v1/ingestion/resolve
 * On-demand resolution of ANY Indian location (text or lat/lng)
 */
router.get('/resolve', async (req, res) => {
  const { q, lat, lng, limit, refresh } = req.query;

  try {
    let input = q;
    if (lat && lng) {
      input = { lat: parseFloat(lat), lng: parseFloat(lng) };
    }

    if (!input) {
      return res.status(400).json({ error: 'Location query parameter "q" or "lat" & "lng" is required' });
    }

    const result = await resolveExperiencesForLocation(input, {
      limit: limit ? parseInt(limit, 10) : 50,
      forceRefresh: refresh === 'true',
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/v1/ingestion/status
 * Returns system-wide coverage statistics, cache status, and background seeder health
 */
router.get('/status', async (req, res) => {
  try {
    const totalExperiences = await dbGet('SELECT COUNT(*) as count FROM experiences');
    const osmExperiences = await dbGet("SELECT COUNT(*) as count FROM experiences WHERE source = 'osm_overpass'");
    const totalCachedRegions = await dbGet('SELECT COUNT(*) as count FROM cached_regions');
    const queueStats = await dbAll(`
      SELECT status, COUNT(*) as count 
      FROM admin_boundaries_queue 
      GROUP BY status
    `);
    const workerStatus = getSeedingWorkerStatus();

    res.json({
      coverage: {
        total_experiences: totalExperiences.count,
        open_data_ingested: osmExperiences.count,
        cached_regions: totalCachedRegions.count,
      },
      queue: queueStats,
      worker: workerStatus,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/v1/ingestion/seed/discover
 * Dynamically queries OSM for Indian state and district boundaries (zero hardcoded lists)
 */
router.post('/seed/discover', async (req, res) => {
  const { admin_level } = req.body || {};
  try {
    const result = await discoverIndiaAdminBoundaries(admin_level || 4);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/v1/ingestion/seed/start
 */
router.post('/seed/start', async (req, res) => {
  const { interval_ms } = req.body || {};
  try {
    const result = await startBackgroundSeedingWorker(interval_ms || 4000);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/v1/ingestion/seed/pause
 */
router.post('/seed/pause', (req, res) => {
  const result = pauseBackgroundSeedingWorker();
  res.json(result);
});

/**
 * GET /api/v1/ingestion/logs
 */
router.get('/logs', async (req, res) => {
  try {
    const logs = await dbAll('SELECT * FROM ingestion_logs ORDER BY id DESC LIMIT 50');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
