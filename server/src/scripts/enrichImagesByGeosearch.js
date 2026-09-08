/**
 * LOKIVA Geo-Anchored Image Enrichment
 * ------------------------------------
 * The old pipeline (pexelsService / hybridPhotoService) searched stock-photo
 * libraries using the full experience TITLE — e.g.
 *   "Ranwar Village Indo-Portuguese Heritage Walk & Irani Chai"
 * That title is an invented experience name, not a real, photographed thing.
 * No stock library or Wikipedia article is ever going to match it, so the
 * old pipeline was effectively doing a random keyword match and silently
 * falling back to one of ~10 shared category stock photos.
 *
 * This script ignores the title for image lookup and instead asks:
 * "what real, geotagged, verifiable photography exists near this
 *  experience's actual lat/lng?" — using every experience's existing
 * (latitude, longitude) as the anchor instead of fuzzy text.
 *
 * Source priority (all free, no API key required):
 *   1. Wikipedia geosearch  — nearby real articles, curated infobox photo
 *   2. Wikimedia Commons geosearch — raw geotagged photographs nearby
 *      (filtered to strip flags/logos/maps/diagrams/SVGs)
 *   3. Cleaned-title stock search (existing pexelsService) — last resort
 *   4. Category fallback pool (existing pexelsService) — absolute last resort
 *
 * Every row also gets image_source + image_distance_m written back so you
 * can audit exactly how each photo was chosen and re-run just the weak ones.
 *
 * Usage:
 *   node src/scripts/enrichImagesByGeosearch.js --dry-run          (report only, no writes)
 *   node src/scripts/enrichImagesByGeosearch.js                    (write results)
 *   node src/scripts/enrichImagesByGeosearch.js --only-fallback    (re-run rows that
 *                                                                    previously landed on
 *                                                                    stock/category fallback)
 *   node src/scripts/enrichImagesByGeosearch.js --limit 20         (test on first 20 rows)
 */

import { initDb, dbAll, dbRun } from '../db/db.js';
import { getFallbackForCategory, fetchPexelsPhotos } from '../services/pexelsService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USER_AGENT = 'LOKIVA-India-Cultural-Engine/2.0 (contact: discovery@lokiva.in)';

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const ONLY_FALLBACK = args.includes('--only-fallback');
const limitArg = args.find((a) => a.startsWith('--limit'));
const LIMIT = limitArg ? parseInt(args[args.indexOf(limitArg) + 1] || limitArg.split('=')[1], 10) : null;

// Radii to try, in meters, escalating from tight (precise) to wide (best-effort)
const RADII = [400, 1200, 3000];

// Filenames that are technically "photos" on Commons but are never useful here
const BAD_FILE_PATTERNS = [
  /flag_of/i, /coat_of_arms/i, /seal_of/i, /logo/i, /icon/i, /symbol/i,
  /^map_of/i, /_map\./i, /diagram/i, /chart/i, /\.svg$/i, /\.pdf$/i,
  /locator/i, /emblem/i, /stub/i, /wiki\.png$/i,
];

function isUsablePhoto(title, mime) {
  if (mime && !mime.startsWith('image/')) return false;
  if (mime === 'image/svg+xml') return false;
  return !BAD_FILE_PATTERNS.some((re) => re.test(title));
}

// Pages too generic to represent a specific micro-experience — skip these
// as the "anchor" even if geosearch returns them first.
function isTooGeneric(title, city) {
  const t = title.toLowerCase().trim();
  const c = (city || '').toLowerCase().trim();
  const genericExact = ['india', c, `${c} district`, `${c} metropolitan region`, `${c} (city)`];
  if (genericExact.includes(t)) return true;

  // Administrative / political / postal articles — their infobox "photo" is
  // almost always a locator map or constituency outline, not real photography.
  const badPatterns = [
    /assembly constituency/i, /lok sabha constituency/i, /parliamentary constituency/i,
    /\bconstituency\b/i, /\btaluka\b/i, /\btehsil\b/i, /\bmandal\b/i,
    /municipal (corporation|council)/i, /postal code/i, /\bpin code\b/i,
    /administrative division/i, /^list of /i, /police station/i,
    /pincode/i, /zip code/i, /ward no/i, /revenue village/i,
  ];
  if (badPatterns.some((re) => re.test(t))) return true;

  // Disaster / tragedy / incident articles — geotagged, but never appropriate
  // to show as a place photo. Hard-excluded, not just deprioritized.
  const eventPatterns = [
    /\blandslide\b/i, /crowd crush/i, /\bstampede\b/i, /\briot(s)?\b/i,
    /\bmassacre\b/i, /\bbombing(s)?\b/i, /terrorist attack/i, /\bshooting\b/i,
    /\bcollapse\b/i, /\bexplosion\b/i, /\bassassination\b/i, /\bearthquake\b/i,
    /\bepidemic\b/i, /\boutbreak\b/i, /\bfire$/i, /flight \d+/i,
    /^(18|19|20)\d{2}\s/i, // titles starting with a year are almost always event pages
  ];
  return eventPatterns.some((re) => re.test(t));
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}
// Real, but thematically mundane — deprioritized (not excluded) in favor of
// an actual landmark when one exists at a similar distance.
const MUNDANE_PATTERNS = [
  /metro station/i, /railway station/i, /bus (stop|stand|depot)/i,
  /\bairport\b/i, /management association/i, /\boffice\b/i,
  /\bschool\b/i, /\bhospital\b/i, /\bcollege\b/i, /\buniversity\b/i,
  /housing society/i, /apartment/i, /residential/i,
];
function isMundane(title) {
  return MUNDANE_PATTERNS.some((re) => re.test(title));
}

