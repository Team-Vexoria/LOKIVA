import { dbAll, dbGet } from '../db/db.js';

// Pre-seeded prominent heritage landmarks and city centers of India
const KNOWN_POIS = [
  { name: 'City Palace', city: 'Jaipur', state: 'Rajasthan', lat: 26.9258, lng: 75.8237 },
  { name: 'Hawa Mahal', city: 'Jaipur', state: 'Rajasthan', lat: 26.9239, lng: 75.8267 },
  { name: 'Amer Fort', city: 'Jaipur', state: 'Rajasthan', lat: 26.9855, lng: 75.8513 },
  { name: 'Jantar Mantar', city: 'Jaipur', state: 'Rajasthan', lat: 26.9248, lng: 75.8246 },
  { name: 'Albert Hall Museum', city: 'Jaipur', state: 'Rajasthan', lat: 26.9116, lng: 75.8195 },
  { name: 'Jaipur Railway Station', city: 'Jaipur', state: 'Rajasthan', lat: 26.9196, lng: 75.7878 },
  { name: 'Kashi Vishwanath Temple', city: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3109, lng: 83.0107 },
  { name: 'Dashashwamedh Ghat', city: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3069, lng: 83.0104 },
  { name: 'Assi Ghat', city: 'Varanasi', state: 'Uttar Pradesh', lat: 25.2885, lng: 82.9998 },
  { name: 'Gateway of India', city: 'Mumbai', state: 'Maharashtra', lat: 18.9220, lng: 72.8347 },
  { name: 'Marine Drive', city: 'Mumbai', state: 'Maharashtra', lat: 18.9432, lng: 72.8230 },
  { name: 'Colaba Causeway', city: 'Mumbai', state: 'Maharashtra', lat: 18.9180, lng: 72.8290 },
  { name: 'Bandra Bandstand', city: 'Mumbai', state: 'Maharashtra', lat: 19.0435, lng: 72.8197 },
  { name: 'Chhatrapati Shivaji Maharaj Terminus', city: 'Mumbai', state: 'Maharashtra', lat: 18.9400, lng: 72.8354 },
  { name: 'Taj Mahal', city: 'Agra', state: 'Uttar Pradesh', lat: 27.1751, lng: 78.0421 },
  { name: 'Agra Fort', city: 'Agra', state: 'Uttar Pradesh', lat: 27.1795, lng: 78.0211 },
  { name: 'Red Fort', city: 'Delhi', state: 'Delhi', lat: 28.6562, lng: 77.2410 },
  { name: 'India Gate', city: 'Delhi', state: 'Delhi', lat: 28.6129, lng: 77.2295 },
  { name: 'Qutub Minar', city: 'Delhi', state: 'Delhi', lat: 28.5245, lng: 77.1855 },
  { name: 'Chandni Chowk', city: 'Delhi', state: 'Delhi', lat: 28.6506, lng: 77.2303 },
  { name: 'Fort Kochi', city: 'Kochi', state: 'Kerala', lat: 9.9658, lng: 76.2421 },
  { name: 'Mattancherry Palace', city: 'Kochi', state: 'Kerala', lat: 9.9583, lng: 76.2592 },
  { name: 'Virupaksha Temple', city: 'Hampi', state: 'Karnataka', lat: 15.3350, lng: 76.4600 },
  { name: 'Golden Temple', city: 'Amritsar', state: 'Punjab', lat: 31.6200, lng: 74.8765 },
  // Major City Centroids
  { name: 'Jaipur', city: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873 },
  { name: 'Varanasi', city: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lng: 82.9739 },
  { name: 'Mumbai', city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
  { name: 'Delhi', city: 'Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090 },
  { name: 'Udaipur', city: 'Udaipur', state: 'Rajasthan', lat: 24.5854, lng: 73.7125 },
  { name: 'Agra', city: 'Agra', state: 'Uttar Pradesh', lat: 27.1767, lng: 78.0081 },
  { name: 'Kochi', city: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673 },
  { name: 'Goa', city: 'Panaji', state: 'Goa', lat: 15.4909, lng: 73.8278 },
  { name: 'Amritsar', city: 'Amritsar', state: 'Punjab', lat: 31.6340, lng: 74.8723 },
  { name: 'Hampi', city: 'Hampi', state: 'Karnataka', lat: 15.3350, lng: 76.4600 },
];

/**
 * Resolves a named location or anchor to { lat, lng, name, city, state }
 * Fast path: checks known POIs registry and database listings.
 * Fallback: Google Geocoding API if configured.
 */
export async function resolveLocationAnchor(locationStr) {
  if (!locationStr || typeof locationStr !== 'string') return null;

  const query = locationStr.trim().toLowerCase();

  // 1. Fast path: check known POIs
  for (const poi of KNOWN_POIS) {
    const poiName = poi.name.toLowerCase();
    if (
      query === poiName ||
      query.includes(poiName) ||
      poiName.includes(query) ||
      (query.includes(poi.city.toLowerCase()) && query.includes(poiName))
    ) {
      return {
        lat: poi.lat,
        lng: poi.lng,
        name: poi.name,
        city: poi.city,
        state: poi.state,
        source: 'known_pois',
      };
    }
  }

  // 2. Check local database listings for matching title or area
  try {
    const dbRows = await dbAll(
      `SELECT title, city, state, latitude, longitude 
       FROM experiences 
       WHERE latitude IS NOT NULL 
         AND (LOWER(title) LIKE ? OR LOWER(city) LIKE ? OR LOWER(neighborhood) LIKE ?) 
       LIMIT 1`,
      [`%${query}%`, `%${query}%`, `%${query}%`]
    );

    if (dbRows && dbRows.length > 0) {
      const match = dbRows[0];
      return {
        lat: match.latitude,
        lng: match.longitude,
        name: match.title,
        city: match.city,
        state: match.state,
        source: 'database_listing',
      };
    }
  } catch (err) {
    console.warn('[LocationResolver] DB lookup error:', err?.message || err);
  }

  // 3. Fallback: Google Geocoding API if key is present
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.MAPS_API_KEY;
  if (apiKey) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        locationStr + ', India'
      )}&key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.status === 'OK' && json.results && json.results.length > 0) {
        const top = json.results[0];
        const lat = top.geometry.location.lat;
        const lng = top.geometry.location.lng;
        return {
          lat,
          lng,
          name: top.formatted_address,
          city: '',
          state: '',
          source: 'google_geocoding',
        };
      }
    } catch (err) {
      console.warn('[LocationResolver] Geocoding error:', err?.message || err);
    }
  }

  return null;
}
