import express from 'express';
import {
  fetchPexelsPhotos,
  buildExperiencePhotoQuery,
  buildDestinationPhotoQuery,
} from '../services/pexelsService.js';

export const mediaRouter = express.Router();

/**
 * GET /api/v1/media/image
 * Resolves a dynamic high-resolution photo for a query, city, category, or experience
 */
mediaRouter.get('/image', async (req, res) => {
  try {
    const { q, city, state, category, title } = req.query;

    let query = q;
    if (!query) {
      if (title || category || city) {
        query = `${city || ''} ${category || ''} ${title || ''} India`.trim();
      } else if (city) {
        query = buildDestinationPhotoQuery(city, state);
      } else {
        query = 'India cultural heritage tourism';
      }
    }

    const result = await fetchPexelsPhotos(query, 1);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/v1/media/gallery
 * Resolves multiple dynamic high-resolution photos for experience detail and destination galleries
 */
mediaRouter.get('/gallery', async (req, res) => {
  try {
    const { q, city, category, title, count = '4' } = req.query;

    let query = q;
    if (!query) {
      query = `${city || ''} ${category || ''} ${title || ''} India`.trim();
    }

    const parsedCount = Math.min(Math.max(parseInt(count, 10) || 4, 1), 10);
    const result = await fetchPexelsPhotos(query, parsedCount);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