/** 1. Wikipedia geosearch — nearby real articles with a curated thumbnail */
async function wikipediaGeosearch(lat, lng, radius, city) {
  const url =
    `https://en.wikipedia.org/w/api.php?action=query&generator=geosearch` +
    `&ggscoord=${lat}|${lng}&ggsradius=${radius}&ggslimit=10` +
    `&prop=pageimages|coordinates&piprop=thumbnail&pithumbsize=1200&format=json`;
  const data = await fetchJson(url);
  const pages = Object.values(data?.query?.pages || {});
  if (!pages.length) return null;

   const candidates = pages
    .filter((p) => p.thumbnail?.source && !isTooGeneric(p.title, city))
    .map((p) => {
      const coord = p.coordinates?.[0];
      const dist = coord ? haversineMeters(lat, lng, coord.lat, coord.lon) : radius;
      return { title: p.title, url: p.thumbnail.source, distance: dist, mundane: isMundane(p.title) };
    })
    .sort((a, b) => a.distance - b.distance);

   if (!candidates.length) return null;

  // Return both: the best genuine landmark (if any) and the best mundane
  // match, so the caller can keep widening the search radius for a real
  // landmark before ever settling for a metro station or office building.
  const landmark = candidates.find((c) => !c.mundane) || null;
  const mundaneBest = candidates.find((c) => c.mundane) || null;
  return { landmark, mundaneBest };
}

/** 2. Wikimedia Commons geosearch — raw geotagged photos nearby */
async function commonsGeosearch(lat, lng, radius) {
  const url =
    `https://commons.wikimedia.org/w/api.php?action=query&generator=geosearch` +
    `&ggscoord=${lat}|${lng}&ggsradius=${radius}&ggslimit=15` +
    `&prop=imageinfo|coordinates&iiprop=url|mime&iiurlwidth=1200&format=json`;
  const data = await fetchJson(url);
  const pages = Object.values(data?.query?.pages || {});
  if (!pages.length) return null;

  const candidates = pages
    .filter((p) => {
      const info = p.imageinfo?.[0];
      return info?.thumburl && isUsablePhoto(p.title, info.mime);
    })
    .map((p) => {
      const info = p.imageinfo[0];
      const coord = p.coordinates?.[0];
      const dist = coord ? haversineMeters(lat, lng, coord.lat, coord.lon) : radius;
      return { title: p.title, url: info.thumburl, distance: dist };
    })
    .sort((a, b) => a.distance - b.distance);

  return candidates[0] || null;
}

/** Strip the invented activity suffix, keep the real anchor place name for a last-resort text search */
function extractAnchorName(title) {
  if (!title) return '';
  // This dataset is template-generated: "<Real Place Name> <Templated Activity Phrase>".
  // Cut at the first word that reliably starts the templated filler, whichever
  // template this particular row used.
  const cutWords = new RegExp(
    '\\b(' +
      [
        'Walk', 'Trail', 'Masterclass', 'Workshop', 'Tasting', 'Studio', 'Guild', 'Colony',
        'Class', 'Experience', 'Tour', 'Session', 'Courtyard', 'Folklore', 'Photography',
        'Architectural', 'Architecture', 'Century-Old', 'Sunset', 'Sunrise', 'Hidden',
        'Direct-From-Weaver', 'Direct-From', 'Fisherfolk', 'Ancient', 'Organic', 'Traditional',
        'Authentic', 'Rooftop', 'Alleyway', 'Ridge', 'Heritage Haveli', 'Bell Resonance',
        'Wood Block', 'Regional Sweets', 'Handloom', 'Coastal', 'Morning', 'Evening',
        'Nature Trail', 'Bird Sanctuary', 'Herbal', 'Blending', 'Carving', 'Confection',
        'Local', 'Regional',
      ].join('|') +
      ')\\b',
    'i'
  );
  const beforeAmp = title.split(/&|:/)[0];
  const match = beforeAmp.match(new RegExp(`^(.*?)(${cutWords.source})`, 'i'));
  const anchor = (match ? match[1] : beforeAmp).trim();
  // Safety net: if nothing cut and the "anchor" is still the whole long phrase,
  // it's not a real anchor — better to return just the first 2 words than the
  // full invented title.
  if (!match && anchor.split(/\s+/).length > 3) {
    return anchor.split(/\s+/).slice(0, 2).join(' ');
  }
  return anchor;
}

