import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbRun, dbGet, dbAll } from './src/db/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mapPath = path.resolve(__dirname, './experiences_image_map.json');
let map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

const agraPlaces = [
  {
    id: 1087,
    title: 'Taj Mahal (UNESCO World Heritage Site)',
    city: 'Agra',
    state: 'Uttar Pradesh',
    area_name: 'Dharmapuri, Forest Colony, Tajganj',
    category: 'Heritage & History',
    price: 50,
    rating: 4.96,
    review_count: 1420,
    approx_duration_mins: 180,
    tagline: '17th-century ivory-white marble mausoleum on the south bank of the Yamuna River',
    description: 'Commissioned in 1632 by the Mughal emperor Shah Jahan to house the tomb of his favourite wife, Mumtaz Mahal. A masterpiece of symmetry, Persian Mughal architecture, and inlay stonework.',
    tags: JSON.stringify(['monument', 'unesco', 'mughal', 'agra', 'heritage', 'taj-mahal']),
    latitude: 27.1751,
    longitude: 78.0421,
    image_url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 1088,
    title: 'Agra Fort (Red Fort of Agra)',
    city: 'Agra',
    state: 'Uttar Pradesh',
    area_name: 'Agra Fort, Rakabganj',
    category: 'Heritage & History',
    price: 50,
    rating: 4.89,
    review_count: 980,
    approx_duration_mins: 90,
    tagline: 'Colossal 16th-century red sandstone imperial fortress of the Mughal emperors',
    description: 'UNESCO World Heritage fort comprising Jahangiri Mahal, Khas Mahal, Diwan-i-Khas, Diwan-i-Aam, and Musamman Burj where Shah Jahan was imprisoned overlooking the Taj.',
    tags: JSON.stringify(['fort', 'unesco', 'mughal', 'agra', 'heritage', 'sandstone']),
    latitude: 27.1795,
    longitude: 78.0211,
    image_url: 'https://img-cdn.publive.online/fit-in/1200x675/filters:format(webp)/local-samosal/media/media_files/2025/01/10/IyeE4HbeMA6wdYjqYZTm.png'
  },
  {
    id: 1089,
    title: 'Mehtab Bagh (Moonlight Garden)',
    city: 'Agra',
    state: 'Uttar Pradesh',
    area_name: 'Nagla Devjit, Across Yamuna',
    category: 'Nature & Wildlife',
    price: 25,
    rating: 4.82,
    review_count: 640,
    approx_duration_mins: 60,
    tagline: 'Charbagh garden complex perfectly aligned across the Yamuna river for sunset Taj reflections',
    description: 'Crescent-shaped Mughal garden offering unobstructed panoramic views of the rear facade of the Taj Mahal across the Yamuna river waters without crowds.',
    tags: JSON.stringify(['garden', 'sunset', 'taj-view', 'yamuna', 'nature']),
    latitude: 27.1800,
    longitude: 78.0420,
    image_url: 'https://experiencemyindia.com/wp-content/uploads/2024/11/Taj-Mahal-view-from-Mehtab-Bagh.jpg'
  },
  {
    id: 1090,
    title: "Tomb of I'timad-ud-Daulah (Baby Taj)",
    city: 'Agra',
    state: 'Uttar Pradesh',
    area_name: 'Moti Bagh, Yamuna East Bank',
    category: 'Heritage & History',
    price: 25,
    rating: 4.85,
    review_count: 520,
    approx_duration_mins: 60,
    tagline: 'First Mughal structure constructed entirely from pure white marble with pietra dura inlay',
    description: 'Delicate riverside mausoleum built between 1622 and 1628 by Queen Nur Jahan for her father Mir Ghiyas Beg, acting as the architectural inspiration for the Taj Mahal.',
    tags: JSON.stringify(['monument', 'baby-taj', 'pietra-dura', 'marble', 'heritage']),
    latitude: 27.1929,
    longitude: 78.0311,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/c/c9/I%27tim%C4%81d-ud-Daulah%2C_Agra.jpg'
  },
  {
    id: 1091,
    title: 'Fatehpur Sikri & Buland Darwaza',
    city: 'Agra',
    state: 'Uttar Pradesh',
    area_name: 'Fatehpur Sikri Heritage Zone',
    category: 'Heritage & History',
    price: 50,
    rating: 4.92,
    review_count: 1120,
    approx_duration_mins: 120,
    tagline: "Emperor Akbar's 16th-century red sandstone capital and the 54m Gateway of Magnificence",
    description: 'Immaculately preserved UNESCO ghost city founded in 1571 CE, housing Jama Masjid, the white marble Tomb of Salim Chishti, Panch Mahal, and Buland Darwaza.',
    tags: JSON.stringify(['unesco', 'fatehpur-sikri', 'buland-darwaza', 'akbar', 'heritage']),
    latitude: 27.0945,
    longitude: 77.6679,
    image_url: 'https://s7ap1.scene7.com/is/image/incredibleindia/fatehpur-sikri-agra-uttar-pradesh-1-attr-hero?qlt=82&ts=1726650332548'
  },
  {
    id: 1093,
    title: 'Akbar’s Tomb (Sikandra)',
    city: 'Agra',
    state: 'Uttar Pradesh',
    area_name: 'Sikandra, Mathura Road',
    category: 'Heritage & History',
    price: 35,
    rating: 4.81,
    review_count: 490,
    approx_duration_mins: 75,
    tagline: 'Grand four-tiered red sandstone and white marble mausoleum set in serene deer park gardens',
    description: 'Masterpiece of Mughal architecture begun by Emperor Akbar and completed by Jahangir in 1613, blending Islamic, Hindu, and Buddhist architectural motifs.',
    tags: JSON.stringify(['tomb', 'sikandra', 'akbar', 'sandstone', 'heritage']),
    latitude: 27.2206,
    longitude: 77.9505,
    image_url: 'https://pohcdn.com/sites/default/files/styles/paragraph__hero_banner__hb_image__1880bp/public/hero_banner/Tomb_of_Akbar_the_Great.jpg'
  },
  {
    id: 1095,
    title: 'Kinari Bazaar Old City Heritage Walk',
    city: 'Agra',
    state: 'Uttar Pradesh',
    area_name: 'Kinari Bazaar, Near Jama Masjid',
    category: 'Art & Culture',
    price: 0,
    rating: 4.79,
    review_count: 380,
    approx_duration_mins: 90,
    tagline: 'Centuries-old bustling lanes of traditional Zardozi embroidery, leathercraft, and spices',
    description: 'Vibrant heritage marketplace near Jama Masjid where artisans handcraft intricate Zardozi gold embroidery, traditional bridal jewelry, brassware, and fragrant local perfumes.',
    tags: JSON.stringify(['bazaar', 'shopping', 'zardozi', 'heritage', 'market']),
    latitude: 27.1825,
    longitude: 78.0135,
    image_url: 'https://cdn.prod.rexby.com/image/79a636bfcd424dd395856b4404f6c105?format=webp&width=1080&height=1350&quality=80'
  },
  {
    id: 1092,
    title: 'Sadar Bazaar Traditional Agra Petha & Chaat Trail',
    city: 'Agra',
    state: 'Uttar Pradesh',
    area_name: 'Sadar Bazaar, Agra Cantt',
    category: 'Food & Culinary',
    price: 150,
    rating: 4.87,
    review_count: 720,
    approx_duration_mins: 45,
    tagline: 'Historic confectionery street famous for translucent ash gourd petha, bedmi poori, and dalmoth',
    description: 'Discover the original Mughal-era sweetmakers in Agra’s historic cantonment market, tasting saffron, angoori, and paan flavoured pethas alongside crispy spicy chaat.',
    tags: JSON.stringify(['food', 'petha', 'agra', 'bazaar', 'chaat']),
    latitude: 27.1594,
    longitude: 78.0062,
    image_url: 'https://cdn.getyourguide.com/image/format=auto,fit=crop,gravity=auto,quality=60,width=400,height=265,dpr=2/tour_img/38fc369f2c07481da3d4ddb51b066663e81364320ca229594c55c101baedab19.jpeg'
  }
];

