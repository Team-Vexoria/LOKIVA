import { dbAll } from '../db/db.js';

async function check() {
  const rows = await dbAll("SELECT id, title, city, is_active FROM experiences WHERE LOWER(city) LIKE '%udaipur%'");
  console.log('Total rows:', rows.length);
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
}

check().catch(console.error);
