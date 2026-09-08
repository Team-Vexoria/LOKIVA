import { dbRun, dbAll } from '../db/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WEST_BENGAL_EXPERIENCES = [
  // Darjeeling (5)
  {
    id: 6001,
    title: 'Darjeeling Himalayan Railway (Toy Train)',
    tagline: 'UNESCO World Heritage 1881 narrow-gauge steam railway threading through high mountain mist',
    description: 'Iconic 2-foot narrow gauge train connecting New Jalpaiguri to Darjeeling. Experience century-old steam locomotives navigating dramatic loops, zigzag reverses, and panoramic Himalayan tea estate vistas.',
    category: 'Heritage & History',
    city: 'Darjeeling',
    state: 'West Bengal',
    area_name: 'Darjeeling Railway Station, Hill Cart Road, Darjeeling',
    price: 1000,
    rating: 4.96,
    review_count: 2410,
    approx_duration_mins: 120,
    image_url: 'https://www.easeindiatrip.com/blog/wp-content/uploads/2025/01/Darjeeling-Himalayan-Railway-03.jpg',
    image_urls: JSON.stringify([
      'https://www.easeindiatrip.com/blog/wp-content/uploads/2025/01/Darjeeling-Himalayan-Railway-03.jpg',
      'https://www.easeindiatrip.com/blog/darjeeling-himalayan-railway-toy-train-guide/',
    ]),
    tags: JSON.stringify(['toy-train', 'dhr', 'unesco', 'darjeeling', 'heritage', 'steam-train', 'verified']),
    latitude: 27.0427,
    longitude: 88.2636,
    is_indoor: 0,
    is_rain_safe: 1,
    is_hidden_gem: 0,
    is_family_friendly: 1,
    low_walking: 1,
    wheelchair_accessible: 1,
    is_active: 1,
    source: 'user_curated_link',
  },
  {
    id: 6002,
    title: 'Tiger Hill',
    tagline: '2,590m summit famed for golden sunrises over Mt. Kanchenjunga and Mt. Everest peaks',
    description: 'The highest ridge vantage point in Darjeeling. Stand in awe as the pre-dawn darkness breaks into golden-pink light washing across the snow-capped crests of Kanchenjunga and the eastern Himalayan massif.',
    category: 'Nature & Wildlife',
    city: 'Darjeeling',
    state: 'West Bengal',
    area_name: 'Senchal Wildlife Sanctuary Ridge, Ghoom, Darjeeling',
    price: 50,
    rating: 4.92,
    review_count: 3180,
    approx_duration_mins: 150,
    image_url: 'https://darjeelingadventuretourism.com/images/tiger-hill-780.jpg',
    image_urls: JSON.stringify([
      'https://darjeelingadventuretourism.com/images/tiger-hill-780.jpg',
      'https://darjeelingadventuretourism.com/tiger-hill',
    ]),
    tags: JSON.stringify(['tiger-hill', 'sunrise', 'kanchenjunga', 'viewpoint', 'darjeeling', 'verified']),
    latitude: 27.0089,
    longitude: 88.2863,
    is_indoor: 0,
    is_rain_safe: 0,
    is_hidden_gem: 0,
    is_family_friendly: 1,
    low_walking: 0,
    wheelchair_accessible: 0,
    is_active: 1,
    source: 'user_curated_link',
  },
  {
    id: 6003,
    title: 'Batasia Loop',
    tagline: 'Engineering marvel where the Toy Train loops 360° around landscaped gardens & war memorial',
    description: 'Created in 1919 to lower the train’s gradient descent from Ghoom. Features a stunning spiraling track around manicured gardens, the Gorkha War Memorial cenotaph, and unobstructed sweeps of Kanchenjunga.',
    category: 'Nature & Wildlife',
    city: 'Darjeeling',
    state: 'West Bengal',
    area_name: 'Hill Cart Road, West Point, Darjeeling',
    price: 20,
    rating: 4.88,
    review_count: 1940,
    approx_duration_mins: 60,
    image_url: 'https://darjeelingyatra.com/images/batasia-loop/batasia-loop-500-400.webp',
    image_urls: JSON.stringify([
      'https://darjeelingyatra.com/images/batasia-loop/batasia-loop-500-400.webp',
    ]),
    tags: JSON.stringify(['batasia-loop', 'toy-train', 'memorial', 'gardens', 'darjeeling', 'verified']),
    latitude: 27.0169,
    longitude: 88.2472,
    is_indoor: 0,
    is_rain_safe: 0,
    is_hidden_gem: 0,
    is_family_friendly: 1,
    low_walking: 1,
    wheelchair_accessible: 1,
    is_active: 1,
    source: 'user_curated_link',
  },
  {
    id: 6004,
    title: 'Darjeeling Tea Gardens',
    tagline: 'Endless emerald high-altitude slopes producing the world-renowned Champagne of Teas',
    description: 'Walk through historic tea estates like Happy Valley and Makaibari terraced across misty mountain ridges. Learn artisanal orthodox two-leaves-and-a-bud plucking and enjoy guided tea tasting cuppings.',
    category: 'Nature & Wildlife',
    city: 'Darjeeling',
    state: 'West Bengal',
    area_name: 'Happy Valley & Makaibari Tea Estate Trails, Darjeeling',
    price: 100,
    rating: 4.90,
    review_count: 1670,
    approx_duration_mins: 90,
    image_url: 'https://3.imimg.com/data3/EF/FQ/MY-3370654/tea-gardens-of-darjeeling-the-hidden-paradise-500x500.jpg',
    image_urls: JSON.stringify([
      'https://3.imimg.com/data3/EF/FQ/MY-3370654/tea-gardens-of-darjeeling-the-hidden-paradise-500x500.jpg',
    ]),
    tags: JSON.stringify(['tea-gardens', 'happy-valley', 'makaibari', 'himalayan-tea', 'darjeeling', 'verified']),
    latitude: 27.0543,
    longitude: 88.2618,
    is_indoor: 0,
    is_rain_safe: 0,
    is_hidden_gem: 0,
    is_family_friendly: 1,
    low_walking: 0,
    wheelchair_accessible: 0,
    is_active: 1,
    source: 'user_curated_link',
  },
  {
    id: 6005,
    title: 'Peace Pagoda',
    tagline: 'Gleaming white Buddhist monument on Jalapahar hill designed to unite all races for world peace',
    description: 'Constructed under the guidance of Nichidatsu Fujii, founder of the Nipponzan Myohoji Buddhist Order. Showcases four large gold-polished sandstone avatars of Lord Buddha and panoramic forest peace walks.',
    category: 'Spiritual & Wellness',
    city: 'Darjeeling',
    state: 'West Bengal',
    area_name: 'Jalapahar Hill, West Point, Darjeeling',
    price: 0,
    rating: 4.87,
    review_count: 1420,
    approx_duration_mins: 60,
    image_url: 'https://www.trawell.in/admin/images/upload/729541590Darjeeling_Peace_Pagoda_Main.jpg',
    image_urls: JSON.stringify([
      'https://www.trawell.in/admin/images/upload/729541590Darjeeling_Peace_Pagoda_Main.jpg',
    ]),
    tags: JSON.stringify(['peace-pagoda', 'japanese-temple', 'buddhism', 'jalapahar', 'darjeeling', 'verified']),
    latitude: 27.0278,
    longitude: 88.2575,
    is_indoor: 0,
    is_rain_safe: 1,
    is_hidden_gem: 0,
    is_family_friendly: 1,
    low_walking: 1,
    wheelchair_accessible: 1,
    is_active: 1,
    source: 'user_curated_link',
  },

  // Kolkata (5)
  {
    id: 6006,
    title: 'Victoria Memorial',
    tagline: 'Monumental white Makrana marble palace and premier cultural landmark of Kolkata',
    description: 'Conceived by Lord Curzon and designed by William Emerson in Indo-Saracenic revival style. Houses 25 royal galleries of British imperial memorabilia, historic oil paintings, and 64 acres of reflecting pools.',
    category: 'Heritage & History',
    city: 'Kolkata',
    state: 'West Bengal',
    area_name: "1 Queen's Way, Maidan, Kolkata",
    price: 50,
    rating: 4.93,
    review_count: 4820,
    approx_duration_mins: 120,
    image_url: 'https://kolkatacitytour.com/wp-content/uploads/2022/04/victoria-memorial-Kolkata-1-1.jpg',
    image_urls: JSON.stringify([
      'https://kolkatacitytour.com/wp-content/uploads/2022/04/victoria-memorial-Kolkata-1-1.jpg',
    ]),
    tags: JSON.stringify(['victoria-memorial', 'monument', 'marble', 'museum', 'kolkata', 'maidan', 'verified']),
    latitude: 22.5448,
    longitude: 88.3426,
    is_indoor: 1,
    is_rain_safe: 1,
    is_hidden_gem: 0,
    is_family_friendly: 1,
    low_walking: 0,
    wheelchair_accessible: 1,
    is_active: 1,
    source: 'user_curated_link',
  },
  {
    id: 6007,
    title: 'Howrah Bridge (Rabindra Setu)',
    tagline: 'Iconic 1943 balanced cantilever steel bridge spanning the sacred Hooghly river',
    description: 'Sixth-longest cantilever bridge in the world, built without a single nut or bolt using 26,500 tonnes of high-tensile alloy steel. Serves as the enduring cultural symbol of the City of Joy.',
    category: 'Heritage & History',
    city: 'Kolkata',
    state: 'West Bengal',
    area_name: 'Hooghly Riverfront, Howrah & Kolkata',
    price: 0,
    rating: 4.89,
    review_count: 3890,
    approx_duration_mins: 45,
    image_url: 'https://s7ap1.scene7.com/is/image/incredibleindia/howrah-bridge-kolkata-west-bengal-2-attr-hero?qlt=82&ts=1742153659633',
    image_urls: JSON.stringify([
      'https://s7ap1.scene7.com/is/image/incredibleindia/howrah-bridge-kolkata-west-bengal-2-attr-hero?qlt=82&ts=1742153659633',
    ]),
    tags: JSON.stringify(['howrah-bridge', 'cantilever', 'hooghly-river', 'kolkata', 'heritage', 'verified']),
    latitude: 22.5851,
    longitude: 88.3468,
    is_indoor: 0,
    is_rain_safe: 0,
    is_hidden_gem: 0,
    is_family_friendly: 1,
    low_walking: 1,
    wheelchair_accessible: 1,
    is_active: 1,
    source: 'user_curated_link',
  },
  {
    id: 6008,
    title: 'Indian Museum',
    tagline: 'The oldest and largest multidisciplinary museum in the Asia-Pacific region, founded in 1814',
    description: 'Known colloquially as Jadu Ghar (House of Magic). Preserves over 100,000 priceless artifacts across archaeology, art, anthropology, geology, and zoology, including a 4,000-year-old Egyptian mummy and Gandhara sculptures.',
    category: 'Heritage & History',
    city: 'Kolkata',
    state: 'West Bengal',
    area_name: '27 Jawaharlal Nehru Road, Park Street area, Kolkata',
    price: 50,
    rating: 4.84,
    review_count: 2150,
    approx_duration_mins: 150,
    image_url: 'https://indianmuseumkolkata.org/im_cont/uploads/2022/04/banner2.jpg',
    image_urls: JSON.stringify([
      'https://indianmuseumkolkata.org/im_cont/uploads/2022/04/banner2.jpg',
    ]),
    tags: JSON.stringify(['indian-museum', 'jadu-ghar', 'archaeology', 'mummy', 'park-street', 'kolkata', 'verified']),
    latitude: 22.5579,
    longitude: 88.3511,
    is_indoor: 1,
    is_rain_safe: 1,
    is_hidden_gem: 0,
    is_family_friendly: 1,
    low_walking: 0,
    wheelchair_accessible: 1,
    is_active: 1,
    source: 'user_curated_link',
  },
  {
    id: 6009,
    title: 'Dakshineswar Kali Temple',
    tagline: '1855 CE Navaratna temple where Sri Ramakrishna Paramahamsa attained spiritual illumination',
    description: 'Majestic nine-spired temple on the banks of the Hooghly River built by philanthropist Rani Rashmoni. Dedicated to Goddess Bhavatarini, with 12 identical riverfront Shiva shrines and sacred Panchavati grove.',
    category: 'Spiritual & Wellness',
    city: 'Kolkata',
    state: 'West Bengal',
    area_name: 'Mayadib, Dakshineswar, Hooghly Riverfront, Kolkata',
    price: 0,
    rating: 4.95,
    review_count: 5420,
    approx_duration_mins: 90,
    image_url: 'https://www.trawell.in/admin/images/upload/555418100Kolkata_Dakshineswar_Kali_Temple_Main.jpg',
    image_urls: JSON.stringify([
      'https://www.trawell.in/admin/images/upload/555418100Kolkata_Dakshineswar_Kali_Temple_Main.jpg',
    ]),
    tags: JSON.stringify(['dakshineswar', 'kali-temple', 'ramakrishna', 'hooghly', 'pilgrimage', 'kolkata', 'verified']),
    latitude: 22.6534,
    longitude: 88.3575,
    is_indoor: 0,
    is_rain_safe: 1,
    is_hidden_gem: 0,
    is_family_friendly: 1,
    low_walking: 1,
    wheelchair_accessible: 1,
    is_active: 1,
    source: 'user_curated_link',
  },
  {
    id: 6010,
    title: 'St. Paul’s Cathedral',
    tagline: '1847 CE Gothic Revival Anglican cathedral famed for stained-glass windows & peaceful lawns',
    description: 'The first Episcopal Church of the Orient, noted for its impressive Indo-Gothic architecture designed by Major William Nairn Forbes. Features Florentine stained-glass frescoes, historic episcopal tombs, and tranquil Maidan grounds.',
    category: 'Heritage & History',
    city: 'Kolkata',
    state: 'West Bengal',
    area_name: '1A Cathedral Road, Maidan, Kolkata',
    price: 0,
    rating: 4.86,
    review_count: 1780,
    approx_duration_mins: 60,
    image_url: 'https://i.pinimg.com/736x/f4/08/5b/f4085b84425168c59383a1e739d57589.jpg',
    image_urls: JSON.stringify([
      'https://i.pinimg.com/736x/f4/08/5b/f4085b84425168c59383a1e739d57589.jpg',
    ]),
    tags: JSON.stringify(['cathedral', 'gothic', 'stained-glass', 'maidan', 'kolkata', 'heritage', 'verified']),
    latitude: 22.5442,
    longitude: 88.3467,
    is_indoor: 1,
    is_rain_safe: 1,
    is_hidden_gem: 0,
    is_family_friendly: 1,
    low_walking: 1,
    wheelchair_accessible: 1,
    is_active: 1,
    source: 'user_curated_link',
  },
];

