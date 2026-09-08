import { dbRun, dbAll } from '../db/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALMORA_EXPERIENCES = [
  {
    id: 1401,
    title: 'Bright End Corner Sunset & Sunrise Point',
    tagline: 'Serene viewpoint offering legendary sunrise and sunset panoramas over the Kumaon Himalayas',
    description: 'Located at the end of the Almora ridge, Bright End Corner is dedicated to Swami Vivekananda who spent quiet contemplative days here. It offers spellbinding, unobstructed vistas of morning dawn and fiery golden dusk over snow-capped Himalayan crests.',
    category: 'Nature & Wildlife',
    city: 'Almora',
    state: 'Uttarakhand',
    area_name: 'Mall Road End, Almora',
    price: 0,
    rating: 4.85,
    review_count: 1980,
    approx_duration_mins: 60,
    image_url: 'https://www.trawell.in/admin/images/thumbs/363732905Almora_Binsar_Wildlife_Sanctuary_Main_thumb.jpg',
    image_urls: JSON.stringify(['https://www.trawell.in/admin/images/thumbs/363732905Almora_Binsar_Wildlife_Sanctuary_Main_thumb.jpg']),
    tags: JSON.stringify(['bright-end-corner', 'almora', 'sunset', 'sunrise', 'himalayan-view', 'vivekananda']),
    latitude: 29.5878,
    longitude: 79.6456,
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
    id: 1402,
    title: 'Kasaar Devi Temple (Crank’s Ridge)',
    tagline: '2nd-century cave sanctuary set within Earth’s unique geomagnetic Van Allen radiation belt',
    description: 'Perched on Crank’s Ridge overlooking Almora, this ancient cave temple is renowned for its intense geomagnetic energy, comparable to Machu Picchu and Stonehenge. Visited by Swami Vivekananda, Bob Dylan, and George Harrison, it offers profound tranquility and panoramic valley vistas.',
    category: 'Spiritual & Wellness',
    city: 'Almora',
    state: 'Uttarakhand',
    area_name: 'Kasar Devi, Binsar Road',
    price: 0,
    rating: 4.93,
    review_count: 2640,
    approx_duration_mins: 90,
    image_url: 'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=1221569176646032',
    image_urls: JSON.stringify(['https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=1221569176646032']),
    tags: JSON.stringify(['kasar-devi', 'geomagnetic', 'cranks-ridge', 'spiritual', 'meditation', 'cave-temple']),
    latitude: 29.6375,
    longitude: 79.6644,
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
    id: 1403,
    title: 'Chitai Golu Devta Temple (Temple of Justice)',
    tagline: 'Sacred shrine adorned with thousands of brass bells and written petitions to the God of Justice',
    description: 'Dedicated to Golu Devta, an incarnation of Lord Shiva considered the supreme dispenser of justice in Kumaon. Devotees hang written legal stamp paper petitions and return to tie brass bells of every size upon fulfilling vows, creating an acoustic sanctuary echoing with sacred chiming.',
    category: 'Spiritual & Wellness',
    city: 'Almora',
    state: 'Uttarakhand',
    area_name: 'Chitai, Pithoragarh Highway',
    price: 0,
    rating: 4.91,
    review_count: 3210,
    approx_duration_mins: 60,
    image_url: 'http://www.transformingtravels.com/wp-content/uploads/2024/04/Chitai-Golu-Devta-Temple.jpg',
    image_urls: JSON.stringify(['http://www.transformingtravels.com/wp-content/uploads/2024/04/Chitai-Golu-Devta-Temple.jpg']),
    tags: JSON.stringify(['golu-devta', 'chitai', 'bells', 'temple-of-justice', 'kumaon-heritage']),
    latitude: 29.5997,
    longitude: 79.7042,
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
    id: 1404,
    title: 'Zero Point • Binsar Wildlife Sanctuary',
    tagline: 'Highest vantage point in Binsar with 300-km sweeping vistas of Kedarnath, Trishul, and Nanda Devi',
    description: 'Nestled within dense oak and rhododendron forests of Binsar Wildlife Sanctuary at 7,900 feet, Zero Point offers the grandest panoramic spectacle in Uttarakhand — a majestic 300-kilometer arc of Himalayan giants including Chaukhamba, Trishul, Nanda Devi, and Panchachuli.',
    category: 'Nature & Wildlife',
    city: 'Almora',
    state: 'Uttarakhand',
    area_name: 'Binsar Wildlife Sanctuary, Almora',
    price: 150,
    rating: 4.89,
    review_count: 2150,
    approx_duration_mins: 150,
    image_url: 'https://www.alltrails.com/mugen/image/location-app-router?url=https%3A%2F%2Fimages.alltrails.com%2FeyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvOTIzNTgyMDQvZTUxZjEyYzgyNjE4NWRlZjM0YTk5MjljZWU5MWFkNDUuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJ3ZWJwIiwicmVzaXplIjp7IndpZHRoIjoiMTA4MCIsImhlaWdodCI6IjcwMCIsImZpdCI6ImNvdmVyIn0sInJvdGF0ZSI6bnVsbCwianBlZyI6eyJ0cmVsbGlzUXVhbnRpc2F0aW9uIjp0cnVlLCJvdmVyc2hvb3REZXJpbmdpbmciOnRydWUsIm9wdGltaXNlU2NhbnMiOnRydWUsInF1YW50aXNhdGlvblRhYmxlIjozfX19&w=3840&q=90',
    image_urls: JSON.stringify(['https://www.alltrails.com/mugen/image/location-app-router?url=https%3A%2F%2Fimages.alltrails.com%2FeyJidWNrZXQiOiJhc3NldHMuYWxsdHJhaWxzLmNvbSIsImtleSI6InVwbG9hZHMvcGhvdG8vaW1hZ2UvOTIzNTgyMDQvZTUxZjEyYzgyNjE4NWRlZjM0YTk5MjljZWU5MWFkNDUuanBnIiwiZWRpdHMiOnsidG9Gb3JtYXQiOiJ3ZWJwIiwicmVzaXplIjp7IndpZHRoIjoiMTA4MCIsImhlaWdodCI6IjcwMCIsImZpdCI6ImNvdmVyIn0sInJvdGF0ZSI6bnVsbCwianBlZyI6eyJ0cmVsbGlzUXVhbnRpc2F0aW9uIjp0cnVlLCJvdmVyc2hvb3REZXJpbmdpbmciOnRydWUsIm9wdGltaXNlU2NhbnMiOnRydWUsInF1YW50aXNhdGlvblRhYmxlIjozfX19&w=3840&q=90']),
    tags: JSON.stringify(['binsar', 'zero-point', 'nanda-devi', 'trishul', 'wildlife-sanctuary', 'trek']),
    latitude: 29.7027,
    longitude: 79.7547,
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
    id: 1405,
    title: 'Kumaon Regimental Centre (KRC) Museum',
    tagline: 'Distinguished military heritage museum commemorating the bravery of Kumaon and Naga soldiers',
    description: 'Established in 1974 to honor the valor of India’s most decorated infantry regiment. The museum preserves historical battle honors, captured enemy flags from 1965 and 1971, weapons from the 1857 mutiny, and the posthumous Param Vir Chakra medal of Major Somnath Sharma.',
    category: 'Heritage & History',
    city: 'Almora',
    state: 'Uttarakhand',
    area_name: 'Ranikhet Cantonment, Almora Enclave',
    price: 50,
    rating: 4.87,
    review_count: 1840,
    approx_duration_mins: 75,
    image_url: 'https://avathioutdoors.gumlet.io/travelGuide/dev/ranikhet_P9050.jpg',
    image_urls: JSON.stringify(['https://avathioutdoors.gumlet.io/travelGuide/dev/ranikhet_P9050.jpg']),
    tags: JSON.stringify(['krc-museum', 'kumaon-regiment', 'military-heritage', 'ranikhet', 'bravery']),
    latitude: 29.6433,
    longitude: 79.4319,
    is_indoor: 1,
    is_rain_safe: 1,
    is_hidden_gem: 0,
    is_family_friendly: 1,
    low_walking: 1,
    wheelchair_accessible: 1,
    is_active: 1,
    source: 'user_curated_link',
  },
  {
    id: 1406,
    title: 'Katarmal Sun Temple (Bara Aditya Temple)',
    tagline: '9th-century Katyuri architectural marvel and India’s second most prominent Sun temple',
    description: 'Built by Katyuri King Katarmalla in the 9th century, this ancient stone temple complex perches atop a hill opposite Almora. It features one main shrine dedicated to the Sun God surrounded by 44 miniature stone shrines, intricate wood carvings, and astronomical solar alignment.',
    category: 'Heritage & History',
    city: 'Almora',
    state: 'Uttarakhand',
    area_name: 'Katarmal, Kosi River Valley',
    price: 0,
    rating: 4.90,
    review_count: 1720,
    approx_duration_mins: 90,
    image_url: 'https://www.chardhamtour.in/blog/wp-content/uploads/2019/05/Katarmal-Temple.jpg',
    image_urls: JSON.stringify(['https://www.chardhamtour.in/blog/wp-content/uploads/2019/05/Katarmal-Temple.jpg']),
    tags: JSON.stringify(['katarmal', 'sun-temple', 'katyuri', 'ancient-architecture', 'heritage-monument']),
    latitude: 29.6231,
    longitude: 79.6106,
    is_indoor: 0,
    is_rain_safe: 0,
    is_hidden_gem: 0,
    is_family_friendly: 1,
    low_walking: 0,
    wheelchair_accessible: 0,
    is_active: 1,
    source: 'user_curated_link',
  },
];

