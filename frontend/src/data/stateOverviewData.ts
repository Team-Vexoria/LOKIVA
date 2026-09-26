import { SHOWCASE_DESTINATIONS } from './destinationsShowcaseData';

export interface StateSnapshot {
  region: string;
  capital: string;
  bestTime: string;
  duration: string;
  bestFor: string[];
  climate: string;
}

export interface StateHighlight {
  title: string;
  description: string;
  image: string;
  tag: string;
}

export interface CulturalItem {
  id: string;
  category: 'Clothing' | 'Music' | 'Dance' | 'Art' | 'Handicrafts' | 'Architecture' | 'Tradition';
  title: string;
  description: string;
  image: string;
}

export interface FestivalItem {
  id: string;
  name: string;
  monthSeason: string;
  description: string;
  image: string;
  highlightTag: string;
}

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  badge?: string;
}

export interface PlaceItem {
  id: string;
  name: string;
  location: string;
  city: string;
  description: string;
  image: string;
  tags: string[];
  rating: number;
}

export interface SeasonTimelineItem {
  season: 'Winter' | 'Spring' | 'Summer' | 'Monsoon' | 'Autumn';
  months: string;
  weather: string;
  temperature: string;
  experiences: string[];
  festivals: string[];
  isRecommended: boolean;
}

export interface TravelPersonalityTag {
  id: string;
  label: string;
  emoji: string;
  description: string;
  isTopMatch: boolean;
}

export interface LocalExperienceItem {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  tag: string;
  image: string;
  highlights: string[];
  icon: string;
}

export interface StateOverview {
  id: string;
  name: string;
  code: string;
  tagline: string;
  heroVideo?: string;
  heroImage: string;
  primaryCity: string;
  introduction: {
    headline: string;
    subheadline: string;
    description: string;
  };
  snapshot: StateSnapshot;
  whyVisitHighlights: StateHighlight[];
  culture: CulturalItem[];
  festivals: FestivalItem[];
  foods: FoodItem[];
  places: PlaceItem[];
  seasons: SeasonTimelineItem[];
  travelPersonalities: TravelPersonalityTag[];
  localExperiences: LocalExperienceItem[];
  quickEscapeCity: string;
  suggestedPrompts: string[];
  finalCtaMessage: string;
}

