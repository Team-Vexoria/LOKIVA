/**
 * OpenStreetMap Nominatim Geocoding Client with Automatic Photon Failover
 * 
 * Complies strictly with OSM Nominatim Usage Policy:
 * - Specific, descriptive User-Agent header with product name and contact
 * - Enforces minimum 1.1s inter-request spacing to prevent server load
 * - Automatic failover to Photon API if Nominatim is busy or times out
 */

import { geocodeWithPhoton } from './photon.js';

const USER_AGENT = 'LOKIVA-India-Cultural-Engine/1.0 (contact: discovery@lokiva.in)';
let lastRequestTime = 0;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function rateLimitedFetch(url) {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < 1100) {
    await delay(1100 - elapsed);
  }
  lastRequestTime = Date.now();

  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'application/json',
      'Accept-Language': 'en-IN,en;q=0.9,hi;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error(`Nominatim query failed (${response.status}): ${response.statusText}`);
  }

  return response.json();
}

/**
 * Geocodes an arbitrary query string (city, town, district, landmark) anywhere in India
 * @param {string} query 
 * @returns {Promise<{
 *   displayName: string,
 *   lat: number,
 *   lng: number,
 *   bbox: { minLat: number, minLng: number, maxLat: number, maxLng: number },
 *   state: string,
 *   cityOrDistrict: string,
 *   osmId: string,
 *   osmType: string
 * }>}
 */
export async function geocodeLocation(query) {
  if (!query || typeof query !== 'string' || !query.trim()) {
    throw new Error('Geocoding query cannot be empty');
  }

  const encoded = encodeURIComponent(query.trim());
  const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&countrycodes=in&format=json&addressdetails=1&limit=1`;

  try {
    const results = await rateLimitedFetch(url);

    if (results && results.length > 0) {
      return parseNominatimResult(results[0]);
    }

    // Fallback search with ", India" suffix
    const fallbackUrl = `https://nominatim.openstreetmap.org/search?q=${encoded},+India&format=json&addressdetails=1&limit=1`;
    const fallbackResults = await rateLimitedFetch(fallbackUrl);
    if (fallbackResults && fallbackResults.length > 0) {
      return parseNominatimResult(fallbackResults[0]);
    }
  } catch (nominatimErr) {
    console.warn(`Nominatim primary failed for "${query}": ${nominatimErr.message}. Attempting Photon backup...`);
  }

  // Backup Tier: Photon Geocoder
  const photonResult = await geocodeWithPhoton(query);
  if (photonResult) {
    return photonResult;
  }

  throw new Error(`Location "${query}" could not be resolved across Indian geocoders`);
}

/**
 * Reverse geocodes GPS coordinates into an administrative location
 * @param {number} lat 
 * @param {number} lng 
 */
export async function reverseGeocode(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
    const result = await rateLimitedFetch(url);
    if (result && result.lat && result.lon) {
      return parseNominatimResult(result);
    }
  } catch (err) {
    console.warn(`Nominatim reverse geocode error: ${err.message}`);
  }

  // Generic fallback if reverse geocoding fails
  return {
    displayName: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)}), India`,
    lat,
    lng,
    bbox: {
      minLat: lat - 0.05,
      minLng: lng - 0.05,
      maxLat: lat + 0.05,
      maxLng: lng + 0.05,
    },
    state: 'India',
    cityOrDistrict: 'Local Area',
    osmId: '',
    osmType: 'N',
  };
}

function parseNominatimResult(item) {
  const boundingBox = item.boundingbox || [];
  const minLat = parseFloat(boundingBox[0]) || parseFloat(item.lat) - 0.05;
  const maxLat = parseFloat(boundingBox[1]) || parseFloat(item.lat) + 0.05;
  const minLng = parseFloat(boundingBox[2]) || parseFloat(item.lon) - 0.05;
  const maxLng = parseFloat(boundingBox[3]) || parseFloat(item.lon) + 0.05;

  const addr = item.address || {};
  const state = addr.state || addr.state_district || 'India';
  const cityOrDistrict =
    addr.city ||
    addr.town ||
    addr.village ||
    addr.suburb ||
    addr.municipality ||
    addr.county ||
    addr.state_district ||
    item.name ||
    'Local Area';

  return {
    displayName: item.display_name,
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
    bbox: {
      minLat: Math.min(minLat, maxLat),
      minLng: Math.min(minLng, maxLng),
      maxLat: Math.max(minLat, maxLat),
      maxLng: Math.max(minLng, maxLng),
    },
    state,
    cityOrDistrict,
    osmId: String(item.osm_id || ''),
    osmType: String(item.osm_type || ''),
  };
}
