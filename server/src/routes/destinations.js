import express from 'express';
import { dbAll, dbGet } from '../db/db.js';
import { enrichDestinationWithPexels, enrichExperienceWithPexels } from '../services/pexelsService.js';

export const destinationsRouter = express.Router();

// GET /destinations - list destination cities
destinationsRouter.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '20', 10);
    const cities = await dbAll('SELECT * FROM cities ORDER BY id ASC LIMIT ?', [limit]);

    const results = [];
    for (const c of cities) {
      const expCountRow = await dbGet('SELECT COUNT(*) as count FROM experiences WHERE city = ?', [c.name]);
      const categoriesRows = await dbAll('SELECT DISTINCT category FROM experiences WHERE city = ? LIMIT 3', [c.name]);
      const enrichedCity = await enrichDestinationWithPexels(c);
      results.push({
        id: c.id,
        name: c.name,
        state_name: c.state_name,
        state_code: c.state_code,
        tagline: c.tagline,
        latitude: c.latitude,
        longitude: c.longitude,
        image_url: enrichedCity.image_url,
        experience_count: expCountRow ? expCountRow.count : 0,
        popular_categories: categoriesRows.map((r) => r.category),
      });
    }
    res.json(results);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// GET /destinations/states
destinationsRouter.get('/states', async (req, res) => {
  try {
    const states = await dbAll('SELECT * FROM states ORDER BY name ASC');
    res.json(states);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// GET /destinations/cities
destinationsRouter.get('/cities', async (req, res) => {
  try {
    const { state_code } = req.query;
    let sql = 'SELECT * FROM cities';
    const params = [];
    if (state_code) {
      sql += ' WHERE state_code = ?';
      params.push(state_code);
    }
    sql += ' ORDER BY name ASC';
    const cities = await dbAll(sql, params);
    res.json(cities);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// GET /destinations/:state/:city - detail
destinationsRouter.get('/:state/:city', async (req, res) => {
  try {
    const { state, city } = req.params;
    const cityRow = await dbGet(
      'SELECT * FROM cities WHERE LOWER(name) = ? OR LOWER(state_name) = ?',
      [city.toLowerCase(), state.toLowerCase()]
    );
    if (!cityRow) return res.status(404).json({ detail: 'Destination not found' });

    const enrichedCity = await enrichDestinationWithPexels(cityRow);
    const areas = await dbAll('SELECT * FROM areas WHERE city_id = ?', [cityRow.id]);
    const topExp = await dbAll('SELECT * FROM experiences WHERE city = ? ORDER BY rating DESC LIMIT 6', [cityRow.name]);

    const formattedExp = await Promise.all(
      topExp.map(async (e) => {
        const item = {
          ...e,
          tags: typeof e.tags === 'string' ? JSON.parse(e.tags || '[]') : e.tags || [],
          image_urls: typeof e.image_urls === 'string' ? JSON.parse(e.image_urls || '[]') : e.image_urls || [],
        };
        return enrichExperienceWithPexels(item);
      })
    );

    res.json({
      id: enrichedCity.id,
      name: enrichedCity.name,
      state_name: enrichedCity.state_name,
      state_code: enrichedCity.state_code,
      tagline: enrichedCity.tagline,
      description: enrichedCity.description,
      latitude: enrichedCity.latitude,
      longitude: enrichedCity.longitude,
      image_url: enrichedCity.image_url,
      culture_summary: enrichedCity.culture_summary,
      best_time_to_visit: enrichedCity.best_time_to_visit,
      areas: areas,
      top_experiences: formattedExp,
      weather_summary: { temp_c: 28, condition: 'Sunny', is_raining: false },
    });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});
