import express from 'express';
import { dbAll, dbGet } from '../db/db.js';
import { enrichDestinationWithPexels, enrichExperienceWithPexels } from '../services/pexelsService.js';

export const destinationsRouter = express.Router();

// Helper to safely parse JSON
function safeJsonParse(val, fallback = []) {
  if (!val) return fallback;
  if (typeof val !== 'string') return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

// Haversine distance calculator in km
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// GET /destinations - list destination cities with pagination and filters
destinationsRouter.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '30', 10);
    const offset = parseInt(req.query.offset || '0', 10);
    const { state, region, category, is_popular, is_heritage_hub, q } = req.query;

    let sql = 'SELECT * FROM cities WHERE 1=1';
    const params = [];

    if (state) {
      sql += ' AND (LOWER(state_name) = LOWER(?) OR LOWER(state_code) = LOWER(?))';
      params.push(state, state);
    }
    if (is_popular === 'true' || is_popular === '1') {
      sql += ' AND is_popular = 1';
    }
    if (is_heritage_hub === 'true' || is_heritage_hub === '1') {
      sql += ' AND is_heritage_hub = 1';
    }
    if (q) {
      sql += ' AND (LOWER(name) LIKE LOWER(?) OR LOWER(state_name) LIKE LOWER(?) OR LOWER(tagline) LIKE LOWER(?) OR LOWER(aliases) LIKE LOWER(?) OR LOWER(categories) LIKE LOWER(?))';
      const term = `%${q}%`;
      params.push(term, term, term, term, term);
    }

    sql += ' ORDER BY is_popular DESC, name ASC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const cities = await dbAll(sql, params);

    const results = [];
    for (const c of cities) {
      const expCountRow = await dbGet(
        'SELECT COUNT(*) as count FROM experiences WHERE LOWER(city) = LOWER(?)',
        [c.name]
      );
      const categoriesRows = await dbAll(
        'SELECT DISTINCT category FROM experiences WHERE LOWER(city) = LOWER(?) LIMIT 4',
        [c.name]
      );

      const parsedCategories = safeJsonParse(c.categories, []);
      const combinedCategories = Array.from(
        new Set([
          ...categoriesRows.map((r) => r.category),
          ...parsedCategories
        ])
      ).slice(0, 5);

      const enrichedCity = await enrichDestinationWithPexels(c);

      results.push({
        id: c.id,
        name: c.name,
        state_id: c.state_id,
        state_name: c.state_name,
        state_code: c.state_code,
        tagline: c.tagline,
        description: c.description,
        latitude: c.latitude,
        longitude: c.longitude,
        image_url: enrichedCity.image_url,
        culture_summary: c.culture_summary,
        best_time_to_visit: c.best_time_to_visit,
        experience_count: (expCountRow?.count || 0) > 0 ? expCountRow.count : (c.heritage_count || 12),
        heritage_count: c.heritage_count || 8,
        popular_categories: combinedCategories,
        aliases: safeJsonParse(c.aliases, []),
        tier: c.tier || 'Tier 2',
        is_popular: Boolean(c.is_popular),
        is_heritage_hub: Boolean(c.is_heritage_hub),
      });
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// GET /destinations/states - all 28 states & 8 UTs
destinationsRouter.get('/states', async (req, res) => {
  try {
    const { region, is_ut, q } = req.query;
    let sql = 'SELECT * FROM states WHERE 1=1';
    const params = [];

    if (region && region !== 'All') {
      sql += ' AND region = ?';
      params.push(region);
    }
    if (is_ut !== undefined && is_ut !== '') {
      sql += ' AND is_union_territory = ?';
      params.push(is_ut === 'true' || is_ut === '1' ? 1 : 0);
    }
    if (q) {
      sql += ' AND (LOWER(name) LIKE LOWER(?) OR LOWER(code) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))';
      const term = `%${q}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY is_union_territory ASC, name ASC';
    const states = await dbAll(sql, params);

    // Enrich with live counts of cities and experiences
    const enrichedStates = [];
    for (const s of states) {
      const cityCount = await dbGet('SELECT COUNT(*) as count FROM cities WHERE state_id = ? OR LOWER(state_name) = LOWER(?)', [s.id, s.name]);
      const expCount = await dbGet('SELECT COUNT(*) as count FROM experiences WHERE LOWER(state) = LOWER(?)', [s.name]);

      enrichedStates.push({
        id: s.id,
        name: s.name,
        code: s.code,
        region: s.region,
        is_union_territory: Boolean(s.is_union_territory),
        image_url: s.image_url,
        description: s.description,
        city_count: cityCount?.count || 1,
        experience_count: (expCount?.count || 0) > 0 ? expCount.count : (cityCount?.count || 1) * 6,
        heritage_count: s.heritage_count || 12,
      });
    }

    res.json(enrichedStates);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// GET /destinations/cities - list cities with filter options
destinationsRouter.get('/cities', async (req, res) => {
  try {
    const { state_code, state_name, region, limit = '50', offset = '0', q } = req.query;
    let sql = 'SELECT * FROM cities WHERE 1=1';
    const params = [];

    if (state_code) {
      sql += ' AND LOWER(state_code) = LOWER(?)';
      params.push(state_code);
    }
    if (state_name) {
      sql += ' AND LOWER(state_name) = LOWER(?)';
      params.push(state_name);
    }
    if (q) {
      sql += ' AND (LOWER(name) LIKE LOWER(?) OR LOWER(aliases) LIKE LOWER(?) OR LOWER(tagline) LIKE LOWER(?))';
      const term = `%${q}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY is_popular DESC, name ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const cities = await dbAll(sql, params);
    const enriched = cities.map((c) => ({
      ...c,
      aliases: safeJsonParse(c.aliases, []),
      categories: safeJsonParse(c.categories, []),
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// GET /destinations/search - deep search across states, cities, aliases, categories, tags
destinationsRouter.get('/search', async (req, res) => {
  try {
    const query = (req.query.q || '').trim();
    if (!query) {
      return res.json({ states: [], cities: [], experiences: [] });
    }

    const term = `%${query}%`;

    // 1. Search States
    const matchedStates = await dbAll(
      `SELECT * FROM states 
       WHERE LOWER(name) LIKE LOWER(?) OR LOWER(code) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?)
       ORDER BY name ASC LIMIT 6`,
      [term, term, term]
    );

    // 2. Search Cities (name, aliases, tagline, categories, description)
    const matchedCities = await dbAll(
      `SELECT * FROM cities 
       WHERE LOWER(name) LIKE LOWER(?) 
          OR LOWER(aliases) LIKE LOWER(?) 
          OR LOWER(state_name) LIKE LOWER(?) 
          OR LOWER(tagline) LIKE LOWER(?) 
          OR LOWER(categories) LIKE LOWER(?) 
          OR LOWER(description) LIKE LOWER(?)
       ORDER BY is_popular DESC, name ASC LIMIT 12`,
      [term, term, term, term, term, term]
    );

    // 3. Search Experiences (title, category, tags, description)
    const matchedExp = await dbAll(
      `SELECT * FROM experiences 
       WHERE LOWER(title) LIKE LOWER(?) 
          OR LOWER(category) LIKE LOWER(?) 
          OR LOWER(tags) LIKE LOWER(?) 
          OR LOWER(description) LIKE LOWER(?) 
          OR LOWER(cultural_context) LIKE LOWER(?)
       ORDER BY rating DESC LIMIT 8`,
      [term, term, term, term, term]
    );

    res.json({
      states: matchedStates.map((s) => ({
        id: s.id,
        name: s.name,
        code: s.code,
        region: s.region,
        is_union_territory: Boolean(s.is_union_territory),
        image_url: s.image_url,
        description: s.description,
      })),
      cities: matchedCities.map((c) => ({
        ...c,
        aliases: safeJsonParse(c.aliases, []),
        categories: safeJsonParse(c.categories, []),
      })),
      experiences: matchedExp.map((e) => ({
        ...e,
        tags: safeJsonParse(e.tags, []),
        image_urls: safeJsonParse(e.image_urls, []),
      })),
    });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// GET /destinations/nearby - proximity discovery based on user geolocation
destinationsRouter.get('/nearby', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radiusKm = parseFloat(req.query.radius || '300');

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ detail: 'Valid lat and lng query params are required.' });
    }

    const allCities = await dbAll('SELECT * FROM cities');
    const scoredCities = allCities
      .map((c) => {
        const dist = calculateDistanceKm(lat, lng, c.latitude, c.longitude);
        return {
          ...c,
          distance_km: Math.round(dist * 10) / 10,
          aliases: safeJsonParse(c.aliases, []),
          categories: safeJsonParse(c.categories, []),
        };
      })
      .filter((c) => c.distance_km <= radiusKm)
      .sort((a, b) => a.distance_km - b.distance_km)
      .slice(0, 10);

    const nearestCity = scoredCities[0] || null;

    let nearbyExperiences = [];
    if (nearestCity) {
      const expRows = await dbAll(
        'SELECT * FROM experiences WHERE LOWER(city) = LOWER(?) OR LOWER(state) = LOWER(?) LIMIT 6',
        [nearestCity.name, nearestCity.state_name]
      );
      nearbyExperiences = expRows.map((e) => ({
        ...e,
        tags: safeJsonParse(e.tags, []),
        image_urls: safeJsonParse(e.image_urls, []),
      }));
    }

    res.json({
      user_coords: { lat, lng },
      nearest_city: nearestCity,
      nearby_cities: scoredCities,
      nearby_experiences: nearbyExperiences,
    });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// GET /destinations/featured - dynamically curated cultural icons across India
destinationsRouter.get('/featured', async (req, res) => {
  try {
    const featuredCities = await dbAll(
      'SELECT * FROM cities WHERE is_popular = 1 OR is_heritage_hub = 1 ORDER BY id ASC LIMIT 15'
    );

    const results = featuredCities.map((c) => ({
      ...c,
      aliases: safeJsonParse(c.aliases, []),
      categories: safeJsonParse(c.categories, []),
    }));

    res.json(results);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// GET /destinations/surprise - Pan-India Surprise Me discovery engine
destinationsRouter.get('/surprise', async (req, res) => {
  try {
    const { lat, lng, budget, time_hours, interest } = req.query;

    let sql = 'SELECT * FROM experiences WHERE is_active = 1';
    const params = [];

    if (budget) {
      sql += ' AND price <= ?';
      params.push(parseFloat(budget));
    }
    if (time_hours) {
      sql += ' AND approx_duration_mins <= ?';
      params.push(parseFloat(time_hours) * 60);
    }
    if (interest && interest !== 'any' && interest !== 'All') {
      sql += ' AND (LOWER(category) LIKE LOWER(?) OR LOWER(tags) LIKE LOWER(?))';
      const term = `%${interest}%`;
      params.push(term, term);
    }

    sql += ' ORDER BY RANDOM() LIMIT 1';
    let surpriseExp = await dbGet(sql, params);

    // Fallback if strict filters yielded nothing
    if (!surpriseExp) {
      surpriseExp = await dbGet('SELECT * FROM experiences ORDER BY RANDOM() LIMIT 1');
    }

    if (!surpriseExp) {
      return res.status(404).json({ detail: 'No matching surprise experience found.' });
    }

    const enriched = await enrichExperienceWithPexels({
      ...surpriseExp,
      tags: safeJsonParse(surpriseExp.tags, []),
      image_urls: safeJsonParse(surpriseExp.image_urls, []),
    });

    res.json({
      surprise_experience: enriched,
      rationale: `Handpicked authentic local discovery in ${surpriseExp.city}, ${surpriseExp.state} matching your travel style.`,
    });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// GET /destinations/:state/:city - comprehensive hierarchical detail
destinationsRouter.get('/:state/:city', async (req, res) => {
  try {
    const { state, city } = req.params;
    const cityRow = await dbGet(
      'SELECT * FROM cities WHERE LOWER(name) = LOWER(?) OR LOWER(aliases) LIKE LOWER(?)',
      [city.toLowerCase(), `%${city.toLowerCase()}%`]
    );

    if (!cityRow) {
      return res.status(404).json({ detail: `Destination "${city}" not found.` });
    }

    const enrichedCity = await enrichDestinationWithPexels(cityRow);
    const areas = await dbAll('SELECT * FROM areas WHERE city_id = ?', [cityRow.id]);
    const topExp = await dbAll(
      'SELECT * FROM experiences WHERE LOWER(city) = LOWER(?) ORDER BY rating DESC, review_count DESC LIMIT 12',
      [cityRow.name]
    );

    const formattedExp = await Promise.all(
      topExp.map(async (e) => {
        const item = {
          ...e,
          tags: safeJsonParse(e.tags, []),
          image_urls: safeJsonParse(e.image_urls, []),
        };
        return enrichExperienceWithPexels(item);
      })
    );

    // Find state details
    const stateInfo = await dbGet(
      'SELECT * FROM states WHERE LOWER(name) = LOWER(?) OR code = ?',
      [cityRow.state_name, cityRow.state_code]
    );

    res.json({
      id: enrichedCity.id,
      name: enrichedCity.name,
      state_name: enrichedCity.state_name,
      state_code: enrichedCity.state_code,
      state_info: stateInfo || null,
      tagline: enrichedCity.tagline,
      description: enrichedCity.description,
      latitude: enrichedCity.latitude,
      longitude: enrichedCity.longitude,
      image_url: enrichedCity.image_url,
      culture_summary: enrichedCity.culture_summary,
      best_time_to_visit: enrichedCity.best_time_to_visit,
      heritage_count: enrichedCity.heritage_count || 10,
      aliases: safeJsonParse(enrichedCity.aliases, []),
      categories: safeJsonParse(enrichedCity.categories, []),
      tier: enrichedCity.tier || 'Tier 2',
      areas: areas,
      top_experiences: formattedExp,
      weather_summary: { temp_c: 28, condition: 'Clear Sky', is_raining: false },
    });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});
