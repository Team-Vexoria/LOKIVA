import { dbAll } from '../db/db.js';

async function main() {
  const cities = await dbAll('SELECT id, name, state_name FROM cities ORDER BY state_name, name');
  console.log('Total cities in DB:', cities.length);
  const byState = {};
  for (const c of cities) {
    if (!byState[c.state_name]) byState[c.state_name] = [];
    byState[c.state_name].push(c.name);
  }
  console.log('Cities grouped by state:', JSON.stringify(byState, null, 2));

  const states = await dbAll('SELECT id, name FROM states ORDER BY name');
  console.log('Total states:', states.length);
  const statesWithoutCities = states.filter(s => !byState[s.name]);
  console.log('States without cities:', statesWithoutCities.map(s => s.name));
  process.exit(0);
}

main().catch(console.error);
