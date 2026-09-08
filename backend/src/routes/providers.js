import express from 'express';
import { dbAll, dbGet, dbRun } from '../db/db.js';

export const providersRouter = express.Router();

// GET /providers/me
providersRouter.get('/me', async (req, res) => {
  try {
    let provider = await dbGet('SELECT * FROM providers LIMIT 1');
    if (!provider) {
      provider = {
        id: 1,
        business_name: 'Jaipur Heritage Crafts Guild',
        description: 'Generational block printers and blue pottery artisans of Jaipur.',
        city: 'Jaipur',
        state: 'Rajasthan',
        is_verified: true,
        rating: 4.9,
        review_count: 38,
      };
    }
    res.json(provider);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// GET /providers/experiences - provider's listings
providersRouter.get('/experiences', async (req, res) => {
  try {
    const experiences = await dbAll('SELECT * FROM experiences WHERE provider_id = 1 OR provider_id IS NULL LIMIT 20');
    const formatted = experiences.map((e) => ({
      ...e,
      is_indoor: Boolean(e.is_indoor),
      is_rain_safe: Boolean(e.is_rain_safe),
      is_hidden_gem: Boolean(e.is_hidden_gem),
      is_family_friendly: Boolean(e.is_family_friendly),
      low_walking: Boolean(e.low_walking),
      wheelchair_accessible: Boolean(e.wheelchair_accessible),
      is_active: Boolean(e.is_active),
      tags: typeof e.tags === 'string' ? JSON.parse(e.tags || '[]') : e.tags || [],
      image_urls: typeof e.image_urls === 'string' ? JSON.parse(e.image_urls || '[]') : e.image_urls || [],
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// PUT /providers/experiences/:id - update listing
providersRouter.put('/experiences/:id', async (req, res) => {
  try {
    const { title, price, max_capacity, approx_duration_mins } = req.body;
    await dbRun(
      'UPDATE experiences SET title = COALESCE(?, title), price = COALESCE(?, price), max_capacity = COALESCE(?, max_capacity), approx_duration_mins = COALESCE(?, approx_duration_mins) WHERE id = ?',
      [title, price, max_capacity, approx_duration_mins, req.params.id]
    );
    const updated = await dbGet('SELECT * FROM experiences WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// GET /providers/analytics - host metrics
providersRouter.get('/analytics', async (req, res) => {
  try {
    res.json({
      total_views: 4820,
      total_bookings: 142,
      total_revenue: 184500.0,
      average_rating: 4.88,
      monthly_trend: [
        { month: 'Jan', revenue: 24000, bookings: 18 },
        { month: 'Feb', revenue: 31000, bookings: 24 },
        { month: 'Mar', revenue: 42500, bookings: 32 },
        { month: 'Apr', revenue: 38000, bookings: 28 },
        { month: 'May', revenue: 49000, bookings: 40 },
      ],
      top_experiences: [
        { id: 1, title: 'Generational Hand-Block Printing Workshop', bookings: 64, revenue: 83200 },
        { id: 2, title: 'Jaipur Blue Pottery Masterclass', bookings: 48, revenue: 57600 },
        { id: 3, title: 'Walled City Sunset Rooftop Chai & Heritage Tales', bookings: 30, revenue: 43700 },
      ],
    });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});
