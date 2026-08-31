import { dbRun, dbGet, dbAll } from '../../db/db.js';
import { geocodeLocation, reverseGeocode } from './nominatim.js';
import { queryOverpassBbox } from './overpass.js';
import { enrichPlace } from './opentripmap.js';

const CACHE_FRESHNESS_DAYS = 30;

/**
 * Resolves experiences for ANY arbitrary location in India on-demand.
 * 
 * Flow:
 * 1. Geocode location via Nominatim (no hardcoded lists!)
 * 2. Check cached_regions table for an existing bounding box within 30 days
 * 3. If stale or uncached: fetch live from Overpass + enrich via Wikidata/OTM + persist to cache
 * 4. Serve the result directly from the fresh cache
 * 
 * @param {string | { lat: number, lng: number }} locationInput
 * @param {object} options
 */
export async function resolveExperiencesForLocation(locationInput, options = {}) {
  const startTime = Date.now();
  let geocoded;

  // Step 1: Geocode input (text or coordinates)
  if (typeof locationInput === 'object' && locationInput.lat && locationInput.lng) {
    geocoded = await reverseGeocode(locationInput.lat, locationInput.lng);
  } else if (typeof locationInput === 'string' && locationInput.trim()) {
    geocoded = await geocodeLocation(locationInput.trim());
  } else {
    throw new Error('Valid location query or coordinates are required');
  }

  const { displayName, lat, lng, bbox, state, cityOrDistrict } = geocoded;

  // Step 2: Check cached_regions table
  const existingRegion = await dbGet(
    `SELECT * FROM cached_regions
     WHERE min_lat <= ? AND max_lat >= ?
       AND min_lng <= ? AND max_lng >= ?
       AND datetime(last_fetched_at, '+' || ? || ' days') > datetime('now')
     ORDER BY place_count DESC LIMIT 1`,
    [lat, lat, lng, lng, CACHE_FRESHNESS_DAYS]
  );

  if (existingRegion && existingRegion.place_count > 0 && !options.forceRefresh) {
    // Return cached experiences directly
    const cachedPlaces = await fetchExperiencesInBbox(
      existingRegion.min_lat,
      existingRegion.min_lng,
      existingRegion.max_lat,
      existingRegion.max_lng
    );

    if (cachedPlaces.length > 0) {
      await logIngestionRun(
        displayName,
        displayName,
        'cached',
        cachedPlaces.length,
        0,
        0,
        Date.now() - startTime,
        null
      );

      return {
        location: {
          displayName,
          lat,
          lng,
          state,
          city: cityOrDistrict,
          bbox,
        },
        experiences: cachedPlaces,
        source: 'local_cache',
        freshness: existingRegion.last_fetched_at,
        isLiveIngested: false,
      };
    }
  }

  // Step 3: Fetch live from Overpass for this bounding box
  try {
    const rawElements = await queryOverpassBbox(
      bbox.minLat,
      bbox.minLng,
      bbox.maxLat,
      bbox.maxLng,
      options.limit || 50
    );

    let placesPersisted = 0;
    let placesEnriched = 0;

    for (const raw of rawElements) {
      // Enrich with Wikidata / Commons
      let enriched = {
        otmXid: null,
        wikidataId: raw.wikidataId,
        notabilityScore: null,
        enrichedDescription: null,
        imageUrl: null,
        wikipediaUrl: null,
      };

      if (raw.wikidataId) {
        try {
          enriched = await enrichPlace(raw);
          if (enriched.notabilityScore) placesEnriched++;
        } catch {
          // Non-blocking enrichment
        }
      }

      // Check if place already exists by osm_id
      const existing = await dbGet('SELECT id FROM experiences WHERE osm_id = ?', [raw.osmId]);

      const finalDescription = enriched.enrichedDescription || raw.description;
      const imageUrlsJson = JSON.stringify(enriched.imageUrl ? [enriched.imageUrl] : []);

      if (existing) {
        await dbRun(
          `UPDATE experiences SET
             title = ?,
             description = ?,
             category = ?,
             notability_score = ?,
             image_urls = ?,
             source = 'osm_overpass',
             is_active = 1
           WHERE id = ?`,
          [raw.title, finalDescription, raw.category, enriched.notabilityScore, imageUrlsJson, existing.id]
        );
      } else {
        await dbRun(
          `INSERT INTO experiences (
             title, tagline, description, category, cultural_context,
             state, city, area_name, latitude, longitude,
             approx_duration_mins, price, currency, is_indoor, is_rain_safe,
             is_hidden_gem, is_family_friendly, low_walking, wheelchair_accessible,
             rating, review_count, notability_score, osm_id, osm_type,
             otm_xid, wikidata_id, source, raw_osm_tags, image_urls, tags, is_active
           ) VALUES (
             ?, ?, ?, ?, ?,
             ?, ?, ?, ?, ?,
             ?, ?, 'INR', ?, ?,
             1, ?, ?, ?,
             NULL, 0, ?, ?, ?,
             ?, ?, 'osm_overpass', ?, ?, '[]', 1
           )`,
          [
            raw.title,
            raw.tagline,
            finalDescription,
            raw.category,
            raw.culturalContext,
            state,
            cityOrDistrict,
            cityOrDistrict,
            raw.latitude,
            raw.longitude,
            raw.approxDurationMins,
            raw.price,
            raw.isIndoor ? 1 : 0,
            raw.isRainSafe ? 1 : 0,
            raw.isWheelchair ? 1 : 0,
            raw.lowWalking ? 1 : 0,
            raw.isWheelchair ? 1 : 0,
            enriched.notabilityScore,
            raw.osmId,
            raw.osmType,
            enriched.otmXid,
            enriched.wikidataId,
            raw.rawTags,
            imageUrlsJson,
          ]
        );
        placesPersisted++;
      }
    }

    // Persist to cached_regions
    await dbRun(
      `INSERT INTO cached_regions (
         min_lat, min_lng, max_lat, max_lng, center_lat, center_lng, display_name, place_count, last_fetched_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [bbox.minLat, bbox.minLng, bbox.maxLat, bbox.maxLng, lat, lng, displayName, rawElements.length]
    );

    // Fetch newly stored experiences
    const freshPlaces = await fetchExperiencesInBbox(
      bbox.minLat,
      bbox.minLng,
      bbox.maxLat,
      bbox.maxLng
    );

    const durationMs = Date.now() - startTime;

    await logIngestionRun(
      typeof locationInput === 'string' ? locationInput : `${lat},${lng}`,
      displayName,
      'success',
      rawElements.length,
      placesPersisted,
      placesEnriched,
      durationMs,
      null
    );

    return {
      location: {
        displayName,
        lat,
        lng,
        state,
        city: cityOrDistrict,
        bbox,
      },
      experiences: freshPlaces,
      source: 'live_ingested_osm',
      freshness: new Date().toISOString(),
      isLiveIngested: true,
      stats: {
        found: rawElements.length,
        persisted: placesPersisted,
        enriched: placesEnriched,
        durationMs,
      },
    };
  } catch (err) {
    const durationMs = Date.now() - startTime;
    await logIngestionRun(
      typeof locationInput === 'string' ? locationInput : `${lat},${lng}`,
      displayName || 'Unknown',
      'failed',
      0,
      0,
      0,
      durationMs,
      err.message
    );
    throw err;
  }
}

/**
 * Queries the database for all active experiences within a geographic bounding box
 */
async function fetchExperiencesInBbox(minLat, minLng, maxLat, maxLng) {
  const rows = await dbAll(
    `SELECT * FROM experiences
     WHERE latitude BETWEEN ? AND ?
       AND longitude BETWEEN ? AND ?
       AND is_active = 1
     ORDER BY notability_score DESC, rating DESC LIMIT 60`,
    [minLat, maxLat, minLng, maxLng]
  );

  return rows.map(formatExperienceRow);
}

function formatExperienceRow(row) {
  return {
    id: row.id,
    title: row.title,
    tagline: row.tagline,
    description: row.description,
    category: row.category,
    cultural_context: row.cultural_context,
    state: row.state,
    city: row.city,
    city_name: row.city,
    area_name: row.area_name,
    latitude: row.latitude,
    longitude: row.longitude,
    approx_duration_mins: row.approx_duration_mins,
    duration_mins: row.approx_duration_mins,
    price: row.price,
    currency: row.currency,
    is_indoor: Boolean(row.is_indoor),
    is_rain_safe: Boolean(row.is_rain_safe),
    is_hidden_gem: Boolean(row.is_hidden_gem),
    is_family_friendly: Boolean(row.is_family_friendly),
    low_walking: Boolean(row.low_walking),
    accessibility_wheelchair: Boolean(row.wheelchair_accessible),
    wheelchair_accessible: Boolean(row.wheelchair_accessible),
    rating: row.rating !== null && row.rating !== undefined ? row.rating : null,
    review_count: row.review_count || 0,
    notability_score: row.notability_score,
    osm_id: row.osm_id,
    source: row.source,
    image_urls: JSON.parse(row.image_urls || '[]'),
    images: JSON.parse(row.image_urls || '[]'),
    tags: JSON.parse(row.tags || '[]'),
    why_it_fits: row.cultural_context
      ? `Verified ${row.category} from open heritage records.`
      : `Step-free accessible cultural site in ${row.city}.`,
  };
}

async function logIngestionRun(
  queryInput,
  resolvedLocation,
  status,
  placesFound,
  placesPersisted,
  placesEnriched,
  durationMs,
  errorMessage
) {
  try {
    await dbRun(
      `INSERT INTO ingestion_logs (
         query_input, resolved_location, status, places_found,
         places_persisted, places_enriched, duration_ms, error_message
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        queryInput,
        resolvedLocation,
        status,
        placesFound,
        placesPersisted,
        placesEnriched,
        durationMs,
        errorMessage,
      ]
    );
  } catch (err) {
    console.error('Failed to write ingestion log:', err);
  }
}
