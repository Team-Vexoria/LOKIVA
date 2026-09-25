export interface StateCulturalDossier {
  stateId: string;
  name: string;
  tagline: string;
  heroImage: string;
  bestMonths: string;
  currentWeather: string;
  popularPlaces: string[];
  iconicFlavors: Array<{
    name: string;
    description: string;
    badge: string;
  }>;
  curatedCircuits: Array<{
    title: string;
    duration: string;
    pace: string;
    highlights?: string[];
  }>;
  siteCount: number;
  guildCount: number;
  region: 'North India' | 'South India' | 'West India' | 'East India' | 'Northeast' | 'Central India';
}

export const STATE_DOSSIERS: Record<string, StateCulturalDossier> = {
  'Rajasthan': {
    stateId: 'rajasthan',
    name: 'Rajasthan',
    tagline: 'Land of Living Forts, Stepwells, and Indigo Guilds',
    heroImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=1200&auto=format&fit=crop',
    bestMonths: 'October to March (Pleasant winter & desert festivals)',
    currentWeather: '27°C : Clear Skies & Dry Breeze',
    popularPlaces: ['Hawa Mahal & Amber Fort', 'Mehrangarh & Blue City', 'Lake Pichola Haveli Ghats'],
    iconicFlavors: [
      { name: 'Dal Baati Churma', description: 'Wood-fired wheat baatis drenched in desi ghee with spiced lentils', badge: 'Signature Dish' },
      { name: 'Ghevar', description: 'Honeycomb disc pastry soaked in saffron cardamom syrup', badge: 'Royal Sweet' },
      { name: 'Ker Sangri', description: 'Sun-dried desert beans and wild capers tossed in mustard oil and raw mango', badge: 'Desert Heritage' },
    ],
    curatedCircuits: [
      {
        title: '3-Day Pink City Artisans & Palaces',
        duration: '3 Days',
        pace: 'Balanced Pace',
        highlights: ['Sanganer hand-block printing ateliers', 'Panna Meena Kund stepwell dawn walk', 'City Palace royal private courtyards'],
      },
      {
        title: '5-Day Thar Desert Frontier & Citadel Loop',
        duration: '5 Days',
        pace: 'Immersive Pace',
        highlights: ['Toorji Ka Jhalra stepwell', 'Mehrangarh sunset ramparts', 'Living sandstone fort artist workshops'],
      },
    ],
    siteCount: 65,
    guildCount: 24,
    region: 'West India',
  },

  'Uttar Pradesh': {
    stateId: 'uttar-pradesh',
    name: 'Uttar Pradesh',
    tagline: 'Sacred River Ghats, Banarasi Silks, and Awadhi Haute Cuisine',
    heroImage: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=1200&auto=format&fit=crop',
    bestMonths: 'October to March (Misty morning ghats & classical music sabhas)',
    currentWeather: '25°C : Gentle River Breeze',
    popularPlaces: ['Assi to Manikarnika River Ghats', 'Taj Mahal & Agra Red Citadel', 'Bada Imambara & Chowk'],
    iconicFlavors: [
      { name: 'Galouti Kebab', description: 'Melt-in-mouth smoked patties prepared with 160 traditional spice aromatics', badge: 'Nawabi Legacy' },
      { name: 'Banarasi Paan', description: 'Betel leaf stuffed with organic gulkand, kattha, and aromatic mitha masala', badge: 'Ghat Tradition' },
      { name: 'Malaiyo', description: 'Frothy winter milk cloud infused with kesar, pistachios, and morning dew', badge: 'Seasonal Delicacy' },
    ],
    curatedCircuits: [
      {
        title: '3-Day Varanasi Sacred Loom & Ghat Immersion',
        duration: '3 Days',
        pace: 'Contemplative Pace',
        highlights: ['Dawn wooden boat rowing on Ganga', 'Kaduwa silk master loom ateliers', 'Evening Maha Aarti pavilion'],
      },
      {
        title: '4-Day Lucknow Nawabi Heritage & Gastronomy Walk',
        duration: '4 Days',
        pace: 'Culinary Focus',
        highlights: ['Centuries-old Chowk kebab houses', 'Chikankari shadow-embroidery guild', 'Bada Imambara acoustic maze'],
      },
    ],
    siteCount: 72,
    guildCount: 28,
    region: 'North India',
  },

  'Kerala': {
    stateId: 'kerala',
    name: 'Kerala',
    tagline: 'Serene Spice Canals, Kathakali Mask Ateliers, and Monsoon Ayurveda',
    heroImage: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1200&auto=format&fit=crop',
    bestMonths: 'September to March (Crisp backwaters & vibrant temple pageantry)',
    currentWeather: '29°C : Tropical Coastal Warmth',
    popularPlaces: ['Fort Kochi Heritage Quarters', 'Alleppey Vembanad Backwaters', 'Munnar High-Altitude Tea Estates'],
    iconicFlavors: [
      { name: 'Appam with Stew', description: 'Lacy fermented rice crepes with fragrant coconut milk vegetable or meat broth', badge: 'Breakfast Classic' },
      { name: 'Karimeen Pollichathu', description: 'Fresh pearl spot fish marinated in shallots and wrapped in charred banana leaves', badge: 'Backwater Specialty' },
      { name: 'Parippu Payasam', description: 'Slow-simmered jaggery and roasted lentil pudding with coconut chips', badge: 'Festival Sweet' },
    ],
    curatedCircuits: [
      {
        title: '3-Day Fort Kochi Art Guilds & Spice Trail',
        duration: '3 Days',
        pace: 'Relaxed Pace',
        highlights: ['Chinese cantilever fishing nets', 'Mattancherry spice trading alleys', 'Kathakali classical makeup ritual'],
      },
      {
        title: '4-Day Alleppey Backwaters & Coir Artisans',
        duration: '4 Days',
        pace: 'Leisurely Pace',
        highlights: ['Slow wooden canal punt cruise', 'Natural coir rope spinning village', 'Sunset coastal toddy parlor feast'],
      },
    ],
    siteCount: 58,
    guildCount: 19,
    region: 'South India',
  },

  'Tamil Nadu': {
    stateId: 'tamil-nadu',
    name: 'Tamil Nadu',
    tagline: 'Living Dravidian Temple Gopurams and Kanchipuram Weaving Mansions',
    heroImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1200&auto=format&fit=crop',
    bestMonths: 'November to February (Mild weather & temple music festivals)',
    currentWeather: '28°C : Sunny Coastal Air',
    popularPlaces: ['Madurai Meenakshi Temple', 'Thanjavur Brihadisvara Temple', 'Mahabalipuram Shore Monoliths'],
    iconicFlavors: [
      { name: 'Chettinad Pepper Chicken', description: 'Fiery toasted kalpaasi stone flower, star anise, and whole crushed peppercorns', badge: 'Heritage Roast' },
      { name: 'Filter Degree Kaapi', description: 'Fresh chicory blend brewed in brass dabarah with frothy whole milk', badge: 'Daily Ritual' },
      { name: 'Jigarthanda', description: 'Madurai cooler with almond tree gum, condensed nannari milk, and basundi', badge: 'Temple City Cooler' },
    ],
    curatedCircuits: [
      {
        title: '4-Day Chola Living Architecture Circuit',
        duration: '4 Days',
        pace: 'Balanced Pace',
        highlights: ['Thanjavur bronze casting guild', 'Granite monolithic chariot temples', 'Chettinad teakwood palatial mansions'],
      },
      {
        title: '3-Day Madurai Heritage & Food Trail',
        duration: '3 Days',
        pace: 'Intensive Culture',
        highlights: ['Night ceremony at Meenakshi Amman', 'Sungudi tie-dye cotton workshops', 'Ancient banana leaf messes'],
      },
    ],
    siteCount: 64,
    guildCount: 22,
    region: 'South India',
  },

  'Karnataka': {
    stateId: 'karnataka',
    name: 'Karnataka',
    tagline: 'Vijayanagara Boulder Ruins, Sandalwood Carvers, and Western Ghats Arabica',
    heroImage: '/assets/states/karnataka.jpg',
    bestMonths: 'October to March (Pleasant plateau temperatures & cool nights)',
    currentWeather: '26°C : Crisp Plateau Breeze',
    popularPlaces: ['Hampi Boulder Monuments', 'Mysuru Amba Vilas Palace', 'Chikmagalur Coffee Slopes'],
    iconicFlavors: [
      { name: 'Bisi Bele Bath', description: 'Comforting lentil rice stew simmered with nutmeg, kapok buds, and pure ghee', badge: 'Mysore Classic' },
      { name: 'Mysore Pak', description: 'Silky melt-away fudge forged from gram flour, hot ghee, and caramelized sugar', badge: 'Royal Sweet' },
      { name: 'Coorg Pandi Curry', description: 'Tender pork slow cooked in dark, fermented kachampuli fruit vinegar', badge: 'Highland Specialty' },
    ],
    curatedCircuits: [
      {
        title: '3-Day Hampi Ancient Empire Boulder Circuit',
        duration: '3 Days',
        pace: 'Walking Focused',
        highlights: ['Vittala Temple stone musical pillars', 'Coracle river crossing across Tungabhadra', 'Hemakuta Hill golden hour panorama'],
      },
      {
        title: '4-Day Mysore Silk Mansions & Coorg Coffee Trail',
        duration: '4 Days',
        pace: 'Balanced Pace',
        highlights: ['Government silk weaving factory', 'Mysuru rosewood marquetry carvers', 'Organic Arabica shade plantation stay'],
      },
    ],
    siteCount: 56,
    guildCount: 20,
    region: 'South India',
  },

  'Maharashtra': {
    stateId: 'maharashtra',
    name: 'Maharashtra',
    tagline: 'Ancient Basalt Cave Sanctuaries, Sahyadri Hill Forts, and Coastal Petha',
    heroImage: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=1200&auto=format&fit=crop',
    bestMonths: 'October to March (Pleasant winters & cool Sahyadri winds)',
    currentWeather: '28°C : Warm Maritime Sunlight',
    popularPlaces: ['Ajanta & Ellora Monolithic Caves', 'Chhatrapati Shivaji Terminus & Fort', 'Sinhagad Fort & Sahyadri Valleys'],
    iconicFlavors: [
      { name: 'Misal Pav', description: 'Sprouted moth bean curry topped with spicy tarri, farsan, and buttered pav', badge: 'Street Icon' },
      { name: 'Puran Poli', description: 'Delicate hand-rolled flatbread stuffed with fragrant jaggery and nutmeg chana dal', badge: 'Festival Dish' },
      { name: 'Malvani Fish Thali', description: 'Surmai rava fry with fresh solkadhi coconut kokum nectar', badge: 'Konkan Coast' },
    ],
    curatedCircuits: [
      {
        title: '3-Day Ajanta & Ellora Rock-Cut Masterpieces',
        duration: '3 Days',
        pace: 'Historical Focus',
        highlights: ['Kailash Temple monolithic mountain excavation', 'Ajanta mineral fresco painting caves', 'Himroo weaving atelier in Aurangabad'],
      },
      {
        title: '3-Day Mumbai Deco & Colonial Heritage Architecture',
        duration: '3 Days',
        pace: 'Walking Pace',
        highlights: ['Oval Maidan Art Deco promenade', 'Chhatrapati Shivaji Maharaj Vastu Sangrahalaya', 'Kala Ghoda artisan cafes and galleries'],
      },
    ],
    siteCount: 68,
    guildCount: 25,
    region: 'West India',
  },

  'Gujarat': {
    stateId: 'gujarat',
    name: 'Gujarat',
    tagline: 'Kutch Rogan Guilds, Stepwell Geometry, and White Desert Solitude',
    heroImage: 'https://images.unsplash.com/photo-1609137144822-77765103a838?q=80&w=1200&auto=format&fit=crop',
    bestMonths: 'November to February (Rann Utsav & pleasant desert nights)',
    currentWeather: '26°C : Dry Desert Sunshine',
    popularPlaces: ['Rani ki Vav Patan Stepwell', 'Great Rann of Kutch Salt Flats', 'Sabarmati Ashram & Old Pols'],
    iconicFlavors: [
      { name: 'Gujarati Kathiawadi Thali', description: 'Ringan no olo, bajra rotla, garlic chutney, and white butter', badge: 'Rustic Feast' },
      { name: 'Khandvi', description: 'Delicate steamed gram flour rolls tempered with mustard seeds and fresh coconut', badge: 'Delicate Snack' },
      { name: 'Undhiyu', description: 'Clay-pot baked winter root vegetable mélange infused with fresh green garlic', badge: 'Seasonal Legend' },
    ],
    curatedCircuits: [
      {
        title: '3-Day Kutch Living Craft Villages Circuit',
        duration: '3 Days',
        pace: 'Craft Immersive',
        highlights: ['Nirona Rogan castor oil painting masters', 'Bhujodi handloom wool shawls', 'White salt flats sunset horizon'],
      },
      {
        title: '3-Day Ahmedabad Pols & Ancient Stepwells',
        duration: '3 Days',
        pace: 'Architectural Focus',
        highlights: ['Heritage walk through wooden Pols', 'Adalaj stepwell stone carvings', 'Calico Museum of Textiles private tour'],
      },
    ],
    siteCount: 52,
    guildCount: 23,
    region: 'West India',
  },

  'West Bengal': {
    stateId: 'west-bengal',
    name: 'West Bengal',
    tagline: 'Colonial Courtyards, Terracotta Temples, and Darjeeling Tea Slopes',
    heroImage: 'https://images.unsplash.com/photo-1558431382-27e303142255?q=80&w=1200&auto=format&fit=crop',
    bestMonths: 'October to March (Durga Puja, cultural season, and cool tea hills)',
    currentWeather: '26°C : Humid Gentle Breeze',
    popularPlaces: ['Victoria Memorial & Heritage North Kolkata', 'Bishnupur Terracotta Temples', 'Darjeeling Tiger Hill Tea Slopes'],
    iconicFlavors: [
      { name: 'Shorshe Ilish', description: 'Hilsa fish gently steamed in pungent stone-ground yellow and black mustard gravy', badge: 'Culinary Masterpiece' },
      { name: 'Kosha Mangsho with Luchi', description: 'Slow-braised spiced mutton served with puffed golden flour bread', badge: 'Sunday Tradition' },
      { name: 'Mishti Doi & Sandesh', description: 'Earthen pot baked caramelized yogurt and fresh chena cardamom confections', badge: 'Bengal Sweet' },
    ],
    curatedCircuits: [
      {
        title: '3-Day North Kolkata Heritage Mansions & Adda',
        duration: '3 Days',
        pace: 'Cultural Walk',
        highlights: ['College Street Boi Para bookstalls', 'Kumartuli idol sculptor quarter', 'Prinsep Ghat Hooghly wooden boat ride'],
      },
      {
        title: '3-Day Bishnupur Terracotta & Baluchari Weaving',
        duration: '3 Days',
        pace: 'Heritage Focus',
        highlights: ['17th century carved terracotta temples', 'Baluchari silk jacquard loom weavers', 'Dokra lost-wax brass casting atelier'],
      },
    ],
    siteCount: 59,
    guildCount: 21,
    region: 'East India',
  },

  'Himachal Pradesh': {
    stateId: 'himachal-pradesh',
    name: 'Himachal Pradesh',
    tagline: 'Cedar Forest Valleys, Spiti Monasteries, and Wood-Carved Pagodas',
    heroImage: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1200&auto=format&fit=crop',
    bestMonths: 'March to June (Blooming valleys) or October to February (Snow season)',
    currentWeather: '16°C : Crisp Alpine Mountain Air',
    popularPlaces: ['Dharamshala & McLeodGanj', 'Old Manali & Naggar Castle', 'Spiti Valley Key Gompa'],
    iconicFlavors: [
      { name: 'Himachali Dham', description: 'Ceremonial copper vessel feast of Madra, Khatta, and rice without onion or garlic', badge: 'Valley Banquet' },
      { name: 'Siddu', description: 'Steamed wheat dough pocket filled with walnut poppy seed paste and melted ghee', badge: 'Mountain Comfort' },
      { name: 'Babru', description: 'Himachali deep-fried flatbread stuffed with spiced black gram dal', badge: 'Village Snack' },
    ],
    curatedCircuits: [
      {
        title: '3-Day Kangra Valley Miniatures & Tea Circuit',
        duration: '3 Days',
        pace: 'Serene Pace',
        highlights: ['Kangra miniature painting school', 'Dharamsala Tibetan exile monasteries', 'Palampur organic tea garden walks'],
      },
      {
        title: '5-Day Kinnaur & Spiti High-Pass Monastery Trail',
        duration: '5 Days',
        pace: 'Adventure Culture',
        highlights: ['1,000-year-old Tabo mud monastery', 'Chicham suspension bridge', 'High-altitude cold desert fossil villages'],
      },
    ],
    siteCount: 44,
    guildCount: 16,
    region: 'North India',
  },

  'Ladakh': {
    stateId: 'ladakh',
    name: 'Ladakh',
    tagline: 'Moonland Plateaus, Ancient Thangka Ateliers, and High-Pass Gompas',
    heroImage: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=1200&auto=format&fit=crop',
    bestMonths: 'May to September (High-altitude passes open & festival dances)',
    currentWeather: '12°C : High-Altitude Bright Sun',
    popularPlaces: ['Thiksey & Hemis Gompa', 'Pangong Tso Crystal Lake', 'Nubra Valley Sand Dunes & Diskit'],
    iconicFlavors: [
      { name: 'Thukpa & Tingmo', description: 'Hearty hand-pulled noodle broth served with steamed flower yeast bread', badge: 'Highland Staple' },
      { name: 'Butter Tea (Gur Gur)', description: 'Churned yak butter tea with Himalayan rock salt in carved wooden bowls', badge: 'Warmth Elixir' },
      { name: 'Apricot Kernel Jam', description: 'Wild organic apricots slow reduced into tangy sweet morning preserve', badge: 'Valley Harvest' },
    ],
    curatedCircuits: [
      {
        title: '4-Day Indus Valley Living Monasteries',
        duration: '4 Days',
        pace: 'Acclimatized Pace',
        highlights: ['Thiksey dawn prayer chants', 'Alchi 11th century Kashmiri-influenced murals', 'Ladakhi copper metalwork guilds in Chilling'],
      },
    ],
    siteCount: 38,
    guildCount: 14,
    region: 'North India',
  },

  'Jammu and Kashmir': {
    stateId: 'jammu-and-kashmir',
    name: 'Jammu and Kashmir',
    tagline: 'Chinar Avenues, Hand-Knotted Pashmina Guilds, and Dal Shikara Mornings',
    heroImage: '/assets/states/jammu_kashmir.jpg',
    bestMonths: 'April to October (Tulip blooms, apple orchards & golden autumn)',
    currentWeather: '18°C : Cool Himalayan Breeze',
    popularPlaces: ['Dal Lake Floating Flower Markets', 'Gulmarg Meadow of Flowers', 'Pahalgam Betaab Valley'],
    iconicFlavors: [
      { name: 'Kashmiri Wazwan Rogan Josh', description: 'Aromatic mutton curry stewed with wild mawal cockscomb flower extract', badge: 'Royal Wazwan' },
      { name: 'Kahwa', description: 'Delicate green tea simmered with whole saffron strands, cardamom, and almond slivers', badge: 'Ceremonial Tea' },
      { name: 'Modur Pulao', description: 'Sweet saffron basmati rice with candied fruits, cashew nuts, and fresh milk', badge: 'Celebration Dish' },
    ],
    curatedCircuits: [
      {
        title: '3-Day Srinagar Old City Artisans & Lake Haven',
        duration: '3 Days',
        pace: 'Artisan Focus',
        highlights: ['Hand-spun pure Pashmina loom tour', 'Paper-mâché lacquer master workshop', 'Dawn shikara floating vegetable market'],
      },
    ],
    siteCount: 46,
    guildCount: 18,
    region: 'North India',
  },

  'Punjab': {
    stateId: 'punjab',
    name: 'Punjab',
    tagline: 'Golden Sanctuary Reflections, Phulkari Needlework, and Generous Dhaba Tables',
    heroImage: '/assets/states/punjab.jpg',
    bestMonths: 'October to March (Golden mustard blooms & warm winter sunshine)',
    currentWeather: '24°C : Crisp Sunny Morning',
    popularPlaces: ['Sri Harmandir Sahib Golden Temple', 'Wagah Border Heritage Ceremony', 'Qila Mubarak Patiala'],
    iconicFlavors: [
      { name: 'Amritsari Kulcha with Chole', description: 'Crisp layered tandoori bread stuffed with spiced potatoes and smothered in white butter', badge: 'Street Legend' },
      { name: 'Sarson Da Saag & Makki Di Roti', description: 'Fresh mustard greens slow simmered with butter and stone-ground cornmeal flatbread', badge: 'Winter Classic' },
      { name: 'Malai Lassi', description: 'Thick chilled yogurt drink topped with a generous dollop of fresh clotted cream', badge: 'Heritage Drink' },
    ],
    curatedCircuits: [
      {
        title: '3-Day Amritsar Spiritual Soul & Food Walk',
        duration: '3 Days',
        pace: 'Cultural Immersion',
        highlights: ['Harmandir Sahib midnight Palki Sahib ritual', 'Guru Ka Langar community kitchen volunteering', 'Heritage walled city street culinary loop'],
      },
    ],
    siteCount: 42,
    guildCount: 15,
    region: 'North India',
  },

  'Uttarakhand': {
    stateId: 'uttarakhand',
    name: 'Uttarakhand',
    tagline: 'Holy River Confluences, Sacred Oak Forests, and Kumaoni Stone Villages',
    heroImage: 'https://images.unsplash.com/photo-1506485338023-6ce5f36692df?q=80&w=1200&auto=format&fit=crop',
    bestMonths: 'March to June (Summer clear views) or September to November (Autumn peaks)',
    currentWeather: '19°C : Mountain Air & Forest Scent',
    popularPlaces: ['Rishikesh & Haridwar Ganga Ghats', 'Almora & Binsar Sanctuary', 'Valley of Flowers & Hemkund'],
    iconicFlavors: [
      { name: 'Kafli', description: 'Iron kadhai braised spinach and fenugreek puree thickened with rice paste', badge: 'Pahari Superfood' },
      { name: 'Aloo Ke Gutke', description: 'Himalayan mountain potatoes fried with aromatic jamboo and red chilies', badge: 'Village Classic' },
      { name: 'Bal Mithai', description: 'Fudge confection coated with crunchy white sugar pearls from Almora', badge: 'Kumaoni Specialty' },
    ],
    curatedCircuits: [
      {
        title: '3-Day Rishikesh Yoga & Sacred River Circuit',
        duration: '3 Days',
        pace: 'Wellness & Culture',
        highlights: ['Parmarth Niketan sunset Ganga aarti', 'Beatles Ashram forest graffiti trail', 'Hidden Neer Garh mountain waterfall trek'],
      },
    ],
    siteCount: 41,
    guildCount: 14,
    region: 'North India',
  },

  'Goa': {
    stateId: 'goa',
    name: 'Goa',
    tagline: 'Baroque Whitewashed Cathedrals, Latin Quarter Mansions, and Kokum Spices',
    heroImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1200&auto=format&fit=crop',
    bestMonths: 'November to February (Breezy coastal winter & cultural fiestas)',
    currentWeather: '30°C : Sea Salt & Coconut Palm Breeze',
    popularPlaces: ['Fontainhas Latin Quarters', 'Old Goa Basilica of Bom Jesus', 'Divar Island Estuary Villages'],
    iconicFlavors: [
      { name: 'Goan Fish Curry Rice', description: 'Tangy coconut milk and tefla berry curry served over parboiled red rice', badge: 'Coastal Soul' },
      { name: 'Pork Vindaloo', description: 'Slow simmered pork marinated in palm vinegar, garlic, and Kashmiri red chilies', badge: 'Portuguese Legacy' },
      { name: 'Bebinca', description: 'Seven-layered baked pudding made with coconut milk, egg yolk, and nutmeg', badge: 'Classic Dessert' },
    ],
    curatedCircuits: [
      {
        title: '3-Day Old Goa & Fontainhas Heritage Walk',
        duration: '3 Days',
        pace: 'Relaxed Walking',
        highlights: ['Fontainhas pastel Portuguese tile mansions', 'Divar Island heritage ferry crossing', 'Spice plantation authentic lunch and tasting'],
      },
    ],
    siteCount: 36,
    guildCount: 12,
    region: 'West India',
  },

  'Madhya Pradesh': {
    stateId: 'madhya-pradesh',
    name: 'Madhya Pradesh',
    tagline: 'Khajuraho Sandstone Erotica, Sanchi Stupa Peace, and Gwalior Palaces',
    heroImage: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=1200&auto=format&fit=crop',
    bestMonths: 'October to March (Cool safari weather & temple walking comfort)',
    currentWeather: '25°C : Warm Inland Afternoon',
    popularPlaces: ['Khajuraho Western Temples', 'Sanchi Buddhist Great Stupa', 'Gwalior Fort & Jai Vilas Palace'],
    iconicFlavors: [
      { name: 'Bhutte Ka Kees', description: 'Grated fresh corn tempered with mustard, milk, and freshly scraped coconut', badge: 'Malwa Street Food' },
      { name: 'Poha Jalebi', description: 'Steamed flattened rice spiced with jeeravan and topped with crisp sev and hot jalebi', badge: 'Breakfast Staple' },
      { name: 'Dal Bafla', description: 'Boiled then wood-charcoal baked wheat rolls soaked in ghee with spicy dal', badge: 'Heritage Meal' },
    ],
    curatedCircuits: [
      {
        title: '3-Day Khajuraho & Orchha Medieval Palaces',
        duration: '3 Days',
        pace: 'Architectural Focus',
        highlights: ['Chandela stone sculpting mastery tour', 'Betwa River cenotaphs at dusk', 'Chanderi handloom saree weavers visit'],
      },
    ],
    siteCount: 54,
    guildCount: 20,
    region: 'Central India',
  },

  'Odisha': {
    stateId: 'odisha',
    name: 'Odisha',
    tagline: 'Konark Sun Stone Chariots, Raghurajpur Pattachitra, and Jagannath Rhythms',
    heroImage: '/assets/states/odisha.jpg',
    bestMonths: 'October to March (Pleasant coastal breezes & classical dance festivals)',
    currentWeather: '27°C : Coastal Warmth & Ocean Air',
    popularPlaces: ['Konark Sun Temple', 'Puri Jagannath Grand Road', 'Bhubaneswar Lingaraj Temple'],
    iconicFlavors: [
      { name: 'Chhena Poda', description: 'Caramelized cottage cheese cake baked overnight in sal leaves until crusty brown', badge: 'State Sweet' },
      { name: 'Dalma', description: 'Nutritious lentil and raw papaya stew tempered with panch phoron and ghee', badge: 'Temple Classic' },
      { name: 'Chhena Jhili', description: 'Golden fried fresh cheese dumplings soaked in light cardamom syrup', badge: 'Nimapada Treat' },
    ],
    curatedCircuits: [
      {
        title: '3-Day Golden Triangle & Artisan Villages',
        duration: '3 Days',
        pace: 'Artisan Focus',
        highlights: ['Konark stone celestial musicians tour', 'Raghurajpur master Pattachitra village', 'Pipli applique craft market'],
      },
    ],
    siteCount: 47,
    guildCount: 19,
    region: 'East India',
  },

  'Assam': {
    stateId: 'assam',
    name: 'Assam',
    tagline: 'Brahmaputra River Valleys, Golden Muga Silks, and Rhinoceros Sanctuaries',
    heroImage: 'https://images.unsplash.com/photo-1598894000396-bc4878a25c64?q=80&w=1200&auto=format&fit=crop',
    bestMonths: 'November to April (Kaziranga wildlife open & clear tea garden skies)',
    currentWeather: '23°C : Fresh River Mist',
    popularPlaces: ['Kaziranga National Park', 'Majuli River Island Satras', 'Kamakhya Temple Hilltop'],
    iconicFlavors: [
      { name: 'Masor Tenga', description: 'Light tangy freshwater fish broth stewed with elephant apple or wild tomatoes', badge: 'Assamese Soul' },
      { name: 'Khaar', description: 'Traditional alkaline preparation filtered through sun-dried charred banana peel ashes', badge: 'Ancient Dish' },
      { name: 'Pitha', description: 'Steamed or toasted rice flour rolls stuffed with sesame seeds and grated jaggery', badge: 'Bihu Festival' },
    ],
    curatedCircuits: [
      {
        title: '3-Day Majuli Island & Vaishnavite Satra Trail',
        duration: '3 Days',
        pace: 'Peaceful Cultural',
        highlights: ['Monastic bamboo mask-making guild', 'Traditional Mishing tribe stilt-village dinner', 'Sunset over the sacred Brahmaputra'],
      },
    ],
    siteCount: 39,
    guildCount: 16,
    region: 'Northeast',
  },

  'Delhi': {
    stateId: 'delhi',
    name: 'Delhi',
    tagline: 'Eight Historic Cities, Mughal Stone Citadels, and Chandni Chowk Spices',
    heroImage: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=1200&auto=format&fit=crop',
    bestMonths: 'October to March (Pleasant sunny days & cool historical walks)',
    currentWeather: '24°C : Bright Afternoon Sun',
    popularPlaces: ['Humayun Tomb & Nizamuddin', 'Chandni Chowk & Jama Masjid', 'Qutb Minar Complex & Mehrauli'],
    iconicFlavors: [
      { name: 'Butter Chicken & Naan', description: 'Charred tandoori chicken simmered in silky tomato, makhana, and fenugreek gravy', badge: 'Delhi Original' },
      { name: 'Old Delhi Chaat', description: 'Crisp papdi with sweet yogurt, tamarind saunth, and roasted cumin', badge: 'Street Icon' },
      { name: 'Daulat Ki Chaat', description: 'Airy winter milk foam churned under moonlight and dusted with saffron pistachios', badge: 'Seasonal Magic' },
    ],
    curatedCircuits: [
      {
        title: '2-Day Seven Cities of Delhi Architectural Loop',
        duration: '2 Days',
        pace: 'Active Heritage',
        highlights: ['Humayun Tomb garden symmetry', 'Mehrauli Archaeological Park stepwell walk', 'Nizamuddin Dargah evening Qawwali'],
      },
    ],
    siteCount: 62,
    guildCount: 22,
    region: 'North India',
  },

  'Telangana': {
    stateId: 'telangana',
    name: 'Telangana',
    tagline: 'Charminar Pearls, Kakatiya Stone Toranas, and Dum Biryani Heritage',
    heroImage: '/assets/states/telangana.jpg',
    bestMonths: 'October to February (Moderate weather & cultural celebrations)',
    currentWeather: '28°C : Warm Sunlight',
    popularPlaces: ['Golconda Fort Acoustic Ramparts', 'Charminar & Laad Bazaar', 'Warangal Thousand Pillar Temple'],
    iconicFlavors: [
      { name: 'Hyderabadi Dum Biryani', description: 'Raw marinated meat and fragrant aged basmati cooked in sealed dough degh', badge: 'Culinary Masterpiece' },
      { name: 'Mirchi Ka Salan', description: 'Large bhavnagri chilies stewed in roasted peanut, sesame, and tamarind gravy', badge: 'Biryani Partner' },
      { name: 'Double Ka Meetha', description: 'Fried milk bread soaked in saffron infused condensed milk and toasted nuts', badge: 'Nawabi Dessert' },
    ],
    curatedCircuits: [
      {
        title: '3-Day Hyderabad Nizami Heritage & Craft Circuit',
        duration: '3 Days',
        pace: 'Balanced Walking',
        highlights: ['Golconda sound echo engineering walk', 'Laad Bazaar lacquer bangle craftsmen', 'Chowmahalla Palace vintage car and clock gallery'],
      },
    ],
    siteCount: 45,
    guildCount: 17,
    region: 'South India',
  },

  'Andhra Pradesh': {
    stateId: 'andhra-pradesh',
    name: 'Andhra Pradesh',
    tagline: 'Tirupati Temple Spire Vistas, Kalamkari Hand-Painting, and Coromandel Coasts',
    heroImage: 'https://images.unsplash.com/photo-1600100397608-f010f443831b?q=80&w=1200&auto=format&fit=crop',
    bestMonths: 'October to March (Pleasant coastal breezes)',
    currentWeather: '29°C : Sunny Coastal Air',
    popularPlaces: ['Tirumala Venkateswara Temple', 'Lepakshi Hanging Pillar Temple', 'Borra Caves & Araku Coffee Valley'],
    iconicFlavors: [
      { name: 'Gongura Mutton', description: 'Fiery mutton braised with sour sorrel leaves and red Guntur chilies', badge: 'Andhra Pride' },
      { name: 'Pesarattu Upma', description: 'Whole green moong dal crepe stuffed with seasoned ginger semolina upma', badge: 'Breakfast Classic' },
      { name: 'Pootharekulu', description: 'Ultra-thin translucent rice paper rolls stuffed with powdered sugar and ghee', badge: 'Paper Sweet' },
    ],
    curatedCircuits: [
      {
        title: '3-Day Lepakshi & Srikalahasti Kalamkari Circuit',
        duration: '3 Days',
        pace: 'Craft & Art',
        highlights: ['Lepakshi monolithic Nandi bull', 'Srikalahasti natural vegetable dye Kalamkari artists', 'Chandragiri Fort ramparts'],
      },
    ],
    siteCount: 46,
    guildCount: 16,
    region: 'South India',
  },

  'Sikkim': {
    stateId: 'sikkim',
    name: 'Sikkim',
    tagline: 'Kanchenjunga Glacial Vistas, Red Panda Sanctuaries, and Buddhist Monasteries',
    heroImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop',
    bestMonths: 'March to May (Rhododendron blooms) or October to December (Clear mountain views)',
    currentWeather: '14°C : Crisp Alpine Mountain Air',
    popularPlaces: ['Rumtek Dharma Chakra Centre', 'Gurudongmar Sacred Alpine Lake', 'Pelling & Pemayangtse Monastery'],
    iconicFlavors: [
      { name: 'Momos & Gundruk', description: 'Steamed handmade dumplings accompanied by fermented leafy vegetable soup', badge: 'Himalayan Comfort' },
      { name: 'Phagshapa', description: 'Pork strips cooked with dried red chilies and radishes without oil', badge: 'Traditional Stew' },
      { name: 'Chhurpi Soup', description: 'Warm herbaceous soup made from local fermented yak milk cheese', badge: 'Highland Specialty' },
    ],
    curatedCircuits: [
      {
        title: '3-Day Gangtok & Rumtek Spiritual Haven',
        duration: '3 Days',
        pace: 'Tranquil Pace',
        highlights: ['Rumtek Golden Stupa prayer ritual', 'Namgyal Institute of Tibetology', 'Enchey Monastery sacred cham dance grounds'],
      },
    ],
    siteCount: 34,
    guildCount: 12,
    region: 'Northeast',
  },

  'Meghalaya': {
    stateId: 'meghalaya',
    name: 'Meghalaya',
    tagline: 'Living Root Bridges, Cloud-Crowned Canyons, and Khasi Sacred Groves',
    heroImage: 'https://images.unsplash.com/photo-1627894006066-b45786443c2c?q=80&w=1200&auto=format&fit=crop',
    bestMonths: 'October to April (Dry trekking paths & crystal clear river waters)',
    currentWeather: '17°C : Cool Mountain Mist',
    popularPlaces: ['Nongriat Double Decker Living Root Bridge', 'Dawki Umngot Transparent River', 'Mawlynnong & Mawphlang Sacred Grove'],
    iconicFlavors: [
      { name: 'Jadoh', description: 'Fragrant upland rice cooked in pork or chicken broth with black sesame paste', badge: 'Khasi Staple' },
      { name: 'Dohneiiong', description: 'Slow-simmered pork curry made with roasted indigenous black sesame seed paste', badge: 'Heritage Gravy' },
      { name: 'Pukhlein', description: 'Crispy fried sweet bread made from fermented rice flour and golden jaggery', badge: 'Tea Snack' },
    ],
    curatedCircuits: [
      {
        title: '3-Day Cherrapunji Living Root Bridges Trek',
        duration: '3 Days',
        pace: 'Active Trekking',
        highlights: ['Centuries-old rubber tree root bridges', 'Rainbow Falls natural emerald pool', 'Mawphlang ancient sacred forest walk'],
      },
    ],
    siteCount: 31,
    guildCount: 10,
    region: 'Northeast',
  },

  'Bihar': {
    stateId: 'bihar',
    name: 'Bihar',
    tagline: 'Bodhi Tree Enlightenment Grounds, Nalanda Ruins, and Madhubani Painting',
    heroImage: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=1200&auto=format&fit=crop',
    bestMonths: 'October to March (Pleasant winter weather & spiritual pilgrim season)',
    currentWeather: '25°C : Gentle Plains Sunshine',
    popularPlaces: ['Mahabodhi Temple Bodh Gaya', 'Nalanda Ancient University Ruins', 'Rajgir Vulture Peak & Ropeway'],
    iconicFlavors: [
      { name: 'Litti Chokha', description: 'Roasted whole wheat balls filled with spiced sattu served with fire-charred eggplant', badge: 'Cultural Pride' },
      { name: 'Khaja', description: 'Multi-layered flaky pastry soaked in light sugar syrup from Silao', badge: 'Ancient Sweet' },
      { name: 'Sattu Sharbat', description: 'Cooling drink of roasted chickpea flour with roasted cumin, green chili, and black salt', badge: 'Nutritional Elixir' },
    ],
    curatedCircuits: [
      {
        title: '3-Day Buddhist Circuit & Nalanda Scholarship',
        duration: '3 Days',
        pace: 'Reflective Pace',
        highlights: ['Bodh Gaya sacred Bodhi tree meditation', 'Nalanda red-brick monastery excavations', 'Madhubani painting village artist home'],
      },
    ],
    siteCount: 38,
    guildCount: 14,
    region: 'East India',
  },

  'Jharkhand': {
    stateId: 'jharkhand',
    name: 'Jharkhand',
    tagline: 'Sal Canopy Wilderness, Terraced Waterfalls, and Sohrai Tribal Murals',
    heroImage: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=1200&auto=format&fit=crop',
    bestMonths: 'October to March (Cascading waterfalls & cool tribal festivals)',
    currentWeather: '24°C : Plateau Forest Air',
    popularPlaces: ['Hundru & Dassam Waterfalls', 'Betla National Park', 'Baidyanath Dham Deoghar'],
    iconicFlavors: [
      { name: 'Dhuska with Ghugni', description: 'Crisp deep-fried rice and chana dal batter pancakes served with black gram curry', badge: 'Tribal Classic' },
      { name: 'Rugra Curry', description: 'Indigenous forest mushroom stew cooked with whole mustard and green chili', badge: 'Monsoon Foraged' },
      { name: 'Malpua', description: 'Spiced sweet pancakes fried in pure ghee and dipped in cardamom sugar syrup', badge: 'Festival Dessert' },
    ],
    curatedCircuits: [
      {
        title: '3-Day Hazaribagh Sohrai & Khovar Art Trail',
        duration: '3 Days',
        pace: 'Artisan Immersion',
        highlights: ['Indigenous mud house wall murals', 'Sal forest canopy drives', 'Ancient stone-age rock art sites'],
      },
    ],
    siteCount: 29,
    guildCount: 11,
    region: 'East India',
  },

  'Chhattisgarh': {
    stateId: 'chhattisgarh',
    name: 'Chhattisgarh',
    tagline: 'Bastar Bell-Metal Casting, Chitrakote Waterfalls, and Tribal Haats',
    heroImage: '/assets/states/chhattisgarh.jpg',
    bestMonths: 'October to March (Cool river season & vibrant weekly weekly haats)',
    currentWeather: '26°C : Pleasant Forest Warmth',
    popularPlaces: ['Chitrakote Niagara of India Waterfalls', 'Bastar Tribal Craft Guilds', 'Sirpur Ancient Buddhist Temples'],
    iconicFlavors: [
      { name: 'Chila with Tomato Chutney', description: 'Nutritious rice flour flatbread with fresh garlic and charred green tomato dip', badge: 'Village Breakfast' },
      { name: 'Fara', description: 'Steamed rice dumplings tempered with curry leaves, mustard seeds, and roasted sesame', badge: 'Healthy Snack' },
      { name: 'Mahuwa Drink & Sweets', description: 'Aromatic flower liquor and roasted dry mahuwa cakes from the Bastar forests', badge: 'Forest Harvest' },
    ],
    curatedCircuits: [
      {
        title: '3-Day Bastar Lost-Wax Brass & Waterfall Loop',
        duration: '3 Days',
        pace: 'Artisan Focus',
        highlights: ['Dhokra lost-wax bell-metal casting family home', 'Chitrakote falls sunset spray', 'Weekly tribal terracotta marketplace'],
      },
    ],
    siteCount: 32,
    guildCount: 15,
    region: 'Central India',
  },

  'Haryana': {
    stateId: 'haryana',
    name: 'Haryana',
    tagline: 'Kurukshetra Battlefield Echoes, Pinjore Mughal Gardens, and Surajkund Crafts',
    heroImage: '/assets/states/haryana.jpg',
    bestMonths: 'October to March (Pleasant winter breeze & Surajkund Mela)',
    currentWeather: '24°C : Crisp Northern Sunshine',
    popularPlaces: ['Brahma Sarovar Kurukshetra', 'Pinjore Yadavindra Gardens', 'Sultanpur Bird Sanctuary'],
    iconicFlavors: [
      { name: 'Bajra Khichdi', description: 'Crushed pearl millet slow-cooked with split moong and topped with fresh white butter', badge: 'Winter Nourishment' },
      { name: 'Kadhi Pakora', description: 'Gram flour dumplings simmered in sour spiced buttermilk curry with fenugreek', badge: 'Daily Feast' },
      { name: 'Singri Ki Sabzi', description: 'Desert beans cooked with dried mango, yogurt, and whole spices', badge: 'Rustic Dish' },
    ],
    curatedCircuits: [
      {
        title: '2-Day Kurukshetra & Pinjore Mughal Garden Loop',
        duration: '2 Days',
        pace: 'Balanced Pace',
        highlights: ['Brahma Sarovar reflection walk', 'Terraced 17th century Pinjore fountains', 'Heritage haveli culinary stop'],
      },
    ],
    siteCount: 28,
    guildCount: 9,
    region: 'North India',
  },

  'Chandigarh': {
    stateId: 'chandigarh',
    name: 'Chandigarh',
    tagline: 'Le Corbusier Modernist Geometry, Nek Chand Rock Garden, and Sukhna Lake',
    heroImage: '/assets/states/chandigarh.jpg',
    bestMonths: 'October to March (Rose festival & crisp lake breezes)',
    currentWeather: '23°C : Fresh Northern Air',
    popularPlaces: ['Nek Chand Rock Garden', 'Capitol Complex Le Corbusier', 'Sukhna Lake Promenade'],
    iconicFlavors: [
      { name: 'Amritsari Kulcha with Chana', description: 'Crisp layered tandoori flatbread with tangy chickpeas and butter', badge: 'City Favorite' },
      { name: 'Tandoori Murgh', description: 'Clay-oven charred whole chicken infused with mustard oil and Kashmiri chili', badge: 'Grilled Classic' },
      { name: 'Kulfi Falooda', description: 'Dense saffron pistachio ice cream served on chilled vermicelli noodles', badge: 'Dessert Icon' },
    ],
    curatedCircuits: [
      {
        title: '2-Day Modernist Architecture & Sculptural Wonders',
        duration: '2 Days',
        pace: 'Design & Walk',
        highlights: ['Nek Chand scrap ceramic sculpture labyrinth', 'Open Hand monument plaza', 'Sukhna lake sunrise walk'],
      },
    ],
    siteCount: 22,
    guildCount: 8,
    region: 'North India',
  },

  'Arunachal Pradesh': {
    stateId: 'arunachal-pradesh',
    name: 'Arunachal Pradesh',
    tagline: 'Tawang Glacier Passes, Monpa Wood Carving, and Orchid Forest Valleys',
    heroImage: 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?q=80&w=1200&auto=format&fit=crop',
    bestMonths: 'October to April (Crisp mountain air & Tawang Torgya festival)',
    currentWeather: '13°C : Highland Alpine Chill',
    popularPlaces: ['Tawang Monastery & Sela Pass', 'Ziro Valley Pine Groves', 'Namdapha Rainforest Sanctuary'],
    iconicFlavors: [
      { name: 'Pika Pila', description: 'Traditional pickle made with bamboo shoot, pork fat, and hot mountain chilies', badge: 'Tribal Specialty' },
      { name: 'Lukter', description: 'Sun-dried tender beef or pork tossed with flakes of bhut jolokia ghost chili', badge: 'Spicy Delicacy' },
      { name: 'Apong (Rice Beer)', description: 'Traditional fermented sweet rice drink brewed inside charred bamboo stems', badge: 'Community Brew' },
    ],
    curatedCircuits: [
      {
        title: '4-Day Tawang Monastery & Sela Pass Trail',
        duration: '4 Days',
        pace: 'Mountain Journey',
        highlights: ['17th century Tawang Buddhist monastery', 'Sela Pass high alpine lake at 13,700 ft', 'Monpa handmade paper-making village'],
      },
    ],
    siteCount: 29,
    guildCount: 9,
    region: 'Northeast',
  },

  'Nagaland': {
    stateId: 'nagaland',
    name: 'Nagaland',
    tagline: 'Hornbill Warrior Lore, Dzukou Valley Lilies, and Bamboo Architectural Guilds',
    heroImage: 'https://images.unsplash.com/photo-1609137144822-77765103a838?q=80&w=1200&auto=format&fit=crop',
    bestMonths: 'October to May (Hornbill Festival & clear hiking seasons)',
    currentWeather: '17°C : Cool Ridge Breeze',
    popularPlaces: ['Kohima War Heritage & Cathedral', 'Kisama Heritage Village', 'Dzukou Valley Trek'],
    iconicFlavors: [
      { name: 'Smoked Pork with Axone', description: 'Wood-smoked pork stewed with fermented soybeans and king chili', badge: 'Naga Signature' },
      { name: 'Bamboo Shoot Fish', description: 'Fresh river fish cooked with fermented bamboo shoots and fresh herbs', badge: 'Ridge Classic' },
      { name: 'Zutho', description: 'Traditional frothy fermented rice brew served in carved bamboo tumblers', badge: 'Celebration Drink' },
    ],
    curatedCircuits: [
      {
        title: '3-Day Kohima & Khonoma Green Village Loop',
        duration: '3 Days',
        pace: 'Eco Heritage',
        highlights: ['Khonoma 700-year-old terraced agriculture', 'Angami warrior shawl weavers', 'Kohima heritage walk and marketplace'],
      },
    ],
    siteCount: 26,
    guildCount: 11,
    region: 'Northeast',
  },

  'Manipur': {
    stateId: 'manipur',
    name: 'Manipur',
    tagline: 'Floating Phumdis on Loktak Lake, Kangla Fort, and Classical Raas Dances',
    heroImage: '/assets/states/manipur.jpg',
    bestMonths: 'October to March (Pleasant lake breezes & Sangai Festival)',
    currentWeather: '20°C : Fresh Valley Sunlight',
    popularPlaces: ['Loktak Lake Floating National Park', 'Kangla Fort Ancient Palace', 'Ima Keithel All-Women Market'],
    iconicFlavors: [
      { name: 'Kangshoi', description: 'Healthy vegetable stew flavored with dried fermented fish and herbs', badge: 'Home Staple' },
      { name: 'Eromba', description: 'Mashed boiled vegetables and fermented ngari fish garnished with fragrant herbs', badge: 'Traditional Dish' },
      { name: 'Chak-Hao Kheer', description: 'Aromatic deep purple black rice pudding cooked in rich milk and cardamom', badge: 'Royal Dessert' },
    ],
    curatedCircuits: [
      {
        title: '3-Day Loktak Lake & Ima Keithel Women Market',
        duration: '3 Days',
        pace: 'Cultural Immersion',
        highlights: ['World only floating lake homestay', 'Ima Keithel 500-year-old women-run market', 'Andro pottery ancient village fire ritual'],
      },
    ],
    siteCount: 25,
    guildCount: 10,
    region: 'Northeast',
  },

  'Mizoram': {
    stateId: 'mizoram',
    name: 'Mizoram',
    tagline: 'Emerald Bamboo Ridges, Cheraw Bamboo Dance, and Blue Mountain Peaks',
    heroImage: '/assets/states/mizoram.jpg',
    bestMonths: 'October to March (Chapchar Kut festivals & clear hillside vistas)',
    currentWeather: '19°C : Crisp Hill Air',
    popularPlaces: ['Aizawl Mountain City', 'Reiek Tlang Heritage Peak', 'Phawngpui Blue Mountain'],
    iconicFlavors: [
      { name: 'Bai', description: 'Nutritious steamed seasonal greens cooked with pork and bamboo shoots without spices', badge: 'Mizo Soul' },
      { name: 'Vawksa Rep', description: 'Wood-smoked seasoned pork tossed with fresh wild mountain herbs and mustard leaves', badge: 'Smoked Classic' },
      { name: 'Koat Pitha', description: 'Crispy sweet banana and rice flour fritters fried in fresh mustard oil', badge: 'Traditional Snack' },
    ],
    curatedCircuits: [
      {
        title: '3-Day Aizawl & Reiek Mizo Cultural Experience',
        duration: '3 Days',
        pace: 'Nature & Village',
        highlights: ['Reiek traditional Mizo model village', 'Solomon Temple architecture', 'Bara Bazar handloom Puan weaving market'],
      },
    ],
    siteCount: 24,
    guildCount: 8,
    region: 'Northeast',
  },

  'Tripura': {
    stateId: 'tripura',
    name: 'Tripura',
    tagline: 'Neermahal Water Palace, Unakoti Rock-Cut Reliefs, and Cane Bamboo Masters',
    heroImage: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=1200&auto=format&fit=crop',
    bestMonths: 'October to March (Pleasant winter weather & cultural fairs)',
    currentWeather: '22°C : Warm Gentle Breeze',
    popularPlaces: ['Ujjayanta Palace Agartala', 'Neermahal Water Palace', 'Unakoti Colossal Rock Sculptures'],
    iconicFlavors: [
      { name: 'Mui Borok', description: 'Traditional dish centered on berma fermented fish cooked with organic vegetables', badge: 'Indigenous Flavor' },
      { name: 'Chakhwi', description: 'Bamboo shoot and pork preparation cooked with natural alkaline wood ash water', badge: 'Heritage Stew' },
      { name: 'Bhangui', description: 'Aromatic sun-dried sticky rice steamed in banana leaf cones with ginger and ghee', badge: 'Rice Delicacy' },
    ],
    curatedCircuits: [
      {
        title: '3-Day Unakoti Rock Carvings & Neermahal Lake Palace',
        duration: '3 Days',
        pace: 'Historical Exploration',
        highlights: ['Colossal 8th century carved Shiva face on rock mountain', 'Neermahal water boat crossing', 'Ujjayanta royal museum tour'],
      },
    ],
    siteCount: 26,
    guildCount: 10,
    region: 'Northeast',
  },

  'Puducherry': {
    stateId: 'puducherry',
    name: 'Puducherry',
    tagline: 'French Colonial Quarters, Auroville Matrimandir, and Coromandel Promenades',
    heroImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1200&auto=format&fit=crop',
    bestMonths: 'October to March (Cool ocean breezes & outdoor walking comfort)',
    currentWeather: '28°C : Seaside Breeze',
    popularPlaces: ['White Town French Quarter', 'Auroville Golden Sphere Matrimandir', 'Promenade Beach Waterfront'],
    iconicFlavors: [
      { name: 'Creole Fish Curry', description: 'French-Tamil coastal curry with coconut milk, aniseed, and wild green chilies', badge: 'Franco-Tamil' },
      { name: 'Baguette with Camembert', description: 'Freshly baked artisanal French baguettes with imported and Auroville cheeses', badge: 'French Legacy' },
      { name: 'Pondicherry Prawn Masala', description: 'Fresh Coromandel prawns tossed with shallots, curry leaves, and crushed peppercorns', badge: 'Seafood Favorite' },
    ],
    curatedCircuits: [
      {
        title: '2-Day White Town Architecture & Auroville Discovery',
        duration: '2 Days',
        pace: 'Leisurely Walk',
        highlights: ['Mustard-yellow French colonial street stroll', 'Auroville sustainable community workshops', 'Sunset bicycle tour along Goubert Avenue'],
      },
    ],
    siteCount: 28,
    guildCount: 9,
    region: 'South India',
  },

  'Andaman and Nicobar Islands': {
    stateId: 'andaman-and-nicobar-islands',
    name: 'Andaman and Nicobar Islands',
    tagline: 'Coral Atolls, Cellular Jail History, and Pristine Radhanagar Sands',
    heroImage: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=1200&auto=format&fit=crop',
    bestMonths: 'November to May (Calm turquoise waters & sunny island skies)',
    currentWeather: '29°C : Warm Tropical Sea Breeze',
    popularPlaces: ['Cellular Jail National Memorial', 'Radhanagar Beach Havelock', 'Ross Island Colonial Ruins'],
    iconicFlavors: [
      { name: 'Tawa Fish Fry', description: 'Fresh red snapper marinated in local island spices and shallow fried in coconut oil', badge: 'Island Catch' },
      { name: 'Coconut Prawn Curry', description: 'Sweet bay prawns simmered in freshly squeezed coconut milk with green chilies', badge: 'Island Specialty' },
      { name: 'Tropical Fruit Platters', description: 'Wild island papayas, pineapples, and sweet bananas garnished with lime', badge: 'Fresh Harvest' },
    ],
    curatedCircuits: [
      {
        title: '3-Day Havelock Coral & Ross Island Ruins',
        duration: '3 Days',
        pace: 'Island Relaxation',
        highlights: ['Cellular Jail light and sound historical tribute', 'Radhanagar beach rated top in Asia', 'Ross Island banyan root engulfed colonial church'],
      },
    ],
    siteCount: 24,
    guildCount: 7,
    region: 'South India',
  },

  'Lakshadweep': {
    stateId: 'lakshadweep',
    name: 'Lakshadweep',
    tagline: 'Turquoise Coral Lagoons, Coir Artisan Guilds, and Island Solitude',
    heroImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop',
    bestMonths: 'October to May (Crystal clear waters & calm ocean boating)',
    currentWeather: '30°C : Gentle Lagoon Breeze',
    popularPlaces: ['Agatti Island Lagoon', 'Bangaram Coral Atoll', 'Kavaratti Marine Aquarium'],
    iconicFlavors: [
      { name: 'Tuna Curry with Parotta', description: 'Line-caught yellowfin tuna braised in coconut milk with curry leaves and fennel', badge: 'Lagoon Catch' },
      { name: 'Rayereha', description: 'Red spicy fish curry cooked with dried tamarind and roasted island spices', badge: 'Traditional Dish' },
      { name: 'Kadala Halwa', description: 'Sweet confection made with chickpeas, coconut milk, and jaggery', badge: 'Sweet Treat' },
    ],
    curatedCircuits: [
      {
        title: '3-Day Bangaram & Agatti Coral Lagoon Experience',
        duration: '3 Days',
        pace: 'Lagoon Serenity',
        highlights: ['Shipwreck coral reef snorkeling', 'Traditional coir twisting village walk', 'Starlight lagoon boat drifting'],
      },
    ],
    siteCount: 18,
    guildCount: 6,
    region: 'South India',
  },

  'Dadra and Nagar Haveli and Daman and Diu': {
    stateId: 'dadra-and-nagar-haveli-and-daman-and-diu',
    name: 'Dadra and Nagar Haveli and Daman and Diu',
    tagline: 'Portuguese Sea Forts, Palm-Fringed Coasts, and Warli Tribal Heritage',
    heroImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1200&auto=format&fit=crop',
    bestMonths: 'October to March (Cool Arabian sea breezes)',
    currentWeather: '27°C : Coastal Warmth',
    popularPlaces: ['Diu Fortress & St. Paul Church', 'Nani Daman Fort', 'Silvassa Tribal Cultural Museum'],
    iconicFlavors: [
      { name: 'Coqueiro Fish Curry', description: 'Goan-influenced fish curry with tamarind, grated coconut, and coriander seeds', badge: 'Coastal Specialty' },
      { name: 'Diu Crab Curry', description: 'Fresh mud crabs simmered in aromatic roasted spice broth', badge: 'Seafood Catch' },
      { name: 'Pappad and Chutneys', description: 'Locally hand-pressed lentil papads served with sweet and sour mango dips', badge: 'Traditional Accompaniment' },
    ],
    curatedCircuits: [
      {
        title: '2-Day Diu Coastal Fortress & Church Loop',
        duration: '2 Days',
        pace: 'Relaxed Walking',
        highlights: ['16th century ocean fortress ramparts', 'St. Paul Church baroque wood carvings', 'Ghoghla beach golden sunset stroll'],
      },
    ],
    siteCount: 22,
    guildCount: 7,
    region: 'West India',
  },
};