// Update JSON map
map = map.filter(item => !(item.city === 'Agra' || (item.title && item.title.toLowerCase().includes('agra')) || (item.title && item.title.toLowerCase().includes('taj mahal'))));
map.unshift(...agraPlaces.map(p => ({
  id: p.id,
  title: p.title,
  city: p.city,
  state: p.state,
  category: p.category,
  image_url: p.image_url
})));
fs.writeFileSync(mapPath, JSON.stringify(map, null, 2), 'utf8');
console.log('Saved 8 Agra places to experiences_image_map.json');

// Upsert into SQLite
async function syncDb() {
  for (const p of agraPlaces) {
    const existing = await dbGet('SELECT id FROM experiences WHERE id = ? OR LOWER(TRIM(title)) = LOWER(TRIM(?))', [p.id, p.title]);
    if (existing) {
      await dbRun(`
        UPDATE experiences 
        SET title = ?, 
            tagline = ?, 
            description = ?, 
            category = ?, 
            city = 'Agra', 
            state = 'Uttar Pradesh', 
            area_name = ?, 
            price = ?, 
            rating = ?, 
            review_count = ?, 
            approx_duration_mins = ?, 
            image_urls = ?, 
            tags = ?, 
            latitude = ?, 
            longitude = ?, 
            is_active = 1, 
            notability_score = 100,
            source = 'user_curated_link'
        WHERE id = ?
      `, [
        p.title,
        p.tagline,
        p.description,
        p.category,
        p.area_name,
        p.price,
        p.rating,
        p.review_count,
        p.approx_duration_mins,
        JSON.stringify([p.image_url]),
        p.tags,
        p.latitude,
        p.longitude,
        existing.id
      ]);
      console.log(`Updated experience ID ${existing.id}: ${p.title}`);
    } else {
      await dbRun(`
        INSERT INTO experiences (
          id, title, tagline, description, category, city, state, area_name,
          price, rating, review_count, approx_duration_mins, image_urls, tags,
          latitude, longitude, is_active, notability_score, source
        ) VALUES (?, ?, ?, ?, ?, 'Agra', 'Uttar Pradesh', ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 100, 'user_curated_link')
      `, [
        p.id,
        p.title,
        p.tagline,
        p.description,
        p.category,
        p.area_name,
        p.price,
        p.rating,
        p.review_count,
        p.approx_duration_mins,
        JSON.stringify([p.image_url]),
        p.tags,
        p.latitude,
        p.longitude
      ]);
      console.log(`Inserted experience ID ${p.id}: ${p.title}`);
    }
  }

  // Activate all 8 verified places
  for (const p of agraPlaces) {
    await dbRun('UPDATE experiences SET is_active = 1 WHERE LOWER(TRIM(title)) = LOWER(TRIM(?)) OR id = ?', [p.title, p.id]);
  }

  // Deactivate any other places in Agra to fulfill "add only this i provided dont add another location just this only"
  const titles = agraPlaces.map(p => p.title);
  const titlePlaceholders = titles.map(() => '?').join(',');
  await dbRun(`UPDATE experiences SET is_active = 0 WHERE city = 'Agra' AND title NOT IN (${titlePlaceholders})`, titles);
  console.log('Deactivated any non-whitelisted Agra places.');

  const activeAgra = await dbAll('SELECT id, title, image_urls, is_active FROM experiences WHERE city = "Agra" AND is_active = 1');
  console.log(`Active Agra experiences in SQLite: ${activeAgra.length}`);
  for (const a of activeAgra) {
    console.log(` - [${a.id}] ${a.title}: ${JSON.parse(a.image_urls)[0]}`);
  }
}

syncDb().then(() => {
  console.log('Database sync complete.');
  process.exit(0);
}).catch(err => {
  console.error('Error syncing db:', err);
  process.exit(1);
});