async function resolveImageForExperience(exp) {
  const { latitude: lat, longitude: lng, title, city, category } = exp;

  let bestMundane = null; // best mundane wiki match seen so far, kept as a fallback

  for (const radius of RADII) {
    const wiki = await wikipediaGeosearch(lat, lng, radius, city);
    if (wiki?.landmark) {
      return { url: wiki.landmark.url, source: 'wikipedia_geosearch', distance: Math.round(wiki.landmark.distance), matchedTo: wiki.landmark.title };
    }
    if (wiki?.mundaneBest && !bestMundane) {
      bestMundane = wiki.mundaneBest; // keep the tightest-radius mundane match, but keep searching wider for a landmark
    }

    const commons = await commonsGeosearch(lat, lng, radius);
    if (commons) return { url: commons.url, source: 'commons_geosearch', distance: Math.round(commons.distance), matchedTo: commons.title };
  }

  // No landmark found at any radius — a real, correctly nearby (if mundane)
  // Wikipedia photo still beats a stock search or category fallback.
  if (bestMundane) {
    return { url: bestMundane.url, source: 'wikipedia_geosearch_mundane', distance: Math.round(bestMundane.distance), matchedTo: bestMundane.title };
  }

  // Last resort 1: cleaned anchor-name stock search (not geo-verified, best-effort)
  const anchor = extractAnchorName(title);
  if (anchor) {
    try {
      const stock = await fetchPexelsPhotos(`${anchor} ${city} India`, 3);
      if (stock?.photoUrl && !stock.isFallback) {
        return { url: stock.photoUrl, source: 'stock_anchor_search', distance: null, matchedTo: anchor };
      }
    } catch {}
  }

  // Last resort 2: category fallback pool — flagged clearly for manual review
  const seed = `${exp.id}_${title}_${city}_${category}`;
  const fallbackUrl = getFallbackForCategory(category, seed);
  return { url: fallbackUrl, source: 'category_fallback', distance: null, matchedTo: null };
}

async function run() {
  await initDb();

  // Additive, non-destructive schema migration
  try {
    const cols = (await dbAll('PRAGMA table_info(experiences)')).map((c) => c.name);
    if (!cols.includes('image_source')) await dbRun('ALTER TABLE experiences ADD COLUMN image_source TEXT');
    if (!cols.includes('image_distance_m')) await dbRun('ALTER TABLE experiences ADD COLUMN image_distance_m REAL');
  } catch (e) {
    console.log('Migration note:', e.message);
  }

  let where = 'WHERE is_active = 1';
  if (ONLY_FALLBACK) {
    where += " AND (image_source IS NULL OR image_source = 'category_fallback' OR image_source = 'stock_anchor_search')";
  }
  const rows = await dbAll(
    `SELECT id, title, city, category, latitude, longitude FROM experiences ${where} ORDER BY id`
  );
  const targets = LIMIT ? rows.slice(0, LIMIT) : rows;

  console.log(`\n=== LOKIVA Geo-Anchored Image Enrichment ===`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE (writing to DB)'}`);
  console.log(`Rows to process: ${targets.length} / ${rows.length} total matched\n`);

  const report = [];
  const counts = { wikipedia_geosearch: 0, commons_geosearch: 0, stock_anchor_search: 0, category_fallback: 0 };

  for (let i = 0; i < targets.length; i++) {
    const exp = targets[i];
    const result = await resolveImageForExperience(exp);
    counts[result.source] = (counts[result.source] || 0) + 1;

    const tag = result.source === 'category_fallback' ? '⚠ FALLBACK' : result.source === 'stock_anchor_search' ? '~ stock' : '✓';
    console.log(
      `[${i + 1}/${targets.length}] ${tag} "${exp.title.slice(0, 55)}" -> ${result.source}` +
        (result.distance != null ? ` (${result.distance}m` + (result.matchedTo ? `, matched: ${result.matchedTo})` : ')') : result.matchedTo ? ` (matched: ${result.matchedTo})` : '')
    );

    report.push({ id: exp.id, title: exp.title, city: exp.city, ...result });

    if (!DRY_RUN) {
      await dbRun('UPDATE experiences SET image_urls = ?, image_source = ?, image_distance_m = ? WHERE id = ?', [
        JSON.stringify([result.url]),
        result.source,
        result.distance,
        exp.id,
      ]);
    }

    // Be polite to free public APIs
    await new Promise((r) => setTimeout(r, 150));
  }

  const reportPath = path.resolve(__dirname, '../../image_enrichment_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`\n=== Summary ===`);
  console.log(`Wikipedia geosearch (best, curated):  ${counts.wikipedia_geosearch || 0}`);
  console.log(`Commons geosearch (real, geotagged):   ${counts.commons_geosearch || 0}`);
  console.log(`Stock anchor search (best-effort):     ${counts.stock_anchor_search || 0}`);
  console.log(`Category fallback (needs manual look):  ${counts.category_fallback || 0}`);
  console.log(`\nFull report written to: ${reportPath}`);
  if (DRY_RUN) console.log(`\nThis was a dry run — nothing was written. Re-run without --dry-run to apply.`);
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });