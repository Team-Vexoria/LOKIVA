import express from 'express';
import { dbAll, dbGet, dbRun } from '../db/db.js';
import { enrichExperienceWithPexels } from '../services/pexelsService.js';

export const experiencesRouter = express.Router();

function formatExperience(e) {
  if (!e) return null;
  return {
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
  };
}

// GET /experiences/proxy-image - Universal robust image proxy
experiencesRouter.get('/proxy-image', async (req, res) => {
  try {
    const rawUrl = req.query.url;
    if (!rawUrl || typeof rawUrl !== 'string') {
      return res.status(400).send('Missing image url');
    }

    const cleanUrl = decodeURIComponent(rawUrl);

    // If it's a Wikimedia 1280px URL, normalize to 800px or direct URL to avoid 404 scaler bugs
    let fetchUrl = cleanUrl;
    if (fetchUrl.includes('upload.wikimedia.org') && fetchUrl.includes('/1280px-')) {
      fetchUrl = fetchUrl.replace('/1280px-', '/800px-');
    }

    const response = await fetch(fetchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
    });

    if (response.ok) {
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('Access-Control-Allow-Origin', '*');
      const arrayBuffer = await response.arrayBuffer();
      return res.send(Buffer.from(arrayBuffer));
    }

    // Secondary attempt if 800px failed: try 640px or original image
    if (fetchUrl.includes('/800px-')) {
      const fallbackUrl = fetchUrl.replace('/800px-', '/640px-');
      const fallbackRes = await fetch(fallbackUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      if (fallbackRes.ok) {
        res.setHeader('Content-Type', fallbackRes.headers.get('content-type') || 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.setHeader('Access-Control-Allow-Origin', '*');
        const arrayBuffer = await fallbackRes.arrayBuffer();
        return res.send(Buffer.from(arrayBuffer));
      }
    }

    return res.status(404).send('Image not found');
  } catch (err) {
    return res.status(500).send('Proxy error');
  }
});

// GET /experiences/categories - summary of categories
experiencesRouter.get('/categories', async (req, res) => {
  try {
    const { city, state } = req.query;
    let sql = 'SELECT category, COUNT(*) as count, AVG(rating) as avg_rating FROM experiences WHERE is_active = 1';
    const params = [];
    if (city) {
      sql += ' AND LOWER(city) = ?';
      params.push(city.toLowerCase());
    }
    if (state) {
      sql += ' AND LOWER(state) = ?';
      params.push(state.toLowerCase());
    }
    sql += ' GROUP BY category ORDER BY count DESC';

    const rows = await dbAll(sql, params);
    const categoryIcons = {
      workshop: 'Palette',
      food: 'Utensils',
      culture: 'Landmark',
      nature: 'Compass',
      spiritual: 'Sparkles',
      music: 'Music',
    };

    const result = rows.map((r) => ({
      name: r.category,
      count: r.count,
      avg_rating: Math.round(r.avg_rating * 10) / 10,
      icon_name: categoryIcons[r.category.toLowerCase()] || 'Sparkles',
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// GET /experiences - full catalog with advanced filters
experiencesRouter.get('/', async (req, res) => {
  try {
    const {
      category,
      q,
      city,
      state,
      max_price,
      max_duration_mins,
      is_hidden_gem,
      low_walking,
      family_friendly,
      is_indoor,
      limit = '50',
      offset = '0',
    } = req.query;

    let sql = 'SELECT * FROM experiences WHERE is_active = 1';
    const params = [];

    if (category) {
      sql += ' AND LOWER(category) = ?';
      params.push(category.toLowerCase());
    }
    if (city) {
      sql += ' AND LOWER(city) = ?';
      params.push(city.toLowerCase());
    }
    if (state) {
      sql += ' AND LOWER(state) = ?';
      params.push(state.toLowerCase());
    }
    if (q) {
      sql += ' AND (LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(area_name) LIKE ? OR LOWER(city) LIKE ? OR LOWER(state) LIKE ?)';
      const term = `%${q.toLowerCase()}%`;
      params.push(term, term, term, term, term);
    }
    if (max_price) {
      sql += ' AND price <= ?';
      params.push(parseFloat(max_price));
    }
    if (max_duration_mins) {
      sql += ' AND approx_duration_mins <= ?';
      params.push(parseInt(max_duration_mins, 10));
    }
    if (is_hidden_gem === 'true') {
      sql += ' AND is_hidden_gem = 1';
    }
    if (low_walking === 'true') {
      sql += ' AND low_walking = 1';
    }
    if (family_friendly === 'true') {
      sql += ' AND is_family_friendly = 1';
    }
    if (is_indoor === 'true') {
      sql += ' AND is_indoor = 1';
    }

    sql += ' ORDER BY notability_score DESC, COALESCE(rating, 4.5) DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const rows = await dbAll(sql, params);
    const formattedRows = rows.map(formatExperience);

    // Enrich missing/generic photos in parallel with cached Pexels resolution
    const enrichedList = await Promise.all(
      formattedRows.map(async (exp) => {
        if (!exp.image_url || exp.image_url.includes('placeholder') || exp.image_url.includes('source.unsplash.com')) {
          return enrichExperienceWithPexels(exp);
        }
        return exp;
      })
    );

    res.json(enrichedList);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// GET /experiences/:id
experiencesRouter.get('/:id', async (req, res) => {
  try {
    const exp = await dbGet('SELECT * FROM experiences WHERE id = ?', [req.params.id]);
    if (!exp) return res.status(404).json({ detail: 'Experience not found' });

    const provider = exp.provider_id ? await dbGet('SELECT * FROM providers WHERE id = ?', [exp.provider_id]) : null;
    const reviews = await dbAll('SELECT * FROM reviews WHERE experience_id = ? ORDER BY created_at DESC LIMIT 10', [exp.id]);

    const formatted = formatExperience(exp);
    const enriched = await enrichExperienceWithPexels(formatted);
    enriched.provider = provider;
    enriched.reviews = reviews;
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// POST /experiences (Create new experience)
experiencesRouter.post('/', async (req, res) => {
  try {
    const e = req.body;
    const result = await dbRun(
      `INSERT INTO experiences (
        provider_id, title, tagline, description, category, cultural_context,
        state, city, area_name, latitude, longitude, approx_duration_mins,
        price, currency, max_capacity, difficulty_level, is_indoor, is_rain_safe,
        is_hidden_gem, is_family_friendly, low_walking, wheelchair_accessible,
        best_time_of_day, image_urls, tags, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        e.provider_id || 1, e.title, e.tagline, e.description, e.category, e.cultural_context,
        e.state || 'Rajasthan', e.city || 'Jaipur', e.area_name || 'Old City',
        e.latitude || 26.9124, e.longitude || 75.7873, e.approx_duration_mins || 120,
        e.price || 500, e.currency || 'INR', e.max_capacity || 10, e.difficulty_level || 'easy',
        e.is_indoor ? 1 : 0, e.is_rain_safe ? 1 : 0, e.is_hidden_gem ? 1 : 0,
        e.is_family_friendly ? 1 : 0, e.low_walking ? 1 : 0, e.wheelchair_accessible ? 1 : 0,
        e.best_time_of_day || 'morning', JSON.stringify(e.image_urls || []),
        JSON.stringify(e.tags || []),
      ]
    );

    const created = await dbGet('SELECT * FROM experiences WHERE id = ?', [result.lastID]);
    res.status(201).json(formatExperience(created));
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});
