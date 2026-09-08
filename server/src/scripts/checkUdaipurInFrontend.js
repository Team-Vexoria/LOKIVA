import fs from 'fs';
import path from 'path';

const file = 'c:/LOKIVA-main/frontend/src/data/userVerifiedPlacesData.ts';
const content = fs.readFileSync(file, 'utf8');

const blocks = content.split(/\{\s*id:\s*/);
console.log('Total blocks:', blocks.length);

const udaipurBlocks = [];
for (let i = 1; i < blocks.length; i++) {
  const b = blocks[i];
  if (b.includes("'Udaipur'") || b.includes('"Udaipur"')) {
    const idMatch = b.match(/^(\d+)/);
    const titleMatch = b.match(/title:\s*['"]([^'"]+)['"]/);
    udaipurBlocks.push({
      id: idMatch ? idMatch[1] : 'unknown',
      title: titleMatch ? titleMatch[1] : 'unknown'
    });
  }
}

console.log('Udaipur blocks in userVerifiedPlacesData.ts:', udaipurBlocks);
