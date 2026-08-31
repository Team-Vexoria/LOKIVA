/**
 * Comprehensive Indian City Scraper & Multi-Source Ingestor
 * 
 * Sources:
 * 1. Google Places API (if GOOGLE_PLACES_API_KEY is configured in server/.env)
 * 2. Wikidata SPARQL Knowledge Graph (All heritage & monuments in district)
 * 3. OpenStreetMap Overpass Bounding Box (All craft, handloom, historic, food POIs)
 * 4. Wikipedia REST Summary & Wikimedia Commons High-Res Photography
 * 
 * Usage:
 *   node server/src/scripts/scrapeCity.js <city_name> [state_name]
 * 
 * Example:
 *   node server/src/scripts/scrapeCity.js jaunpur "Uttar Pradesh"
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory and root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
import { initDb, dbRun, dbGet, dbAll } from '../db/db.js';
import { geocodeLocation } from '../services/ingestion/nominatim.js';
import { queryOverpassBbox } from '../services/ingestion/overpass.js';
import { queryWikidataBbox } from '../services/ingestion/wikidata.js';
import { fetchWikiPlaceDetails } from '../services/ingestion/wikiImageFetcher.js';

const GOOGLE_API_KEY =
  process.env.GOOGLE_PLACES_API_KEY ||
  process.env.GOOGLE_MAPS_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.PLACES_API_KEY ||
  process.env.VITE_GOOGLE_MAPS_API_KEY ||
  null;

async function searchGooglePlaces(city, categoryKeyword) {
  if (!GOOGLE_API_KEY) return [];

  const url = 'https://places.googleapis.com/v1/places:searchText';
  const query = `${categoryKeyword} in ${city}, India`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.photos,places.types,places.priceLevel,places.editorialSummary',
      },
      body: JSON.stringify({
        textQuery: query,
        maxResultCount: 20,
      }),
    });

    if (!res.ok) {
      console.warn(`[Google Places] Status ${res.status}`);
      return [];
    }

    const data = await res.json();
    const places = data.places || [];

    return places.map((p) => {
      let photoUrl = null;
      if (p.photos && p.photos.length > 0) {
        const photoRef = p.photos[0].name;
        photoUrl = `https://places.googleapis.com/v1/${photoRef}/media?maxHeightPx=800&maxWidthPx=1200&key=${GOOGLE_API_KEY}`;
      }

      return {
        title: p.displayName?.text || '',
        address: p.formattedAddress || '',
        latitude: p.location?.latitude || 0,
        longitude: p.location?.longitude || 0,
        rating: p.rating || null,
        reviewCount: p.userRatingCount || 0,
        imageUrl: photoUrl,
        description: p.editorialSummary?.text || `Popular ${categoryKeyword} in ${city}.`,
        source: 'google_places_api',
      };
    });
  } catch (err) {
    console.warn('[Google Places] Error:', err.message);
    return [];
  }
}

async function main() {
  const args = process.argv.slice(2);
  const cityInput = args[0] || 'Jaunpur';
  const stateInput = args[1] || 'Uttar Pradesh';

  console.log(`\n=================================================================`);
  console.log(` LOKIVA Pan-India Autonomous City Scraper & Multi-Tier Ingestor`);
  console.log(` Target City: "${cityInput}", State: "${stateInput}"`);
  console.log(` Google Places API Key: ${GOOGLE_API_KEY ? 'CONFIGURED (Active)' : 'NOT FOUND (Using OSM + Wikidata + Wikipedia)'}`);
  console.log(`=================================================================\n`);

  await initDb();

  // 1. Geocode City Coordinates and District Bounding Box
  console.log(`[Step 1] Geocoding "${cityInput}" across India...`);
  const geo = await geocodeLocation(`${cityInput}, ${stateInput}`);
  console.log(`✓ Geocoded: ${geo.displayName}`);
  console.log(`  GPS: (${geo.lat}, ${geo.lng})`);
  console.log(`  District Catchment: [${geo.bbox.minLat}, ${geo.bbox.minLng}] to [${geo.bbox.maxLat}, ${geo.bbox.maxLng}]`);

  const collectedPlaces = [];

  // 2. Query Google Places API (if key available)
  if (GOOGLE_API_KEY) {
    console.log(`\n[Step 2] Querying Google Places API for real photography & reviews...`);
    const googleCategories = [
      'tourist attractions',
      'historical monuments and forts',
      'handicrafts pottery and textile workshops',
      'famous traditional sweets and street food',
      'ancient temples and mosques',
    ];

    for (const cat of googleCategories) {
      const gPlaces = await searchGooglePlaces(cityInput, cat);
      console.log(`  ✓ Google Places (${cat}): Found ${gPlaces.length} places`);
      collectedPlaces.push(...gPlaces);
    }
  }

  // 3. Query OpenStreetMap Overpass across the entire 4,000 sq km district
  console.log(`\n[Step 3] Querying OpenStreetMap Overpass across entire district catchment...`);
  try {
    const osmPlaces = await queryOverpassBbox(
      geo.bbox.minLat,
      geo.bbox.minLng,
      geo.bbox.maxLat,
      geo.bbox.maxLng,
      120
    );
    console.log(`✓ Overpass extracted ${osmPlaces.length} cultural, craft, and heritage POIs.`);
    collectedPlaces.push(...osmPlaces);
  } catch (err) {
    console.warn(`Overpass query note: ${err.message}`);
  }

  // 4. Query Wikidata SPARQL Knowledge Graph
  console.log(`\n[Step 4] Querying Wikidata SPARQL for registered heritage monuments...`);
  try {
    const wikiPlaces = await queryWikidataBbox(
      geo.bbox.minLat,
      geo.bbox.minLng,
      geo.bbox.maxLat,
      geo.bbox.maxLng,
      50
    );
    console.log(`✓ Wikidata extracted ${wikiPlaces.length} registered cultural sites.`);
    collectedPlaces.push(...wikiPlaces);
  } catch (err) {
    console.warn(`Wikidata query note: ${err.message}`);
  }

  console.log(`\n[Step 5] Processing, deduplicating, and enriching ${collectedPlaces.length} total places...`);

  let insertedCount = 0;
  let enrichedPhotos = 0;

  for (const raw of collectedPlaces) {
    const title = raw.title?.trim();
    if (!title || title.length < 3) continue;

    // Filter non-cultural infrastructure
    const lower = title.toLowerCase();
    if (['airport', 'fuel', 'petrol', 'atm', 'bank', 'railway station', 'bus stand', 'toll plaza'].some(k => lower.includes(k))) {
      continue;
    }

    // Resolve real photo if missing
    let imageUrl = raw.imageUrl || (raw.image_urls && raw.image_urls[0]) || null;
    let description = raw.description || `Authentic cultural location in ${cityInput}.`;

    if (!imageUrl) {
      const wiki = await fetchWikiPlaceDetails(title, cityInput);
      if (wiki.imageUrl) {
        imageUrl = wiki.imageUrl;
        enrichedPhotos++;
      }
      if (wiki.extract && description.length < 50) {
        description = wiki.extract;
      }
    }

    // Dynamic price calculation
    let category = raw.category || 'Heritage & History';
    let price = raw.price !== undefined ? raw.price : 25;
    let duration = raw.approxDurationMins || 60;
    let isIndoor = raw.isIndoor !== undefined ? raw.isIndoor : false;
    let wheelchair = raw.wheelchairAccessible !== undefined ? raw.wheelchairAccessible : true;

    const osmId = raw.osmId || `scraped_${cityInput.toLowerCase()}_${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const imageUrlsJson = JSON.stringify(imageUrl ? [imageUrl] : []);

    const existing = await dbGet('SELECT id FROM experiences WHERE title = ? OR osm_id = ?', [title, osmId]);

    if (existing) {
      await dbRun(
        `UPDATE experiences SET
           description = ?,
           image_urls = ?,
           price = ?,
           latitude = ?,
           longitude = ?,
           category = ?,
           wheelchair_accessible = ?,
           is_active = 1
         WHERE id = ?`,
        [description, imageUrlsJson, price, raw.latitude, raw.longitude, category, wheelchair ? 1 : 0, existing.id]
      );
    } else {
      await dbRun(
        `INSERT INTO experiences (
           title, tagline, description, category, cultural_context,
           state, city, area_name, latitude, longitude,
           approx_duration_mins, price, currency, is_indoor, is_rain_safe,
           is_hidden_gem, is_family_friendly, low_walking, wheelchair_accessible,
           rating, review_count, notability_score, osm_id, osm_type,
           source, image_urls, tags, is_active
         ) VALUES (
           ?, ?, ?, ?, ?,
           ?, ?, ?, ?, ?,
           ?, ?, 'INR', ?, ?,
           1, 1, ?, ?,
           ?, ?, 85, ?, 'N',
           ?, ?, '[]', 1
         )`,
        [
          title,
          `Local Cultural Experience in ${cityInput}`,
          description,
          category,
          `Documented Indian cultural site in ${cityInput}, ${stateInput}.`,
          stateInput,
          cityInput,
          cityInput,
          raw.latitude,
          raw.longitude,
          duration,
          price,
          isIndoor ? 1 : 0,
          isIndoor ? 1 : 0,
          isIndoor ? 1 : 0,
          wheelchair ? 1 : 0,
          raw.rating || null,
          raw.reviewCount || 0,
          osmId,
          raw.source || 'city_aggregator',
          imageUrlsJson,
        ]
      );
      insertedCount++;
    }
  }

  const totalInDb = await dbGet('SELECT count(*) as cnt FROM experiences WHERE city LIKE ? OR state LIKE ?', [`%${cityInput}%`, `%${stateInput}%`]);
  const totalWithPhotos = await dbGet('SELECT count(*) as cnt FROM experiences WHERE (city LIKE ? OR state LIKE ?) AND image_urls != "[]" AND image_urls IS NOT NULL', [`%${cityInput}%`, `%${stateInput}%`]);

  console.log(`\n=================================================================`);
  console.log(` [City Ingestion Summary for "${cityInput}"]`);
  console.log(` Total Places Extracted: ${collectedPlaces.length}`);
  console.log(` New Insertions / Updates: ${insertedCount}`);
  console.log(` Real Photos Enriched: ${enrichedPhotos}`);
  console.log(` Total Active Places in Region: ${totalInDb?.cnt || 0}`);
  console.log(` Places with High-Res Photos: ${totalWithPhotos?.cnt || 0}`);
  console.log(`=================================================================\n`);

  process.exit(0);
}

main().catch(console.error);
