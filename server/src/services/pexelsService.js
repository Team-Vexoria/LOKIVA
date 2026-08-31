import { dbGet, dbRun } from '../db/db.js';

// Read API Key from environment variables with fallback to the provided key
const PEXELS_API_KEY =
  process.env.PEXELS_API_KEY || '7lX14KYxRXlrf45UjWflngkzVuuRlytqgyaPdc97LT19fPc3nCQZdxvw';

// In-memory LRU-like cache for instant zero-latency responses
const memoryCache = new Map();
const MEMORY_CACHE_MAX_SIZE = 1000;

// Curated high-definition Indian cultural fallback photos categorized cleanly
export const CULTURAL_FALLBACKS = {
  food: [
    'https://images.pexels.com/photos/4602266/pexels-photo-4602266.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/16308804/pexels-photo-16308804.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  art: [
    'https://images.pexels.com/photos/28389703/pexels-photo-28389703.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1047540/pexels-photo-1047540.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  heritage: [
    'https://images.pexels.com/photos/7107597/pexels-photo-7107597.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3581368/pexels-photo-3581368.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/789750/pexels-photo-789750.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  culture: [
    'https://images.pexels.com/photos/27833051/pexels-photo-27833051.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2161449/pexels-photo-2161449.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2846217/pexels-photo-2846217.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  nature: [
    'https://images.pexels.com/photos/1483053/pexels-photo-1483053.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/931018/pexels-photo-931018.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  adventure: [
    'https://images.pexels.com/photos/36870020/pexels-photo-36870020.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  nightlife: [
    'https://images.pexels.com/photos/2161449/pexels-photo-2161449.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/789750/pexels-photo-789750.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  hiddengems: [
    'https://images.pexels.com/photos/28389703/pexels-photo-28389703.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/27833051/pexels-photo-27833051.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  default: [
    'https://images.pexels.com/photos/27833051/pexels-photo-27833051.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/4602266/pexels-photo-4602266.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
};

export function getFallbackForCategory(category = '', id = 0) {
  const cat = category.toLowerCase();
  if (cat.includes('food') || cat.includes('culinary') || cat.includes('tea') || cat.includes('dining')) {
    return CULTURAL_FALLBACKS.food[id % CULTURAL_FALLBACKS.food.length];
  }
  if (cat.includes('art') || cat.includes('craft') || cat.includes('workshop') || cat.includes('textile') || cat.includes('pottery')) {
    return CULTURAL_FALLBACKS.art[id % CULTURAL_FALLBACKS.art.length];
  }
  if (cat.includes('heritage') || cat.includes('history') || cat.includes('monument') || cat.includes('palace') || cat.includes('fort')) {
    return CULTURAL_FALLBACKS.heritage[id % CULTURAL_FALLBACKS.heritage.length];
  }
  if (cat.includes('nature') || cat.includes('wildlife') || cat.includes('beach') || cat.includes('backwater')) {
    return CULTURAL_FALLBACKS.nature[id % CULTURAL_FALLBACKS.nature.length];
  }
  if (cat.includes('night') || cat.includes('evening') || cat.includes('sunset') || cat.includes('music')) {
    return CULTURAL_FALLBACKS.nightlife[id % CULTURAL_FALLBACKS.nightlife.length];
  }
  if (cat.includes('adventure') || cat.includes('trek') || cat.includes('sport') || cat.includes('outdoor')) {
    return CULTURAL_FALLBACKS.adventure[id % CULTURAL_FALLBACKS.adventure.length];
  }
  if (cat.includes('spiritual') || cat.includes('wellness') || cat.includes('temple') || cat.includes('ghat')) {
    return CULTURAL_FALLBACKS.culture[id % CULTURAL_FALLBACKS.culture.length];
  }
  return CULTURAL_FALLBACKS.default[id % CULTURAL_FALLBACKS.default.length];
}

/**
 * Sanitize search query by stripping noise characters and generic fillers
 */
function cleanQuery(query) {
  if (!query || typeof query !== 'string') return 'India cultural heritage';
  return query
    .replace(/[^\w\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Fetch photos from Pexels API with 2-tier caching (Memory + SQLite)
 */
export async function fetchPexelsPhotos(rawQuery, count = 1, orientation = 'landscape') {
  const query = cleanQuery(rawQuery);
  const cacheKey = `${query.toLowerCase()}__${count}__${orientation}`;

  // 1. Check in-memory cache
  if (memoryCache.has(cacheKey)) {
    return { ...memoryCache.get(cacheKey), isCached: true };
  }

  // 2. Check SQLite persistent cache
  try {
    const cachedRow = await dbGet('SELECT * FROM pexels_image_cache WHERE query = ?', [cacheKey]);
    if (cachedRow && cachedRow.photo_url) {
      let urls = [];
      try {
        urls = JSON.parse(cachedRow.photo_urls || '[]');
      } catch {
        urls = [cachedRow.photo_url];
      }
      const result = {
        photoUrl: cachedRow.photo_url,
        photoUrls: urls.length > 0 ? urls : [cachedRow.photo_url],
        photographer: cachedRow.photographer || 'Pexels Contributor',
        photographerUrl: cachedRow.photographer_url || 'https://www.pexels.com',
        isCached: true,
      };

      if (memoryCache.size >= MEMORY_CACHE_MAX_SIZE) {
        const firstKey = memoryCache.keys().next().value;
        memoryCache.delete(firstKey);
      }
      memoryCache.set(cacheKey, result);

      return result;
    }
  } catch (err) {
    console.warn('SQLite Pexels cache read failed:', err.message);
  }

  // 3. Query Pexels API
  try {
    const perPage = Math.max(count, 4);
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=${orientation}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Authorization: PEXELS_API_KEY,
        'User-Agent': 'LOKIVA-India-Discovery/1.0',
      },
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.photos && data.photos.length > 0) {
        const primaryPhoto = data.photos[0];
        const photoUrl =
          primaryPhoto.src?.large2x ||
          primaryPhoto.src?.large ||
          primaryPhoto.src?.medium ||
          primaryPhoto.src?.original;

        const photoUrls = data.photos
          .slice(0, count)
          .map((p) => p.src?.large2x || p.src?.large || p.src?.medium || p.src?.original)
          .filter(Boolean);

        const result = {
          photoUrl: photoUrl || getFallbackForCategory(query),
          photoUrls: photoUrls.length > 0 ? photoUrls : [photoUrl],
          photographer: primaryPhoto.photographer || 'Pexels Contributor',
          photographerUrl: primaryPhoto.photographer_url || primaryPhoto.url || 'https://www.pexels.com',
          isCached: false,
        };

        // Save to SQLite cache asynchronously
        dbRun(
          `INSERT OR REPLACE INTO pexels_image_cache (query, photo_url, photo_urls, photographer, photographer_url)
           VALUES (?, ?, ?, ?, ?)`,
          [cacheKey, result.photoUrl, JSON.stringify(result.photoUrls), result.photographer, result.photographerUrl]
        ).catch((err) => console.warn('Pexels cache write error:', err.message));

        if (memoryCache.size >= MEMORY_CACHE_MAX_SIZE) {
          const firstKey = memoryCache.keys().next().value;
          memoryCache.delete(firstKey);
        }
        memoryCache.set(cacheKey, result);

        return result;
      }
    } else {
      console.warn(`Pexels API query for "${query}" failed with status ${res.status}`);
    }
  } catch (err) {
    console.warn(`Pexels API error for query "${query}":`, err.message);
  }

  // 4. Broader Fallback Query
  const tokens = query.split(' ');
  if (tokens.length > 2) {
    const broaderQuery = `${tokens[0]} ${tokens[tokens.length - 2] || ''} India`.trim();
    if (broaderQuery !== query) {
      try {
        const broaderRes = await fetchPexelsPhotos(broaderQuery, count, orientation);
        if (broaderRes && broaderRes.photoUrl) {
          return broaderRes;
        }
      } catch {}
    }
  }

  // 5. Categorized Fallback
  const fallbackUrl = getFallbackForCategory(query);
  return {
    photoUrl: fallbackUrl,
    photoUrls: [fallbackUrl],
    photographer: 'LOKIVA Cultural Heritage Archive',
    photographerUrl: 'https://lokiva.in',
    isFallback: true,
  };
}

/**
 * Generate accurate search query for an experience
 */
export function buildExperiencePhotoQuery(exp) {
  if (!exp) return 'India cultural heritage experience';

  const city = exp.city || exp.city_name || exp.state || 'India';
  const category = exp.category || 'culture';
  const title = (exp.title || '').replace(/\(.*?\)/g, '').trim();

  return `${city} ${category} ${title} India`;
}

/**
 * Generate accurate search query for a city / destination
 */
export function buildDestinationPhotoQuery(city, state) {
  const cityName = city || 'India';
  const stateName = state || '';
  return `${cityName} ${stateName} landmark heritage tourism India`.trim();
}

/**
 * Automatically resolve and enrich an experience with high-res Pexels photos
 */
export async function enrichExperienceWithPexels(experience) {
  if (!experience) return experience;

  const existingImage =
    experience.image_url ||
    (Array.isArray(experience.image_urls) && experience.image_urls[0]) ||
    null;

  // If experience image is missing, generic, or an un-proxied wikimedia thumbnail, resolve high-res Pexels photo
  const needsPexels =
    !existingImage ||
    existingImage.includes('placeholder') ||
    existingImage.includes('source.unsplash.com') ||
    existingImage.includes('upload.wikimedia.org');

  const query = buildExperiencePhotoQuery(experience);
  const pexelsData = await fetchPexelsPhotos(query, 4);

  const mainImageUrl = needsPexels ? pexelsData.photoUrl : existingImage;

  const mergedGallery =
    pexelsData.photoUrls && pexelsData.photoUrls.length > 0
      ? pexelsData.photoUrls
      : [mainImageUrl];

  return {
    ...experience,
    image_url: mainImageUrl,
    image_urls: mergedGallery,
    photographer: pexelsData.photographer,
    photographer_url: pexelsData.photographerUrl,
  };
}

/**
 * Automatically enrich a city destination with high-res Pexels photo
 */
export async function enrichDestinationWithPexels(destination) {
  if (!destination) return destination;

  const query = buildDestinationPhotoQuery(destination.name || destination.city, destination.state_name || destination.state);
  const pexelsData = await fetchPexelsPhotos(query, 1);

  const existing = destination.image_url;
  const isGeneric = !existing || existing.includes('placeholder') || existing.includes('upload.wikimedia.org');

  return {
    ...destination,
    image_url: isGeneric ? pexelsData.photoUrl : existing,
    photographer: pexelsData.photographer,
  };
}