async function syncAlmora() {
  console.log('Syncing Almora destinations to SQLite DB...');

  // Ensure Almora city is present in cities table
  const cityRows = await dbAll('SELECT id FROM cities WHERE LOWER(name) = ?', ['almora']);
  if (cityRows.length === 0) {
    await dbRun(
      `INSERT INTO cities (
        name, state_id, state_name, state_code, tagline, description,
        latitude, longitude, image_url, culture_summary, best_time_to_visit,
        aliases, categories, heritage_count, is_popular, is_heritage_hub, is_hidden_gem, tier
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 0, 'Tier 2')`,
      [
        'Almora',
        8,
        'Uttarakhand',
        'UK',
        'Cultural Heart of Kumaon & Himalayan Van Allen Ridge',
        'Ancient stone temples, Crank’s Ridge magnetic aura, sacred Golu Devta bells, and 300-km Himalayan panoramas.',
        29.5878,
        79.6456,
        'https://www.trawell.in/admin/images/thumbs/363732905Almora_Binsar_Wildlife_Sanctuary_Main_thumb.jpg',
        'Kumaoni Aipan sacred art, Tamta copper craft guilds, and bal mithai confectionery heritage.',
        'March to June & September to November',
        JSON.stringify(['Binsar', 'Ranikhet', 'Kasar Devi', 'Kumaon']),
        JSON.stringify(['Heritage', 'Nature', 'Spiritual', 'Culture']),
        18,
      ]
    );
    console.log('Inserted Almora into cities table');
  }

  for (const exp of ALMORA_EXPERIENCES) {
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
    for (const exp of ALMORA_EXPERIENCES) {
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

  console.log('Almora sync complete!');
}

syncAlmora().catch(console.error);
