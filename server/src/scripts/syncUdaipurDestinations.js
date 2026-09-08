import { dbRun, dbAll } from '../db/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UDAIPUR_EXPERIENCES = [
  {
    id: 1501,
    title: 'City Palace Complex & Crystal Gallery',
    tagline: 'Magnificent 400-year-old royal fortress complex towering over the eastern banks of Lake Pichola',
    description: 'Built over four centuries by successive Mewar rulers, this colossal granite and marble palace complex blends Rajasthani and Mughal architectural styles, featuring intricate mirror-work at Sheesh Mahal, peacock mosaics at Mor Chowk, and royal courtyards.',
    category: 'Heritage & History',
    city: 'Udaipur',
    state: 'Rajasthan',
    area_name: 'Old City, Lake Pichola East',
    price: 300,
    rating: 4.92,
    review_count: 4280,
    approx_duration_mins: 120,
    image_url: 'https://wanderon-images.gumlet.io/gallery/new/2025/10/08/1759921247369-city-palace-udaipur.jpg?auto=compress,format&w=768',
    image_urls: JSON.stringify(['https://wanderon-images.gumlet.io/gallery/new/2025/10/08/1759921247369-city-palace-udaipur.jpg?auto=compress,format&w=768']),
    tags: JSON.stringify(['city-palace', 'mewar', 'sheesh-mahal', 'udaipur', 'heritage-palace']),
    latitude: 24.5764,
    longitude: 73.6835,
    is_indoor: 0,
    is_rain_safe: 1,
    is_hidden_gem: 0,
    is_family_friendly: 1,
    low_walking: 0,
    wheelchair_accessible: 1,
    is_active: 1,
    source: 'user_curated_link',
  },
  {
    id: 1502,
    title: 'Lake Pichola Sunset Boat Cruise',
    tagline: 'Iconic 14th-century freshwater lake surrounded by marble palaces, ghats, and the Aravalli hills',
    description: 'Created in 1362 AD by a Banjara tribesman, Lake Pichola is the romantic centerpiece of Udaipur. A boat cruise glides past illuminated heritage ghats, the floating Taj Lake Palace, Bagore Ki Haveli, and dramatic reflections of the Aravalli mountains.',
    category: 'Nature & Wildlife',
    city: 'Udaipur',
    state: 'Rajasthan',
    area_name: 'Pichola, Central Udaipur',
    price: 400,
    rating: 4.90,
    review_count: 3950,
    approx_duration_mins: 60,
    image_url: 'https://hblimg.mmtcdn.com/content/hubble/img/udaipur/mmt/activities/m_activities-udaipur-lake-pichola_l_400_640.jpg',
    image_urls: JSON.stringify(['https://hblimg.mmtcdn.com/content/hubble/img/udaipur/mmt/activities/m_activities-udaipur-lake-pichola_l_400_640.jpg']),
    tags: JSON.stringify(['lake-pichola', 'boat-cruise', 'sunset', 'waterfront', 'romantic-udaipur']),
    latitude: 24.5736,
    longitude: 73.6789,
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
    id: 1503,
    title: 'Sajjangarh Monsoon Palace & Wildlife Sanctuary',
    tagline: '19th-century white marble hilltop fortress built to track monsoon clouds across the Mewar valley',
    description: 'Perched 3,100 feet above sea level atop Bansdara Peak, this dramatic palace was built by Maharana Sajjan Singh in 1884 to watch approaching monsoon clouds. It offers a 360-degree sunset vista across Udaipur’s lakes, palaces, and rugged Aravalli ridges.',
    category: 'Heritage & History',
    city: 'Udaipur',
    state: 'Rajasthan',
    area_name: 'Bansdara Peak, Sajjangarh',
    price: 110,
    rating: 4.86,
    review_count: 2840,
    approx_duration_mins: 90,
    image_url: 'https://udaipurtaxiservices.com/blog/wp-content/uploads/2025/03/Sajjangarh-Fort.jpg',
    image_urls: JSON.stringify(['https://udaipurtaxiservices.com/blog/wp-content/uploads/2025/03/Sajjangarh-Fort.jpg']),
    tags: JSON.stringify(['sajjangarh', 'monsoon-palace', 'sunset-point', 'aravalli', 'hilltop-fort']),
    latitude: 24.5919,
    longitude: 73.6428,
    is_indoor: 0,
    is_rain_safe: 0,
    is_hidden_gem: 0,
    is_family_friendly: 1,
    low_walking: 0,
    wheelchair_accessible: 1,
    is_active: 1,
    source: 'user_curated_link',
  },
  {
    id: 1504,
    title: 'Jag Mandir Island Palace (Lake Garden Palace)',
    tagline: '17th-century island sanctuary featuring life-sized marble elephants and Mughal-influenced courtyards',
    description: 'Constructed by three Maharanas on an island in Lake Pichola, Jag Mandir served as a royal summer resort and refuge for Prince Khurram (later Emperor Shah Jahan), inspiring features of the Taj Mahal. Adorned with carved stone elephants, gardens, and domed pavilions.',
    category: 'Heritage & History',
    city: 'Udaipur',
    state: 'Rajasthan',
    area_name: 'Lake Pichola Island',
    price: 450,
    rating: 4.88,
    review_count: 2610,
    approx_duration_mins: 75,
    image_url: 'https://s7ap1.scene7.com/is/image/incredibleindia/1-jag-mandir-palace-udaipur-rajasthan-attr-hero?qlt=82&ts=1742194862020',
    image_urls: JSON.stringify(['https://s7ap1.scene7.com/is/image/incredibleindia/1-jag-mandir-palace-udaipur-rajasthan-attr-hero?qlt=82&ts=1742194862020']),
    tags: JSON.stringify(['jag-mandir', 'island-palace', 'lake-pichola', 'marble-elephants', 'mewar-history']),
    latitude: 24.5678,
    longitude: 73.6783,
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
    id: 1505,
    title: 'Jagdish Temple (Indo-Aryan Stone Shrine)',
    tagline: 'Majestic 1651 AD carved stone temple dedicated to Lord Vishnu with a 79-foot shikhar',
    description: 'Commissioned by Maharana Jagat Singh I, this continuous living temple rises right outside the City Palace gate on a tall terrace. It features intricately sculpted pillars, ceilings depicting dancers and musicians, brass Garuda shrine, and a four-armed black stone idol of Lord Vishnu.',
    category: 'Spiritual & Wellness',
    city: 'Udaipur',
    state: 'Rajasthan',
    area_name: 'City Palace Road, Old City',
    price: 0,
    rating: 4.87,
    review_count: 2190,
    approx_duration_mins: 45,
    image_url: 'https://temple.yatradham.org/public/Product/temple/temple_8t3hYPtJ_202410161435320.jpg',
    image_urls: JSON.stringify(['https://temple.yatradham.org/public/Product/temple/temple_8t3hYPtJ_202410161435320.jpg']),
    tags: JSON.stringify(['jagdish-temple', 'indo-aryan', 'vishnu', 'living-temple', 'stone-carvings']),
    latitude: 24.5794,
    longitude: 73.6844,
    is_indoor: 1,
    is_rain_safe: 1,
    is_hidden_gem: 0,
    is_family_friendly: 1,
    low_walking: 0,
    wheelchair_accessible: 0,
    is_active: 1,
    source: 'user_curated_link',
  },
];