export const STATE_OVERVIEWS: Record<string, StateOverview> = {
  rajasthan: {
    id: 'rajasthan',
    name: 'Rajasthan',
    code: 'RJ',
    tagline: 'Where royal heritage meets the golden desert.',
    heroVideo: '/rajasthan_video.mp4',
    heroImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=2000&q=85',
    primaryCity: 'Jaipur',
    quickEscapeCity: 'Jaipur, Rajasthan',
    introduction: {
      headline: 'A Living Epic of Maharajas, Fortresses, and Starlit Sands',
      subheadline: 'Step beyond tourist trails into a land where sandstone keeps touch the clouds and timeless folk ballads echo across infinite dunes.',
      description: 'Rajasthan is not merely a destination; it is an enduring empire of color, chivalry, and hospitality. From the amber-hued courtyards of Jaipur to the tranquil mirror waters of Lake Pichola and the wind-swept golden dunes of Jaisalmer, every corner reverberates with regal splendour and artisan soul.',
    },
    snapshot: {
      region: 'North-West India',
      capital: 'Jaipur',
      bestTime: 'Oct – Mar',
      duration: '5 – 8 Days',
      bestFor: ['Heritage', 'Culture', 'Desert', 'Food'],
      climate: 'Arid desert climate with mild, sunny winters (10°C – 28°C) and fiery summers.',
    },
    whyVisitHighlights: [
      {
        title: 'Untamed Golden Sand Dunes',
        description: 'Watch the Thar desert shift beneath crimson sunsets, where camel caravans glide across untouched ripples.',
        image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1000&q=80',
        tag: 'Desert Romance',
      },
      {
        title: 'Impregnable Hilltop Fortresses',
        description: 'Marvel at UNESCO-listed ramparts engineered across jagged ridgelines that withstood centuries of desert sieges.',
        image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1000&q=80',
        tag: 'Architectural Genius',
      },
      {
        title: 'Guilds of Master Artisans',
        description: 'Witness centuries-old craft traditions in action, from Jaipur blue pottery to Bagru wooden block printing.',
        image: 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=1000&q=80',
        tag: 'Artisan Heritage',
      },
      {
        title: 'Royal Culinary Feasts',
        description: 'Savor fiery game curries, hand-ground desert spices, and melt-in-mouth churma prepared over slow wood embers.',
        image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=1000&q=80',
        tag: 'Epicurean Legacy',
      },
    ],
    culture: [
      {
        id: 'c1',
        category: 'Clothing',
        title: 'Vibrant Bandhani & Royal Pagri',
        description: 'Tie-dye fabrics saturated in marigold and vermilion, paired with intricately folded turbans that signify family honor and clan origin.',
        image: '/assets/culture/rajasthan/clothing.jpg',
      },
      {
        id: 'c2',
        category: 'Music',
        title: 'Manganiyar & Langa Rhythms',
        description: 'Hereditary desert bards strumming the bowing Kamayacha and raw Khartal clappers, singing oral histories of kings and desert rains.',
        image: '/assets/culture/rajasthan/music.jpg',
      },
      {
        id: 'c3',
        category: 'Dance',
        title: 'Hypnotic Ghoomar & Kalbelia',
        description: 'The swirling skirts of graceful Ghoomar court dances contrasted with the serpentine agility and acrobatic fire of nomadic Kalbelias.',
        image: '/assets/culture/rajasthan/dance.jpg',
      },
      {
        id: 'c4',
        category: 'Art',
        title: 'Miniature Pichwai Paintings',
        description: 'Meticulously crafted religious tapestries using natural colors, depicting divine tales, nature and royal life with intricate details.',
        image: '/assets/culture/rajasthan/art.jpg',
      },
      {
        id: 'c5',
        category: 'Handicrafts',
        title: 'Bagru Block Prints & Blue Pottery',
        description: 'Chiseled teak woodblocks stamped with natural dyes alongside the timeless blue pottery known for its unique designs and rich heritage.',
        image: '/assets/culture/rajasthan/handicrafts.jpg',
      },
      {
        id: 'c6',
        category: 'Architecture',
        title: 'Jharokhas & Stepwell Marvels',
        description: 'Latticed sandstone balconies designed to catch the breeze, grand forts and intricate stepwells that showcase Rajasthan\'s architectural brilliance.',
        image: '/assets/culture/rajasthan/architecture.jpg',
      },
    ],
    festivals: [
      {
        id: 'f1',
        name: 'Pushkar Camel Fair',
        monthSeason: 'November (Kartik Purnima)',
        description: 'Over 50,000 decorated camels, horses, and cattle converge on sacred desert dunes alongside holy dips, music, and bazaar revelry.',
        image: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=800&q=80',
        highlightTag: 'Desert Spectacle',
      },
      {
        id: 'f2',
        name: 'Jaisalmer Desert Festival',
        monthSeason: 'February',
        description: 'Sam Sand Dunes turn into a stage of vibrant puppet dances, turban-tying contests, camel polo, and midnight folk concerts under the moon.',
        image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
        highlightTag: 'Folk Extravaganza',
      },
      {
        id: 'f3',
        name: 'Teej & Gangaur Pageants',
        monthSeason: 'March & August',
        description: 'Women dressed in emerald and vermilion lead golden palanquin processions through old Jaipur lanes to celebrate fertility and monsoon showers.',
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
        highlightTag: 'Monsoon Celebration',
      },
      {
        id: 'f4',
        name: 'Jaipur Literature Festival',
        monthSeason: 'January',
        description: 'The world’s greatest free literary gathering, held at Diggi Palace where Nobel laureates, poets, and thinkers mingle amidst palace gardens.',
        image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
        highlightTag: 'Global Ideas',
      },
    ],
    foods: [
      {
        id: 'fd1',
        name: 'Dal Baati Churma',
        category: 'Royal Feast',
        description: 'Fire-baked whole-wheat dough rounds dipped in pure desi ghee, served with five-lentil panchmel dal and sweetened jaggery crumble.',
        image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
        badge: 'Must Try',
      },
      {
        id: 'fd2',
        name: 'Laal Maas',
        category: 'Desert Spicy Specialty',
        description: 'A legendary fiery mutton curry slow-cooked with smoking Mathania red chilies, garlic paste, and curd originally invented for warrior hunts.',
        image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80',
        badge: 'Signature',
      },
      {
        id: 'fd3',
        name: 'Pyaaz Ki Kachori',
        category: 'Street Classic',
        description: 'Flaky, golden-crisp deep-fried pastry pocket bursting with caramelized spiced onions, served piping hot with tangy tamarind chutney.',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'fd4',
        name: 'Jaipuri Malai Ghevar',
        category: 'Festive Sweet',
        description: 'Delicate honeycomb disc made from clarified butter and flour, drenched in saffron-cardamom syrup and topped with rich clotted cream.',
        image: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=800&q=80',
        badge: 'Sweet Tooth',
      },
    ],
    places: [
      {
        id: 'p1',
        name: 'Amber Fort & Maota Lake',
        location: 'Jaipur',
        city: 'Jaipur',
        description: 'Sheesh Mahal mirror mosaics, carved marble courtyards, and sunset reflections over serene waters framed by the Aravalli hills.',
        image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
        tags: ['UNESCO Fort', 'Mirror Palace', 'Palatial'],
        rating: 4.9,
      },
      {
        id: 'p2',
        name: 'Lake Pichola & Jag Mandir',
        location: 'Udaipur',
        city: 'Udaipur',
        description: 'Romantic island palaces rising like white marble dreams out of tranquil waters, framed by the misty peaks of the Aravalli mountains.',
        image: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=800&q=80',
        tags: ['Lake Cruise', 'Romance', 'Heritage Palace'],
        rating: 4.9,
      },
      {
        id: 'p3',
        name: 'Sam Sand Dunes & Desert Park',
        location: 'Jaisalmer',
        city: 'Jaisalmer',
        description: 'Endless golden dunes where camel riders silhouetted against glowing horizons sleep under undisturbed starlit skies.',
        image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
        tags: ['Desert Safari', 'Stargazing', 'Campfire'],
        rating: 4.8,
      },
      {
        id: 'p4',
        name: 'Mehrangarh Fortress Ramparts',
        location: 'Jodhpur',
        city: 'Jodhpur',
        description: 'Towering 400 feet above the Blue City, Mehrangarh houses palatial galleries, royal howdahs, and cannon ramparts.',
        image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80',
        tags: ['Blue City View', 'Royal Museum', 'Fortress'],
        rating: 4.9,
      },
    ],
    seasons: [
      {
        season: 'Winter',
        months: 'October – March',
        weather: 'Pleasant, crisp, clear blue skies with cool desert evenings.',
        temperature: '10°C – 26°C',
        experiences: ['Desert camping in Jaisalmer', 'Heritage walking tours in Jaipur', 'Outdoor lake dining in Udaipur'],
        festivals: ['Pushkar Camel Fair', 'Desert Festival', 'Jaipur Lit Fest'],
        isRecommended: true,
      },
      {
        season: 'Spring',
        months: 'February – March',
        weather: 'Comfortable sunny days with blooming palace gardens.',
        temperature: '18°C – 32°C',
        experiences: ['Wildlife safaris in Ranthambore', 'Fort rampart photography', 'Holi palace celebrations'],
        festivals: ['Elephant Festival', 'Holika Dahan'],
        isRecommended: true,
      },
      {
        season: 'Summer',
        months: 'April – June',
        weather: 'Intense dry desert heat; uncrowded palaces and budget luxury stay rates.',
        temperature: '32°C – 45°C',
        experiences: ['Early morning palace visits', 'Mount Abu hill retreat', 'Luxury indoor spa sanctuaries'],
        festivals: ['Mount Abu Summer Fest'],
        isRecommended: false,
      },
      {
        season: 'Monsoon',
        months: 'July – September',
        weather: 'Lush greenery awakens across the Aravalli hills with pleasant rainfall showers.',
        temperature: '24°C – 35°C',
        experiences: ['Romantic monsoon boat rides in Udaipur', 'Peacock sightings in Jaipur gardens'],
        festivals: ['Teej Procession', 'Kajli Teej'],
        isRecommended: false,
      },
      {
        season: 'Autumn',
        months: 'September – October',
        weather: 'Gentle cooling breeze, low humidity, transition to peak travel.',
        temperature: '22°C – 33°C',
        experiences: ['Old bazaar shopping', 'Rooftop dining with fort views', 'Early season desert trips'],
        festivals: ['Navratri Garba', 'Marwar Festival'],
        isRecommended: true,
      },
    ],
    travelPersonalities: [
      {
        id: 'tp1',
        label: 'Heritage Lovers',
        emoji: '🏛️',
        description: 'Ancient hill fortresses, intact royal residences, and UNESCO stepwells.',
        isTopMatch: true,
      },
      {
        id: 'tp2',
        label: 'Culture Enthusiasts',
        emoji: '🎨',
        description: 'Living artisan communities, royal court music, and ancestral block printing.',
        isTopMatch: true,
      },
      {
        id: 'tp3',
        label: 'Photographers',
        emoji: '📸',
        description: 'Golden hour sand dunes, blue alleys of Jodhpur, and mirror palaces.',
        isTopMatch: true,
      },
      {
        id: 'tp4',
        label: 'Food Explorers',
        emoji: '🍜',
        description: 'Royal thali banquets, smoky Laal Maas, and sweet saffron ghevar.',
        isTopMatch: true,
      },
      {
        id: 'tp5',
        label: 'Couples',
        emoji: '❤️',
        description: 'Fairytale lake palace boat cruises and starlit private desert glamping.',
        isTopMatch: true,
      },
      {
        id: 'tp6',
        label: 'Adventure Seekers',
        emoji: '🏔️',
        description: 'Dune bashing, hot air ballooning over Amber, and fort ziplining.',
        isTopMatch: false,
      },
      {
        id: 'tp7',
        label: 'Family Travelers',
        emoji: '👨‍👩‍👧',
        description: 'Puppet shows, elephant interactions, and palace museum journeys.',
        isTopMatch: false,
      },
      {
        id: 'tp8',
        label: 'Nature Lovers',
        emoji: '🌿',
        description: 'Bengal tigers in Ranthambore and Keoladeo migratory bird reserves.',
        isTopMatch: false,
      },
    ],
    localExperiences: [
      {
        id: 'le1',
        title: 'Thar Desert Safari & Stargazing',
        subtitle: 'Bedouin luxury under unpolluted desert skies',
        duration: '6 Hours / Overnight',
        tag: 'Iconic Wonder',
        image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
        highlights: ['Camel trek across untouched ripple dunes', 'Private bonfire with folk musicians', 'Midnight telescope stargazing'],
        icon: '🐪',
      },
      {
        id: 'le2',
        title: 'Bagru Natural Dye Block Printing',
        subtitle: 'Carve and print with 5th-generation Chhipa guild masters',
        duration: '3 Hours',
        tag: 'Artisan Workshop',
        image: 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=800&q=80',
        highlights: ['Mix natural harda, indigo, and alum mordants', 'Stamp your own bespoke cotton stole', 'Explore sun-drying field courtyards'],
        icon: '🎨',
      },
      {
        id: 'le3',
        title: 'Royal Rajasthani Culinary Masterclass',
        subtitle: 'Learn secret spice blends in a 200-year-old Haveli kitchen',
        duration: '4 Hours',
        tag: 'Epicurean Trail',
        image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
        highlights: ['Spices sourced from Johari bazaar', 'Slow-ember baati baking technique', 'Five-course ancestral family dining'],
        icon: '🍛',
      },
      {
        id: 'le4',
        title: 'Sunset Folk Rhythms with Manganiyars',
        subtitle: 'An intimate rooftop chamber concert as the desert sky ignites',
        duration: '2 Hours',
        tag: 'Soulful Music',
        image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
        highlights: ['Acoustic Kamayacha & Khartal duet', 'Tales of royal desert caravans', 'Sipping hot saffron chai under lanterns'],
        icon: '🎶',
      },
    ],
    suggestedPrompts: [
      'Plan a 3-day royal Rajasthan trip.',
      'Show me the best food experiences in Jaipur.',
      'What are the best sunset points in Jaisalmer?',
      'How to visit Bagru artisan block printing guilds?',
    ],
    finalCtaMessage: 'Walk into courtyards where royalty once stepped, listen to winds that carry five hundred years of legends, and let Rajasthan kindle your wanderlust.',
  },

  kerala: {
    id: 'kerala',
    name: 'Kerala',
    code: 'KL',
    tagline: 'Where emerald backwaters meet timeless traditions.',
    heroVideo: '/kerala_video.mp4',
    heroImage: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=2000&q=85',
    primaryCity: 'Kochi',
    quickEscapeCity: 'Kochi, Kerala',
    introduction: {
      headline: 'God’s Own Country: A Sanctuary of Water, Spice, and Grace',
      subheadline: 'Drift across palm-canopied lagoons, breathe misty highland tea hills, and let five millennia of Ayurvedic wisdom restore your spirit.',
      description: 'Kerala is India’s tranquil garden by the Arabian Sea. Intertwined with over 900 kilometers of interconnected waterways, spice-scented mountain ranges in the Western Ghats, and 500-year-old trade harbors, it is a serene haven where art, nature, and community dwell in effortless harmony.',
    },
    snapshot: {
      region: 'South India',
      capital: 'Thiruvananthapuram',
      bestTime: 'Sep – Mar',
      duration: '6 – 9 Days',
      bestFor: ['Backwaters', 'Ayurveda', 'Spices', 'Nature'],
      climate: 'Tropical maritime climate with rejuvenating monsoons and balmy winter breezes (22°C – 32°C).',
    },
    whyVisitHighlights: [
      {
        title: 'Serene Kettuvallam Backwaters',
        description: 'Glide on handcrafted thatched houseboats past water lilies, duck farms, and timeless village canals.',
        image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1000&q=80',
        tag: 'Waterway Magic',
      },
      {
        title: 'High Altitude Tea & Spice Highlands',
        description: 'Inhale cardamom-scented mountain air in Munnar and Wayanad where rolling tea carpet hills touch misty clouds.',
        image: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1000&q=80',
        tag: 'Highland Serenity',
      },
      {
        title: 'Authentic 5,000-Year Ayurveda',
        description: 'Restore body and mind through authentic Panchakarma therapies using medicinal herbal oils and natural springs.',
        image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80',
        tag: 'Holistic Wellness',
      },
      {
        title: 'Centuries of Global Spice Trade',
        description: 'Wander Fort Kochi’s pastel colonial streets, Chinese fishing nets, and ancient Jewish spice warehouses.',
        image: 'https://images.unsplash.com/photo-1588096344356-9b441f71df44?auto=format&fit=crop&w=1000&q=80',
        tag: 'Coastal Heritage',
      },
    ],
    culture: [
      {
        id: 'ck1',
        category: 'Clothing',
        title: 'Kasavu Handlooms & Mundu',
        description: 'Pristine unbleached cotton woven with shimmering pure gold zari borders, worn with elegance during festivals and temple rites.',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'ck2',
        category: 'Music',
        title: 'Sopana Sangeetham & Panchavadyam',
        description: 'Sacred temple percussion orchestras comprising five instruments including the booming Timila, Maddalam, and bronze Ilathalam.',
        image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'ck3',
        category: 'Dance',
        title: 'Kathakali Drama & Mohiniyattam',
        description: 'Vivid green chutti face makeup, dramatic eye movements, and intricate mudras performing Sanskrit epics with intense poetic grace.',
        image: 'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'ck4',
        category: 'Art',
        title: 'Ancient Kalaripayattu Martial Arts',
        description: 'Considered the mother of all martial arts, featuring fluid animal stances, flexible Urumi swords, and body conditioning.',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'ck5',
        category: 'Handicrafts',
        title: 'Aranmula Metal Mirror & Coir Guilds',
        description: 'Mysterious bell-metal alloys polished into glassless front-reflecting mirrors, alongside spun golden coconut husk fiber craft.',
        image: 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'ck6',
        category: 'Architecture',
        title: 'Sloping Naalukettu Courtyards',
        description: 'Teak wood joinery without iron nails, steep gabled red-tiled roofs, and central open rain courtyards designed for monsoons.',
        image: 'https://images.unsplash.com/photo-1590059390046-51e60058ec4f?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'ck7',
        category: 'Tradition',
        title: 'Grand Banana-Leaf Sadya',
        description: 'A 24-dish vegetarian symphony served in precise sacred order on a fresh plantain leaf, celebrated with payasam puddings.',
        image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80',
      },
    ],
    festivals: [
      {
        id: 'fk1',
        name: 'Onam Harvest Festival',
        monthSeason: 'August – September',
        description: 'Ten days of breathtaking floral carpets (Pookkalam), grand feasts (Sadya), tiger dances (Pulikali), and snake boat races celebrating King Mahabali.',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        highlightTag: 'Harvest Euphoria',
      },
      {
        id: 'fk2',
        name: 'Nehru Trophy Snake Boat Race',
        monthSeason: 'August',
        description: 'Over 100 oarsmen rowing synchronized Chundan Vallams to furious rhythmic boat songs across the Punnamada Lake.',
        image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
        highlightTag: 'Aquatic Battle',
      },
      {
        id: 'fk3',
        name: 'Thrissur Pooram',
        monthSeason: 'April – May',
        description: 'The mother of all temple festivals featuring caparisoned elephants, changing silk parasols (Kudamattom), and world-class percussion fireworks.',
        image: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=800&q=80',
        highlightTag: 'Temple Splendor',
      },
      {
        id: 'fk4',
        name: 'Kochi-Muziris Biennale',
        monthSeason: 'December – March (Biennial)',
        description: 'South Asia’s largest contemporary art festival, transforming historic waterfront warehouses into international galleries.',
        image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
        highlightTag: 'Global Contemporary Art',
      },
    ],
    foods: [
      {
        id: 'fdk1',
        name: 'Karimeen Pollichathu',
        category: 'Coastal Specialty',
        description: 'Fresh pearl spot fish marinated in shallots, green chilies, and crushed black pepper, baked inside banana leaf packets over coconut embers.',
        image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
        badge: 'Signature',
      },
      {
        id: 'fdk2',
        name: 'Appam with Coconut Vegetable Stew',
        category: 'Breakfast Classic',
        description: 'Lacy, crispy-edged fermented rice batter hoppers with a fluffy soft center, served with fragrant coconut milk cardamom stew.',
        image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80',
        badge: 'Iconic',
      },
      {
        id: 'fdk3',
        name: 'Malabar Parotta with Pepper Roast',
        category: 'Street Feast',
        description: 'Flaky, spiral-layered griddled flatbread paired with rich, dark roasted gravy infused with fennel, curry leaves, and Tellicherry pepper.',
        image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'fdk4',
        name: 'Ada Pradhaman Payasam',
        category: 'Festive Dessert',
        description: 'Steamed rice pasta ribbons simmered in velvety dark jaggery syrup, thick coconut cream, and roasted cashew and coconut slices.',
        image: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=800&q=80',
      },
    ],
    places: [
      {
        id: 'pk1',
        name: 'Alleppey Backwaters & Vembanad Lake',
        location: 'Alappuzha',
        city: 'Alappuzha',
        description: 'A labyrinth of emerald palm-lined canals, tranquil houseboats, and village lagoons opening into India’s longest lake.',
        image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
        tags: ['Houseboat', 'Backwaters', 'Lagoon'],
        rating: 4.9,
      },
      {
        id: 'pk2',
        name: 'Munnar Tea Hills & Kolukkumalai',
        location: 'Idukki',
        city: 'Munnar',
        description: 'Rolling velvet-green tea estates rising 7,000 feet into the clouds, featuring the highest organic tea plantation in the world.',
        image: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=800&q=80',
        tags: ['Misty Hills', 'Tea Plantations', 'Trekking'],
        rating: 4.9,
      },
      {
        id: 'pk3',
        name: 'Fort Kochi Historic Quarter',
        location: 'Kochi',
        city: 'Kochi',
        description: 'Chinese cantilevered fishing nets silhouetted against glowing sunsets, Portuguese chapels, spice markets, and hip art cafes.',
        image: 'https://images.unsplash.com/photo-1588096344356-9b441f71df44?auto=format&fit=crop&w=800&q=80',
        tags: ['Chinese Nets', 'Art Cafes', 'Colonial Lore'],
        rating: 4.8,
      },
      {
        id: 'pk4',
        name: 'Varkala Red Sandstone Cliffs',
        location: 'Varkala',
        city: 'Varkala',
        description: 'Dramatic red laterite cliffs towering over the Arabian Sea, fringed by coastal coconut palms, yoga shalas, and sunset cafes.',
        image: 'https://images.unsplash.com/photo-1590059390046-51e60058ec4f?auto=format&fit=crop&w=800&q=80',
        tags: ['Cliff Beach', 'Sunset Yoga', 'Coastal Breeze'],
        rating: 4.8,
      },
    ],
    seasons: [
      {
        season: 'Winter',
        months: 'November – February',
        weather: 'Pleasant, dry, sunny days with cool evening breezes by the ocean.',
        temperature: '22°C – 30°C',
        experiences: ['Houseboat cruises in Alleppey', 'Fort Kochi art walks', 'Munnar hill hikes'],
        festivals: ['Kochi Biennale', 'Christmas Festivities', 'Theyyam Season'],
        isRecommended: true,
      },
      {
        season: 'Monsoon',
        months: 'June – August',
        weather: 'Lush torrential monsoon downpours; ideal natural climate for Ayurvedic cures.',
        temperature: '22°C – 28°C',
        experiences: ['Ayurvedic Panchakarma therapies', 'Waterfalls in full glory', 'Lush rain retreats'],
        festivals: ['Nehru Trophy Race', 'Onam Preparations'],
        isRecommended: true,
      },
      {
        season: 'Spring',
        months: 'February – March',
        weather: 'Warm sunny weather, clear seas, perfect for beach stays.',
        temperature: '24°C – 32°C',
        experiences: ['Varkala beach relaxation', 'Periyar wildlife sanctuaries', 'Spice plantation walks'],
        festivals: ['Attukal Pongala', 'Maha Shivaratri'],
        isRecommended: true,
      },
      {
        season: 'Autumn',
        months: 'September – October',
        weather: 'Fresh post-monsoon emerald scenery, vibrant skies, cool water levels.',
        temperature: '23°C – 31°C',
        experiences: ['Village canoe explorations', 'Onam festivities', 'Birdwatching at Kumarakom'],
        festivals: ['Onam Carnival', 'Pulikali Tiger Dance'],
        isRecommended: true,
      },
      {
        season: 'Summer',
        months: 'April – May',
        weather: 'Warm and humid along the coast; cool and refreshing in Munnar highlands.',
        temperature: '26°C – 36°C',
        experiences: ['Highland tea estate stays', 'Indoor spice cooking sessions', 'Waterfalls dipping'],
        festivals: ['Thrissur Pooram', 'Vishu New Year'],
        isRecommended: false,
      },
    ],
    travelPersonalities: [
      {
        id: 'tp_k1',
        label: 'Nature Lovers',
        emoji: '🌿',
        description: 'Dense rainforests, misty tea highlands, and serene wildlife sanctuaries.',
        isTopMatch: true,
      },
      {
        id: 'tp_k2',
        label: 'Couples',
        emoji: '❤️',
        description: 'Private thatched houseboats, cliff-top sunset views, and candlelit dinners.',
        isTopMatch: true,
      },
      {
        id: 'tp_k3',
        label: 'Culture Enthusiasts',
        emoji: '🎨',
        description: 'Kathakali dramas, ancient Kalaripayattu martial arts, and spice lore.',
        isTopMatch: true,
      },
      {
        id: 'tp_k4',
        label: 'Food Explorers',
        emoji: '🍜',
        description: 'Steamed appams, Karimeen in banana leaf, and authentic plantain sadya.',
        isTopMatch: true,
      },
      {
        id: 'tp_k5',
        label: 'Family Travelers',
        emoji: '👨‍👩‍👧',
        description: 'Gentle canal cruising, spice plantation tours, and friendly homestays.',
        isTopMatch: true,
      },
      {
        id: 'tp_k6',
        label: 'Heritage Lovers',
        emoji: '🏛️',
        description: '500-year-old Dutch and Portuguese palaces, and Jewish synagogues.',
        isTopMatch: false,
      },
      {
        id: 'tp_k7',
        label: 'Photographers',
        emoji: '📸',
        description: 'Dramatic Chinese fishing nets, lush emerald waterways, and tea mist.',
        isTopMatch: true,
      },
      {
        id: 'tp_k8',
        label: 'Adventure Seekers',
        emoji: '🏔️',
        description: 'Bamboo rafting in Periyar, Meesapulimala peak trek, and cliff surfing.',
        isTopMatch: false,
      },
    ],
    localExperiences: [
      {
        id: 'lek1',
        title: 'Backwater Kettuvallam Private Cruise',
        subtitle: 'Sail silently through coconut lagoons with a private onboard chef',
        duration: 'Day or Overnight',
        tag: 'Quintessential Kerala',
        image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
        highlights: ['Freshly caught pearl spot grilled onboard', 'Stop at remote canal villages', 'Silent motorless sunset rowing'],
        icon: '🛶',
      },
      {
        id: 'lek2',
        title: 'Authentic Kerala Cooking Masterclass',
        subtitle: 'Pound fresh spices and scrape coconuts in a heritage homestead',
        duration: '3 Hours',
        tag: 'Culinary Heritage',
        image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
        highlights: ['Pluck fresh curry leaves and peppercorns', 'Cook Karimeen Pollichathu in banana leaves', 'Eat with hand on fresh plantain leaf'],
        icon: '🥥',
      },
      {
        id: 'lek3',
        title: 'Traditional Ayurvedic Rejuvenation',
        subtitle: 'Authentic warm medicated herbal oil therapies under qualified Vaidyas',
        duration: '2.5 Hours',
        tag: 'Holistic Healing',
        image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
        highlights: ['Shirodhara warm oil forehead pour', 'Custom dosha body diagnostic', 'Herbal steam chamber detox'],
        icon: '🌿',
      },
      {
        id: 'lek4',
        title: 'Backstage Kathakali & Mudra Recital',
        subtitle: 'Witness the 3-hour natural mineral makeup ritual before the stage ignites',
        duration: '2 Hours',
        tag: 'Cultural Immersion',
        image: 'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&w=800&q=80',
        highlights: ['Watch facial transformation with rice paste', 'Learn the 24 foundational mudras', 'Front-row seat for the dramatic recital'],
        icon: '🎭',
      },
    ],
    suggestedPrompts: [
      'What should I experience in Kerala in 5 days?',
      'Show me the best backwater village homestays in Alleppey.',
      'Guide me to authentic Ayurvedic wellness retreats.',
      'Where to find the freshest seafood and appams in Fort Kochi?',
    ],
    finalCtaMessage: 'Listen to the gentle whispers of the backwaters, feel the healing herbs of the earth, and experience God’s Own Country at least once in your lifetime.',
  },

  maharashtra: {
    id: 'maharashtra',
    name: 'Maharashtra',
    code: 'MH',
    tagline: 'From vibrant cities to misty mountains and ancient forts.',
    heroVideo: '/maharashtra_video.mp4',
    heroImage: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=2000&q=85',
    primaryCity: 'Mumbai',
    quickEscapeCity: 'Mumbai, Maharashtra',
    introduction: {
      headline: 'The Heartland of Chhatrapati Kings, Rock-Cut Marvels, and Infinite Energy',
      subheadline: 'From the soaring stone ramparts of the Sahyadri mountains to UNESCO rock-cut cave shrines and the unstoppable heartbeat of Mumbai.',
      description: 'Maharashtra is an exhilarating contrast of timeless heroism and forward-looking dynamism. Here, mighty Maratha hill fortresses pierce monsoon clouds, 2,000-year-old basalt monasteries at Ajanta and Ellora amaze the world, and coastal Arabian fishing villages sit alongside global metropolises.',
    },
    snapshot: {
      region: 'West India',
      capital: 'Mumbai',
      bestTime: 'Oct – Mar (Monsoon for Treks)',
      duration: '4 – 7 Days',
      bestFor: ['Forts', 'Trekking', 'Street Food', 'UNESCO Heritage'],
      climate: 'Tropical coastal climate in Konkan; breezy Deccan plateau (16°C – 34°C).',
    },
    whyVisitHighlights: [
      {
        title: 'Invincible Maratha Hill Forts',
        description: 'Trek up cloud-wrapped cliff paths to Raigad, Sinhagad, and Rajgad where Chhatrapati Shivaji built legends.',
        image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1000&q=80',
        tag: 'Fortress Glory',
      },
      {
        title: 'UNESCO Basalt Rock-Cut Wonders',
        description: 'Stand in awe before Kailasa Temple at Ellora—the world’s largest monolithic sculpture carved top-down from a single rock.',
        image: 'https://images.unsplash.com/photo-1600100397608-f010f44383c2?auto=format&fit=crop&w=1000&q=80',
        tag: 'Ancient Genius',
      },
      {
        title: 'The Electric Pulse of Mumbai',
        description: 'Colonial Victorian arcades, bustling Dabbawalas, sunset Marine Drive walks, and world-class street gastronomy.',
        image: 'https://images.unsplash.com/photo-1566552881560-0be86c53e56f?auto=format&fit=crop&w=1000&q=80',
        tag: 'Maximum City',
      },
      {
        title: 'Untouched Konkan Coast & Forts',
        description: 'Golden sandy coves, Murud Janjira sea fortress, and authentic coconut Malvani seafood cooked in clay pots.',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
        tag: 'Coastal Escape',
      },
    ],
    culture: [
      {
        id: 'cm1',
        category: 'Clothing',
        title: 'Nauvari Saree & Kolhapuri Pheta',
        description: 'Nine-yard draped Nauvari sarees designed for equestrian freedom, crowned with saffron and gold ceremonial pheta headgear.',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'cm2',
        category: 'Music',
        title: 'Powada Ballads & Natya Sangeet',
        description: 'Heroic narrative ballads of warrior courage sung with the Daf drum, alongside classical musical theater traditions.',
        image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'cm3',
        category: 'Dance',
        title: 'Energetic Lavani & Dhol Tasha',
        description: 'Fast-paced, expressive Lavani dances driven by the pounding Dholak rhythm, and 500-member community Dhol Tasha drum troupes.',
        image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'cm4',
        category: 'Art',
        title: 'Indigenous Warli Tribal Canvas',
        description: 'Primitive geometric white rice-paste stick figures depicting community farming, joyous tarpa dances, and sacred mother nature.',
        image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'cm5',
        category: 'Handicrafts',
        title: 'Paithani Silks & Kolhapuri Chappals',
        description: 'Pure silk sarees with peacock-motif gold pallus, paired with vegetable-tanned artisanal leather footwear built to last decades.',
        image: 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'cm6',
        category: 'Architecture',
        title: 'Monolithic Basalt Forts & Caves',
        description: 'High bastion ramparts, clever hidden Gomukhi entrances, and cliff-hewn viharas engineered across Sahyadri volcanic basalt.',
        image: 'https://images.unsplash.com/photo-1600100397608-f010f44383c2?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'cm7',
        category: 'Tradition',
        title: 'Ganeshotsav & Dabbawala Ingenuity',
        description: 'Ten days of unmatched community unity and grand processions, alongside the Six Sigma marvel of Mumbai Dabbawalas.',
        image: 'https://images.unsplash.com/photo-1566552881560-0be86c53e56f?auto=format&fit=crop&w=800&q=80',
      },
    ],
    festivals: [
      {
        id: 'fm1',
        name: 'Ganesh Chaturthi',
        monthSeason: 'August – September',
        description: 'The monumental soul festival of Maharashtra; giant idols, high-decibel Dhol Tasha drums, and emotional sea immersions at Girgaon Chowpatty.',
        image: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=800&q=80',
        highlightTag: 'Unrivaled Energy',
      },
      {
        id: 'fm2',
        name: 'Gudi Padwa',
        monthSeason: 'March – April',
        description: 'The Marathi New Year marked by silk-draped Gudi flags raised from balconies, Shobha Yatra bike rallies in traditional attire, and sweet Shrikhand.',
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
        highlightTag: 'New Year Awakening',
      },
      {
        id: 'fm3',
        name: 'Ellora Heritage Festival',
        monthSeason: 'January',
        description: 'World-renowned classical singers and dancers perform directly before the floodlit monolithic Kailasa temple under starry skies.',
        image: 'https://images.unsplash.com/photo-1600100397608-f010f44383c2?auto=format&fit=crop&w=800&q=80',
        highlightTag: 'Classical Splendor',
      },
      {
        id: 'fm4',
        name: 'Kala Ghoda Arts Festival',
        monthSeason: 'February',
        description: 'Mumbai’s historic heritage precinct transforms into an open-air carnival of street installations, theater, indie cinema, and craft stalls.',
        image: 'https://images.unsplash.com/photo-1566552881560-0be86c53e56f?auto=format&fit=crop&w=800&q=80',
        highlightTag: 'Urban Culture',
      },
    ],
    foods: [
      {
        id: 'fdm1',
        name: 'Kolhapuri Misal Pav',
        category: 'Spicy Street Icon',
        description: 'Sprouted moth bean curry drowned in fiery red ‘kat’ gravy, topped with crunchy farsan, chopped onions, and soft buttery pav.',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
        badge: 'Fiery Legend',
      },
      {
        id: 'fdm2',
        name: 'Malvani Surmai Curry with Solkadhi',
        category: 'Konkan Seafood',
        description: 'Fresh kingfish simmered in roasted coconut and triphala spice, paired with tangy pink kokum-coconut milk digestif.',
        image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
        badge: 'Coastal Gold',
      },
      {
        id: 'fdm3',
        name: 'Mumbai Vada Pav',
        category: 'Street Soul Food',
        description: 'Piping-hot spiced potato fritter encased in chickpea batter, sandwiched in fresh bread with dry garlic chutney and fried green chilies.',
        image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'fdm4',
        name: 'Warm Puran Poli with Desi Ghee',
        category: 'Festive Sweet',
        description: 'Hand-rolled thin flatbread stuffed with sweet chana dal and organic jaggery infused with nutmeg and cardamom, served with melted ghee.',
        image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
      },
    ],
    places: [
      {
        id: 'pm1',
        name: 'Gateway of India & South Mumbai Heritage',
        location: 'Mumbai',
        city: 'Mumbai',
        description: 'Indo-Saracenic basalt arch facing the Arabian Sea, surrounded by Victorian Gothic UNESCO monuments and buzzing seaside promenades.',
        image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
        tags: ['Heritage Monument', 'Harbor Sea', 'Victorian Gothic'],
        rating: 4.8,
      },
      {
        id: 'pm2',
        name: 'Ellora & Ajanta UNESCO Caves',
        location: 'Chhatrapati Sambhajinagar',
        city: 'Chhatrapati Sambhajinagar',
        description: '34 rock-cut cave temples spanning Buddhism, Hinduism, and Jainism, headlined by the mind-bending monolithic Kailasa temple.',
        image: 'https://images.unsplash.com/photo-1600100397608-f010f44383c2?auto=format&fit=crop&w=800&q=80',
        tags: ['Monolithic Wonder', 'Ancient Murals', 'UNESCO'],
        rating: 5.0,
      },
      {
        id: 'pm3',
        name: 'Sinhagad & Raigad Cloud Forts',
        location: 'Pune & Raigad',
        city: 'Pune',
        description: 'Legendary hill fortress bastions perched high over deep valleys, offering panoramic views of misty Western Ghat passes.',
        image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
        tags: ['Fort Trek', 'Maratha Lore', 'Cloud Valley'],
        rating: 4.9,
      },
      {
        id: 'pm4',
        name: 'Lonavala & Karla Buddhist Caves',
        location: 'Western Ghats',
        city: 'Lonavala',
        description: 'Ancient 2nd-century BC rock-cut chaitya hall with intricate teakwood ribs, nestled in verdant misty waterfall hills.',
        image: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=800&q=80',
        tags: ['Misty Waterfalls', 'Rock Caves', 'Monsoon Hill'],
        rating: 4.7,
      },
    ],
    seasons: [
      {
        season: 'Winter',
        months: 'November – February',
        weather: 'Pleasant, dry, sunny days and cool evening sea breezes.',
        temperature: '16°C – 28°C',
        experiences: ['Heritage walks in South Mumbai', 'Exploring Ajanta & Ellora caves', 'Wine tasting in Nashik'],
        festivals: ['Kala Ghoda Festival', 'Banganga Music Fest', 'Ellora Festival'],
        isRecommended: true,
      },
      {
        season: 'Monsoon',
        months: 'June – September',
        weather: 'Lush, misty downpours that transform the Sahyadri mountains into green paradise with hundreds of waterfalls.',
        temperature: '22°C – 28°C',
        experiences: ['Sahyadri fortress monsoon trekking', 'Chasing waterfalls in Lonavala & Malshej', 'Hot tea and kanda bhajjis'],
        festivals: ['Ganesh Chaturthi', 'Dahi Handi'],
        isRecommended: true,
      },
      {
        season: 'Spring',
        months: 'February – March',
        weather: 'Sunny and warm, perfect for Konkan coastal beaches.',
        temperature: '22°C – 32°C',
        experiences: ['Scuba diving in Tarkarli', 'Murud Janjira boat rides', 'Alphonso mango farm visits'],
        festivals: ['Gudi Padwa', 'Holi'],
        isRecommended: true,
      },
      {
        season: 'Autumn',
        months: 'October – November',
        weather: 'Post-monsoon freshness, lush green valleys, pleasant travel conditions.',
        temperature: '22°C – 32°C',
        experiences: ['Hill fortress photography', 'Vineyard tours in Nashik', 'Coastal Konkan drives'],
        festivals: ['Diwali Pahat', 'Kojagiri Purnima'],
        isRecommended: true,
      },
      {
        season: 'Summer',
        months: 'April – May',
        weather: 'Hot and humid along the coast; cool retreats available in Mahabaleshwar and Matheran.',
        temperature: '28°C – 38°C',
        experiences: ['Highland strawberry picking in Mahabaleshwar', 'Sunset viewpoints at Arthur Seat'],
        festivals: ['Maharashtra Day'],
        isRecommended: false,
      },
    ],
    travelPersonalities: [
      {
        id: 'tpm1',
        label: 'Adventure Seekers',
        emoji: '🏔️',
        description: 'Monsoon fort treks, rock-cut cliff traverses, and Sahyadri peak climbing.',
        isTopMatch: true,
      },
      {
        id: 'tpm2',
        label: 'Food Explorers',
        emoji: '🍜',
        description: 'Kolhapuri spicy curries, Mumbai street food crawls, and fresh Konkan fish.',
        isTopMatch: true,
      },
      {
        id: 'tpm3',
        label: 'Heritage Lovers',
        emoji: '🏛️',
        description: 'UNESCO Kailasa temple, Maratha hill forts, and Victorian Gothic architecture.',
        isTopMatch: true,
      },
      {
        id: 'tpm4',
        label: 'Photographers',
        emoji: '📸',
        description: 'Misty cloud waterfalls, Mumbai golden-hour shorelines, and rock-cut shrines.',
        isTopMatch: true,
      },
      {
        id: 'tpm5',
        label: 'Culture Enthusiasts',
        emoji: '🎨',
        description: 'Lavani theater, Warli tribal art villages, and Ganesh festival euphoria.',
        isTopMatch: true,
      },
      {
        id: 'tpm6',
        label: 'Couples',
        emoji: '❤️',
        description: 'Marine Drive late-night strolls, hill station retreats, and vineyard cottages.',
        isTopMatch: false,
      },
      {
        id: 'tpm7',
        label: 'Family Travelers',
        emoji: '👨‍👩‍👧',
        description: 'Toy trains in Matheran, Elephanta island boat rides, and interactive science centers.',
        isTopMatch: false,
      },
      {
        id: 'tpm8',
        label: 'Nature Lovers',
        emoji: '🌿',
        description: 'Tadoba tiger reserve safaris, Kaas plateau flower blooms, and Konkan beaches.',
        isTopMatch: false,
      },
    ],
    localExperiences: [
      {
        id: 'lem1',
        title: 'Sahyadri Cloud Fort Trek',
        subtitle: 'Climb through morning mist to historic Maratha stone ramparts',
        duration: '5 Hours',
        tag: 'High Adventure',
        image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
        highlights: ['Hike ancient stone-cut Gomukhi staircases', 'Panoramic view of cloud inversions', 'Authentic Pithla Bhakri lunch at summit'],
        icon: '🏰',
      },
      {
        id: 'lem2',
        title: 'Mumbai Irani Cafe & Street Food Trail',
        subtitle: 'Wander through 100-year-old bakeries, spice lanes, and sea promenades',
        duration: '3 Hours',
        tag: 'Culinary Expedition',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
        highlights: ['Fresh bun maska & chai at heritage Irani cafe', 'Legendary Khau Galli street chaat', 'Heritage architecture stories'],
        icon: '🍛',
      },
      {
        id: 'lem3',
        title: 'Live Lavani Folk & Dhol Tasha Workshop',
        subtitle: 'Feel the earth-shaking beats and expressive footwork of Marathi folk masters',
        duration: '2.5 Hours',
        tag: 'Rhythmic Heritage',
        image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=800&q=80',
        highlights: ['Learn fundamental Dhol stick strike patterns', 'Storytelling through musical facial expressions', 'Intimate artist interaction'],
        icon: '🎭',
      },
      {
        id: 'lem4',
        title: 'Konkan Coastline & Sea Fortress Expedition',
        subtitle: 'Sail on traditional wooden boats to the invincible Murud Janjira sea fortress',
        duration: '6 Hours',
        tag: 'Maritime Odyssey',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        highlights: ['Arabian Sea boat crossing to island citadel', 'Explore freshwater palace tanks in the sea', 'Clay pot Malvani fish curry on the beach'],
        icon: '🌊',
      },
    ],
    suggestedPrompts: [
      'Plan a weekend in Maharashtra covering forts and food.',
      'What are the best monsoon trekking trails in the Sahyadris?',
      'Show me a heritage walking tour of South Mumbai.',
      'How to visit Ajanta and Ellora caves in two days?',
    ],
    finalCtaMessage: 'From cloud-crested hilltops conquered by Maratha warriors to the eternal roar of the Arabian tide, Maharashtra invites you to dream and explore boldly.',
  },

  ladakh: {
    id: 'ladakh',
    name: 'Ladakh',
    code: 'LA',
    tagline: 'Where the mountains touch the sky.',
    heroVideo: '/ladakh_video.mp4',
    heroImage: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=2000&q=85',
    primaryCity: 'Leh',
    quickEscapeCity: 'Leh, Ladakh',
    introduction: {
      headline: 'The Land of High Passes, Glacial Waters, and Sacred Silence',
      subheadline: 'Breathe crisp Himalayan air at 17,000 feet, where thousand-year-old cliffside Buddhist monasteries touch indigo skies.',
      description: 'Ladakh is a high-altitude marvel suspended between heaven and earth. Guarded by the great Karakoram and Himalayan ranges, this moonscape cold desert reveals miraculous turquoise lakes, ancient Tibetan gompas echoing with monk chants, and pristine night skies that reveal the full splendor of the Milky Way.',
    },
    snapshot: {
      region: 'Northern Himalayas',
      capital: 'Leh',
      bestTime: 'May – Sep',
      duration: '6 – 10 Days',
      bestFor: ['High Passes', 'Ancient Gompas', 'Glacial Lakes', 'Stargazing'],
      climate: 'High-altitude cold desert with crisp, sunlit days and freezing starry nights (-10°C to 24°C).',
    },
    whyVisitHighlights: [
      {
        title: 'Shimmering Pangong & Tso Moriri',
        description: 'Watch deep cobalt and turquoise waters change color throughout the day against dramatic arid peaks.',
        image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1000&q=80',
        tag: 'Turquoise Waters',
      },
      {
        title: '1,000-Year Cliffside Gompas',
        description: 'Explore Thiksey, Diskit, and Hemis monasteries clinging to rugged cliff faces, housing sacred Buddhist scrolls and colossal statues.',
        image: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=1000&q=80',
        tag: 'Sacred Sanctum',
      },
      {
        title: 'World’s Highest Motorable Passes',
        description: 'Drive across Khardung La and Chang La at dizzying elevations above 17,500 feet with panoramic glacier vistas.',
        image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80',
        tag: 'Roof of the World',
      },
      {
        title: 'Pristine Dark Sky Stargazing',
        description: 'Hanle and Nubra offer world-class dark skies with zero light pollution, revealing shooting stars and the Milky Way core.',
        image: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1000&q=80',
        tag: 'Celestial Wonder',
      },
    ],
    culture: [
      {
        id: 'cl1',
        category: 'Clothing',
        title: 'Woolen Goncha & Perak Headdress',
        description: 'Heavy sheep wool robes bound at the waist with silk sashes, crowned by heirloom Perak headdresses studded with natural raw turquoises.',
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'cl2',
        category: 'Music',
        title: 'Daman Drums & Sacred Surna Horns',
        description: 'Hypnotic resonant brass Dungchen horns and Daman kettle drums played during monastic prayers to summon mountain deities.',
        image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'cl3',
        category: 'Dance',
        title: 'Sacred Cham Monastic Mask Dances',
        description: 'Lamas dressed in ornate brocades and fierce deity masks perform slow, turning, symbolic rituals to conquer ignorance and evil.',
        image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'cl4',
        category: 'Art',
        title: 'Thangka Silk Scrolls & Sand Mandalas',
        description: 'Sacred geometric mandalas created grain by grain from powdered colored stone, dissolved post-ritual to teach impermanence.',
        image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'cl5',
        category: 'Handicrafts',
        title: 'Hand-Spun Pashmina & Chamba Woodwork',
        description: 'Ultra-soft cashmere harvested from Changthangi mountain goats at 14,000 feet, alongside carved Tibetan juniper wood tables.',
        image: 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'cl6',
        category: 'Architecture',
        title: 'Sun-Dried Mud-Brick Monasteries',
        description: 'Tiered white-and-ochre walls built of thick mountain mud bricks with inward-sloping trapezoidal windows that trap thermal warmth.',
        image: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'cl7',
        category: 'Tradition',
        title: 'Butter Lamp Offerings & Warm Khambir',
        description: 'Spinning brass prayer wheels in clockwise devotion, lighting yak butter lamps, and sharing hearthside warm sourdough bread.',
        image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80',
      },
    ],
    festivals: [
      {
        id: 'fl1',
        name: 'Hemis Tsechu Festival',
        monthSeason: 'June – July',
        description: 'Commemorating Guru Padmasambhava at Hemis Monastery with colossal silk thangkas unfurled, sacred Cham mask dances, and brass fanfares.',
        image: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=800&q=80',
        highlightTag: 'Monastic Miracle',
      },
      {
        id: 'fl2',
        name: 'Ladakh Festival',
        monthSeason: 'September',
        description: 'A vibrant week-long cultural parade through Leh streets showcasing archers, polo tournaments, masked dancers, and folk singers.',
        image: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=800&q=80',
        highlightTag: 'Himalayan Unity',
      },
      {
        id: 'fl3',
        name: 'Thiksey Gustor',
        monthSeason: 'November',
        description: 'Two days of monastic prayers and sacred rituals at Thiksey Monastery culminating in the symbolic distribution of the sacrificial cake (Torma).',
        image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80',
        highlightTag: 'Sacred Ritual',
      },
      {
        id: 'fl4',
        name: 'Losar (Ladakhi New Year)',
        monthSeason: 'December – January',
        description: 'Homes illuminated with butter oil lamps, prayer flags hoisted on rooftops, and community feasts marking the Himalayan new dawn.',
        image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
        highlightTag: 'Winter Renewal',
      },
    ],
    foods: [
      {
        id: 'fdl1',
        name: 'Steaming Ladakhi Thukpa',
        category: 'High-Altitude Comfort',
        description: 'Hand-pulled wheat noodles in aromatic vegetable and meat broth, spiced with mountain herbs, ginger, and wild garlic.',
        image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80',
        badge: 'Mountain Classic',
      },
      {
        id: 'fdl2',
        name: 'Skyu Traditional Stew',
        category: 'Highland Staple',
        description: 'Thumb-sized whole-wheat dough nuggets slow-cooked in a hearty root vegetable, turnip, and mutton stew that warms mountain evenings.',
        image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
        badge: 'Ancestral',
      },
      {
        id: 'fdl3',
        name: 'Khambir with Butter Tea (Gur Gur)',
        category: 'Morning Routine',
        description: 'Traditional thick fermented sourdough bread baked over iron pans, dipped in warm salted yak-butter and churned tea.',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'fdl4',
        name: 'Apricot Tart & Chhurpi Snack',
        category: 'Local Sweet & Cheese',
        description: 'Sun-dried Himalayan apricots baked into sweet tarts, paired with dried organic yak cheese chew that energizes mountain trekkers.',
        image: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=800&q=80',
      },
    ],
    places: [
      {
        id: 'pl1',
        name: 'Pangong Tso Alpine Salt Lake',
        location: 'Changthang Plateau',
        city: 'Leh',
        description: 'A 134-kilometer glacial lake sitting at 14,270 feet that shifts between iridescent shades of cyan, navy, and crystal emerald.',
        image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80',
        tags: ['Glacial Lake', 'Changing Colors', 'High Altitude'],
        rating: 5.0,
      },
      {
        id: 'pl2',
        name: 'Thiksey Gompa & Maitreya Buddha',
        location: 'Leh Valley',
        city: 'Leh',
        description: 'Affectionately known as Mini Potala, this 12-story whitewashed monastery complex houses a two-story gilded statue of Maitreya Buddha.',
        image: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=800&q=80',
        tags: ['Cliff Monastery', 'Giant Buddha', 'Sunrise Chants'],
        rating: 4.9,
      },
      {
        id: 'pl3',
        name: 'Nubra Valley & Hunder White Dunes',
        location: 'Nubra Valley',
        city: 'Diskit',
        description: 'High-altitude cold sand dunes framed by snow peaks, home to double-humped Bactrian camels once part of the Silk Road.',
        image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
        tags: ['White Sand Dunes', 'Bactrian Camels', 'Silk Road'],
        rating: 4.9,
      },
      {
        id: 'pl4',
        name: 'Khardung La High Pass (17,582 ft)',
        location: 'Karakoram Range',
        city: 'Leh',
        description: 'A legendary mountain pass connecting Leh to Nubra and Siachen glacier, draped in fluttering Buddhist prayer flags.',
        image: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80',
        tags: ['High Mountain Pass', 'Prayer Flags', 'Glacier Views'],
        rating: 4.8,
      },
    ],
    seasons: [
      {
        season: 'Summer',
        months: 'June – August',
        weather: 'Pleasant, dry, warm sunny days and cool nights. Roads and mountain passes fully open.',
        temperature: '15°C – 26°C',
        experiences: ['Pangong Tso & Nubra road expeditions', 'Monastery festival attendances', 'High-altitude trekking'],
        festivals: ['Hemis Festival', 'Yuru Kabgyat'],
        isRecommended: true,
      },
      {
        season: 'Autumn',
        months: 'September – October',
        weather: 'Crisp sunny days, golden poplar foliage, clear crystalline lakes, and low tourist footfall.',
        temperature: '5°C – 18°C',
        experiences: ['Landscape photography with golden trees', 'Stargazing at Hanle dark reserve', 'Peaceful monastery meditation'],
        festivals: ['Ladakh Festival', 'Diskit Gustor'],
        isRecommended: true,
      },
      {
        season: 'Spring',
        months: 'April – May',
        weather: 'Snow starts thawing; apricot blossoms bloom across lower valleys like Turtuk.',
        temperature: '8°C – 18°C',
        experiences: ['Apricot blossom trails in Turtuk', 'Leh heritage town walks', 'Acclimatization excursions'],
        festivals: ['Apricot Blossom Festival'],
        isRecommended: true,
      },
      {
        season: 'Winter',
        months: 'November – February',
        weather: 'Extreme Siberian cold; frozen lakes and snow blankets. Only for extreme adventure travelers.',
        temperature: '-15°C – 2°C',
        experiences: ['Chadar Trek over frozen Zanskar river', 'Snow leopard tracking in Hemis National Park'],
        festivals: ['Losar New Year', 'Spituk Gustor'],
        isRecommended: false,
      },
      {
        season: 'Monsoon',
        months: 'July – August',
        weather: 'Ladakh lies in the rain shadow zone! Receives virtually zero monsoon rain, making it India’s premier monsoon haven.',
        temperature: '15°C – 25°C',
        experiences: ['Dry sunny road trips while the rest of India experiences monsoons', 'Lake camping'],
        festivals: ['Karsha Gustor'],
        isRecommended: true,
      },
    ],
    travelPersonalities: [
      {
        id: 'tpl1',
        label: 'Adventure Seekers',
        emoji: '🏔️',
        description: 'Conquering 17,500-foot passes, high-altitude motorcycling, and glacial river treks.',
        isTopMatch: true,
      },
      {
        id: 'tpl2',
        label: 'Photographers',
        emoji: '📸',
        description: 'Vibrant prayer flags against cobalt skies, turquoise lakes, and starry Milky Way.',
        isTopMatch: true,
      },
      {
        id: 'tpl3',
        label: 'Culture Enthusiasts',
        emoji: '🎨',
        description: 'Thangka art, Tibetan monastic rituals, Cham mask dances, and butter lamp prayers.',
        isTopMatch: true,
      },
      {
        id: 'tpl4',
        label: 'Nature Lovers',
        emoji: '🌿',
        description: 'Himalayan marmots, rare black-necked cranes, and untouched alpine serenity.',
        isTopMatch: true,
      },
      {
        id: 'tpl5',
        label: 'Couples',
        emoji: '❤️',
        description: 'Cozy luxury glamping under million-star skies beside shimmering Pangong lake.',
        isTopMatch: false,
      },
      {
        id: 'tpl6',
        label: 'Heritage Lovers',
        emoji: '🏛️',
        description: '1,000-year-old cliffside Buddhist sanctuaries and Leh royal palace.',
        isTopMatch: false,
      },
      {
        id: 'tpl7',
        label: 'Food Explorers',
        emoji: '🍜',
        description: 'Authentic steaming thukpa, wild herbal skyu, and butter tea with fresh khambir.',
        isTopMatch: false,
      },
      {
        id: 'tpl8',
        label: 'Family Travelers',
        emoji: '👨‍👩‍👧',
        description: 'Leh town cultural walks and double-humped camel rides in Nubra.',
        isTopMatch: false,
      },
    ],
    localExperiences: [
      {
        id: 'lel1',
        title: 'Dawn Monastery Chant & Butter Lamps',
        subtitle: 'Listen to monks blow ancient horns as the sun hits Thiksey Gompa',
        duration: '2.5 Hours',
        tag: 'Spiritual Awakening',
        image: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=800&q=80',
        highlights: ['Ascend whitewashed stone steps at 6 AM', 'Listen to deep harmonic throat chants', 'Sip warm butter tea with resident monks'],
        icon: '🏔️',
      },
      {
        id: 'lel2',
        title: 'Nubra Valley Silk Road Dunes Expedition',
        subtitle: 'Ride double-humped Bactrian camels across white cold desert dunes',
        duration: 'Full Day',
        tag: 'Silk Route Wonder',
        image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
        highlights: ['Cross Khardung La at 17,582 ft', 'Bactrian camel ride through Hunder sand waves', 'Visit Diskit Maitreya colossus at dusk'],
        icon: '🚙',
      },
      {
        id: 'lel3',
        title: 'Pangong Glacial Lake & Dark Sky Glamping',
        subtitle: 'Camp beside world’s highest saltwater lake under brilliant celestial skies',
        duration: 'Overnight',
        tag: 'Astronomical Sanctuary',
        image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80',
        highlights: ['Watch the lake transform through 7 shades of blue', 'Telescope view of Saturn rings and Milky Way', 'Warm wood-stove luxury yurt comfort'],
        icon: '🏕️',
      },
      {
        id: 'lel4',
        title: 'Tibetan Singing Bowl & Meditation Immersion',
        subtitle: 'Align your mind and body with vibrational sound therapy in Leh old town',
        duration: '1.5 Hours',
        tag: 'Mindful Healing',
        image: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80',
        highlights: ['Handmade 7-metal singing bowls resonance', 'Breathing exercises adapted for altitude', 'Guided visualization of high peaks'],
        icon: '🧘',
      },
    ],
    suggestedPrompts: [
      'How to acclimatize and plan a 5-day Leh Ladakh trip?',
      'Best time and photography tips for Pangong Tso and Nubra Valley.',
      'Where can I attend monastic Cham mask dances?',
      'Complete packing and permit checklist for high-altitude passes.',
    ],
    finalCtaMessage: 'Stand beneath skies of impossible azure, feel the hush of ancient mountain shrines, and return with a piece of the roof of the world forever in your soul.',
  },
};

