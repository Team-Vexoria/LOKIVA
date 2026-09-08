import { dbAll } from './src/db/db.js';

async function run() {
  const exps = await dbAll("SELECT id, title, city, state FROM experiences WHERE state LIKE '%chhattisgarh%'");
  console.log('Experiences for Chhattisgarh:', exps);

  const allStates = await dbAll("SELECT id, name FROM states");
  console.log('Total states:', allStates.length);

  const allCities = await dbAll("SELECT id, name, state_name FROM cities");
  console.log('Total cities:', allCities.length);
}

run();
