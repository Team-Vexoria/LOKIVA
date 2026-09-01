/**
 * LOKIVA Local Artisans, Heritage Guides & Cultural Hosts Master Catalog
 * 
 * Verified community guides, master craftsmen, cultural storytellers, and workshops
 * with accurate pricing, high-res photography, and rich cultural context.
 */

import { initDb, dbRun, dbGet } from '../../db/db.js';

export const ARTISANS_AND_GUIDES = [
  // =========================================================================
  // MUMBAI: LICENSED GUIDES & ARTISAN GUILDS
  // =========================================================================
  {
    title: 'South Mumbai UNESCO Art Deco & Heritage Precinct Walking Tour',
    tagline: 'Guided architectural walk through Oval Maidan, Marine Drive, and Victorian Gothic courts',
    description: 'Explore the world\'s second-largest collection of Art Deco buildings accompanied by an accredited architectural historian guide. Learn how nautical motifs, tropical balconies, and ziggurat stepped roofs defined 1930s Bombay glamour.',
    category: 'Heritage & History',
    cultural_context: 'Mumbai\'s Victorian Gothic and Art Deco Ensembles were inscribed as a UNESCO World Heritage site in 2018.',
    state: 'Maharashtra',
    city: 'Mumbai',
    area_name: 'Oval Maidan & Marine Drive, Fort',
    latitude: 18.9322,
    longitude: 72.8298,
    approx_duration_mins: 120,
    price: 750, // Per person walking tour fee
    is_indoor: 0,
    is_rain_safe: 0,
    wheelchair_accessible: 1,
    osm_id: 'mumbai_art_deco_guide_01',
    image_urls: JSON.stringify(['https://images.pexels.com/photos/33948766/pexels-photo-33948766.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940']),
    tags: JSON.stringify(['Heritage Guide', 'Art Deco', 'Walking Tour', 'Architecture', 'UNESCO']),
  },
  {
    title: 'Worli Koliwada Heritage Fisherfolk Community Trail & Storytelling',
    tagline: 'Centuries-old indigenous fishing village walk led by local Koli community elders',
    description: 'Walk through the 800-year-old Worli Koliwada village, visit the historic British Worli Fort overlooking the Arabian Sea, observe traditional net-mending and boat-carving, and listen to folk tales from native fishermen.',
    category: 'Workshops & Craft',
    cultural_context: 'The Kolis are the original indigenous inhabitants of the seven islands of Bombay before British land reclamation.',
    state: 'Maharashtra',
    city: 'Mumbai',
    area_name: 'Worli Koliwada, Worli',
    latitude: 19.0234,
    longitude: 72.8156,
    approx_duration_mins: 90,
    price: 500,
    is_indoor: 0,
    is_rain_safe: 0,
    wheelchair_accessible: 1,
    osm_id: 'mumbai_koli_storyteller_02',
    image_urls: JSON.stringify(['https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940']),
    tags: JSON.stringify(['Local Guide', 'Koli Community', 'Fisherfolk', 'Oral History', 'Worli']),
  },
  {
    title: 'Kumbharwada Traditional Terracotta Pottery Workshop with Master Potter',
    tagline: 'Hands-on clay wheel throwing and kiln firing session in Mumbai\'s oldest pottery colony',
    description: 'Spend 2 hours at the potter\'s wheel in the 150-year-old Kumbharwada settlement. Master potters from Gujarat will guide you through clay kneading, wheel shaping of matkas and diyas, and traditional wood-fired kiln techniques.',
    category: 'Workshops & Craft',
    cultural_context: 'Kumbharwada potters have preserved ancestral clay-crafting traditions for 5 generations in central Mumbai.',
    state: 'Maharashtra',
    city: 'Mumbai',
    area_name: 'Kumbharwada, Dharavi 90 Feet Road',
    latitude: 19.0433,
    longitude: 72.8567,
    approx_duration_mins: 120,
    price: 600,
    is_indoor: 1,
    is_rain_safe: 1,
    wheelchair_accessible: 1,
    osm_id: 'mumbai_kumbhar_pottery_03',
    image_urls: JSON.stringify(['https://images.pexels.com/photos/2162938/pexels-photo-2162938.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940']),
    tags: JSON.stringify(['Pottery Workshop', 'Artisan Guild', 'Clay Wheel', 'Craft', 'Master Potter']),
  },

  // =========================================================================
  // JAIPUR: MASTER ARTISANS & GUILDS
  // =========================================================================
  {
    title: 'Hand-Block Printing Masterclass with Bagru Natural Dye Craftsmen',
    tagline: 'Wooden block stamping and natural indigo dye workshop with 4th-generation Chippa artisans',
    description: 'Learn the ancient art of Dabu mud-resist and Bagru block printing. Hand-carve a small teak block, mix organic vegetable dyes (indigo, harda, pomegranate rind), and print your own custom silk scarf to take home.',
    category: 'Workshops & Craft',
    cultural_context: 'Bagru block printing is a GI-tagged craft practiced by the Chippa community of Rajasthan for over 400 years.',
    state: 'Rajasthan',
    city: 'Jaipur',
    area_name: 'Sanganer & Bagru Artisan Corridor',
    latitude: 26.8122,
    longitude: 75.7891,
    approx_duration_mins: 150,
    price: 850,
    is_indoor: 1,
    is_rain_safe: 1,
    wheelchair_accessible: 1,
    osm_id: 'jaipur_block_print_artisan_01',
    image_urls: JSON.stringify(['https://images.pexels.com/photos/1327734/pexels-photo-1327734.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940']),
    tags: JSON.stringify(['Block Printing', 'Natural Dye', 'Master Artisan', 'Textile Workshop', 'GI Tag']),
  },
  {
    title: 'Jaipur Meenakari & Kundan Gem Enamelling Studio Walk with Master Jeweller',
    tagline: 'Witness royal Rajput miniature gold-enamelling and gem-setting in Johari Bazaar',
    description: 'Go behind the scenes inside a private haveli studio in the historic Johari Bazaar. Observe master artisans fusing vivid mineral powders in kilns to create reversible Meenakari jewellery worn by Jaipur royalty.',
    category: 'Workshops & Craft',
    cultural_context: 'Introduced by Raja Man Singh I from Lahore in the 16th century, Jaipur Meenakari is renowned for ruby-red and emerald-green enamel work.',
    state: 'Rajasthan',
    city: 'Jaipur',
    area_name: 'Johari Bazaar Haveli Quarter',
    latitude: 26.9205,
    longitude: 75.8284,
    approx_duration_mins: 90,
    price: 500,
    is_indoor: 1,
    is_rain_safe: 1,
    wheelchair_accessible: 1,
    osm_id: 'jaipur_meenakari_artisan_02',
    image_urls: JSON.stringify(['https://images.pexels.com/photos/1458867/pexels-photo-1458867.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940']),
    tags: JSON.stringify(['Meenakari', 'Kundan', 'Jewellery Artisan', 'Johari Bazaar', 'Royal Craft']),
  },

  // =========================================================================
  // AGRA: PARCHIN KARI (PIETRA DURA) INLAY MASTERS
  // =========================================================================
  {
    title: 'Mughal Pietra Dura (Parchin Kari) Marble Inlay Workshop',
    tagline: 'Cut and set semi-precious lapis, jasper, and malachite into Makrana marble with master artisans',
    description: 'Learn the exacting craft of Parchin Kari from descendants of the master craftsmen who built the Taj Mahal. Use bow-drills to carve delicate floral grooves and shape semi-precious gemstones with emery wheels.',
    category: 'Workshops & Craft',
    cultural_context: 'Parchin Kari marble inlay reached its historical zenith under Emperor Shah Jahan during the construction of the Taj Mahal.',
    state: 'Uttar Pradesh',
    city: 'Agra',
    area_name: 'Tajganj Artisan Quarter',
    latitude: 27.1698,
    longitude: 78.0412,
    approx_duration_mins: 120,
    price: 900,
    is_indoor: 1,
    is_rain_safe: 1,
    wheelchair_accessible: 1,
    osm_id: 'agra_pietra_dura_artisan_01',
    image_urls: JSON.stringify(['https://images.pexels.com/photos/19149628/pexels-photo-19149628.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940']),
    tags: JSON.stringify(['Pietra Dura', 'Marble Inlay', 'Master Craftsman', 'Tajganj', 'Mughal Art']),
  },

  // =========================================================================
  // UDAIPUR: MEWAR COURT MINIATURE PAINTING MASTERS
  // =========================================================================
  {
    title: 'Mewar School Miniature Painting Workshop with Single-Hair Brush',
    tagline: 'Paint delicate Rajasthani miniatures on handmade marble paper using natural gemstone pigments',
    description: 'Learn the ancient Mewar miniature painting style using squirrel-hair single-bristle brushes. Discover how artisans grind lapis lazuli for ultramarine blue and gold leaf for royal crowns, and paint your own miniature artwork.',
    category: 'Workshops & Craft',
    cultural_context: 'Mewar court painters developed bold emotional storytelling and intricate natural motifs that flourished from the 16th to 18th centuries.',
    state: 'Rajasthan',
    city: 'Udaipur',
    area_name: 'Gangaur Ghat Marg, Old City',
    latitude: 24.5794,
    longitude: 73.6821,
    approx_duration_mins: 120,
    price: 700,
    is_indoor: 1,
    is_rain_safe: 1,
    wheelchair_accessible: 1,
    osm_id: 'udaipur_miniature_artisan_01',
    image_urls: JSON.stringify(['https://images.pexels.com/photos/159862/art-school-drawing-canvas-159862.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940']),
    tags: JSON.stringify(['Miniature Painting', 'Mewar Art', 'Master Painter', 'Natural Pigments', 'Udaipur']),
  },

  // =========================================================================
  // AMRITSAR: SACRED HERITAGE & GURBANI GUIDE
  // =========================================================================
  {
    title: 'Golden Temple Night Palki Sahib & Langar Seva Guided Spiritual Trail',
    tagline: 'Night ceremony experience and community kitchen volunteer walk with Sikh heritage scholars',
    description: 'Participate in the sacred midnight Sukhasan ceremony where the Guru Granth Sahib is carried in a flower-bedecked gold palanquin. Tour the world\'s largest community kitchen serving 100,000 free meals daily, learning Sikh tenets of equality and selfless seva.',
    category: 'Heritage & History',
    cultural_context: 'The Guru Ram Das Langar has served free vegetarian meals around the clock for over 450 years regardless of caste, creed, or nationality.',
    state: 'Punjab',
    city: 'Amritsar',
    area_name: 'Harmandir Sahib Complex, Heritage Street',
    latitude: 31.6200,
    longitude: 74.8765,
    approx_duration_mins: 150,
    price: 400,
    is_indoor: 1,
    is_rain_safe: 1,
    wheelchair_accessible: 1, // Broad ramps and motorized chair accessibility
    osm_id: 'amritsar_palki_guide_01',
    image_urls: JSON.stringify(['https://images.pexels.com/photos/14890717/pexels-photo-14890717.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940']),
    tags: JSON.stringify(['Spiritual Guide', 'Langar Seva', 'Golden Temple', 'Sikh Heritage', 'Palki Sahib']),
  },

  // =========================================================================
  // VARANASI: CLASSICAL GHARANA SITAR MASTERCLASS
  // =========================================================================
  {
    title: 'Banaras Gharana Classical Sitar & Raga Masterclass on the Ghats',
    tagline: 'Private morning Indian classical music lesson with a 6th-generation Banaras Gharana sitarist',
    description: 'Sit cross-legged inside a heritage riverside music ashram on Assi Ghat. Learn the basics of Indian classical swaras, microtonal meend slides on the sitar, and the meditative morning Raga Bhairav.',
    category: 'Workshops & Craft',
    cultural_context: 'Varanasi is a UNESCO City of Music, home to the ancient Banaras Gharana tradition of Indian classical music.',
    state: 'Uttar Pradesh',
    city: 'Varanasi',
    area_name: 'Assi Ghat Riverside Ashram',
    latitude: 25.2905,
    longitude: 83.0067,
    approx_duration_mins: 90,
    price: 800,
    is_indoor: 1,
    is_rain_safe: 1,
    wheelchair_accessible: 1,
    osm_id: 'varanasi_sitar_master_01',
    image_urls: JSON.stringify(['https://images.pexels.com/photos/1407322/pexels-photo-1407322.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940']),
    tags: JSON.stringify(['Sitar Masterclass', 'Classical Music', 'Banaras Gharana', 'UNESCO Music', 'Assi Ghat']),
  },

  // =========================================================================
  // KOCHI: KATHAKALI MAKEUP & MUDRA DEMONSTRATION
  // =========================================================================
  {
    title: 'Kathakali Green-Room Facial Makeup (Chutti) & 24 Mudra Masterclass',
    tagline: 'Intimate backstage access to sacred 4-hour vegetable mineral face painting and eye gestures',
    description: 'Witness the ritualistic Chutti transformation where natural mineral pigments (manayola, rice paste, and soot) are applied to the Kathakali dancer\'s face. Learn the 24 fundamental hand mudras and Navarasa facial expressions from a veteran guru.',
    category: 'Workshops & Craft',
    cultural_context: 'Kathakali is Kerala\'s 500-year-old dance-drama form combining Sanskrit literature, martial arts, and sacred facial iconography.',
    state: 'Kerala',
    city: 'Kochi',
    area_name: 'KB Jacob Road, Fort Kochi',
    latitude: 9.9654,
    longitude: 76.2412,
    approx_duration_mins: 120,
    price: 650,
    is_indoor: 1,
    is_rain_safe: 1,
    wheelchair_accessible: 1,
    osm_id: 'kochi_kathakali_master_01',
    image_urls: JSON.stringify(['https://images.pexels.com/photos/2034892/pexels-photo-2034892.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940']),
    tags: JSON.stringify(['Kathakali', 'Facial Mudras', 'Kerala Dance', 'Master Guru', 'Fort Kochi']),
  },
];

