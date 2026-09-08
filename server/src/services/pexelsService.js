import { dbGet, dbRun } from '../db/db.js';

// Read API Key from environment variables with fallback to the provided key
const PEXELS_API_KEY =
  process.env.PEXELS_API_KEY || '7lX14KYxRXlrf45UjWflngkzVuuRlytqgyaPdc97LT19fPc3nCQZdxvw';

// In-memory LRU-like cache for instant zero-latency responses
const memoryCache = new Map();
const MEMORY_CACHE_MAX_SIZE = 1000;

// Curated high-definition Indian cultural fallback photos categorized cleanly (all distinct, verified CDN URLs)
export const CULTURAL_FALLBACKS = {
  food: [
    'https://images.pexels.com/photos/4602266/pexels-photo-4602266.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/16308804/pexels-photo-16308804.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/37255838/pexels-photo-37255838.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2673353/pexels-photo-2673353.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2087748/pexels-photo-2087748.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  art: [
    'https://images.pexels.com/photos/28389703/pexels-photo-28389703.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1047540/pexels-photo-1047540.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/20242195/pexels-photo-20242195.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/260024/pexels-photo-260024.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1327689/pexels-photo-1327689.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2261165/pexels-photo-2261165.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  heritage: [
    'https://images.pexels.com/photos/7107597/pexels-photo-7107597.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3581368/pexels-photo-3581368.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/789750/pexels-photo-789750.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/18499072/pexels-photo-18499072.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/15682803/pexels-photo-15682803.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/10975757/pexels-photo-10975757.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/32196020/pexels-photo-32196020.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/14815159/pexels-photo-14815159.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/17376351/pexels-photo-17376351.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/32164946/pexels-photo-32164946.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1603650/pexels-photo-1603650.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2403209/pexels-photo-2403209.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3881104/pexels-photo-3881104.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2444403/pexels-photo-2444403.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/574313/pexels-photo-574313.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  culture: [
    'https://images.pexels.com/photos/27833051/pexels-photo-27833051.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2161449/pexels-photo-2161449.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2846217/pexels-photo-2846217.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/11566792/pexels-photo-11566792.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/14041885/pexels-photo-14041885.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/32498309/pexels-photo-32498309.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/236171/pexels-photo-236171.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/18262579/pexels-photo-18262579.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  spiritual: [
    'https://images.pexels.com/photos/5756687/pexels-photo-5756687.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/39217137/pexels-photo-39217137.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/17433337/pexels-photo-17433337.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/18089549/pexels-photo-18089549.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/6174060/pexels-photo-6174060.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/8450469/pexels-photo-8450469.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  nature: [
    'https://images.pexels.com/photos/1483053/pexels-photo-1483053.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/931018/pexels-photo-931018.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2861280/pexels-photo-2861280.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/34682732/pexels-photo-34682732.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/35971200/pexels-photo-35971200.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/6892490/pexels-photo-6892490.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/962464/pexels-photo-962464.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  adventure: [
    'https://images.pexels.com/photos/36870020/pexels-photo-36870020.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1365428/pexels-photo-1365428.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  nightlife: [
    'https://images.pexels.com/photos/30570738/pexels-photo-30570738.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/37904044/pexels-photo-37904044.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/28106225/pexels-photo-28106225.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/37133961/pexels-photo-37133961.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
  default: [
    'https://images.pexels.com/photos/27833051/pexels-photo-27833051.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/4602266/pexels-photo-4602266.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1047540/pexels-photo-1047540.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3581368/pexels-photo-3581368.jpeg?auto=compress&cs=tinysrgb&w=800',
  ],
};

/**
 * Deterministically pick an unused fallback image for a category
 */
export function getFallbackForCategory(category = '', seed = 0, usedUrlsSet = null) {
  const cat = (category || '').toLowerCase();
  let pool = CULTURAL_FALLBACKS.culture;
  if (cat.includes('food') || cat.includes('culinary') || cat.includes('tea') || cat.includes('dining')) {
    pool = CULTURAL_FALLBACKS.food;
  } else if (cat.includes('art') || cat.includes('craft') || cat.includes('workshop') || cat.includes('textile') || cat.includes('pottery')) {
    pool = CULTURAL_FALLBACKS.art;
  } else if (cat.includes('heritage') || cat.includes('history') || cat.includes('monument') || cat.includes('palace') || cat.includes('fort') || cat.includes('bridge') || cat.includes('mosque') || cat.includes('qila')) {
    pool = CULTURAL_FALLBACKS.heritage;
  } else if (cat.includes('nature') || cat.includes('wildlife') || cat.includes('beach') || cat.includes('backwater') || cat.includes('lake')) {
    pool = CULTURAL_FALLBACKS.nature;
  } else if (cat.includes('night') || cat.includes('evening') || cat.includes('sunset') || cat.includes('music')) {
    pool = CULTURAL_FALLBACKS.nightlife;
  } else if (cat.includes('adventure') || cat.includes('trek') || cat.includes('sport') || cat.includes('outdoor')) {
    pool = CULTURAL_FALLBACKS.adventure;
  } else if (cat.includes('spiritual') || cat.includes('wellness') || cat.includes('temple') || cat.includes('ghat') || cat.includes('dham')) {
    pool = CULTURAL_FALLBACKS.spiritual;
  }

  let num = 0;
  if (typeof seed === 'number') {
    num = Math.abs(seed);
  } else if (typeof seed === 'string') {
    for (let i = 0; i < seed.length; i++) {
      num = (num * 31 + seed.charCodeAt(i)) >>> 0;
    }
  }

  // Find first photo in pool that has not been used
  if (usedUrlsSet && usedUrlsSet instanceof Set) {
    for (let offset = 0; offset < pool.length; offset++) {
      const candidate = pool[(num + offset) % pool.length];
      if (!usedUrlsSet.has(candidate)) {
        return candidate;
      }
    }
    // If entire category pool was exhausted, try all pools to guarantee uniqueness
    const allPools = Object.values(CULTURAL_FALLBACKS).flat();
    for (let offset = 0; offset < allPools.length; offset++) {
      const candidate = allPools[(num + offset) % allPools.length];
      if (!usedUrlsSet.has(candidate)) {
        return candidate;
      }
    }
  }

  return pool[num % pool.length];
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
export async function fetchPexelsPhotos(rawQuery, count = 4, orientation = 'landscape') {
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
    const perPage = Math.max(count, 8);
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
 * Automatically resolve and enrich an experience with high-res photos and strict anti-collision deduplication
 */
export async function enrichExperienceWithPexels(experience, usedUrlsSet = null) {
  if (!experience) return experience;

  const rawExisting =
    experience.image_url ||
    (Array.isArray(experience.image_urls) && experience.image_urls[0]) ||
    null;

  let chosenUrl = null;

  // 1. If existing image is a valid specific Wikimedia photo, route through server proxy for authentic visual
  if (
    rawExisting &&
    rawExisting.includes('upload.wikimedia.org') &&
    !rawExisting.includes('placeholder')
  ) {
    const proxyUrl = rawExisting.startsWith('/api/v1/experiences/proxy-image')
      ? rawExisting
      : `/api/v1/experiences/proxy-image?url=${encodeURIComponent(rawExisting)}`;
    chosenUrl = proxyUrl;
  } else if (
    rawExisting &&
    !rawExisting.includes('placeholder') &&
    !rawExisting.includes('source.unsplash.com')
  ) {
    chosenUrl = rawExisting;
  }

  // 2. If chosenUrl not yet selected, check secondary images in experience.image_urls
  if (!chosenUrl && Array.isArray(experience.image_urls)) {
    for (const u of experience.image_urls) {
      if (!u || u.includes('placeholder')) continue;
      const candidate = u.includes('upload.wikimedia.org')
        ? (u.startsWith('/api/v1/experiences/proxy-image') ? u : `/api/v1/experiences/proxy-image?url=${encodeURIComponent(u)}`)
        : u;
      chosenUrl = candidate;
      break;
    }
  }

  // 3. If still needed, use verified local cultural fallback (ZERO API DEPENDENCY)
  if (!chosenUrl) {
    const seed = `${experience.id || 0}_${experience.title || ''}_${experience.city || ''}_${experience.category || ''}`;
    chosenUrl = getFallbackForCategory(experience.category, seed, usedUrlsSet);
  }

  // Register in usedUrlsSet to avoid collision if set is provided
  if (usedUrlsSet && chosenUrl) {
    usedUrlsSet.add(chosenUrl);
  }

  const photographer = experience.photographer || 'LOKIVA Cultural Heritage Archive';
  const photographerUrl = experience.photographer_url || 'https://lokiva.in';

  const gallery = Array.from(
    new Set([
      chosenUrl,
      ...(Array.isArray(experience.image_urls) ? experience.image_urls : []),
    ])
  ).filter(Boolean);

  return {
    ...experience,
    image_url: chosenUrl,
    image_urls: gallery,
    photographer,
    photographer_url: photographerUrl,
  };
}

/**
 * Automatically enrich a city destination with high-res photo and strict anti-collision deduplication
 */
export async function enrichDestinationWithPexels(destination, usedUrlsSet = null) {
  if (!destination) return destination;

  const existing = destination.image_url;
  let chosenUrl = null;

  if (existing && !existing.includes('placeholder') && !existing.includes('upload.wikimedia.org')) {
    if (!usedUrlsSet || !usedUrlsSet.has(existing)) {
      chosenUrl = existing;
    }
  }

  if (!chosenUrl) {
    const query = buildDestinationPhotoQuery(destination.name || destination.city, destination.state_name || destination.state);
    const pexelsData = await fetchPexelsPhotos(query, 6);

    if (pexelsData && Array.isArray(pexelsData.photoUrls)) {
      for (const pUrl of pexelsData.photoUrls) {
        if (!usedUrlsSet || !usedUrlsSet.has(pUrl)) {
          chosenUrl = pUrl;
          break;
        }
      }
    }
  }

  if (!chosenUrl) {
    const seed = `${destination.id || 0}_${destination.name || destination.city || ''}_${destination.state_name || ''}`;
    chosenUrl = getFallbackForCategory('heritage', seed, usedUrlsSet);
  }

  if (usedUrlsSet && chosenUrl) {
    usedUrlsSet.add(chosenUrl);
  }

  return {
    ...destination,
    image_url: chosenUrl,
  };
}

