import { dbRun, dbAll } from '../db/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SHIMLA_EXPERIENCES = [
  {
    id: 1301,
    title: 'Mall Road Promenade & Heritage Bazaars',
    tagline: 'Bustling colonial-era pedestrian boulevard lined with heritage wooden cafes, woolen emporiums, and bookshops',
    description: 'The beating heart of Shimla, this vehicle-free walking avenue constructed during the British colonial era features classic heritage architecture, Gaiety Heritage Cultural Complex, vibrant Himachali shawl showrooms, and steaming mountain bakery treats.',
    category: 'Shopping & Culture',
    city: 'Shimla',
    state: 'Himachal Pradesh',
    area_name: 'The Mall, Central Shimla',
    price: 0,
    rating: 4.88,
    review_count: 3120,
    approx_duration_mins: 90,
    image_url: 'https://imgcld.yatra.com/ytimages/image/upload/t_yt_blog_c_fill_q_auto:good_f_auto_w_800_h_500/v1556258419/The%20Famous%20Ridge_1556257575.jpg',
    image_urls: JSON.stringify(['https://imgcld.yatra.com/ytimages/image/upload/t_yt_blog_c_fill_q_auto:good_f_auto_w_800_h_500/v1556258419/The%20Famous%20Ridge_1556257575.jpg']),
    tags: JSON.stringify(['mall-road', 'shimla', 'promenade', 'shopping', 'colonial-heritage', 'bazaar']),
    latitude: 31.1044,
    longitude: 77.1741,
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
    id: 1302,
    title: 'The Ridge (Heart of Shimla)',
    tagline: 'Expansive high-altitude open square with panoramic vistas of snow-capped Pir Panjal ranges',
    description: 'Perched above Mall Road, The Ridge is the cultural amphitheater of Shimla. It hosts the Summer Festival, centers around historic Tudor-style municipal libraries, and offers sweeping alpine vistas of snow-dusted Himalayan peaks.',
    category: 'Nature & Wildlife',
    city: 'Shimla',
    state: 'Himachal Pradesh',
    area_name: 'The Ridge, Upper Shimla',
    price: 0,
    rating: 4.90,
    review_count: 2840,
    approx_duration_mins: 60,
    image_url: 'https://yehsafarhamarahai.com/wp-content/uploads/2025/05/dnhc8mr7tmp71-e1746330230265.jpg',
    image_urls: JSON.stringify(['https://yehsafarhamarahai.com/wp-content/uploads/2025/05/dnhc8mr7tmp71-e1746330230265.jpg']),
    tags: JSON.stringify(['the-ridge', 'viewpoint', 'himalayan-views', 'shimla', 'open-square']),
    latitude: 31.1051,
    longitude: 77.1754,
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
    id: 1303,
    title: 'Christ Church (Neo-Gothic Landmark)',
    tagline: 'Second oldest church in North India with vibrant stained-glass windows and historic pipe organ',
    description: 'Consecrated in 1857 on The Ridge, this iconic yellow neo-Gothic sanctuary stands as a quintessential symbol of Shimla, illuminated gloriously at dusk and featuring five stained-glass windows representing faith, hope, charity, fortitude, and patience.',
    category: 'Heritage & History',
    city: 'Shimla',
    state: 'Himachal Pradesh',
    area_name: 'The Ridge, Shimla',
    price: 0,
    rating: 4.87,
    review_count: 2450,
    approx_duration_mins: 45,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Christ_Church%2C_Shimla.jpg',
    image_urls: JSON.stringify(['https://upload.wikimedia.org/wikipedia/commons/f/fd/Christ_Church%2C_Shimla.jpg']),
    tags: JSON.stringify(['christ-church', 'neo-gothic', 'the-ridge', 'stained-glass', 'heritage']),
    latitude: 31.1053,
    longitude: 77.1772,
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
    id: 1304,
    title: 'Jakhoo Temple & 108ft Lord Hanuman Colossus',
    tagline: 'Sacred hilltop shrine perched at 8,054 feet amidst misty deodar forests with towering deity statue',
    description: 'Located on Shimla’s highest summit (Jakhoo Hill), this ancient temple is dedicated to Lord Hanuman, believed to have rested here during his quest for the Sanjeevani herb. Features a monumental 108-foot vermillion statue visible across the valley and scenic ropeway access.',
    category: 'Spiritual & Wellness',
    city: 'Shimla',
    state: 'Himachal Pradesh',
    area_name: 'Jakhoo Hill, Shimla',
    price: 0,
    rating: 4.86,
    review_count: 2190,
    approx_duration_mins: 90,
    image_url: 'https://www.thestatesman.com/wp-content/uploads/2023/04/5D59F9E7-7572-40E1-A9E8-779237EA23BB.jpeg',
    image_urls: JSON.stringify(['https://www.thestatesman.com/wp-content/uploads/2023/04/5D59F9E7-7572-40E1-A9E8-779237EA23BB.jpeg']),
    tags: JSON.stringify(['jakhoo-temple', 'hanuman', 'ropeway', 'highest-peak', 'deodar-forest']),
    latitude: 31.1009,
    longitude: 77.1842,
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
    id: 1305,
    title: 'Kufri Alpine Meadow & Valley Viewpoint',
    tagline: 'High-altitude winter wonderland famous for snow sports, cedar slopes, and Himalayan nature parks',
    description: 'Perched at 7,510 feet just 16 km from Shimla, Kufri captivates with Mahasu Peak trails, tobogganing, horseback rides through pine-scented bridle paths, and the Himalayan Nature Park sheltering rare musk deer and monal pheasants.',
    category: 'Nature & Wildlife',
    city: 'Shimla',
    state: 'Himachal Pradesh',
    area_name: 'Kufri Valley, Shimla',
    price: 30,
    rating: 4.84,
    review_count: 2710,
    approx_duration_mins: 180,
    image_url: 'https://tripandtales.com/wp-content/uploads/2026/03/Kufri-View.jpg',
    image_urls: JSON.stringify(['https://tripandtales.com/wp-content/uploads/2026/03/Kufri-View.jpg']),
    tags: JSON.stringify(['kufri', 'snow-sports', 'mahasu-peak', 'alpine-meadows', 'nature-park']),
    latitude: 31.0988,
    longitude: 77.2678,
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
    id: 1306,
    title: 'Viceregal Lodge & Botanical Grounds',
    tagline: 'Spectacular Scottish baronial estate on Observatory Hill where modern Indian history was shaped',
    description: 'Designed by Henry Irwin and completed in 1888 for the British Viceroy, this monumental teakwood-and-sandstone palace hosted historic conferences leading to Indian independence. It now houses the Indian Institute of Advanced Study, surrounded by manicured rose gardens and English lawngrounds.',
    category: 'Heritage & History',
    city: 'Shimla',
    state: 'Himachal Pradesh',
    area_name: 'Observatory Hill, Summer Hill',
    price: 50,
    rating: 4.92,
    review_count: 2380,
    approx_duration_mins: 105,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Viceregal_Lodge%2C_Simla%2C_India.jpg',
    image_urls: JSON.stringify(['https://upload.wikimedia.org/wikipedia/commons/f/ff/Viceregal_Lodge%2C_Simla%2C_India.jpg']),
    tags: JSON.stringify(['viceregal-lodge', 'rashtrapati-niwas', 'baronial', 'observatory-hill', 'botanical-gardens']),
    latitude: 31.1042,
    longitude: 77.1404,
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

async function syncShimla() {
  console.log('Syncing Shimla destinations to SQLite DB...');

  for (const exp of SHIMLA_EXPERIENCES) {
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
    for (const exp of SHIMLA_EXPERIENCES) {
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

  console.log('Shimla sync complete!');
}

syncShimla().catch(console.error);
