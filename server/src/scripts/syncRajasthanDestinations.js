import { dbRun, dbAll } from '../db/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RAJASTHAN_EXPERIENCES = [
  // 1. Jodhpur
  {
    id: 8001,
    title: 'Mehrangarh Fort',
    tagline: 'Colossal 15th-century Rajput citadel rising 400 feet above the Blue City',
    description: 'Built in 1459 by Rao Jodha, Mehrangarh spans colossal impregnable walls with intricate palaces like Sheesh Mahal, Phool Mahal, and Moti Mahal, housing palanquins, royal costumes, and Rajput armory with sweeping vistas of Jodhpur\'s blue rooftops.',
    category: 'Heritage & History',
    city: 'Jodhpur',
    state: 'Rajasthan',
    area_name: 'Sodagaran Mohalla, Fort Road, Jodhpur',
    price: 200,
    rating: 4.97,
    review_count: 1850,
    approx_duration_mins: 180,
    image_url: 'https://www.andbeyond.com/wp-content/uploads/sites/5/north-india-jodhpur.jpg',
    image_urls: JSON.stringify([
      'https://www.andbeyond.com/wp-content/uploads/sites/5/north-india-jodhpur.jpg',
      'https://www.google.com/imgres?q=mehrangarh%20fort&imgurl=https%3A%2F%2Fwww.andbeyond.com%2Fwp-content%2Fuploads%2Fsites%2F5%2Fnorth-india-jodhpur.jpg'
    ]),
    tags: JSON.stringify(['fort', 'jodhpur', 'rajasthan', 'heritage', 'mehrangarh', 'citadel', 'verified']),
    latitude: 26.2981,
    longitude: 73.0189,
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
    id: 8002,
    title: 'Jaswant Thada',
    tagline: 'Intricately carved white Makrana marble cenotaph of Marwar royalty',
    description: 'Built in 1899 by Maharaja Sardar Singh in memory of his father Maharaja Jaswant Singh II. Dubbed the Taj Mahal of Marwar, its paper-thin polished marble sheets glow warmly in the Rajasthani sunlight across tranquil carved gazebos, tiered gardens, and lakeside reflection pools.',
    category: 'Heritage & History',
    city: 'Jodhpur',
    state: 'Rajasthan',
    area_name: 'Lawaran, Near Mehrangarh Fort, Jodhpur',
    price: 50,
    rating: 4.86,
    review_count: 840,
    approx_duration_mins: 60,
    image_url: 'https://static.toiimg.com/thumb/msid-38975640,width-1000,height-667.cms',
    image_urls: JSON.stringify([
      'https://static.toiimg.com/thumb/msid-38975640,width-1000,height-667.cms',
      'https://www.google.com/imgres?q=jashawant%20thada&imgurl=https%3A%2F%2Fstatic.toiimg.com%2Fphoto%2Fmsid-38975640%2Cwidth-96%2Cheight-65.cms'
    ]),
    tags: JSON.stringify(['cenotaph', 'marble', 'jodhpur', 'jaswant-thada', 'architecture', 'verified']),
    latitude: 26.3039,
    longitude: 73.0247,
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
    id: 8003,
    title: 'Umaid Bhawan Palace',
    tagline: 'Grand Art Deco & Rajput royal residence built from golden Chittar sandstone',
    description: 'Completed in 1943 by Maharaja Umaid Singh, this 347-room architectural wonder is one of the world\'s largest private residences. Features a museum of royal vintage cars, clocks, weaponry, and gilded halls reflecting a magnificent blend of western Art Deco and classical Indian palace architecture.',
    category: 'Heritage & History',
    city: 'Jodhpur',
    state: 'Rajasthan',
    area_name: 'Circuit House Road, Cantt Area, Jodhpur',
    price: 100,
    rating: 4.91,
    review_count: 1260,
    approx_duration_mins: 120,
    image_url: 'https://static.toiimg.com/thumb/103393129/Umaid.jpg?width=1200&height=900',
    image_urls: JSON.stringify([
      'https://static.toiimg.com/thumb/103393129/Umaid.jpg?width=1200&height=900',
      'https://www.google.com/imgres?q=umaid%20bhawan%20palace'
    ]),
    tags: JSON.stringify(['palace', 'art-deco', 'jodhpur', 'umaid-bhawan', 'museum', 'royal', 'verified']),
    latitude: 26.2809,
    longitude: 73.0475,
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
    id: 8004,
    title: 'Mandore Gardens',
    tagline: 'Ancient capital of Marwar featuring high-rock cenotaphs and lush landscaped gardens',
    description: 'The ancient seat of the Parihar and Rathore dynasties before the founding of Jodhpur. Features soaring red sandstone dewals (cenotaphs) shaped like Hindu temples, the Hall of Heroes with rock-carved deities, and lush botanical gardens bustling with resident langurs.',
    category: 'Heritage & History',
    city: 'Jodhpur',
    state: 'Rajasthan',
    area_name: 'Mandore, 9 km North of Jodhpur',
    price: 0,
    rating: 4.76,
    review_count: 680,
    approx_duration_mins: 90,
    image_url: 'https://cdn.getyourguide.com/image/format=auto,fit=crop,gravity=auto,quality=60,width=400,height=265,dpr=2/tour_img/d174f62f6123cc0772801cabd0735c19ed71428aa8476686dde76556927e7157.png',
    image_urls: JSON.stringify([
      'https://cdn.getyourguide.com/image/format=auto,fit=crop,gravity=auto,quality=60,width=400,height=265,dpr=2/tour_img/d174f62f6123cc0772801cabd0735c19ed71428aa8476686dde76556927e7157.png',
      'https://www.google.com/imgres?q=mandore%20garden'
    ]),
    tags: JSON.stringify(['garden', 'mandore', 'cenotaph', 'jodhpur', 'ruins', 'heritage', 'verified']),
    latitude: 26.3575,
    longitude: 73.0428,
    is_indoor: 0,
    is_rain_safe: 0,
    is_hidden_gem: 0,
    is_family_friendly: 1,
    low_walking: 0,
    wheelchair_accessible: 1,
    is_active: 1,
    source: 'user_curated_link',
  },

  // 2. Jaisalmer
  {
    id: 8005,
    title: 'Jaisalmer Fort (Sonar Qila)',
    tagline: 'UNESCO World Heritage living golden sandstone citadel on Trikuta Hill',
    description: 'Founded in 1156 CE by Rawal Jaisal, Sonar Qila is one of the few living forts in the world, with a quarter of Jaisalmer\'s old city population residing inside. Features 99 bastions, 7 interconnected ornate Jain temples dating from the 12th to 16th centuries, and the royal Raj Mahal palace.',
    category: 'Heritage & History',
    city: 'Jaisalmer',
    state: 'Rajasthan',
    area_name: 'Fort Road, Dhibba Para, Jaisalmer',
    price: 100,
    rating: 4.94,
    review_count: 1720,
    approx_duration_mins: 180,
    image_url: 'https://scontent.cdninstagram.com/v/t51.82787-15/588792590_18545702470054127_7503386497180787272_n.jpg?stp=dst-jpg_e35_s640x640_tt6&_nc_cat=101&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiRkVFRC5iZXN0X2ltYWdlX3VybGdlbi5DMyJ9&_nc_ohc=AwqTTAM-6E4Q7kNvwFtFghW&_nc_oc=Adr4qQv2ZBqak6K_O1JSMCv2_9ILksFEPcdtXE0b8lQ0M1ge6qE3_WVIyHxSKKAb_2E&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=-YDG0ORqMVkDUYhl9mQErg&_nc_ss=7fa8c&oh=00_AQKwMriLHCVbMqac9H6GuvFTV9P-vyN3JulRLdBCNmwvbw&oe=6AA5E0FD',
    image_urls: JSON.stringify([
      'https://scontent.cdninstagram.com/v/t51.82787-15/588792590_18545702470054127_7503386497180787272_n.jpg?stp=dst-jpg_e35_s640x640_tt6&_nc_cat=101&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiRkVFRC5iZXN0X2ltYWdlX3VybGdlbi5DMyJ9&_nc_ohc=AwqTTAM-6E4Q7kNvwFtFghW&_nc_oc=Adr4qQv2ZBqak6K_O1JSMCv2_9ILksFEPcdtXE0b8lQ0M1ge6qE3_WVIyHxSKKAb_2E&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=-YDG0ORqMVkDUYhl9mQErg&_nc_ss=7fa8c&oh=00_AQKwMriLHCVbMqac9H6GuvFTV9P-vyN3JulRLdBCNmwvbw&oe=6AA5E0FD',
      'https://www.google.com/imgres?q=jaisalmer%20fort&imgurl=https%3A%2F%2Flookaside.instagram.com%2Fseo%2Fgoogle_widget%2Fcrawler%2F%3Fmedia_id%3D3786775631238055622'
    ]),
    tags: JSON.stringify(['fort', 'unesco', 'jaisalmer', 'golden-fort', 'sonar-qila', 'desert', 'verified']),
    latitude: 26.9124,
    longitude: 70.9128,
    is_indoor: 0,
    is_rain_safe: 1,
    is_hidden_gem: 0,
    is_family_friendly: 1,
    low_walking: 0,
    wheelchair_accessible: 0,
    is_active: 1,
    source: 'user_curated_link',
  },
  {
    id: 8006,
    title: 'Sam Sand Dunes',
    tagline: 'Expansive golden ripple sand dunes offering camel treks, desert safaris & sunset vistas',
    description: 'Immerse in the windswept wilderness of the Thar Desert where undulating 30-to-60-meter dunes shift with the desert winds. Features sunset camel safaris, 4x4 dune bashing, Rajasthani Kalbelia folk performances, and stargazing under clear desert night skies.',
    category: 'Nature & Wildlife',
    city: 'Jaisalmer',
    state: 'Rajasthan',
    area_name: 'Sam Village, Thar Desert, 42 km from Jaisalmer',
    price: 500,
    rating: 4.88,
    review_count: 1450,
    approx_duration_mins: 240,
    image_url: 'https://www.bharatbooking.com/admin/webroot/img/uploads/holiday-package-gallery/1700201154_34594-sam-sand-dunes-jaisalmer-rajasthan-tour-slider-image.webp',
    image_urls: JSON.stringify([
      'https://www.bharatbooking.com/admin/webroot/img/uploads/holiday-package-gallery/1700201154_34594-sam-sand-dunes-jaisalmer-rajasthan-tour-slider-image.webp',
      'https://www.google.com/imgres?q=sam%20sand%20dunes%20jaisalmer'
    ]),
    tags: JSON.stringify(['desert', 'sand-dunes', 'jaisalmer', 'safari', 'camel', 'thar', 'verified']),
    latitude: 26.8322,
    longitude: 70.5058,
    is_indoor: 0,
    is_rain_safe: 0,
    is_hidden_gem: 0,
    is_family_friendly: 1,
    low_walking: 1,
    wheelchair_accessible: 0,
    is_active: 1,
    source: 'user_curated_link',
  },
  {
    id: 8007,
    title: 'Patwon Ki Haveli',
    tagline: 'Cluster of five 19th-century merchant mansions with breathtaking stone filigree',
    description: 'Built between 1800 and 1860 by wealthy brocade and opium merchant Guman Chand Patwa for his five sons. Renowned for over 60 intricately carved jharokha balconies, gold-leaf mural work, mirror rooms, and amber stone carvings resembling fine lace.',
    category: 'Art & Culture',
    city: 'Jaisalmer',
    state: 'Rajasthan',
    area_name: 'Near Patwa Complex, Sadar Bazar, Jaisalmer',
    price: 100,
    rating: 4.89,
    review_count: 940,
    approx_duration_mins: 90,
    image_url: 'https://scontent.cdninstagram.com/v/t51.82787-15/800450370_18436376416135176_305811308998711115_n.jpg?stp=dst-jpg_e35_s640x640_tt6&_nc_cat=102&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiRkVFRC5iZXN0X2ltYWdlX3VybGdlbi5DMyJ9&_nc_ohc=6D7AfkWn3nEQ7kNvwEw3Ahu&_nc_oc=AdrO3ue2aLwNDPAt_lDM5BOpMAlr9gQQoP8OdWmrPASvwOYdC-lv31CDxqQLSG2BPc4&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=z6mMx7prDhBrktYFjoJahg&_nc_ss=7fa8c&oh=00_AQIgCizCjXM75ZKFb_VNE2KHh7VvjoiMnCAefSdu8iJxGg&oe=6AA5F2F6',
    image_urls: JSON.stringify([
      'https://scontent.cdninstagram.com/v/t51.82787-15/800450370_18436376416135176_305811308998711115_n.jpg?stp=dst-jpg_e35_s640x640_tt6&_nc_cat=102&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiRkVFRC5iZXN0X2ltYWdlX3VybGdlbi5DMyJ9&_nc_ohc=6D7AfkWn3nEQ7kNvwEw3Ahu&_nc_oc=AdrO3ue2aLwNDPAt_lDM5BOpMAlr9gQQoP8OdWmrPASvwOYdC-lv31CDxqQLSG2BPc4&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=z6mMx7prDhBrktYFjoJahg&_nc_ss=7fa8c&oh=00_AQIgCizCjXM75ZKFb_VNE2KHh7VvjoiMnCAefSdu8iJxGg&oe=6AA5F2F6',
      'https://www.google.com/imgres?q=patwon%20ki%20haveli&imgurl=https%3A%2F%2Flookaside.instagram.com%2Fseo%2Fgoogle_widget%2Fcrawler%2F%3Fmedia_id%3D3393632755071076025'
    ]),
    tags: JSON.stringify(['haveli', 'jaisalmer', 'architecture', 'jharokha', 'stone-carving', 'verified']),
    latitude: 26.9157,
    longitude: 70.9152,
    is_indoor: 1,
    is_rain_safe: 1,
    is_hidden_gem: 0,
    is_family_friendly: 1,
    low_walking: 1,
    wheelchair_accessible: 0,
    is_active: 1,
    source: 'user_curated_link',
  },

  // 3. Pushkar
  {
    id: 8008,
    title: 'Pushkar Lake & Ghats',
    tagline: 'Sacred semi-circular desert lake ringed by 52 bathing ghats and 500 temples',
    description: 'Revered as Tirtha Raj (King of Pilgrimage Sites), mythologically created when Lord Brahma dropped a lotus petal on earth. Pilgrims take holy dips across the 52 ghats, especially Varaha, Brahma, and Gau Ghats, amidst evening maha aarti chanting and ringing temple bells.',
    category: 'Spiritual & Wellness',
    city: 'Pushkar',
    state: 'Rajasthan',
    area_name: 'Main Ghat Promenade, Pushkar Town',
    price: 0,
    rating: 4.91,
    review_count: 1180,
    approx_duration_mins: 120,
    image_url: 'https://optimatravels.com/images/pushkar-images/pushkar-lake-rajasthan.jpg',
    image_urls: JSON.stringify([
      'https://optimatravels.com/images/pushkar-images/pushkar-lake-rajasthan.jpg',
      'https://www.google.com/imgres?q=pushkar%20lake'
    ]),
    tags: JSON.stringify(['lake', 'ghats', 'pushkar', 'spiritual', 'brahma', 'holy-water', 'verified']),
    latitude: 26.4883,
    longitude: 74.5539,
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
    id: 8009,
    title: 'Brahma Temple (Jagatpita Brahma Mandir)',
    tagline: 'One of the very few existing ancient temples dedicated to the creator god Brahma',
    description: '14th-century stone structure with origins dating back 2,000 years. Distinguished by its striking red spire (shikhara), silver coin-embedded floors, and a hamsa bird motif, enshrining a life-size four-faced idol of Lord Brahma (Chaturmukhi Brahma).',
    category: 'Spiritual & Wellness',
    city: 'Pushkar',
    state: 'Rajasthan',
    area_name: 'Brahma Mandir Road, Pushkar',
    price: 0,
    rating: 4.89,
    review_count: 1320,
    approx_duration_mins: 60,
    image_url: 'https://www.rajasthanplaces.com/wp-content/uploads/2025/11/Jagatpita-Shri-Brahma-Mandir-1024x536.webp',
    image_urls: JSON.stringify([
      'https://www.rajasthanplaces.com/wp-content/uploads/2025/11/Jagatpita-Shri-Brahma-Mandir-1024x536.webp',
      'https://www.google.com/imgres?q=brahma%20temple%20pushkar'
    ]),
    tags: JSON.stringify(['temple', 'brahma', 'pushkar', 'rajasthan', 'spiritual', 'hindu', 'verified']),
    latitude: 26.4892,
    longitude: 74.5516,
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
    id: 8010,
    title: 'Savitri Mata Temple',
    tagline: 'Hilltop sanctuary honoring Goddess Savitri offering panoramic desert and lake vistas',
    description: 'Perched high atop Ratnagiri Hill, this sacred temple is dedicated to Lord Brahma\'s first consort, Goddess Savitri. Accessible via a scenic 987-step stone trek or modern passenger ropeway, offering sweeping 360-degree sunrise panoramas across Pushkar Lake, the holy town, and surrounding sand dunes.',
    category: 'Spiritual & Wellness',
    city: 'Pushkar',
    state: 'Rajasthan',
    area_name: 'Ratnagiri Hill, Pushkar',
    price: 0,
    rating: 4.92,
    review_count: 910,
    approx_duration_mins: 120,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/f/f4/Savitri_mata_mandir.jpg',
    image_urls: JSON.stringify([
      'https://upload.wikimedia.org/wikipedia/commons/f/f4/Savitri_mata_mandir.jpg',
      'https://en.wikipedia.org/wiki/Savitri_Mata_Mandir'
    ]),
    tags: JSON.stringify(['temple', 'savitri-mata', 'pushkar', 'hilltop', 'ropeway', 'panoramic', 'verified']),
    latitude: 26.4878,
    longitude: 74.5385,
    is_indoor: 1,
    is_rain_safe: 1,
    is_hidden_gem: 0,
    is_family_friendly: 1,
    low_walking: 0,
    wheelchair_accessible: 0,
    is_active: 1,
    source: 'user_curated_link',
  }
];