export async function seedArtisansAndGuides() {
  await initDb();
  let inserted = 0;
  let updated = 0;

  for (const item of ARTISANS_AND_GUIDES) {
    const existing = await dbGet('SELECT id FROM experiences WHERE osm_id = ? OR title = ?', [item.osm_id, item.title]);

    if (existing) {
      await dbRun(
        `UPDATE experiences SET
          title = ?, tagline = ?, description = ?, category = ?, cultural_context = ?,
          state = ?, city = ?, area_name = ?, latitude = ?, longitude = ?,
          approx_duration_mins = ?, price = ?, is_indoor = ?, is_rain_safe = ?,
          wheelchair_accessible = ?, image_urls = ?, tags = ?, is_active = 1
        WHERE id = ?`,
        [
          item.title, item.tagline, item.description, item.category, item.cultural_context,
          item.state, item.city, item.area_name, item.latitude, item.longitude,
          item.approx_duration_mins, item.price, item.is_indoor, item.is_rain_safe,
          item.wheelchair_accessible, item.image_urls, item.tags, existing.id
        ]
      );
      updated++;
    } else {
      await dbRun(
        `INSERT INTO experiences (
          title, tagline, description, category, cultural_context,
          state, city, area_name, latitude, longitude,
          approx_duration_mins, price, is_indoor, is_rain_safe,
          wheelchair_accessible, osm_id, image_urls, tags, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          item.title, item.tagline, item.description, item.category, item.cultural_context,
          item.state, item.city, item.area_name, item.latitude, item.longitude,
          item.approx_duration_mins, item.price, item.is_indoor, item.is_rain_safe,
          item.wheelchair_accessible, item.osm_id, item.image_urls, item.tags
        ]
      );
      inserted++;
    }
  }

  console.log(`[Artisans & Guides Catalog] Ingested: ${inserted} new, ${updated} updated.`);
}

if (process.argv[1]?.endsWith('artisansAndGuidesCatalog.js')) {
  seedArtisansAndGuides()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}
