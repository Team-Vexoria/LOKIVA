import fs from 'fs';

const content = fs.readFileSync('c:/LOKIVA-main/frontend/src/data/userVerifiedPlacesData.ts', 'utf8');

// Parse titles
const titles = [...content.matchAll(/title:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
const seenTitles = new Set();
const dupeTitles = [];
titles.forEach(t => {
  const norm = t.toLowerCase().trim();
  if (seenTitles.has(norm)) dupeTitles.push(t);
  else seenTitles.add(norm);
});

console.log('Total titles:', titles.length);
console.log('Duplicate titles:', dupeTitles);
