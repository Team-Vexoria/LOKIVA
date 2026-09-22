export interface MicroCircuit {
  id: string;
  title: string;
  durationDays: number;
  durationLabel: string;
  baseCity: string;
  dailySpendEst: string;
  pacing: 'relaxed' | 'balanced' | 'packed';
  vibeTag: string;
  highlights: string[];
  description: string;
}

export interface StateMetadata {
  name: string;
  normalizedKey: string;
  region: 'North India' | 'South India' | 'West India' | 'East India' | 'Central India' | 'Northeast India' | 'Island Territories';
  primaryHub: string;
  teaser: string;
  sitesCount: number;
  guildsCount: number;
  signatureVibes: string[];
  bestSeason: string;
  circuits: MicroCircuit[];
}

export interface UserJourneyPreferences {
  rhythm: 'solo' | 'couple' | 'family' | 'cohort';
  durationTier: 'weekend' | 'circuit' | 'epic';
  pacing: 'relaxed' | 'balanced' | 'packed';
  vibe: 'temples' | 'crafts' | 'frontiers' | 'palaces';
  budgetDailyInr: number;
}

export const DEFAULT_JOURNEY_PREFERENCES: UserJourneyPreferences = {
  rhythm: 'couple',
  durationTier: 'circuit',
  pacing: 'balanced',
  vibe: 'crafts',
  budgetDailyInr: 4500,
};