/**
 * Helper to retrieve state overview or generate a graceful fallback
 * for any of the showcase or other destinations.
 */
export function getStateOverview(stateSlug: string): StateOverview | null {
  const normalized = (stateSlug || '').toLowerCase().trim().replace(/_/g, '-');
  
  if (STATE_OVERVIEWS[normalized]) {
    return STATE_OVERVIEWS[normalized];
  }

  // Check aliases
  if (normalized === 'rj') return STATE_OVERVIEWS['rajasthan'];
  if (normalized === 'kl') return STATE_OVERVIEWS['kerala'];
  if (normalized === 'mh') return STATE_OVERVIEWS['maharashtra'];
  if (normalized === 'la' || normalized === 'leh') return STATE_OVERVIEWS['ladakh'];

  // Look up in SHOWCASE_DESTINATIONS for a dynamic fallback
  const found = SHOWCASE_DESTINATIONS.find(
    (d) => d.id.toLowerCase() === normalized || d.name.toLowerCase() === normalized
  );

  if (found) {
    return {
      id: found.id,
      name: found.name,
      code: found.code,
      tagline: found.tagline,
      heroVideo: (found as any).bgVideo,
      heroImage: found.bgMedia,
      primaryCity: found.primaryCity,
      quickEscapeCity: `${found.primaryCity}, ${found.name}`,
      introduction: {
        headline: `Discover the Living Spirit of ${found.name}`,
        subheadline: found.tagline,
        description: found.description,
      },
      snapshot: {
        region: found.region,
        capital: found.capitalCity,
        bestTime: 'Oct – Mar',
        duration: '5 – 7 Days',
        bestFor: found.highlightExperiences.slice(0, 4),
        climate: 'Mild and pleasant in winter months with bright sunny days.',
      },
      whyVisitHighlights: found.highlightExperiences.map((exp, idx) => ({
        title: exp,
        description: `Experience the authentic essence of ${exp} in ${found.name}.`,
        image: found.bgMedia,
        tag: `Highlight 0${idx + 1}`,
      })),
      culture: [
        {
          id: 'gen-c1',
          category: 'Clothing',
          title: `Traditional Attire of ${found.name}`,
          description: `Hand-woven fabrics and ceremonial garments celebrated throughout ${found.name}.`,
          image: found.cardThumbnail,
        },
        {
          id: 'gen-c2',
          category: 'Music',
          title: `Folk Music of ${found.name}`,
          description: `Regional instruments and oral ballads passed down across generations.`,
          image: found.cardThumbnail,
        },
        {
          id: 'gen-c3',
          category: 'Dance',
          title: `Folk Dances of ${found.name}`,
          description: `Expressive regional dance forms performed during harvest festivals.`,
          image: found.cardThumbnail,
        },
      ],
      festivals: [
        {
          id: 'gen-f1',
          name: `${found.name} Heritage Festival`,
          monthSeason: 'Winter Season',
          description: `The grand regional carnival celebrating music, local cuisine, and crafts.`,
          image: found.cardThumbnail,
          highlightTag: 'Grand Celebration',
        },
      ],
      foods: [
        {
          id: 'gen-fd1',
          name: `Traditional ${found.name} Thali`,
          category: 'Regional Specialty',
          description: `An assortment of local seasonal specialties cooked with generational spices.`,
          image: found.cardThumbnail,
          badge: 'Must Try',
        },
      ],
      places: [
        {
          id: 'gen-p1',
          name: found.primaryCity,
          location: found.name,
          city: found.primaryCity,
          description: `The cultural heartbeat and premier gateway to exploring ${found.name}.`,
          image: found.cardThumbnail,
          tags: ['Historic', 'Gateway City', 'Culture'],
          rating: 4.8,
        },
      ],
      seasons: [
        {
          season: 'Winter',
          months: 'October – March',
          weather: 'Cool, sunny, and ideal for outdoor exploration.',
          temperature: '15°C – 28°C',
          experiences: ['Heritage walks', 'City explorations', 'Outdoor festivals'],
          festivals: ['Annual Cultural Festival'],
          isRecommended: true,
        },
        {
          season: 'Monsoon',
          months: 'July – September',
          weather: 'Lush greenery and rain showers.',
          temperature: '22°C – 30°C',
          experiences: ['Lush nature visits', 'Rain retreats'],
          festivals: ['Monsoon Celebration'],
          isRecommended: false,
        },
      ],
      travelPersonalities: [
        { id: 'gen-tp1', label: 'Heritage Lovers', emoji: '🏛️', description: 'Ancient history and cultural architecture.', isTopMatch: true },
        { id: 'gen-tp2', label: 'Food Explorers', emoji: '🍜', description: 'Authentic local cuisine and street flavors.', isTopMatch: true },
        { id: 'gen-tp3', label: 'Photographers', emoji: '📸', description: 'Scenic landscapes and vibrant markets.', isTopMatch: true },
        { id: 'gen-tp4', label: 'Nature Lovers', emoji: '🌿', description: 'Green horizons and serene escapes.', isTopMatch: false },
      ],
      localExperiences: [
        {
          id: 'gen-le1',
          title: `Artisanal Craft & Culture in ${found.name}`,
          subtitle: `Connect with local makers and generational masters`,
          duration: '3 Hours',
          tag: 'Artisan Workshop',
          image: found.cardThumbnail,
          highlights: ['Hands-on guild demonstration', 'Direct artisan interaction', 'Bespoke takeaway craft'],
          icon: '🎨',
        },
      ],
      suggestedPrompts: [
        `Plan a 3-day trip to ${found.name}.`,
        `What are the best food experiences in ${found.primaryCity}?`,
        `Top places to visit in ${found.name}.`,
      ],
      finalCtaMessage: `Experience the unforgettable charm, heritage, and hospitality of ${found.name}.`,
    };
  }

  return null;
}
