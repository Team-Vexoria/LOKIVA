/**
 * Wikipedia & Wikimedia Commons Image & Description Fetcher
 * 
 * Automatically resolves real, high-resolution open-licensed photography
 * and historical abstracts for Indian monuments, heritage places, and cultural landmarks.
 */

const USER_AGENT = 'LOKIVA-India-Cultural-Engine/1.0 (contact: discovery@lokiva.in)';

/**
 * Fetches thumbnail image and verified summary from Wikipedia REST API with fast timeout
 * @param {string} title - Place or landmark title
 * @param {string} [city] - Optional city name for disambiguation
 * @returns {Promise<{ imageUrl: string | null, extract: string | null }>}
 */
export async function fetchWikiPlaceDetails(title, city = '') {
  if (!title || typeof title !== 'string') {
    return { imageUrl: null, extract: null };
  }

  // Clean title: remove generic suffixes, parentheticals, etc.
  const cleanTitle = title.replace(/\(.*?\)/g, '').trim();

  // Try direct title first
  const candidates = [
    cleanTitle.replace(/\s+/g, '_'),
    `${cleanTitle.replace(/\s+/g, '_')},_${city ? city.replace(/\s+/g, '_') : 'India'}`,
  ];

  for (const candidate of candidates) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(candidate)}`;
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.type !== 'disambiguation' && (data.thumbnail?.source || data.extract)) {
          return {
            imageUrl: data.thumbnail?.source || null,
            extract: data.extract || null,
          };
        }
      }
    } catch {
      // Non-blocking, try next candidate
    }
  }

  return { imageUrl: null, extract: null };
}