export const INDIA_STATES_METADATA: Record<string, StateMetadata> = {
  'Rajasthan': {
    name: 'Rajasthan',
    normalizedKey: 'rajasthan',
    region: 'North India',
    primaryHub: 'Jaipur',
    teaser: 'Golden citadels, subterranean stepwells, and living hand-block printing guilds.',
    sitesCount: 48,
    guildsCount: 22,
    signatureVibes: ['Hidden master artisan guilds', 'Wild frontiers & stepwells', 'Royal palaces & culinary heritage'],
    bestSeason: 'October to March',
    circuits: [
      {
        id: 'raj-1',
        title: '3-Day Jaipur & Sanganer Hand-Block Print Trail',
        durationDays: 3,
        durationLabel: '3 Days • 2 Nights',
        baseCity: 'Jaipur',
        dailySpendEst: '₹3,500 / day',
        pacing: 'balanced',
        vibeTag: 'Artisan Craft Guilds',
        highlights: ['Sanganer natural indigo dye vats', 'Panna Meena Kund stepwell dawn walk', 'City Palace royal textile gallery'],
        description: 'Immerse in seven generations of master block carvers, organic mud resist dyeing, and private haveli studios.',
      },
      {
        id: 'raj-2',
        title: '5-Day Jodhpur & Jaisalmer Thar Frontier Odyssey',
        durationDays: 5,
        durationLabel: '5 Days • 4 Nights',
        baseCity: 'Jodhpur',
        dailySpendEst: '₹4,800 / day',
        pacing: 'relaxed',
        vibeTag: 'Wild Frontiers & Stepwells',
        highlights: ['Toorji Ka Jhalra stepwell architectural walk', 'Mehrangarh private ramparts at sunset', 'Living sandstone fort artist workshops'],
        description: 'Traverse the blue city cobblestones into the golden dunes with desert musician families and camel-caravan lore.',
      },
      {
        id: 'raj-3',
        title: '7-Day Royal Mewar Lakes & Miniature Guild Circuit',
        durationDays: 7,
        durationLabel: '7 Days • 6 Nights',
        baseCity: 'Udaipur',
        dailySpendEst: '₹6,200 / day',
        pacing: 'relaxed',
        vibeTag: 'Royal Palaces & Living Arts',
        highlights: ['Lake Pichola private ghat boat charter', 'Udaipur miniature squirrel-hair brush guild', 'Kumbhalgarh fortress ridge hike'],
        description: 'Grand lakeside courtyards, secluded Mewari culinary secrets, and private encounters with master stone-inlay sculptors.',
      },
    ],
  },
  'Uttar Pradesh': {
    name: 'Uttar Pradesh',
    normalizedKey: 'uttar pradesh',
    region: 'North India',
    primaryHub: 'Varanasi',
    teaser: 'Sacred river ghats, silk loom weavers, and Nawabi culinary dynasties.',
    sitesCount: 54,
    guildsCount: 26,
    signatureVibes: ['Sacred rituals & living temples', 'Hidden master artisan guilds', 'Royal palaces & culinary heritage'],
    bestSeason: 'October to March',
    circuits: [
      {
        id: 'up-1',
        title: '4-Day Sacred Varanasi & Weaver Guilds',
        durationDays: 4,
        durationLabel: '4 Days • 3 Nights',
        baseCity: 'Varanasi',
        dailySpendEst: '₹3,200 / day',
        pacing: 'relaxed',
        vibeTag: 'Sacred Ghats & Silk Guilds',
        highlights: ['Manikarnika and Dashashwamedh dawn rowing', 'Madanpura master Katan silk handlooms', 'Sarnath deer park quiet meditation'],
        description: 'Wake to temple conch resonance, navigate labyrinthine alleys of weaver ustads, and witness celestial Ganga Aarti.',
      },
      {
        id: 'up-2',
        title: '3-Day Lucknow Nawabi Heritage & Chikan Embroidery',
        durationDays: 3,
        durationLabel: '3 Days • 2 Nights',
        baseCity: 'Lucknow',
        dailySpendEst: '₹3,800 / day',
        pacing: 'balanced',
        vibeTag: 'Royal Palaces & Culinary Heritage',
        highlights: ['Bara Imambara acoustical labyrinth', 'Chowk old-city shadow-work embroidery houses', 'Legendary Tunday Kababi heritage degustation'],
        description: 'Aristocratic Adaa etiquette, centuries-old perfumers (Attar), and exquisite shadow-stitch needles crafted by women artisans.',
      },
      {
        id: 'up-3',
        title: '6-Day Braj & Yamuna Sacred Pilgrimage Circuit',
        durationDays: 6,
        durationLabel: '6 Days • 5 Nights',
        baseCity: 'Vrindavan',
        dailySpendEst: '₹2,900 / day',
        pacing: 'relaxed',
        vibeTag: 'Sacred Rituals & Living Temples',
        highlights: ['Vrindavan Govind Dev Ji ancient red sandstone temple', 'Kusum Sarovar stepwell peaceful pavilions', 'Mathura Sanjhi paper-stencil art guild'],
        description: 'Follow the gentle river path, participate in devotional community feasts, and witness delicate floral stencil traditions.',
      },
    ],
  },
  'Kerala': {
    name: 'Kerala',
    normalizedKey: 'kerala',
    region: 'South India',
    primaryHub: 'Kochi',
    teaser: 'Emerald palm backwaters, ancient spice ports, and Kathakali makeup guilds.',
    sitesCount: 42,
    guildsCount: 18,
    signatureVibes: ['Sacred rituals & living temples', 'Hidden master artisan guilds', 'Wild frontiers & stepwells'],
    bestSeason: 'September to March',
    circuits: [
      {
        id: 'ker-1',
        title: '3-Day Fort Kochi Heritage & Jewish Town Spice Trails',
        durationDays: 3,
        durationLabel: '3 Days • 2 Nights',
        baseCity: 'Kochi',
        dailySpendEst: '₹3,600 / day',
        pacing: 'balanced',
        vibeTag: 'Spice Ports & Living Arts',
        highlights: ['Mattancherry antique spice warehouse walks', 'Kathakali dressing-room mudra rehearsals', 'Chinese cantilever fishing nets at twilight'],
        description: 'Stroll Portuguese alleys, converse with ginger traders, and observe classical performers preparing their dramatic facial pigments.',
      },
      {
        id: 'ker-2',
        title: '5-Day Alappuzha Canals & Aranmula Metal Mirror Guild',
        durationDays: 5,
        durationLabel: '5 Days • 4 Nights',
        baseCity: 'Alappuzha',
        dailySpendEst: '₹4,900 / day',
        pacing: 'relaxed',
        vibeTag: 'Master Artisan Guilds',
        highlights: ['Silent electric solar canoe backwater glide', 'Aranmula secret metal alloy mirror workshop', 'Village coir rope and tod-palm weavers'],
        description: 'Slow down to the rhythm of coconut canals and witness mirror-makers casting rare copper-tin alloys guarded for four centuries.',
      },
      {
        id: 'ker-3',
        title: '7-Day Wayanad Mist & Ancient Edakkal Petroglyphs',
        durationDays: 7,
        durationLabel: '7 Days • 6 Nights',
        baseCity: 'Kozhikode',
        dailySpendEst: '₹4,400 / day',
        pacing: 'balanced',
        vibeTag: 'Wild Frontiers & Ancient Caves',
        highlights: ['Edakkal Neolithic rock-art cliff ascent', 'Cardamom & clove bio-reserve plantation walk', 'Beypore master boatbuilders carving wooden dhows'],
        description: 'High-altitude rain-forest estates, stone-age engravings, and master maritime carpenters shaping timber without modern blueprints.',
      },
    ],
  },
  'Tamil Nadu': {
    name: 'Tamil Nadu',
    normalizedKey: 'tamil nadu',
    region: 'South India',
    primaryHub: 'Madurai',
    teaser: 'Soaring Dravidian gopurams, Bronze idol casters, and Chettinad mansions.',
    sitesCount: 58,
    guildsCount: 31,
    signatureVibes: ['Sacred rituals & living temples', 'Hidden master artisan guilds', 'Royal palaces & culinary heritage'],
    bestSeason: 'November to February',
    circuits: [
      {
        id: 'tn-1',
        title: '3-Day Madurai & Thanjavur Living Chola Wonders',
        durationDays: 3,
        durationLabel: '3 Days • 2 Nights',
        baseCity: 'Thanjavur',
        dailySpendEst: '₹3,400 / day',
        pacing: 'balanced',
        vibeTag: 'Sacred Rituals & Living Temples',
        highlights: ['Brihadisvara Temple evening granite shadows', 'Swamimalai lost-wax bronze casting studios', 'Meenakshi Amman floral market morning walk'],
        description: 'Towering pyramidal gates, granite acoustic pillars, and sculptors who pour molten copper using ancient Vedic geometry texts.',
      },
      {
        id: 'tn-2',
        title: '4-Day Chettinad Aristocratic Mansions & Tile Guilds',
        durationDays: 4,
        durationLabel: '4 Days • 3 Nights',
        baseCity: 'Karaikudi',
        dailySpendEst: '₹4,100 / day',
        pacing: 'relaxed',
        vibeTag: 'Royal Palaces & Culinary Heritage',
        highlights: ['Athangudi handmade floral cement tile studios', 'Palatial 1,000-window teakwood merchant estates', 'Clay-pot peppered Chettinad feast on banana leaves'],
        description: 'Discover wealthy merchant dynasties who brought Burmese teak and Italian marble to rural Tamil plains.',
      },
      {
        id: 'tn-3',
        title: '6-Day Kanchipuram Silks & Mahabalipuram Ocean Bas-Reliefs',
        durationDays: 6,
        durationLabel: '6 Days • 5 Nights',
        baseCity: 'Chennai',
        dailySpendEst: '₹4,600 / day',
        pacing: 'balanced',
        vibeTag: 'Master Artisan Guilds',
        highlights: ['Arjuna Penance monolith ocean breezes', 'Kanchipuram pure zari gold-thread handlooms', 'Shore Temple dawn photography'],
        description: 'Marvel at 7th-century Pallava coastal sculptures followed by private visits to master weavers who weave mulberry silk with spun gold.',
      },
    ],
  },
  'Maharashtra': {
    name: 'Maharashtra',
    normalizedKey: 'maharashtra',
    region: 'West India',
    primaryHub: 'Mumbai',
    teaser: 'Rock-cut basalt caves, coastal sea citadels, and Paithani silk weavers.',
    sitesCount: 52,
    guildsCount: 20,
    signatureVibes: ['Wild frontiers & stepwells', 'Hidden master artisan guilds', 'Royal palaces & culinary heritage'],
    bestSeason: 'October to March',
    circuits: [
      {
        id: 'mah-1',
        title: '3-Day Ellora & Ajanta Ancient Fresco Pilgrimage',
        durationDays: 3,
        durationLabel: '3 Days • 2 Nights',
        baseCity: 'Chhatrapati Sambhajinagar',
        dailySpendEst: '₹3,700 / day',
        pacing: 'balanced',
        vibeTag: 'Rock-Cut Temples & Monoliths',
        highlights: ['Kailasa Temple top-down monolithic basalt wonder', 'Ajanta horseshoe ravine Buddhist cave murals', 'Paithan real gold thread sari looms'],
        description: 'Marvel at single-rock cliff excavations of immense scale and 2,000-year-old natural mineral pigments preserved in monastic caves.',
      },
      {
        id: 'mah-2',
        title: '4-Day Konkan Sea Forts & Malvani Coastline',
        durationDays: 4,
        durationLabel: '4 Days • 3 Nights',
        baseCity: 'Ratnagiri',
        dailySpendEst: '₹3,900 / day',
        pacing: 'relaxed',
        vibeTag: 'Wild Frontiers & Coastal Citadels',
        highlights: ['Murud-Janjira ocean impregnable fortress boat crossing', 'Alphonso mango orchard farmstays', 'Malvani coastal black pepper & fish curries'],
        description: 'Explore sea-girt citadels that resisted maritime empires, coupled with coastal fishing village warmth.',
      },
    ],
  },
  'Gujarat': {
    name: 'Gujarat',
    normalizedKey: 'gujarat',
    region: 'West India',
    primaryHub: 'Ahmedabad',
    teaser: 'UNESCO stepwells, white salt desert expanse, and tribal Rogan art master craftspeople.',
    sitesCount: 46,
    guildsCount: 24,
    signatureVibes: ['Wild frontiers & stepwells', 'Hidden master artisan guilds', 'Sacred rituals & living temples'],
    bestSeason: 'November to February',
    circuits: [
      {
        id: 'guj-1',
        title: '4-Day Kutch Desert Artisans & Rogan Masters',
        durationDays: 4,
        durationLabel: '4 Days • 3 Nights',
        baseCity: 'Bhuj',
        dailySpendEst: '₹4,200 / day',
        pacing: 'balanced',
        vibeTag: 'Master Artisan Guilds',
        highlights: ['Nirona village castor oil Rogan art master studio', 'White Rann salt horizon twilight walk', 'Ajrakhpur double-sided hand block printers'],
        description: 'Meet the only surviving family in the world practicing castor-oil Rogan painting and discover nomadic mirror-work embroideries.',
      },
      {
        id: 'guj-2',
        title: '3-Day Ahmedabad Heritage Pols & Rani Ki Vav Stepwell',
        durationDays: 3,
        durationLabel: '3 Days • 2 Nights',
        baseCity: 'Ahmedabad',
        dailySpendEst: '₹3,400 / day',
        pacing: 'balanced',
        vibeTag: 'Wild Frontiers & Stepwells',
        highlights: ['Rani Ki Vav 7-storey subterranean sculptures', 'Ahmedabad Old City carved wooden bird feeders', 'Calico Museum rare textile archives'],
        description: 'Descend into an inverted temple dedicated to water with 800 celestial stone carvings celebrating sacred hydrology.',
      },
    ],
  },
  'Madhya Pradesh': {
    name: 'Madhya Pradesh',
    normalizedKey: 'madhya pradesh',
    region: 'Central India',
    primaryHub: 'Bhopal',
    teaser: 'Erotic stone temple carvings, Buddhist stupas, and Tiger jungle frontiers.',
    sitesCount: 44,
    guildsCount: 16,
    signatureVibes: ['Sacred rituals & living temples', 'Wild frontiers & stepwells', 'Hidden master artisan guilds'],
    bestSeason: 'October to March',
    circuits: [
      {
        id: 'mp-1',
        title: '4-Day Khajuraho Temples & Orchha River Palaces',
        durationDays: 4,
        durationLabel: '4 Days • 3 Nights',
        baseCity: 'Khajuraho',
        dailySpendEst: '₹3,600 / day',
        pacing: 'relaxed',
        vibeTag: 'Sacred Rituals & Stone Poetry',
        highlights: ['Western group sandstone temple intricate carvings', 'Betwa river sunset chhatris cenotaphs', 'Chanderi sheer gold weave workshops'],
        description: 'Celebrate classical sandstone sensuality and forgotten river fortresses where vultures roost in imperial cupolas.',
      },
    ],
  },
  'West Bengal': {
    name: 'West Bengal',
    normalizedKey: 'west bengal',
    region: 'East India',
    primaryHub: 'Kolkata',
    teaser: 'Terracotta temple villages, colonial river wharfs, and Darjeeling high teas.',
    sitesCount: 40,
    guildsCount: 21,
    signatureVibes: ['Hidden master artisan guilds', 'Royal palaces & culinary heritage', 'Sacred rituals & living temples'],
    bestSeason: 'October to February',
    circuits: [
      {
        id: 'wb-1',
        title: '3-Day Bishnupur Terracotta Temples & Baluchari Silks',
        durationDays: 3,
        durationLabel: '3 Days • 2 Nights',
        baseCity: 'Kolkata',
        dailySpendEst: '₹3,100 / day',
        pacing: 'relaxed',
        vibeTag: 'Master Artisan Guilds',
        highlights: ['Burnt clay carved facades depicting Ramayana', 'Baluchari jacquard looms weaving narrative borders', 'Kumartuli clay sculptor alleys along the Hooghly'],
        description: 'Discover curved Bengal-roof terracotta temples fired with red clay and master weavers illustrating epics on silk pallas.',
      },
    ],
  },
  'Karnataka': {
    name: 'Karnataka',
    normalizedKey: 'karnataka',
    region: 'South India',
    primaryHub: 'Bengaluru',
    teaser: 'Granite boulder ruins of Vijayanagara, sandalwood carvers, and Hoysala temples.',
    sitesCount: 50,
    guildsCount: 19,
    signatureVibes: ['Wild frontiers & stepwells', 'Sacred rituals & living temples', 'Hidden master artisan guilds'],
    bestSeason: 'October to March',
    circuits: [
      {
        id: 'kar-1',
        title: '4-Day Hampi Boulders & Lost Empire Exploration',
        durationDays: 4,
        durationLabel: '4 Days • 3 Nights',
        baseCity: 'Hampi',
        dailySpendEst: '₹3,300 / day',
        pacing: 'balanced',
        vibeTag: 'Wild Frontiers & Stepwells',
        highlights: ['Vittala Temple stone chariot & musical pillars', 'Coracle boat ride on the Tungabhadra rapids', 'Hemakuta Hill sunrise silhouette walks'],
        description: 'Walk through surreal boulderscapes concealing the ruined capital of the world once visited by Persian and Portuguese ambassadors.',
      },
    ],
  },
  'Himachal Pradesh': {
    name: 'Himachal Pradesh',
    normalizedKey: 'himachal pradesh',
    region: 'North India',
    primaryHub: 'Shimla',
    teaser: 'Cedar-scented valleys, Buddhist monasteries, and Kullu wool handlooms.',
    sitesCount: 32,
    guildsCount: 14,
    signatureVibes: ['Wild frontiers & stepwells', 'Sacred rituals & living temples', 'Hidden master artisan guilds'],
    bestSeason: 'March to June, September to November',
    circuits: [
      {
        id: 'hp-1',
        title: '4-Day Spiti Valley Monasteries & High Passes',
        durationDays: 4,
        durationLabel: '4 Days • 3 Nights',
        baseCity: 'Kaza',
        dailySpendEst: '₹4,100 / day',
        pacing: 'relaxed',
        vibeTag: 'Sacred Rituals & High Frontiers',
        highlights: ['Key Gompa fortress monastery morning chant', 'Dhankar ancient cliffside stupas', 'Kullu shawl organic sheep-wool weavers'],
        description: 'Perched thousands of meters high, meditate with monks amidst wind-carved Himalayan canyons.',
      },
    ],
  },
  'Jammu and Kashmir': {
    name: 'Jammu and Kashmir',
    normalizedKey: 'jammu and kashmir',
    region: 'North India',
    primaryHub: 'Srinagar',
    teaser: 'Floating lake markets, Pashmina shawls, and walnut wood carvings.',
    sitesCount: 28,
    guildsCount: 17,
    signatureVibes: ['Hidden master artisan guilds', 'Royal palaces & culinary heritage'],
    bestSeason: 'April to October',
    circuits: [
      {
        id: 'jk-1',
        title: '4-Day Dal Lake Houseboat & Pashmina Loom Discovery',
        durationDays: 4,
        durationLabel: '4 Days • 3 Nights',
        baseCity: 'Srinagar',
        dailySpendEst: '₹4,800 / day',
        pacing: 'relaxed',
        vibeTag: 'Master Artisan Guilds',
        highlights: ['Shikara dawn floating vegetable market', 'Old Srinagar hand-spun Pashmina and Sozni embroidery', 'Pari Mahal Mughal terraced gardens'],
        description: 'Rest on cedarwood houseboats and witness artisans hand-spinning the underfleece of Changthangi goats with needle precision.',
      },
    ],
  },
  'Assam': {
    name: 'Assam',
    normalizedKey: 'assam',
    region: 'Northeast India',
    primaryHub: 'Guwahati',
    teaser: 'One-horned rhino grasslands, Brahmaputra river island satras, and golden Muga silk.',
    sitesCount: 26,
    guildsCount: 15,
    signatureVibes: ['Hidden master artisan guilds', 'Sacred rituals & living temples', 'Wild frontiers & stepwells'],
    bestSeason: 'November to April',
    circuits: [
      {
        id: 'asm-1',
        title: '4-Day Majuli River Island & Vaishnavite Monastery Culture',
        durationDays: 4,
        durationLabel: '4 Days • 3 Nights',
        baseCity: 'Jorhat',
        dailySpendEst: '₹3,100 / day',
        pacing: 'relaxed',
        vibeTag: 'Sacred Rituals & Living Arts',
        highlights: ['World largest river island ferry crossing', 'Samaguri Satra bamboo and cow-dung mask makers', 'Sualkuchi natural golden Muga silk weaving'],
        description: 'Immerse in spiritual monasteries that preserve traditional theatre masks, flute music, and golden silk that shines brighter with every wash.',
      },
    ],
  },
  'Goa': {
    name: 'Goa',
    normalizedKey: 'goa',
    region: 'West India',
    primaryHub: 'Panaji',
    teaser: 'Latin quarter mansions, baroque basilicas, and spice plantation banquets.',
    sitesCount: 30,
    guildsCount: 12,
    signatureVibes: ['Royal palaces & culinary heritage', 'Wild frontiers & stepwells'],
    bestSeason: 'November to March',
    circuits: [
      {
        id: 'goa-1',
        title: '3-Day Fontainhas Heritage & Portuguese Indo-Culinary Walk',
        durationDays: 3,
        durationLabel: '3 Days • 2 Nights',
        baseCity: 'Panaji',
        dailySpendEst: '₹4,200 / day',
        pacing: 'relaxed',
        vibeTag: 'Living Colonial Heritage',
        highlights: ['Fontainhas Latin Quarter hand-painted azulejo tiles', 'Reis Magos defensive estuary fort', 'Traditional wood-fired Bebinca and Feni tasting'],
        description: 'Wander past ochre and indigo balconies, ancient bakeries baking morning poi bread, and private colonial heritage estates.',
      },
    ],
  },
  'Ladakh': {
    name: 'Ladakh',
    normalizedKey: 'ladakh',
    region: 'North India',
    primaryHub: 'Leh',
    teaser: 'Moonland plateaus, Tibetan stupas, and nomadic yak-wool weavers.',
    sitesCount: 24,
    guildsCount: 11,
    signatureVibes: ['Wild frontiers & stepwells', 'Sacred rituals & living temples'],
    bestSeason: 'June to September',
    circuits: [
      {
        id: 'lad-1',
        title: '5-Day Nubra Valley & Thiksey Monastery Dawn Prayers',
        durationDays: 5,
        durationLabel: '5 Days • 4 Nights',
        baseCity: 'Leh',
        dailySpendEst: '₹5,500 / day',
        pacing: 'relaxed',
        vibeTag: 'High Frontiers & Mountain Silence',
        highlights: ['Thiksey sunrise prayer horns resonance', 'Diskit sand dunes two-humped camel caravan', 'Alchi 11th-century Kashmiri-style wall paintings'],
        description: 'Cross 5,000-meter passes into remote monastic sanctums decorated with original mineral dyes untouched by sunlight.',
      },
    ],
  },
  'Odisha': {
    name: 'Odisha',
    normalizedKey: 'odisha',
    region: 'East India',
    primaryHub: 'Bhubaneswar',
    teaser: 'Sun Temple chariot wheels, Raghurajpur Pattachitra painters, and silver filigree.',
    sitesCount: 38,
    guildsCount: 22,
    signatureVibes: ['Sacred rituals & living temples', 'Hidden master artisan guilds'],
    bestSeason: 'October to March',
    circuits: [
      {
        id: 'odi-1',
        title: '3-Day Konark Sun Temple & Raghurajpur Artisan Village',
        durationDays: 3,
        durationLabel: '3 Days • 2 Nights',
        baseCity: 'Puri',
        dailySpendEst: '₹3,000 / day',
        pacing: 'balanced',
        vibeTag: 'Master Artisan Guilds',
        highlights: ['Konark colossal stone sun chariot wheels', 'Raghurajpur palm-leaf etching craft village', 'Cuttack intricate silver filigree workshops'],
        description: 'Experience villages where every house is an open atelier, etching ancestral palm manuscripts with natural river-stone pigments.',
      },
    ],
  },
  'Punjab': {
    name: 'Punjab',
    normalizedKey: 'punjab',
    region: 'North India',
    primaryHub: 'Amritsar',
    teaser: 'Golden temple sanctum, communal langar kitchen, and Phulkari embroidery.',
    sitesCount: 25,
    guildsCount: 13,
    signatureVibes: ['Sacred rituals & living temples', 'Royal palaces & culinary heritage', 'Hidden master artisan guilds'],
    bestSeason: 'October to March',
    circuits: [
      {
        id: 'pun-1',
        title: '3-Day Amritsar Golden Sanctum & Rural Farm Heritage',
        durationDays: 3,
        durationLabel: '3 Days • 2 Nights',
        baseCity: 'Amritsar',
        dailySpendEst: '₹3,000 / day',
        pacing: 'balanced',
        vibeTag: 'Sacred Rituals & Community Spirit',
        highlights: ['Golden Temple nighttime Palki Sahib ceremony', 'World largest volunteer communal kitchen (Langar)', 'Village Phulkari silk-thread floral embroidery'],
        description: 'Witness humbling communal service preparing meals for 100,000 visitors daily, surrounded by marble walkways and brass hymns.',
      },
    ],
  },
  'Delhi': {
    name: 'Delhi',
    normalizedKey: 'delhi',
    region: 'North India',
    primaryHub: 'New Delhi',
    teaser: 'Seven historic cities, Mughal grand monuments, and Sufi qawwali courtyards.',
    sitesCount: 45,
    guildsCount: 19,
    signatureVibes: ['Royal palaces & culinary heritage', 'Sacred rituals & living temples', 'Wild frontiers & stepwells'],
    bestSeason: 'October to March',
    circuits: [
      {
        id: 'del-1',
        title: '3-Day Old Delhi Havelis & Nizamuddin Sufi Twilight',
        durationDays: 3,
        durationLabel: '3 Days • 2 Nights',
        baseCity: 'New Delhi',
        dailySpendEst: '₹3,600 / day',
        pacing: 'balanced',
        vibeTag: 'Seven Dynasties of Heritage',
        highlights: ['Agrasen Ki Baoli hidden stepwell', 'Chandni Chowk spice spice vaults and paratha lanes', 'Nizamuddin Dargah Thursday evening live Qawwali'],
        description: 'Traverse 1,000 years of layered capitals, underground reservoirs, and mystic poetry echo chambers.',
      },
    ],
  },
};

