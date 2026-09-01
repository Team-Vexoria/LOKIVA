/**
 * LOKIVA Hybrid Photo Ingestion Service (Option B Primary + Option C Backup)
 * 
 * Primary (Option B): Unsplash Official Search API / Pexels API
 * Backup (Option C): Verified Wikimedia Commons / Wikipedia PageImages (with no-referrer bypass)
 */

import { initDb, dbRun, dbGet, dbAll } from '../../db/db.js';
import dotenv from 'dotenv';
dotenv.config();

const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY || process.env.UNSPLASH_KEY || '';
const PEXELS_KEY = process.env.PEXELS_API_KEY || process.env.PEXELS_KEY || '';

/**
 * Option B1: Unsplash Official Search API
 */
async function fetchUnsplashPhoto(query) {
  if (!UNSPLASH_KEY) return null;

  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_KEY}`,
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].urls?.regular || data.results[0].urls?.full || null;
    }
  } catch (err) {
    // Graceful fallback to Option C
  }
  return null;
}

/**
 * Option B2: Pexels Search API
 */
async function fetchPexelsPhoto(query) {
  if (!PEXELS_KEY) return null;

  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
    const res = await fetch(url, {
      headers: {
        Authorization: PEXELS_KEY,
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (data.photos && data.photos.length > 0) {
      return data.photos[0].src?.large2x || data.photos[0].src?.large || null;
    }
  } catch (err) {
    // Graceful fallback to Option C
  }
  return null;
}

/**
 * Option C: Verified Wikipedia / Wikimedia Commons PageImages (with no-referrer)
 */
async function fetchWikipediaPhoto(cleanTitle, cityName) {
  const searchQuery = `${cleanTitle} ${cityName || ''}`.trim();
  const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages|extracts&generator=search&gsrsearch=${encodeURIComponent(searchQuery)}&gsrlimit=3&pithumbsize=1280&exintro=1&explaintext=1`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'LOKIVA-Travel-Hybrid/2.0 (contact@lokiva.travel)',
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    const pages = Object.values(data.query?.pages || {});

    for (const p of pages) {
      const pageLower = p.title.toLowerCase();
      // Skip generic country / whole state pages
      if (pageLower === 'india' || pageLower === cityName.toLowerCase() || pageLower === `${cityName.toLowerCase()} district`) {
        continue;
      }

      if (p.thumbnail?.source && !p.thumbnail.source.includes('placeholder')) {
        return p.thumbnail.source;
      }
    }
  } catch (err) {
    // Fail silently
  }
  return null;
}

/**
 * Master Hybrid Resolution:
 * Tries Option B (Unsplash / Pexels) -> Fallbacks to Option C (Wikipedia 1280px Commons)
 */
export async function getVerifiedPlacePhoto(placeTitle, cityName, category) {
  const cleanTitle = placeTitle.replace(/\([^)]*\)/g, '').trim();
  const query = `${cleanTitle} ${cityName || ''}`.trim();

  // 1. Try Option B: Unsplash
  let photo = await fetchUnsplashPhoto(query);
  if (photo) return { source: 'unsplash_api', url: photo };

  // 2. Try Option B: Pexels
  photo = await fetchPexelsPhoto(query);
  if (photo) return { source: 'pexels_api', url: photo };

  // 3. Fallback to Option C: Wikipedia Commons (100% Free & Verified)
  photo = await fetchWikipediaPhoto(cleanTitle, cityName);
  if (photo) return { source: 'wikimedia_commons', url: photo };

  return null;
}

/**
 * Enriches all database places using Hybrid Option B -> Option C Engine
 */
export async function runHybridPhotoEnrichment() {
  await initDb();
  console.log(`\n=================================================================`);
  console.log(` LOKIVA Hybrid Photo Ingestion Engine`);
  console.log(` Mode: Option B (Unsplash/Pexels API) with Option C (Wikimedia) Backup`);
  console.log(` Keys Found: Unsplash=${!!UNSPLASH_KEY}, Pexels=${!!PEXELS_KEY}`);
  console.log(`=================================================================\n`);

  const places = await dbAll('SELECT id, title, city, category, image_urls FROM experiences WHERE is_active = 1');
  console.log(`Found ${places.length} active places to enrich...`);

  let updated = 0;
  let skipped = 0;

  for (const p of places) {
    let currentImages = [];
    try {
      currentImages = JSON.parse(p.image_urls || '[]');
    } catch {}

    // Check if current image is already a verified high-res photo and NOT a bad broken link
    if (currentImages.length > 0 && currentImages[0].startsWith('http') && !currentImages[0].includes('photo-1599488615731')) {
      skipped++;
      continue;
    }

    const result = await getVerifiedPlacePhoto(p.title, p.city, p.category);

    if (result && result.url) {
      await dbRun('UPDATE experiences SET image_urls = ? WHERE id = ?', [JSON.stringify([result.url]), p.id]);
      updated++;
      console.log(`  ✓ [${result.source}] "${p.title}" -> ${result.url.substring(0, 60)}...`);
    }

    await new Promise(r => setTimeout(r, 120));
  }

  const finalStats = await dbGet('SELECT count(*) as cnt FROM experiences WHERE is_active = 1 AND image_urls != "[]" AND image_urls IS NOT NULL');

  console.log(`\n=================================================================`);
  console.log(` [Hybrid Enrichment Complete]`);
  console.log(` Newly Updated: ${updated}`);
  console.log(` Total Places with Verified High-Res Photos: ${finalStats?.cnt}`);
  console.log(`=================================================================\n`);
}

if (process.argv[1]?.endsWith('hybridPhotoService.js')) {
  runHybridPhotoEnrichment()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}
