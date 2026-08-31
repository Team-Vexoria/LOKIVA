import { dbRun, dbGet, dbAll } from '../../db/db.js';
import { geocodeLocation, reverseGeocode } from './nominatim.js';
import { queryOverpassBbox } from './overpass.js';
import { queryWikidataBbox } from './wikidata.js';
import { enrichPlace } from './opentripmap.js';
import { fetchWikiPlaceDetails } from './wikiImageFetcher.js';

const CACHE_FRESHNESS_DAYS = 30;

/**
 * Resolves experiences for ANY arbitrary location in India on-demand.
 * 
 * Multi-Tier Pipeline:
 * 1. Geocode location via Nominatim (with automatic Photon backup - NO hardcoded lists)
 * 2. Check cached_regions table for an existing bounding box within 30 days
 * 3. Tier 1 Live: Query Overpass API across 3 rotating mirrors
 * 4. Tier 2 Backup: If Overpass fails or yields sparse data, query Wikidata SPARQL Knowledge Graph
 * 5. Persist to SQLite experiences & cached_regions tables with honest data (unrated stays null)
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

  // Step 3: Fetch live places (Tier 1: Overpass API, Tier 2 Fallback: Wikidata SPARQL)
  let rawElements = [];
  let extractionSource = 'osm_overpass';

  try {
    rawElements = await queryOverpassBbox(
      bbox.minLat,
      bbox.minLng,
      bbox.maxLat,
      bbox.maxLng,
      options.limit || 50
    );
  } catch (overpassErr) {
    console.warn(`Overpass extraction failed: ${overpassErr.message}. Attempting Wikidata SPARQL backup...`);
  }

  // If Overpass yielded sparse data (< 3 items) or failed, pull from Wikidata SPARQL
  if (rawElements.length < 3) {
    try {
      const wikiPlaces = await queryWikidataBbox(
        bbox.minLat,
        bbox.minLng,
        bbox.maxLat,
        bbox.maxLng,
        options.limit || 40
      );

      if (wikiPlaces.length > 0) {
        // Merge or replace
        rawElements = [...rawElements, ...wikiPlaces];
        extractionSource = rawElements.length > wikiPlaces.length ? 'hybrid_osm_wikidata' : 'wikidata';
      }
    } catch (wikiErr) {
      console.warn(`Wikidata backup extraction failed: ${wikiErr.message}`);
    }
  }

  let placesPersisted = 0;
  let placesEnriched = 0;

  for (const raw of rawElements) {
    let enriched = {
      otmXid: null,
      wikidataId: raw.wikidataId,
      notabilityScore: raw.notabilityScore || null,
      enrichedDescription: null,
      imageUrl: raw.imageUrl || null,
      wikipediaUrl: null,
    };

    if (raw.wikidataId && !raw.imageUrl) {
      try {
        enriched = await enrichPlace(raw);
        if (enriched.notabilityScore) placesEnriched++;
      } catch {
        // Non-blocking enrichment
      }
    }

    // If still no image, query Wikipedia / Wikimedia REST summary
    if (!enriched.imageUrl && !raw.imageUrl) {
      try {
        const wikiInfo = await fetchWikiPlaceDetails(raw.title, cityOrDistrict);
        if (wikiInfo.imageUrl) {
          enriched.imageUrl = wikiInfo.imageUrl;
          placesEnriched++;
        }
        if (wikiInfo.extract && !enriched.enrichedDescription) {
          enriched.enrichedDescription = wikiInfo.extract;
        }
      } catch {
        // Non-blocking
      }
    }

    const finalDescription = enriched.enrichedDescription || raw.description;
    const finalImageUrl = enriched.imageUrl || raw.imageUrl;
    const imageUrlsJson = JSON.stringify(finalImageUrl ? [finalImageUrl] : []);
    const rawTagsJson = typeof raw.rawTags === 'string' ? raw.rawTags : JSON.stringify(raw.rawTags || {});

    // Check if place already exists by osm_id
    const existing = await dbGet('SELECT id FROM experiences WHERE osm_id = ?', [raw.osmId]);

    if (existing) {
      await dbRun(
        `UPDATE experiences SET
           title = ?,
           description = ?,
           category = ?,
           notability_score = ?,
           image_urls = ?,
           source = ?,
           is_active = 1
         WHERE id = ?`,
        [raw.title, finalDescription, raw.category, enriched.notabilityScore, imageUrlsJson, raw.source || extractionSource, existing.id]
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
           ?, ?, ?, ?, ?, '[]', 1
         )`,
        [
          raw.title,
          raw.tagline || 'Authentic Cultural Place',
          finalDescription,
          raw.category,
          raw.culturalContext || 'Documented under Indian open cultural archives.',
          state,
          cityOrDistrict,
          cityOrDistrict,
          raw.latitude,
          raw.longitude,
          raw.approxDurationMins || 60,
          raw.price || 150,
          raw.isIndoor ? 1 : 0,
          raw.isRainSafe ? 1 : 0,
          raw.isFamilyFriendly !== false ? 1 : 0,
          raw.lowWalking ? 1 : 0,
          raw.wheelchairAccessible ? 1 : 0,
          enriched.notabilityScore || 75,
          raw.osmId,
          raw.osmType || 'N',
          enriched.otmXid,
          enriched.wikidataId,
          raw.source || extractionSource,
          rawTagsJson,
          imageUrlsJson,
        ]
      );
      placesPersisted++;
    }
  }

  // Persist to cached_regions
  if (rawElements.length > 0) {
    await dbRun(
      `INSERT INTO cached_regions (
         min_lat, min_lng, max_lat, max_lng, center_lat, center_lng, display_name, place_count, last_fetched_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [bbox.minLat, bbox.minLng, bbox.maxLat, bbox.maxLng, lat, lng, displayName, rawElements.length]
    );
  }

  // Fetch newly stored experiences in bbox
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
    source: extractionSource,
    freshness: new Date().toISOString(),
    isLiveIngested: true,
    stats: {
      totalFound: rawElements.length,
      placesPersisted,
      placesEnriched,
      durationMs,
    },
  };
}

/**
 * Fetches all active experiences within a geographical bounding box
 */