export async function syncRajasthan() {
  console.log('[Rajasthan Sync] Starting synchronization of 10 Rajasthan destinations across Jodhpur, Jaisalmer, and Pushkar...');

  for (const exp of RAJASTHAN_EXPERIENCES) {
    const existing = await dbAll('SELECT id FROM experiences WHERE id = ?', [exp.id]);
    if (existing && existing.length > 0) {
      await dbRun(
        `UPDATE experiences SET
          title = ?, tagline = ?, description = ?, category = ?, city = ?, state = ?,
          area_name = ?, price = ?, rating = ?, review_count = ?, approx_duration_mins = ?,
          image_urls = ?, tags = ?, latitude = ?, longitude = ?, is_indoor = ?, is_rain_safe = ?,
          is_hidden_gem = ?, is_family_friendly = ?, low_walking = ?, wheelchair_accessible = ?,
          is_active = 1, source = ?
        WHERE id = ?`,
        [
          exp.title, exp.tagline, exp.description, exp.category, exp.city, exp.state,
          exp.area_name, exp.price, exp.rating, exp.review_count, exp.approx_duration_mins,
          exp.image_urls, exp.tags, exp.latitude, exp.longitude, exp.is_indoor, exp.is_rain_safe,
          exp.is_hidden_gem, exp.is_family_friendly, exp.low_walking, exp.wheelchair_accessible,
          exp.source, exp.id
        ]
      );
      console.log(`[Rajasthan Sync] Updated: ${exp.title} (ID ${exp.id})`);
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
      console.log(`[Rajasthan Sync] Inserted: ${exp.title} (ID ${exp.id})`);
    }
  }

  // Update experiences_image_map.json
  const mapPath = path.resolve(__dirname, '../../experiences_image_map.json');
  if (fs.existsSync(mapPath)) {
    const mapData = JSON.parse(fs.readFileSync(mapPath, 'utf-8'));
    for (const exp of RAJASTHAN_EXPERIENCES) {
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
    console.log('[Rajasthan Sync] Updated experiences_image_map.json with 10 Rajasthan entries');
  }

  console.log('[Rajasthan Sync] Successfully synchronized all 10 Rajasthan destinations!');
}

syncRajasthan().catch(console.error);