// Generic fallback for any other state/UT
export function getStateMetadata(rawStateName: string): StateMetadata {
  if (!rawStateName) {
    return INDIA_STATES_METADATA['Rajasthan'];
  }

  // Exact lookup
  if (INDIA_STATES_METADATA[rawStateName]) {
    return INDIA_STATES_METADATA[rawStateName];
  }

  // Case-insensitive / partial lookup
  const cleanKey = rawStateName.trim().toLowerCase();
  for (const [key, meta] of Object.entries(INDIA_STATES_METADATA)) {
    if (key.toLowerCase() === cleanKey || meta.normalizedKey === cleanKey) {
      return meta;
    }
  }

  // Construct a graceful fallback with regional warmth
  return {
    name: rawStateName,
    normalizedKey: cleanKey,
    region: getRegionFromState(rawStateName),
    primaryHub: rawStateName,
    teaser: `Explore ancient living traditions, master artisan guilds, and historic landmarks in ${rawStateName}.`,
    sitesCount: 24,
    guildsCount: 10,
    signatureVibes: ['Cultural discovery', 'Regional artisan heritage', 'Local culinary circuits'],
    bestSeason: 'October to March',
    circuits: [
      {
        id: `gen-${cleanKey}-1`,
        title: `3-Day ${rawStateName} Cultural Exploration`,
        durationDays: 3,
        durationLabel: '3 Days • 2 Nights',
        baseCity: rawStateName,
        dailySpendEst: '₹3,200 / day',
        pacing: 'balanced',
        vibeTag: 'Authentic Regional Journey',
        highlights: ['Historic town center walk', 'Traditional village craft workshops', 'Authentic regional culinary trail'],
        description: `Immerse in the authentic hospitality, historic roots, and local master crafts of ${rawStateName}.`,
      },
    ],
  };
}