/**
 * Normalizes state names and retrieves the dossier with guaranteed fallback.
 */
export function getStateDossier(stateName: string): StateCulturalDossier {
  if (!stateName) return STATE_DOSSIERS['Rajasthan'];

  const normalized = stateName.trim().toLowerCase();

  // Direct key lookup
  for (const [key, dossier] of Object.entries(STATE_DOSSIERS)) {
    if (key.toLowerCase() === normalized || dossier.stateId === normalized) {
      return dossier;
    }
  }

  // Fuzzy matches
  if (normalized.includes('jammu') || normalized.includes('kashmir')) {
    return STATE_DOSSIERS['Jammu and Kashmir'];
  }
  if (normalized.includes('delhi')) {
    return STATE_DOSSIERS['Delhi'];
  }
  if (normalized.includes('bengal')) {
    return STATE_DOSSIERS['West Bengal'];
  }
  if (normalized.includes('tamil')) {
    return STATE_DOSSIERS['Tamil Nadu'];
  }
  if (normalized.includes('andhra')) {
    return STATE_DOSSIERS['Andhra Pradesh'];
  }
  if (normalized.includes('uttar')) {
    return STATE_DOSSIERS['Uttar Pradesh'];
  }
  if (normalized.includes('madhya')) {
    return STATE_DOSSIERS['Madhya Pradesh'];
  }
  if (normalized.includes('himachal')) {
    return STATE_DOSSIERS['Himachal Pradesh'];
  }
  if (normalized.includes('arunachal')) {
    return STATE_DOSSIERS['Arunachal Pradesh'];
  }
  if (normalized.includes('andaman')) {
    return STATE_DOSSIERS['Andaman and Nicobar Islands'];
  }
  if (normalized.includes('dadra') || normalized.includes('daman') || normalized.includes('diu')) {
    return STATE_DOSSIERS['Dadra and Nagar Haveli and Daman and Diu'];
  }

  // Return Rajasthan as safe default
  return STATE_DOSSIERS['Rajasthan'];
}