async function syncUdaipur() {
  console.log('--- Syncing Udaipur destinations to SQLite ---');

  // Ensure Udaipur city exists and has updated image_url & metadata
  const cityRows = await dbAll('SELECT id, name FROM cities WHERE LOWER(name) = ?', ['udaipur']);
  if (cityRows.length > 0) {
    await dbRun(
      `UPDATE cities SET
        tagline = 'The City of Lakes & Venice of the East',
        description = 'Historic capital of the kingdom of Mewar, renowned for marble palaces, shimmering Lake Pichola, hilltop fortresses, and living Rajput heritage.',
        image_url = 'https://wanderon-images.gumlet.io/gallery/new/2025/10/08/1759921247369-city-palace-udaipur.jpg?auto=compress,format&w=768',
        is_popular = 1,
        is_heritage_hub = 1
      WHERE id = ?`,
      [cityRows[0].id]
    );
    console.log(`Updated Udaipur city row ID ${cityRows[0].id}`);
  } else {
    await dbRun(
      `INSERT INTO cities (
        name, state_id, state_name, state_code, tagline, description,
        latitude, longitude, image_url, culture_summary, best_time_to_visit,
        aliases, categories, heritage_count, is_popular, is_heritage_hub, is_hidden_gem, tier
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 0, 'Tier 2')`,
      [
        'Udaipur',
        2,
        'Rajasthan',
        'RJ',
        'The City of Lakes & Venice of the East',
        'Historic capital of the kingdom of Mewar, renowned for marble palaces, shimmering Lake Pichola, hilltop fortresses, and living Rajput heritage.',
        24.5854,
        73.7125,
        'https://wanderon-images.gumlet.io/gallery/new/2025/10/08/1759921247369-city-palace-udaipur.jpg?auto=compress,format&w=768',
        'Mewar royal heritage, miniature painting traditions, silver craftsmanship, and lake ghat ceremonies.',
        'October to March',
        JSON.stringify(['Lake City', 'Venice of the East', 'Mewar']),
        JSON.stringify(['Heritage', 'Nature', 'Spiritual', 'Palaces', 'Lakes']),
        25,
      ]
    );
    console.log('Inserted Udaipur into cities table');
  }

  // Deactivate any other generic Udaipur experiences
  const activeIds = UDAIPUR_EXPERIENCES.map((e) => e.id);
  await dbRun(
    `UPDATE experiences SET is_active = 0 WHERE (LOWER(city) = 'udaipur' OR LOWER(city) LIKE '%udaipur%') AND id NOT IN (${activeIds.join(',')})`
  );
  console.log('Deactivated generic experiences for Udaipur');

  for (const exp of UDAIPUR_EXPERIENCES) {
    const existing = await dbAll('SELECT id FROM experiences WHERE id = ?', [exp.id]);
    if (existing.length > 0) {
      await dbRun(
        `UPDATE experiences SET
          title = ?, tagline = ?, description = ?, category = ?, city = ?, state = ?, area_name = ?,
          price = ?, rating = ?, review_count = ?, approx_duration_mins = ?, image_urls = ?,
          tags = ?, latitude = ?, longitude = ?, is_indoor = ?, is_rain_safe = ?, is_hidden_gem = ?,
          is_family_friendly = ?, low_walking = ?, wheelchair_accessible = ?, is_active = 1, source = ?
        WHERE id = ?`,
        [
          exp.title, exp.tagline, exp.description, exp.category, exp.city, exp.state, exp.area_name,
          exp.price, exp.rating, exp.review_count, exp.approx_duration_mins, exp.image_urls,
          exp.tags, exp.latitude, exp.longitude, exp.is_indoor, exp.is_rain_safe, exp.is_hidden_gem,
          exp.is_family_friendly, exp.low_walking, exp.wheelchair_accessible, exp.source, exp.id
        ]
      );
      console.log(`Updated experience ID ${exp.id} (${exp.title})`);
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
          exp.is_family_friendly, exp.low_walking, exp.wheelchair_accessible, exp.source
        ]
      );
      console.log(`Inserted experience ID ${exp.id} (${exp.title})`);
    }
  }

  // Update experiences_image_map.json
  const mapPath = path.resolve(__dirname, '../../experiences_image_map.json');
  if (fs.existsSync(mapPath)) {
    const mapData = JSON.parse(fs.readFileSync(mapPath, 'utf-8'));
    for (const exp of UDAIPUR_EXPERIENCES) {
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
    console.log('Updated experiences_image_map.json');
  }

  console.log('Udaipur sync complete!');
}

syncUdaipur().catch(console.error);
