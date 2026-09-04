import { initDb, dbAll } from '../db/db.js';

await initDb();

const rows = await dbAll(`
  SELECT id, title, latitude, longitude
  FROM experiences
  WHERE title LIKE '%Laxman Jhula%'
     OR title LIKE '%Shivpuri%'
     OR title LIKE '%Swarg Ashram%'
     OR title LIKE '%Tapovan%'
  ORDER BY title
`);

console.table(rows);
process.exit(0);