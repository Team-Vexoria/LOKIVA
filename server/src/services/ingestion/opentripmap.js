/**
 * OpenTripMap & Wikidata / Wikimedia Enrichment Client
 * 
 * Data Honesty Principle:
 * - Notability scores (OTM rate 1-7 / Wikidata sitelinks) are stored strictly as `notability_score`
 *   and NEVER presented as user review ratings.
 * - If no verified image exists on Wikimedia Commons / OpenTripMap, `image_url` is left null/empty
 *   so the frontend renders an illustrated palette placeholder (never a generic stock photo).
 */

const USER_AGENT = 'LOKIVA-India-Enrichment/1.0 (contact: discovery@lokiva.in)';

/**
 * Enriches a place record with OpenTripMap / Wikidata cultural metadata
 * @param {object} place 
 * @returns {Promise<{
 *   otmXid: string | null,
 *   wikidataId: string | null,
 *   notabilityScore: number | null,
 *   enrichedDescription: string | null,
 *   imageUrl: string | null,
 *   wikipediaUrl: string | null
 * }>}
 */
export async function enrichPlace(place) {
  // If we already have a Wikidata ID from Overpass, fetch direct Wikimedia summary
  if (place.wikidataId) {
    try {
      const wikiData = await fetchWikidataSummary(place.wikidataId);
      if (wikiData) {
        return {
          otmXid: null,
          wikidataId: place.wikidataId,
          notabilityScore: wikiData.notabilityScore || 5,
          enrichedDescription: wikiData.description || null,
          imageUrl: wikiData.imageUrl || null,
          wikipediaUrl: wikiData.wikipediaUrl || null,
        };
      }
    } catch (err) {
      // Fallback silently if Wikidata fails
    }
  }

  // Fallback: Query OpenTripMap free radius search if API key or public endpoint is available
  try {
    const otmData = await queryOpenTripMapRadius(place.latitude, place.longitude, place.title);
    if (otmData) {
      return otmData;
    }
  } catch (err) {
    // Non-critical fallback
  }

  return {
    otmXid: null,
    wikidataId: place.wikidataId || null,
    notabilityScore: null,
    enrichedDescription: null,
    imageUrl: null,
    wikipediaUrl: place.wikipedia || null,
  };
}

/**
 * Fetches Wikipedia extracts & verified Commons images for a given Wikidata entity (e.g. Q12345)
 */
async function fetchWikidataSummary(wikidataId) {
  const url = `https://www.wikidata.org/wiki/Special:EntityData/${wikidataId}.json`;
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
  });

  if (!response.ok) return null;

  const data = await response.json();
  const entity = data.entities?.[wikidataId];
  if (!entity) return null;

  // English description
  const description = entity.descriptions?.en?.value || null;

  // Wikipedia article title
  const wikiTitle = entity.sitelinks?.enwiki?.title || null;
  const wikipediaUrl = wikiTitle ? `https://en.wikipedia.org/wiki/${encodeURIComponent(wikiTitle)}` : null;

  // Image claim (P18)
  const imageClaim = entity.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
  let imageUrl = null;
  if (imageClaim) {
    // Verified Wikimedia Commons image URL
    imageUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(imageClaim)}?width=600`;
  }

  // Notability score calculated from Wikipedia sitelinks count (1-10)
  const sitelinksCount = Object.keys(entity.sitelinks || {}).length;
  const notabilityScore = Math.min(10, Math.max(1, Math.round(sitelinksCount / 3)));

  return {
    description,
    imageUrl,
    wikipediaUrl,
    notabilityScore,
  };
}

/**
 * Queries OpenTripMap by coordinate radius (free open endpoint fallback)
 */
async function queryOpenTripMapRadius(lat, lng, name) {
  const apiKey = process.env.OPENTRIPMAP_API_KEY || '5ae2e3f221c38a28845f05b6e680a6cf807f7be90f11bb9e53ce8474';
  const url = `https://api.opentripmap.com/0.1/en/places/radius?radius=500&lon=${lng}&lat=${lat}&name=${encodeURIComponent(name)}&format=json&apikey=${apiKey}`;

  try {
    const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!response.ok) return null;

    const items = await response.json();
    if (!Array.isArray(items) || items.length === 0) return null;

    const bestMatch = items[0];
    return {
      otmXid: bestMatch.xid || null,
      wikidataId: bestMatch.wikidata || null,
      notabilityScore: bestMatch.rate || 3,
      enrichedDescription: null,
      imageUrl: null,
      wikipediaUrl: bestMatch.wikipedia || null,
    };
  } catch {
    return null;
  }
}
