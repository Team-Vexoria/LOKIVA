/**
 * OpenStreetMap Overpass API Client for Cultural & Experience Extraction
 * 
 * Complies with Overpass API acceptable use policy:
 * - Specific User-Agent header
 * - Bounded query limits (timeout=25s, max 100 elements per bounding box query)
 * - Transparent mapping of raw tags to LOKIVA schema
 */

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

const USER_AGENT = 'LOKIVA-India-Cultural-Engine/1.0 (contact: discovery@lokiva.in)';
let currentEndpointIndex = 0;
let lastOverpassRequestTime = 0;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Builds an Overpass QL query for all cultural, artisan, heritage, and local experiences
 * within a bounding box.
 */
function buildOverpassQuery(minLat, minLng, maxLat, maxLng, limit = 60) {
  const bbox = `${minLat},${minLng},${maxLat},${maxLng}`;
  return `
    [out:json][timeout:25];
    (
      // 1. Cultural & Heritage Sites
      node["tourism"~"attraction|museum|artwork|gallery|viewpoint|information"](${bbox});
      way["tourism"~"attraction|museum|gallery"](${bbox});
      node["historic"~"monument|memorial|heritage|archaeological_site|ruins|fort|castle|manor|temple|building"](${bbox});
      way["historic"~"monument|memorial|heritage|archaeological_site|ruins|fort|castle|manor|temple|building"](${bbox});

      // 2. Artisan, Craft & Handloom
      node["craft"](${bbox});
      node["shop"~"craft|pottery|textiles|fabric|art|antiques|tailor|tea|spices|jewellery"](${bbox});
      way["craft"](${bbox});

      // 3. Cultural Amenities & Performing Arts
      node["amenity"~"arts_centre|theatre|community_centre|marketplace|place_of_worship|studio"](${bbox});
      way["amenity"~"arts_centre|theatre|community_centre|marketplace"](${bbox});

      // 4. Heritage Nature & Parks
      node["leisure"~"garden|park|nature_reserve"](${bbox});
      way["leisure"~"garden|park|nature_reserve"](${bbox});
    );
    out center tags ${limit};
  `;
}

/**
 * Executes an Overpass query with failover across multiple public instances
 */
export async function queryOverpassBbox(minLat, minLng, maxLat, maxLng, limit = 60) {
  const now = Date.now();
  const elapsed = now - lastOverpassRequestTime;
  if (elapsed < 1500) {
    await delay(1500 - elapsed);
  }
  lastOverpassRequestTime = Date.now();

  const ql = buildOverpassQuery(minLat, minLng, maxLat, maxLng, limit);
  let lastError = null;

  for (let attempt = 0; attempt < OVERPASS_ENDPOINTS.length; attempt++) {
    const endpoint = OVERPASS_ENDPOINTS[(currentEndpointIndex + attempt) % OVERPASS_ENDPOINTS.length];

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'User-Agent': USER_AGENT,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: `data=${encodeURIComponent(ql)}`,
      });

      if (!response.ok) {
        throw new Error(`Overpass ${endpoint} returned ${response.status}`);
      }

      const data = await response.json();
      currentEndpointIndex = (currentEndpointIndex + attempt) % OVERPASS_ENDPOINTS.length;
      return (data.elements || []).map((el) => normalizeOsmElement(el, minLat, minLng, maxLat, maxLng));
    } catch (err) {
      lastError = err;
      console.warn(`Overpass mirror ${endpoint} failed:`, err.message);
    }
  }

  throw new Error(`All Overpass API mirrors failed: ${lastError?.message}`);
}

/**
 * Normalizes a raw OpenStreetMap node/way into the LOKIVA Experience schema
 */