async function fetchExperiencesInBbox(minLat, minLng, maxLat, maxLng) {
  const pad = 0.02; // Small buffer for nearby edge POIs
  const rows = await dbAll(
    `SELECT * FROM experiences 
     WHERE latitude BETWEEN ? AND ?
       AND longitude BETWEEN ? AND ?
       AND is_active = 1
     ORDER BY notability_score DESC NULLS LAST, id ASC
     LIMIT 100`,
    [minLat - pad, maxLat + pad, minLng - pad, maxLng + pad]
  );

  return rows.map(formatExperienceRow);
}

function formatExperienceRow(row) {
  let images = [];
  try {
    images = JSON.parse(row.image_urls || '[]');
  } catch {
    images = [];
  }

  let tags = [];
  try {
    tags = JSON.parse(row.tags || '[]');
  } catch {
    tags = [];
  }

  return {
    id: String(row.id),
    title: row.title,
    tagline: row.tagline,
    description: row.description,
    category: row.category,
    cultural_context: row.cultural_context,
    state: row.state,
    city: row.city,
    area_name: row.area_name,
    latitude: row.latitude,
    longitude: row.longitude,
    duration_mins: row.approx_duration_mins,
    price_inr: row.price,
    price: row.price,
    currency: row.currency,
    is_indoor: Boolean(row.is_indoor),
    is_rain_safe: Boolean(row.is_rain_safe),
    is_hidden_gem: Boolean(row.is_hidden_gem),
    is_family_friendly: Boolean(row.is_family_friendly),
    low_walking: Boolean(row.low_walking),
    wheelchair_accessible: Boolean(row.wheelchair_accessible),
    rating: row.rating, // Honest rating (null if unrated)
    review_count: row.review_count,
    notability_score: row.notability_score,
    source: row.source,
    image_urls: images,
    tags,
  };
}

async function logIngestionRun(query, resolvedName, status, fetched, inserted, enriched, durationMs, errorMsg) {
  try {
    await dbRun(
      `INSERT INTO ingestion_logs (
         query, resolved_name, status, places_fetched, places_inserted, places_enriched, duration_ms, error_message, created_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [query, resolvedName, status, fetched, inserted, enriched, durationMs, errorMsg]
    );
  } catch {
    // Non-blocking log
  }
}

/**
 * Returns overall statistics about cached data and ingestion runs
 */
export async function getIngestionStats() {
  const totalExperiences = await dbGet('SELECT COUNT(*) as cnt FROM experiences WHERE is_active = 1');
  const openDataCount = await dbGet("SELECT COUNT(*) as cnt FROM experiences WHERE source IN ('osm_overpass', 'wikidata', 'hybrid_osm_wikidata')");
  const cachedRegionsCount = await dbGet('SELECT COUNT(*) as cnt FROM cached_regions');
  const recentLogs = await dbAll('SELECT * FROM ingestion_logs ORDER BY id DESC LIMIT 10');

  return {
    coverage: {
      total_experiences: totalExperiences?.cnt || 0,
      open_data_ingested: openDataCount?.cnt || 0,
      cached_regions: cachedRegionsCount?.cnt || 0,
    },
    recent_logs: recentLogs || [],
  };
}
