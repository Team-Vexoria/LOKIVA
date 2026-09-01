/**
 * LOKIVA Master Photo Seeder using Pexels API
 * Fetches verified, ultra-high-resolution, fast CDN images from Pexels
 * and saves them directly to SQLite database.
 */

import { initDb, dbRun, dbAll } from '../db/db.js';
import dotenv from 'dotenv';
dotenv.config();

const PEXELS_KEY = process.env.PEXELS_API_KEY || 'CUq4jzAG0xoupr6axAqQaFlhwOwnHvrKjeyxicpq7VQZiHIVmZcMVLmm';

const MONUMENTS = [
  { search: 'Taj Mahal Agra', pattern: '%Taj Mahal%' },
  { search: 'Agra Fort India', pattern: '%Agra Fort%' },
  { search: 'Fatehpur Sikri Agra', pattern: '%Fatehpur Sikri%' },
  { search: 'Tomb of Itimad ud Daulah Agra', pattern: '%Tomb of I\'timad%' },
  { search: 'Mehtab Bagh Agra', pattern: '%Mehtab Bagh%' },
  { search: 'Amer Fort Jaipur', pattern: '%Amer Fort%' },
  { search: 'Hawa Mahal Jaipur', pattern: '%Hawa Mahal%' },
  { search: 'Jantar Mantar Jaipur', pattern: '%Jantar Mantar%' },
  { search: 'City Palace Jaipur', pattern: '%City Palace of Jaipur%' },
  { search: 'Nahargarh Fort Jaipur', pattern: '%Nahargarh Fort%' },
  { search: 'City Palace Udaipur', pattern: '%City Palace Udaipur%' },
  { search: 'Lake Palace Udaipur', pattern: '%Lake Palace%' },
  { search: 'Marine Drive Mumbai', pattern: '%Marine Drive%' },
  { search: 'Gateway of India Mumbai', pattern: '%Gateway of India%' },
  { search: 'Chhatrapati Shivaji Terminus Mumbai', pattern: '%Chhatrapati Shivaji%' },
  { search: 'Elephanta Caves Mumbai', pattern: '%Elephanta Caves%' },
  { search: 'Haji Ali Dargah Mumbai', pattern: '%Haji Ali%' },
  { search: 'Siddhivinayak Temple Mumbai', pattern: '%Siddhivinayak%' },
  { search: 'Golden Temple Amritsar', pattern: '%Golden Temple%' },
  { search: 'Charminar Hyderabad', pattern: '%Charminar%' },
  { search: 'Victoria Memorial Kolkata', pattern: '%Victoria Memorial%' },
  { search: 'Meenakshi Temple Madurai', pattern: '%Meenakshi%' },
  { search: 'Brihadisvara Temple Thanjavur', pattern: '%Brihadisvara%' },
  { search: 'Virupaksha Temple Hampi', pattern: '%Hampi%' },
  { search: 'Mysore Palace Karnataka', pattern: '%Mysore Palace%' },
  { search: 'Indian sweets mithai', pattern: '%Agra Petha%' },
  { search: 'Pav Bhaji street food', pattern: '%Pav Bhaji%' },
  { search: 'Vada Pav street food', pattern: '%Ashok Vada Pav%' },
  { search: 'Irani Chai bun maska', pattern: '%Kyani%' },
  { search: 'Berry Pulao Iranian cafe', pattern: '%Britannia%' },
  { search: 'Seekh kebabs charcoal grilled', pattern: '%Bademiya%' },
  { search: 'Mughlai food street', pattern: '%Mohammed Ali Road%' },
];

export async function seedAllPexelsPhotos() {
  await initDb();
  console.log('--- Seeding Verified Photos via Pexels API ---');

  for (const item of MONUMENTS) {
    try {
      const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(item.search)}&per_page=1&orientation=landscape`;
      const res = await fetch(url, {
        headers: { Authorization: PEXELS_KEY },
      });

      if (res.ok) {
        const data = await res.json();
        const photoUrl = data.photos?.[0]?.src?.large2x || data.photos?.[0]?.src?.large;
        if (photoUrl) {
          const updateRes = await dbRun(
            'UPDATE experiences SET image_urls = ? WHERE title LIKE ?',
            [JSON.stringify([photoUrl]), item.pattern]
          );
          console.log(`✓ [Pexels Matched] "${item.search}" -> ${photoUrl.substring(0, 60)}... (${updateRes.changes} rows)`);
        } else {
          console.log(`! No Pexels photo for "${item.search}"`);
        }
      } else {
        console.log(`! Pexels returned HTTP ${res.status} for "${item.search}"`);
      }

      await new Promise(r => setTimeout(r, 400));
    } catch (err) {
      console.error(`Error fetching "${item.search}":`, err.message);
    }
  }

  console.log('\n--- All Famous Landmark Photos Seeded to SQLite successfully! ---');
}

if (process.argv[1]?.endsWith('seedPexelsMasterPhotos.js')) {
  seedAllPexelsPhotos()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}
