import express from 'express';
import { dbAll, dbGet, dbRun } from '../db/db.js';
import { checkItineraryFeasibility } from '../services/algorithms.js';

export const itinerariesRouter = express.Router();

// POST /itineraries/feasibility - check feasibility for selected experience IDs
itinerariesRouter.post('/feasibility', async (req, res) => {
  try {
    const { experience_ids = [], hotel_lat = 26.9124, hotel_lng = 75.7873 } = req.body;
    if (experience_ids.length === 0) {
      return res.json({
        is_feasible: true,
        feasibility_score: 100,
        total_duration_mins: 0,
        total_travel_time_mins: 0,
        total_cost: 0,
        fatigue_level: 'Low',
        items: [],
        warnings: [],
      });
    }

    const placeholders = experience_ids.map(() => '?').join(',');
    const exps = await dbAll(`SELECT * FROM experiences WHERE id IN (${placeholders})`, experience_ids);

    // Keep the order matching the requested experience_ids
    const orderedExps = experience_ids
      .map((id) => exps.find((e) => e.id === id))
      .filter(Boolean);

    const result = checkItineraryFeasibility(orderedExps, { lat: hotel_lat, lng: hotel_lng });
    res.json(result);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// POST /itineraries/replan - dynamic weather/slot replanning
itinerariesRouter.post('/replan', async (req, res) => {
  try {
    const { experience_ids = [], trigger_reason = 'rain', city = 'Jaipur' } = req.body;

    let replacementCandidates = [];
    if (trigger_reason.includes('rain')) {
      replacementCandidates = await dbAll(
        'SELECT * FROM experiences WHERE LOWER(city) = ? AND is_indoor = 1 AND is_active = 1 LIMIT 3',
        [city.toLowerCase()]
      );
    } else {
      replacementCandidates = await dbAll(
        'SELECT * FROM experiences WHERE LOWER(city) = ? AND low_walking = 1 AND is_active = 1 LIMIT 3',
        [city.toLowerCase()]
      );
    }

    const newExpIds = replacementCandidates.map((e) => e.id);
    const feasibility = checkItineraryFeasibility(replacementCandidates);

    res.json({
      success: true,
      reason: trigger_reason,
      message: `Adjusted plan with ${replacementCandidates.length} sheltered indoor alternatives.`,
      new_experience_ids: newExpIds,
      feasibility,
    });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// POST /itineraries - create saved itinerary
itinerariesRouter.post('/', async (req, res) => {
  try {
    const { title, city, state, experience_ids = [], user_id = 1 } = req.body;

    const placeholders = experience_ids.map(() => '?').join(',');
    const exps = experience_ids.length > 0 ? await dbAll(`SELECT * FROM experiences WHERE id IN (${placeholders})`, experience_ids) : [];
    const feasibility = checkItineraryFeasibility(exps);

    const result = await dbRun(
      'INSERT INTO itineraries (user_id, title, city, state, total_duration_mins, total_cost, feasibility_score, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, title || `${city} Cultural Journey`, city, state || 'Rajasthan', feasibility.total_duration_mins, feasibility.total_cost, feasibility.feasibility_score, 'saved']
    );

    const itineraryId = result.lastID;
    for (const item of feasibility.items) {
      await dbRun(
        'INSERT INTO itinerary_items (itinerary_id, experience_id, item_order, start_time, end_time, travel_time_to_next_mins) VALUES (?, ?, ?, ?, ?, ?)',
        [itineraryId, item.experience_id, item.item_order, item.start_time, item.end_time, item.travel_time_to_next_mins]
      );
    }

    const saved = await dbGet('SELECT * FROM itineraries WHERE id = ?', [itineraryId]);
    const items = await dbAll('SELECT * FROM itinerary_items WHERE itinerary_id = ? ORDER BY item_order ASC', [itineraryId]);
    res.status(201).json({ ...saved, items });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// GET /itineraries/:id
itinerariesRouter.get('/:id', async (req, res) => {
  try {
    const it = await dbGet('SELECT * FROM itineraries WHERE id = ?', [req.params.id]);
    if (!it) return res.status(404).json({ detail: 'Itinerary not found' });
    const items = await dbAll('SELECT * FROM itinerary_items WHERE itinerary_id = ? ORDER BY item_order ASC', [it.id]);
    res.json({ ...it, items });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// GET /itineraries/user/:user_id
itinerariesRouter.get('/user/:user_id', async (req, res) => {
  try {
    const list = await dbAll('SELECT * FROM itineraries WHERE user_id = ? ORDER BY created_at DESC', [req.params.user_id]);
    res.json(list);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});
