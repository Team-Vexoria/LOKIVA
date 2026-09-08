import express from 'express';
import { dbAll, dbGet, dbRun } from '../db/db.js';

export const reviewsRouter = express.Router();

// GET /reviews/experience/:id
reviewsRouter.get('/experience/:id', async (req, res) => {
  try {
    const reviews = await dbAll('SELECT * FROM reviews WHERE experience_id = ? ORDER BY created_at DESC', [req.params.id]);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// POST /reviews
reviewsRouter.post('/', async (req, res) => {
  try {
    const { experience_id, rating, title, comment, user_id = 1 } = req.body;
    if (!experience_id || !rating || !comment) {
      return res.status(400).json({ detail: 'experience_id, rating, and comment are required' });
    }

    const result = await dbRun(
      'INSERT INTO reviews (experience_id, user_id, rating, title, comment) VALUES (?, ?, ?, ?, ?)',
      [experience_id, user_id, rating, title, comment]
    );

    // Update experience avg rating
    const avgRow = await dbGet('SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE experience_id = ?', [experience_id]);
    if (avgRow) {
      await dbRun(
        'UPDATE experiences SET rating = ?, review_count = ? WHERE id = ?',
        [Math.round(avgRow.avg_rating * 10) / 10, avgRow.count, experience_id]
      );
    }

    const review = await dbGet('SELECT * FROM reviews WHERE id = ?', [result.lastID]);
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// GET /reviews/favorites - get user favorites
reviewsRouter.get('/favorites', async (req, res) => {
  try {
    const user_id = req.query.user_id || 1;
    const rows = await dbAll(
      `SELECT e.* FROM experiences e
       JOIN favorites f ON e.id = f.experience_id
       WHERE f.user_id = ? AND e.is_active = 1`,
      [user_id]
    );
    const formatted = rows.map((e) => ({
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

// POST /reviews/favorites/:id - toggle favorite
reviewsRouter.post('/favorites/:id', async (req, res) => {
  try {
    const experience_id = parseInt(req.params.id, 10);
    const user_id = req.body.user_id || 1;

    const existing = await dbGet('SELECT id FROM favorites WHERE user_id = ? AND experience_id = ?', [user_id, experience_id]);
    if (existing) {
      await dbRun('DELETE FROM favorites WHERE id = ?', [existing.id]);
      return res.json({ favorited: false, experience_id });
    } else {
      await dbRun('INSERT INTO favorites (user_id, experience_id) VALUES (?, ?)', [user_id, experience_id]);
      return res.json({ favorited: true, experience_id });
    }
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});
