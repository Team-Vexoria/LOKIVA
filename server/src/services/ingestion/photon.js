/**
 * Photon Geocoding Client (Backup Geocoder)
 * 
 * Uses Komoot's open Photon API powered by OpenStreetMap data.
 * Acts as high-speed, zero-rate-limit fallback when Nominatim is busy or times out.
 */

const USER_AGENT = 'LOKIVA-India-Cultural-Engine/1.0 (contact: discovery@lokiva.in)';

/**
 * Geocodes an arbitrary Indian query using Photon API
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
 * } | null>}
 */
export async function geocodeWithPhoton(query) {
  if (!query || typeof query !== 'string' || !query.trim()) {
    return null;
  }

  try {
    const encoded = encodeURIComponent(query.trim());
    // Biased towards India bounding box [68.0, 6.5, 97.5, 37.5]
    const url = `https://photon.komoot.io/api/?q=${encoded}&limit=1&bbox=68.0,6.5,97.5,37.5`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      console.warn(`Photon geocoding responded with ${res.status}`);
      return null;
    }

    const data = await res.json();
    const feature = (data.features || [])[0];

    if (!feature || !feature.geometry || !feature.geometry.coordinates) {
      return null;
    }

    const [lng, lat] = feature.geometry.coordinates;
    const props = feature.properties || {};

    const name = props.name || query.trim();
    const city = props.city || props.town || props.district || props.county || name;
    const state = props.state || 'India';
    const country = props.country || 'India';

    // Build bounding box (default +/- 0.06 deg if not provided)
    const extent = props.extent; // [minLng, maxLat, maxLng, minLat]
    let minLat, maxLat, minLng, maxLng;

    if (extent && extent.length === 4) {
      minLng = extent[0];
      maxLat = extent[1];
      maxLng = extent[2];
      minLat = extent[3];
    } else {
      minLat = lat - 0.05;
      maxLat = lat + 0.05;
      minLng = lng - 0.05;
      maxLng = lng + 0.05;
    }

    const displayName = `${name}, ${city ? city + ', ' : ''}${state}, ${country}`;

    return {
      displayName,
      lat,
      lng,
      bbox: {
        minLat: Math.min(minLat, maxLat),
        minLng: Math.min(minLng, maxLng),
        maxLat: Math.max(minLat, maxLat),
        maxLng: Math.max(minLng, maxLng),
      },
      state,
      cityOrDistrict: city,
      osmId: String(props.osm_id || ''),
      osmType: String(props.osm_type || 'N'),
    };
  } catch (err) {
    console.warn('Photon geocoding error:', err.message);
    return null;
  }
}
