import { initDb, dbRun, dbAll, dbGet } from '../db/db.js';
import { fetchWikiPlaceDetails } from '../services/ingestion/wikiImageFetcher.js';

async function main() {
  await initDb();
  console.log('Database connected.');

  // 1. Clean non-cultural POIs
  await dbRun(`
    DELETE FROM experiences 
    WHERE title LIKE '%Airport%' 
       OR title LIKE '%Fuel%' 
       OR title LIKE '%Petrol%' 
       OR title LIKE '%Bank%' 
       OR title LIKE '%ATM%' 
       OR title LIKE '%Railway%'
  `);
  console.log('Cleaned non-cultural POIs.');

  // 2. Fetch un-imaged places
  const places = await dbAll(`
    SELECT id, title, city, category, image_urls 
    FROM experiences 
    WHERE image_urls = '[]' OR image_urls IS NULL OR image_urls = ''
    LIMIT 60
  `);

  console.log(`Checking Wikipedia/Wikimedia for ${places.length} places...`);
  let enriched = 0;

  for (const p of places) {
    const wiki = await fetchWikiPlaceDetails(p.title, p.city);
    if (wiki.imageUrl) {
      const imgJson = JSON.stringify([wiki.imageUrl]);
      if (wiki.extract) {
        await dbRun('UPDATE experiences SET image_urls = ?, description = ? WHERE id = ?', [
          imgJson,
          wiki.extract,
          p.id,
        ]);
      } else {
        await dbRun('UPDATE experiences SET image_urls = ? WHERE id = ?', [imgJson, p.id]);
      }
      enriched++;
      console.log(`✓ Enriched: ${p.title} -> ${wiki.imageUrl}`);
    }
  }

  const totalWithImages = await dbGet(`SELECT count(*) as cnt FROM experiences WHERE image_urls != '[]' AND image_urls IS NOT NULL`);
  console.log(`\nEnrichment complete: ${enriched} new places enriched.`);
  console.log(`Total places with real photos: ${totalWithImages.cnt}`);
  process.exit(0);
}

main().catch(console.error);
