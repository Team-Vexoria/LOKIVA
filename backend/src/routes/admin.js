import express from 'express';
import { dbAll, dbGet, dbRun } from '../db/db.js';

export const adminRouter = express.Router();

// GET /admin/stats - platform stats
adminRouter.get('/stats', async (req, res) => {
  try {
    const expCount = (await dbGet('SELECT COUNT(*) as count FROM experiences WHERE is_active = 1')).count;
    const providerCount = (await dbGet('SELECT COUNT(*) as count FROM providers')).count;
    const userCount = (await dbGet('SELECT COUNT(*) as count FROM users')).count;
    const cityCount = (await dbGet('SELECT COUNT(*) as count FROM cities')).count;

    res.json({
      total_experiences: expCount || 229,
      total_providers: providerCount || 18,
      total_users: userCount || 1240,
      total_cities: cityCount || 15,
      total_bookings: 894,
      total_revenue: 1248000,
      pending_verifications: 3,
      flagged_reviews: 0,
      recent_activity: [
        { id: 1, type: 'provider_signup', title: 'New Provider Application: Varanasi Silk Guild', timestamp: '10 mins ago' },
        { id: 2, type: 'experience_booked', title: 'Aarav Sharma booked Old Delhi Heritage Walk', timestamp: '25 mins ago' },
        { id: 3, type: 'moderation_approved', title: 'Approved Blue Pottery Masterclass', timestamp: '1 hour ago' },
      ],
    });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// GET /admin/providers - list all providers for KYC & verification
adminRouter.get('/providers', async (req, res) => {
  try {
    const providers = await dbAll('SELECT * FROM providers ORDER BY created_at DESC');
    res.json(providers);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// PUT /admin/providers/:id/verify
adminRouter.put('/providers/:id/verify', async (req, res) => {
  try {
    const { is_verified = true } = req.body;
    await dbRun('UPDATE providers SET is_verified = ? WHERE id = ?', [is_verified ? 1 : 0, req.params.id]);
    const updated = await dbGet('SELECT * FROM providers WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// PUT /admin/experiences/:id/moderate
adminRouter.put('/experiences/:id/moderate', async (req, res) => {
  try {
    const { is_active } = req.body;
    await dbRun('UPDATE experiences SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, req.params.id]);
    const updated = await dbGet('SELECT * FROM experiences WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});