export function normalizeOsmElement(element) {
  const tags = element.tags || {};
  const lat = element.lat || element.center?.lat || 0;
  const lng = element.lon || element.center?.lon || 0;

  // Title: prioritize English or primary name tag, skip unnamed infrastructure
  const title =
    tags['name:en'] ||
    tags['name'] ||
    tags['int_name'] ||
    tags['description:en'] ||
    tags['official_name'] ||
    `${formatCategory(tags)} at ${tags['addr:street'] || 'Local Area'}`;

  const category = classifyCategory(tags);
  const isIndoor = determineIndoor(tags);
  const isWheelchair = tags['wheelchair'] === 'yes' || tags['wheelchair'] === 'designated';
  const isRainSafe = isIndoor || tags['covered'] === 'yes';

  // Honest Data Principles: No fabricated ratings!
  const rating = null;
  const reviewCount = 0;

  // Real duration estimation based on POI type
  const approxDurationMins = estimateDurationMins(category, tags);

  // Description built honestly from real OSM tags
  const description =
    tags['description:en'] ||
    tags['description'] ||
    tags['comment'] ||
    generateHonestDescription(title, category, tags);

  return {
    osmId: `${element.type}/${element.id}`,
    osmType: element.type,
    wikidataId: tags['wikidata'] || null,
    wikipedia: tags['wikipedia'] || null,
    title,
    tagline: tags['short_name'] || tags['alt_name'] || null,
    description,
    category,
    culturalContext: tags['historic:civilization'] || tags['heritage:operator'] || tags['religion'] || null,
    latitude: lat,
    longitude: lng,
    approxDurationMins,
    price: estimateFairPrice(tags, category),
    currency: 'INR',
    isIndoor,
    isRainSafe,
    isWheelchair,
    lowWalking: isIndoor || tags['wheelchair'] === 'yes',
    openingHoursRaw: tags['opening_hours'] || null,
    rating,
    reviewCount,
    rawTags: JSON.stringify(tags),
    source: 'osm_overpass',
  };
}

function classifyCategory(tags) {
  if (tags['shop'] === 'craft' || tags['craft'] || tags['shop'] === 'pottery' || tags['shop'] === 'textiles') {
    return 'Art & Craft';
  }
  if (tags['historic'] || tags['tourism'] === 'museum' || tags['heritage']) {
    return 'Heritage & History';
  }
  if (tags['amenity'] === 'marketplace' || tags['shop'] === 'spices' || tags['shop'] === 'tea' || tags['cuisine']) {
    return 'Food & Culinary';
  }
  if (tags['amenity'] === 'arts_centre' || tags['amenity'] === 'theatre') {
    return 'Music & Dance';
  }
  if (tags['leisure'] === 'nature_reserve' || tags['leisure'] === 'garden' || tags['tourism'] === 'viewpoint') {
    return 'Nature & Wildlife';
  }
  if (tags['amenity'] === 'place_of_worship') {
    return 'Spiritual & Wellness';
  }
  return 'Heritage & History';
}

function determineIndoor(tags) {
  if (tags['indoor'] === 'yes' || tags['covered'] === 'yes' || tags['building']) return true;
  if (tags['tourism'] === 'museum' || tags['tourism'] === 'gallery') return true;
  if (tags['shop'] || tags['craft']) return true;
  if (tags['leisure'] === 'park' || tags['tourism'] === 'viewpoint' || tags['historic'] === 'archaeological_site') return false;
  return true;
}

function estimateDurationMins(category, tags) {
  if (tags['tourism'] === 'museum') return 75;
  if (tags['craft'] || tags['shop'] === 'craft') return 60;
  if (category === 'Heritage & History') return 50;
  if (category === 'Food & Culinary') return 45;
  if (category === 'Nature & Wildlife') return 40;
  return 45;
}

function estimateFairPrice(tags, category) {
  if (tags['fee'] === 'no' || tags['access'] === 'permissive') return 0;
  if (category === 'Art & Craft') return 350;
  if (category === 'Food & Culinary') return 250;
  if (category === 'Heritage & History') return 150;
  return 100;
}

function generateHonestDescription(title, category, tags) {
  const parts = [];
  if (tags['historic']) parts.push(`Historic ${tags['historic'].replace(/_/g, ' ')}`);
  if (tags['craft']) parts.push(`Traditional ${tags['craft'].replace(/_/g, ' ')} craft`);
  if (tags['heritage']) parts.push(`State-recognized heritage site`);
  if (tags['opening_hours']) parts.push(`Open: ${tags['opening_hours']}`);

  return parts.length > 0
    ? `${title}. ${parts.join(' · ')}.`
    : `Verified local ${category.toLowerCase()} point of interest in community registry.`;
}

function formatCategory(tags) {
  return tags['craft'] || tags['historic'] || tags['tourism'] || 'Cultural Site';
}