async function syncWestBengal() {
  console.log('[West Bengal Sync] Initializing database synchronization...');

  // Ensure West Bengal state exists
  const states = await dbAll(`SELECT * FROM states WHERE LOWER(name) LIKE '%bengal%'`);
  let wbStateId = states[0]?.id;
  if (!wbStateId) {
    const res = await dbRun(
      `INSERT INTO states (name, code, region, description, hero_image, is_popular)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        'West Bengal',
        'WB',
        'East India',
        'From the snow-draped Himalayan crests of Darjeeling to the historic colonial riverfronts of Kolkata, West Bengal is India’s cultural and intellectual heartland.',
        'https://images.unsplash.com/photo-1558431382-27e303142255?q=80&w=1200&auto=format&fit=crop',
        1,
      ]
    );
    wbStateId = res.lastID;
    console.log(`[West Bengal Sync] Created West Bengal state with ID ${wbStateId}`);
  }

  // Ensure Darjeeling and Kolkata exist in cities
  const darjeelingRows = await dbAll(`SELECT * FROM cities WHERE LOWER(name) = 'darjeeling'`);
  if (darjeelingRows.length === 0) {
    await dbRun(
      `INSERT INTO cities (state_id, name, tier, latitude, longitude, tagline, description, hero_image, ideal_duration_days, best_season)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        wbStateId,
        'Darjeeling',
        'Heritage Hub',
        27.041,
        88.2663,
        'Queen of the Hills, UNESCO Toy Train & High-Altitude Himalayan Vistas',
        'Perched in the Eastern Himalayas at 2,042m elevation. Famous for the century-old Toy Train, sunrise views of Kanchenjunga from Tiger Hill, and aromatic high-altitude tea estates.',
        'https://www.easeindiatrip.com/blog/wp-content/uploads/2025/01/Darjeeling-Himalayan-Railway-03.jpg',
        3,
        'March to May & October to December',
      ]
    );
    console.log('[West Bengal Sync] Inserted Darjeeling city entry');
  }

  const kolkataRows = await dbAll(`SELECT * FROM cities WHERE LOWER(name) IN ('kolkata', 'calcutta')`);
  if (kolkataRows.length === 0) {
    await dbRun(
      `INSERT INTO cities (state_id, name, tier, latitude, longitude, tagline, description, hero_image, ideal_duration_days, best_season)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        wbStateId,
        'Kolkata',
        'Metro Hub',
        22.5726,
        88.3639,
        'City of Joy, Imperial Marble Marvels & Living Intellectual Heritage',
        'The cultural capital of India along the sacred Hooghly river. Renowned for Victoria Memorial, Howrah Bridge, historic museums, and sacred Kali temples.',
        'https://kolkatacitytour.com/wp-content/uploads/2022/04/victoria-memorial-Kolkata-1-1.jpg',
        3,
        'October to March',
      ]
    );
    console.log('[West Bengal Sync] Inserted Kolkata city entry');
  }

  // Insert or update experiences
  for (const exp of WEST_BENGAL_EXPERIENCES) {
    const existing = await dbAll(`SELECT id FROM experiences WHERE id = ?`, [exp.id]);
    if (existing && existing.length > 0) {
      await dbRun(
        `UPDATE experiences SET
          title = ?, tagline = ?, description = ?, category = ?, city = ?, state = ?, area_name = ?,
          price = ?, rating = ?, review_count = ?, approx_duration_mins = ?, image_urls = ?,
          tags = ?, latitude = ?, longitude = ?, is_indoor = ?, is_rain_safe = ?, is_hidden_gem = ?,
          is_family_friendly = ?, low_walking = ?, wheelchair_accessible = ?, source = ?
        WHERE id = ?`,
        [
          exp.title, exp.tagline, exp.description, exp.category, exp.city, exp.state, exp.area_name,
          exp.price, exp.rating, exp.review_count, exp.approx_duration_mins, exp.image_urls,
          exp.tags, exp.latitude, exp.longitude, exp.is_indoor, exp.is_rain_safe, exp.is_hidden_gem,
          exp.is_family_friendly, exp.low_walking, exp.wheelchair_accessible, exp.source, exp.id,
        ]
      );
      console.log(`[West Bengal Sync] Updated: ${exp.title} (ID ${exp.id})`);
    } else {
      await dbRun(
        `INSERT INTO experiences (
          id, title, tagline, description, category, city, state, area_name,
          price, rating, review_count, approx_duration_mins, image_urls,
          tags, latitude, longitude, is_indoor, is_rain_safe, is_hidden_gem,
          is_family_friendly, low_walking, wheelchair_accessible, is_active, source
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
        [
          exp.id, exp.title, exp.tagline, exp.description, exp.category, exp.city, exp.state, exp.area_name,
          exp.price, exp.rating, exp.review_count, exp.approx_duration_mins, exp.image_urls,
          exp.tags, exp.latitude, exp.longitude, exp.is_indoor, exp.is_rain_safe, exp.is_hidden_gem,
          exp.is_family_friendly, exp.low_walking, exp.wheelchair_accessible, exp.source,
        ]
      );
      console.log(`[West Bengal Sync] Inserted: ${exp.title} (ID ${exp.id})`);
    }
  }

  // Update experiences_image_map.json
  const mapPath = path.resolve(__dirname, '../../experiences_image_map.json');
  if (fs.existsSync(mapPath)) {
    const mapData = JSON.parse(fs.readFileSync(mapPath, 'utf-8'));
    for (const exp of WEST_BENGAL_EXPERIENCES) {
      const idx = mapData.findIndex((m) => m.id === exp.id);
      const entry = {
        id: exp.id,
        title: exp.title,
        city: exp.city,
        state: exp.state,
        category: exp.category,
        image_url: exp.image_url,
      };
      if (idx >= 0) {
        mapData[idx] = entry;
      } else {
        mapData.push(entry);
      }
    }
    fs.writeFileSync(mapPath, JSON.stringify(mapData, null, 2), 'utf-8');
    console.log('[West Bengal Sync] Updated experiences_image_map.json with 10 West Bengal entries');
  }

  console.log('[West Bengal Sync] Successfully synchronized all 10 West Bengal destinations across Darjeeling and Kolkata!');
}

syncWestBengal().catch(console.error);