function getRegionFromState(state: string): StateMetadata['region'] {
  const s = state.toLowerCase();
  if (/kerala|tamil|karnataka|andhra|telangana|puducherry/i.test(s)) return 'South India';
  if (/maharashtra|gujarat|goa|daman/i.test(s)) return 'West India';
  if (/bengal|bihar|odisha|jharkhand/i.test(s)) return 'East India';
  if (/madhya|chhattisgarh/i.test(s)) return 'Central India';
  if (/assam|manipur|meghalaya|mizoram|nagaland|tripura|arunachal|sikkim/i.test(s)) return 'Northeast India';
  if (/andaman|nicobar|lakshadweep/i.test(s)) return 'Island Territories';
  return 'North India';
}

/**
 * Calculates a personalized match score (0 - 100) for a given state based on user profiler preferences
 */
export function calculateStateMatchScore(
  stateName: string,
  prefs: UserJourneyPreferences
): { score: number; reason: string } {
  const meta = getStateMetadata(stateName);
  let baseScore = 75;

  // Vibe alignment
  if (prefs.vibe === 'crafts' && meta.guildsCount >= 20) baseScore += 12;
  else if (prefs.vibe === 'crafts') baseScore += 8;

  if (prefs.vibe === 'temples' && (meta.region === 'South India' || stateName === 'Uttar Pradesh' || stateName === 'Punjab')) {
    baseScore += 12;
  }

  if (prefs.vibe === 'frontiers' && (stateName === 'Rajasthan' || stateName === 'Gujarat' || stateName === 'Ladakh' || stateName === 'Himachal Pradesh')) {
    baseScore += 12;
  }

  if (prefs.vibe === 'palaces' && (stateName === 'Rajasthan' || stateName === 'Uttar Pradesh' || stateName === 'Delhi' || stateName === 'Tamil Nadu')) {
    baseScore += 11;
  }

  // Duration tier match
  const bestDurationMatch = meta.circuits.some((c) => {
    if (prefs.durationTier === 'weekend' && c.durationDays <= 3) return true;
    if (prefs.durationTier === 'circuit' && c.durationDays >= 4 && c.durationDays <= 7) return true;
    if (prefs.durationTier === 'epic' && c.durationDays >= 6) return true;
    return false;
  });
  if (bestDurationMatch) baseScore += 8;

  // Rhythm match
  if (prefs.rhythm === 'couple') baseScore += 3;
  if (prefs.rhythm === 'solo' && (stateName === 'Rajasthan' || stateName === 'Kerala' || stateName === 'Himachal Pradesh')) baseScore += 4;

  const score = Math.min(99, Math.max(72, baseScore));

  const reasons = [
    `Rich alignment with your interest in ${getVibeName(prefs.vibe)}`,
    `Optimal pacing for ${getPacingName(prefs.pacing)} exploration`,
    `Curated artisan hubs matching your ${prefs.rhythm} travel rhythm`,
  ];

  return {
    score,
    reason: reasons[Math.abs(score) % reasons.length],
  };
}

function getVibeName(vibe: UserJourneyPreferences['vibe']): string {
  switch (vibe) {
    case 'temples': return 'Sacred Rituals & Living Temples';
    case 'crafts': return 'Master Artisan Guilds';
    case 'frontiers': return 'Wild Frontiers & Stepwells';
    case 'palaces': return 'Royal Palaces & Culinary Heritage';
  }
}

function getPacingName(pacing: UserJourneyPreferences['pacing']): string {
  switch (pacing) {
    case 'relaxed': return 'Slow & Immersive';
    case 'balanced': return 'Balanced Discovery';
    case 'packed': return 'High-Energy';
  }
}
