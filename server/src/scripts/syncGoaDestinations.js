import { dbRun, dbAll } from '../db/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GOA_EXPERIENCES = [
  {
    id: 1201,
    title: 'Calangute Beach (Queen of Beaches)',
    tagline: 'Vibrant golden shoreline renowned for water sports, beach shacks, and sun-soaked coastal energy',
    description: 'Goa’s largest and most famous beach, Calangute stretches over 4 kilometers along the North Goa coast, offering thrilling parasailing, jet skiing, lively shacks serving fresh Goan curry, and unforgettable Arabian Sea sunsets.',
    category: 'Nature & Wildlife',
    city: 'Goa',
    state: 'Goa',
    area_name: 'Calangute, North Goa',
    price: 0,
    rating: 4.86,
    review_count: 3240,
    approx_duration_mins: 120,
    image_url: 'https://d3w13n53foase7.cloudfront.net/medium_in-and-around-calangute-beach-in-goa-m3pi_image.jpg',
    image_urls: JSON.stringify(['https://d3w13n53foase7.cloudfront.net/medium_in-and-around-calangute-beach-in-goa-m3pi_image.jpg']),
    tags: JSON.stringify(['calangute', 'beach', 'watersports', 'north-goa', 'sunsets']),
    latitude: 15.5442,
    longitude: 73.7553,
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
    id: 1202,
    title: 'Baga Beach',
    tagline: 'Pulsating coastal stretch with signature shacks, watersports, and lively nightlife promenade',
    description: 'Adjacent to Calangute, Baga is iconic for its bustling nightlife at Tito’s Lane, thrilling dolphin cruises, windsurfing, and beloved seaside dining directly on golden sands.',
    category: 'Nature & Wildlife',
    city: 'Goa',
    state: 'Goa',
    area_name: 'Baga, North Goa',
    price: 0,
    rating: 4.88,
    review_count: 2890,
    approx_duration_mins: 120,
    image_url: 'https://bpu-images-v1.s3.eu-north-1.amazonaws.com/uploads/1721476068155_bb1.jpg',
    image_urls: JSON.stringify(['https://bpu-images-v1.s3.eu-north-1.amazonaws.com/uploads/1721476068155_bb1.jpg']),
    tags: JSON.stringify(['baga', 'beach', 'nightlife', 'watersports', 'north-goa']),
    latitude: 15.5553,
    longitude: 73.7517,
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
    id: 1203,
    title: 'Anjuna Beach',
    tagline: 'Legendary red laterite cliffs, trance culture heritage, and vibrant beach flea markets',
    description: 'Famed since the 1960s hippie trail, Anjuna enchants with striking red rock formations, curl-shaped bays, seaside bohemian cafes, and world-famous Wednesday flea markets.',
    category: 'Nature & Wildlife',
    city: 'Goa',
    state: 'Goa',
    area_name: 'Anjuna, North Goa',
    price: 0,
    rating: 4.84,
    review_count: 2150,
    approx_duration_mins: 90,
    image_url: 'https://s7ap1.scene7.com/is/image/incredibleindia/anjuna-beach-goa-goa-anjuna-beach--goa-5-attr-hero?qlt=82&ts=1742182218152',
    image_urls: JSON.stringify(['https://s7ap1.scene7.com/is/image/incredibleindia/anjuna-beach-goa-goa-anjuna-beach--goa-5-attr-hero?qlt=82&ts=1742182218152']),
    tags: JSON.stringify(['anjuna', 'flea-market', 'curlies', 'cliffs', 'bohemian']),
    latitude: 15.5808,
    longitude: 73.7408,
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
    id: 1204,
    title: 'Candolim Beach',
    tagline: 'Serene dunes, pristine waters, and relaxed coastal shacks stretching to Fort Aguada',
    description: 'Offering a more tranquil and refined atmosphere, Candolim features scenic sand dunes, calm waters ideal for leisurely swimming, and premier beachside culinary havens.',
    category: 'Nature & Wildlife',
    city: 'Goa',
    state: 'Goa',
    area_name: 'Candolim, North Goa',
    price: 0,
    rating: 4.82,
    review_count: 1820,
    approx_duration_mins: 90,
    image_url: 'https://explore.rehlat.ae/static/media/searchdestination/thingstodo/images/panjim/candolim_beach/large_Candolim_beach.webp',
    image_urls: JSON.stringify(['https://explore.rehlat.ae/static/media/searchdestination/thingstodo/images/panjim/candolim_beach/large_Candolim_beach.webp']),
    tags: JSON.stringify(['candolim', 'peaceful', 'dunes', 'shacks', 'swimming']),
    latitude: 15.5173,
    longitude: 73.7628,
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
    id: 1205,
    title: 'Palolem Beach',
    tagline: 'Crescent-shaped tropical haven lined with swaying coconut palms and colorful wooden shacks',
    description: 'Nestled in South Goa, Palolem is celebrated for its calm crescent bay framed by lush headlands, peaceful kayak trips to Butterfly Beach, and relaxing dolphin-watching excursions.',
    category: 'Nature & Wildlife',
    city: 'Goa',
    state: 'Goa',
    area_name: 'Canacona, South Goa',
    price: 0,
    rating: 4.91,
    review_count: 2470,
    approx_duration_mins: 150,
    image_url: 'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=830791309300306',
    image_urls: JSON.stringify(['https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=830791309300306']),
    tags: JSON.stringify(['palolem', 'south-goa', 'crescent-bay', 'kayaking', 'sunset']),
    latitude: 15.0100,
    longitude: 74.0232,
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
    id: 1206,
    title: 'Basilica of Bom Jesus (UNESCO World Heritage Site)',
    tagline: '16th-century baroque masterpiece enshrining the sacred relics of St. Francis Xavier',
    description: 'Constructed between 1594 and 1605 in Old Goa, this world-renowned UNESCO basilica is one of the finest Jesuit baroque monuments in Asia, featuring unplastered laterite and ornate gilded altars.',
    category: 'Heritage & History',
    city: 'Goa',
    state: 'Goa',
    area_name: 'Old Goa (Velha Goa)',
    price: 0,
    rating: 4.93,
    review_count: 2100,
    approx_duration_mins: 75,
    image_url: 'https://www.tourmyindia.com/socialimg/basilica-of-bom-jesus-goa.jpg',
    image_urls: JSON.stringify(['https://www.tourmyindia.com/socialimg/basilica-of-bom-jesus-goa.jpg']),
    tags: JSON.stringify(['unesco', 'basilica', 'baroque', 'church', 'old-goa', 'heritage']),
    latitude: 15.5009,
    longitude: 73.9116,
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
    id: 1207,
    title: 'Fort Aguada & 1864 Portuguese Lighthouse',
    tagline: '17th-century Portuguese coastal fortress overlooking the Arabian Sea and Mandovi River',
    description: 'Built in 1612 to guard against Dutch fleets, this imposing fortress features a 79-gun battery, a massive freshwater cistern that replenished ships, and Asia’s oldest four-tiered lighthouse.',
    category: 'Heritage & History',
    city: 'Goa',
    state: 'Goa',
    area_name: 'Sinquerim, Candolim, North Goa',
    price: 25,
    rating: 4.85,
    review_count: 1740,
    approx_duration_mins: 90,
    image_url: 'https://cdn.getyourguide.com/image/format=auto,fit=crop,gravity=auto,quality=60,width=400,height=265,dpr=2/tour_img/bcd9db8adc96c9dba6c4cde00b88f09e74adc12121a4028b832d2650e1a4ea29.png',
    image_urls: JSON.stringify(['https://cdn.getyourguide.com/image/format=auto,fit=crop,gravity=auto,quality=60,width=400,height=265,dpr=2/tour_img/bcd9db8adc96c9dba6c4cde00b88f09e74adc12121a4028b832d2650e1a4ea29.png']),
    tags: JSON.stringify(['fort', 'aguada', 'portuguese', 'lighthouse', 'ocean-view']),
    latitude: 15.4925,
    longitude: 73.7736,
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
    id: 1208,
    title: 'Dudhsagar Falls (Sea of Milk)',
    tagline: 'Spectacular 310m four-tiered cascade roaring through the Western Ghats railway bridge',
    description: 'One of India’s tallest waterfalls at 1,017 feet, Dudhsagar cascades down sheer green granite cliffs in Bhagwan Mahavir Wildlife Sanctuary, famous for the railway bridge passing directly through its mist.',
    category: 'Nature & Wildlife',
    city: 'Goa',
    state: 'Goa',
    area_name: 'Bhagwan Mahavir Sanctuary, Sonaulim, South Goa',
    price: 50,
    rating: 4.89,
    review_count: 1350,
    approx_duration_mins: 240,
    image_url: 'https://web.archive.org/web/20241225190742im_/https://sandeepachetan.com/wp-content/uploads/2013/10/tumblr_mltei6m8xe1s2js0yo1_1280.jpg',
    image_urls: JSON.stringify(['https://web.archive.org/web/20241225190742im_/https://sandeepachetan.com/wp-content/uploads/2013/10/tumblr_mltei6m8xe1s2js0yo1_1280.jpg']),
    tags: JSON.stringify(['waterfall', 'dudhsagar', 'nature', 'western-ghats', 'trek']),
    latitude: 15.3144,
    longitude: 74.3143,
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

async function syncGoa() {
  console.log('Syncing Goa destinations to SQLite DB...');
  
  // Deactivate any old generic Goa experiences
  await dbRun("UPDATE experiences SET is_active = 0 WHERE state = 'Goa' AND id NOT IN (1201, 1202, 1203, 1204, 1205, 1206, 1207, 1208)");

  for (const exp of GOA_EXPERIENCES) {
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
    for (const exp of GOA_EXPERIENCES) {
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

  console.log('Goa sync complete!');
}

syncGoa().catch(console.error);
