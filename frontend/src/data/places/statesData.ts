export interface StateCityInfo {
  state: string;
  code: string;
  isPopular?: boolean;
  isUnionTerritory?: boolean;
  cities: string[];
}

export const INDIAN_STATES_AND_CITIES: StateCityInfo[] = [
  // ─── POPULAR STATES (7 to 8 cities/districts each) ──────────────────────────
  {
    state: 'Maharashtra',
    code: 'MH',
    isPopular: true,
    cities: ['Mumbai', 'Pune', 'Lonavala', 'Nashik', 'Chhatrapati Sambhajinagar', 'Nagpur', 'Alibag', 'Kolhapur'],
  },
  {
    state: 'Rajasthan',
    code: 'RJ',
    isPopular: true,
    cities: ['Jaipur', 'Jaisalmer', 'Udaipur', 'Jodhpur', 'Pushkar', 'Bikaner', 'Mount Abu', 'Bundi'],
  },
  {
    state: 'Uttar Pradesh',
    code: 'UP',
    isPopular: true,
    cities: ['Varanasi', 'Agra', 'Lucknow', 'Ayodhya', 'Prayagraj', 'Mathura', 'Vrindavan', 'Jhansi'],
  },
  {
    state: 'Delhi',
    code: 'DL',
    isPopular: true,
    isUnionTerritory: true,
    cities: ['Old Delhi', 'New Delhi', 'South Delhi', 'Mehrauli', 'Nizamuddin', 'Hauz Khas', 'Chandni Chowk'],
  },
  {
    state: 'Karnataka',
    code: 'KA',
    isPopular: true,
    cities: ['Bengaluru', 'Mysuru', 'Hampi', 'Coorg', 'Gokarna', 'Chikmagalur', 'Mangalore', 'Udupi'],
  },
  {
    state: 'Kerala',
    code: 'KL',
    isPopular: true,
    cities: ['Kochi', 'Alleppey', 'Munnar', 'Wayanad', 'Varkala', 'Thiruvananthapuram', 'Thekkady', 'Kannur'],
  },
  {
    state: 'Tamil Nadu',
    code: 'TN',
    isPopular: true,
    cities: ['Chennai', 'Madurai', 'Thanjavur', 'Kanyakumari', 'Coimbatore', 'Ooty', 'Mahabalipuram', 'Rameswaram'],
  },
  {
    state: 'West Bengal',
    code: 'WB',
    isPopular: true,
    cities: ['Kolkata', 'Darjeeling', 'Kalimpong', 'Sundarbans', 'Santiniketan', 'Digha', 'Murshidabad', 'Siliguri'],
  },
  {
    state: 'Gujarat',
    code: 'GJ',
    isPopular: true,
    cities: ['Ahmedabad', 'Vadodara', 'Surat', 'Bhuj', 'Somnath', 'Dwarka', 'Gir', 'Champaner'],
  },
  {
    state: 'Himachal Pradesh',
    code: 'HP',
    isPopular: true,
    cities: ['Shimla', 'Manali', 'Dharamshala', 'McLeod Ganj', 'Spiti Valley', 'Kasol', 'Dalhousie', 'Kaza'],
  },
  {
    state: 'Uttarakhand',
    code: 'UK',
    isPopular: true,
    cities: ['Rishikesh', 'Haridwar', 'Dehradun', 'Nainital', 'Almora', 'Mussoorie', 'Auli', 'Chopta'],
  },
  {
    state: 'Jammu & Kashmir',
    code: 'JK',
    isPopular: true,
    isUnionTerritory: true,
    cities: ['Srinagar', 'Gulmarg', 'Pahalgam', 'Sonamarg', 'Jammu', 'Patnitop', 'Doodhpathri'],
  },
  {
    state: 'Ladakh',
    code: 'LA',
    isPopular: true,
    isUnionTerritory: true,
    cities: ['Leh', 'Nubra Valley', 'Pangong', 'Zanskar', 'Kargil', 'Tso Moriri', 'Diskit'],
  },
  {
    state: 'Goa',
    code: 'GA',
    isPopular: true,
    cities: ['Panaji', 'Anjuna', 'Calangute', 'Palolem', 'Margao', 'Morjim', 'Canacona', 'Old Goa'],
  },
  {
    state: 'Punjab',
    code: 'PB',
    isPopular: true,
    cities: ['Amritsar', 'Chandigarh', 'Patiala', 'Jalandhar', 'Anandpur Sahib', 'Ludhiana', 'Bathinda'],
  },
  {
    state: 'Madhya Pradesh',
    code: 'MP',
    isPopular: true,
    cities: ['Bhopal', 'Indore', 'Khajuraho', 'Ujjain', 'Gwalior', 'Orchha', 'Jabalpur', 'Mandu'],
  },
  {
    state: 'Odisha',
    code: 'OD',
    isPopular: true,
    cities: ['Bhubaneswar', 'Puri', 'Konark', 'Chilika Lake', 'Cuttack', 'Sambalpur', 'Gopalpur'],
  },

  // ─── OTHER STATES & UTs (5 to 6 cities/districts each) ─────────────────────
  {
    state: 'Assam',
    code: 'AS',
    cities: ['Guwahati', 'Majuli Island', 'Kaziranga', 'Tezpur', 'Jorhat', 'Sivasagar'],
  },
  {
    state: 'Meghalaya',
    code: 'ML',
    cities: ['Shillong', 'Cherrapunji', 'Dawki', 'Mawlynnong', 'Jowai', 'Nongkhnum'],
  },
  {
    state: 'Telangana',
    code: 'TS',
    cities: ['Hyderabad', 'Warangal', 'Karimnagar', 'Nizamabad', 'Khammam', 'Ramagundam'],
  },
  {
    state: 'Andhra Pradesh',
    code: 'AP',
    cities: ['Visakhapatnam', 'Tirupati', 'Vijayawada', 'Araku Valley', 'Kurnool', 'Rajahmundry'],
  },
  {
    state: 'Bihar',
    code: 'BR',
    cities: ['Patna', 'Bodh Gaya', 'Nalanda', 'Rajgir', 'Vaishali', 'Madhubani'],
  },
  {
    state: 'Jharkhand',
    code: 'JH',
    cities: ['Ranchi', 'Jamshedpur', 'Deoghar', 'Hazaribagh', 'Dhanbad', 'Netarhat'],
  },
  {
    state: 'Chhattisgarh',
    code: 'CG',
    cities: ['Raipur', 'Bastar', 'Jagdalpur', 'Bilaspur', 'Sirpur', 'Mainpat'],
  },
  {
    state: 'Sikkim',
    code: 'SK',
    cities: ['Gangtok', 'Pelling', 'Lachung', 'Namchi', 'Ravangla', 'Yuksom'],
  },
  {
    state: 'Arunachal Pradesh',
    code: 'AR',
    cities: ['Tawang', 'Ziro Valley', 'Itanagar', 'Bomdila', 'Pasighat', 'Mechuka'],
  },
  {
    state: 'Nagaland',
    code: 'NL',
    cities: ['Kohima', 'Dimapur', 'Mokokchung', 'Dzukou Valley', 'Mon', 'Wokha'],
  },
  {
    state: 'Manipur',
    code: 'MN',
    cities: ['Imphal', 'Loktak Lake', 'Ukhrul', 'Churachandpur', 'Andro', 'Kakching'],
  },
  {
    state: 'Mizoram',
    code: 'MZ',
    cities: ['Aizawl', 'Lunglei', 'Champhai', 'Reiek', 'Serchhip', 'Hmuifang'],
  },
  {
    state: 'Tripura',
    code: 'TR',
    cities: ['Agartala', 'Unakoti', 'Udaipur Tripura', 'Jampui Hills', 'Neermahal', 'Dharmanagar'],
  },
  {
    state: 'Haryana',
    code: 'HR',
    cities: ['Gurugram', 'Kurukshetra', 'Faridabad', 'Panipat', 'Pinjore', 'Hisar'],
  },
  {
    state: 'Puducherry',
    code: 'PY',
    isUnionTerritory: true,
    cities: ['White Town', 'Auroville', 'Heritage French Quarter', 'Karaikal', 'Mahe', 'Yanam'],
  },
  {
    state: 'Andaman & Nicobar',
    code: 'AN',
    isUnionTerritory: true,
    cities: ['Port Blair', 'Havelock Island', 'Neil Island', 'Baratang', 'Diglipur', 'Ross Island'],
  },
  {
    state: 'Chandigarh',
    code: 'CH',
    isUnionTerritory: true,
    cities: ['Sector 1 Capitol Complex', 'Sector 17 Plaza', 'Sukhna Lake', 'Rock Garden Quarter', 'Rose Garden Sector 16'],
  },
  {
    state: 'Dadra & Nagar Haveli and Daman & Diu',
    code: 'DD',
    isUnionTerritory: true,
    cities: ['Daman', 'Diu', 'Silvassa', 'Nani Daman', 'Moti Daman', 'Khanvel'],
  },
  {
    state: 'Lakshadweep',
    code: 'LD',
    isUnionTerritory: true,
    cities: ['Kavaratti', 'Agatti Island', 'Bangaram', 'Kadmat', 'Minicoy', 'Kalpeni'],
  },
];

export const POPULAR_CITIES_LIST = [
  'Mumbai',
  'Lonavala',
  'Pune',
  'Jaipur',
  'Jaisalmer',
  'Udaipur',
  'Bengaluru',
  'Kochi',
  'Delhi',
  'Varanasi',
  'Chennai',
  'Bhopal',
  'Kolkata',
  'Bhubaneswar',
  'Shillong',
  'Ahmedabad',
  'Ladakh',
  'Guwahati',
  'Hyderabad',
  'Srinagar',
  'Amritsar',
  'Goa',
  'Shimla',
  'Rishikesh',
];

export interface IndianStateZoneInfo {
  name: string;
  code: string;
  zone: 'North' | 'West' | 'South' | 'East & Central' | 'Northeast' | 'Islands';
  highlight: string;
  popularHubs: string[];
  isUnionTerritory?: boolean;
}

export const ALL_INDIAN_STATES_BY_ZONE: IndianStateZoneInfo[] = [
  // ─── NORTH (10 States & UTs) ──────────────────────────────────────────────
  {
    name: 'Rajasthan',
    code: 'RJ',
    zone: 'North',
    highlight: 'Havelis, Thar Dunes & Amber Fort',
    popularHubs: ['Jaipur', 'Jodhpur', 'Udaipur', 'Jaisalmer', 'Pushkar', 'Bikaner'],
  },
  {
    name: 'Uttar Pradesh',
    code: 'UP',
    zone: 'North',
    highlight: 'Ganga Ghats, Varanasi Aarti & Mughal Splendour',
    popularHubs: ['Varanasi', 'Agra', 'Lucknow', 'Ayodhya', 'Prayagraj', 'Mathura'],
  },
  {
    name: 'Delhi',
    code: 'DL',
    zone: 'North',
    isUnionTerritory: true,
    highlight: 'Sandstone Citadels, Spice Bazaars & Culinary Quarters',
    popularHubs: ['Old Delhi', 'New Delhi', 'Mehrauli', 'Chandni Chowk', 'Hauz Khas'],
  },
  {
    name: 'Himachal Pradesh',
    code: 'HP',
    zone: 'North',
    highlight: 'Pine Valleys, Apple Orchards & Himalayan Monasteries',
    popularHubs: ['Shimla', 'Manali', 'Dharamshala', 'Spiti Valley', 'Kasol'],
  },
  {
    name: 'Uttarakhand',
    code: 'UK',
    zone: 'North',
    highlight: 'Ganga Sanctuaries, Yoga Ashrams & Alpine Trails',
    popularHubs: ['Rishikesh', 'Haridwar', 'Nainital', 'Mussoorie', 'Auli'],
  },
  {
    name: 'Jammu & Kashmir',
    code: 'JK',
    zone: 'North',
    isUnionTerritory: true,
    highlight: 'Shikara Canals, Saffron Valleys & Chinar Groves',
    popularHubs: ['Srinagar', 'Gulmarg', 'Pahalgam', 'Sonamarg', 'Jammu'],
  },
  {
    name: 'Ladakh',
    code: 'LA',
    zone: 'North',
    isUnionTerritory: true,
    highlight: 'High-Altitude Passes, Silk Route Monasteries & Stargazing',
    popularHubs: ['Leh', 'Nubra Valley', 'Pangong', 'Zanskar', 'Kargil'],
  },
  {
    name: 'Punjab',
    code: 'PB',
    zone: 'North',
    highlight: 'Harmandir Sahib Sanctuary, Phulkari Textiles & Langar',
    popularHubs: ['Amritsar', 'Chandigarh', 'Patiala', 'Anandpur Sahib'],
  },
  {
    name: 'Haryana',
    code: 'HR',
    zone: 'North',
    highlight: 'Heritage Stepwells, Epic Frontiers & Artisan Guilds',
    popularHubs: ['Kurukshetra', 'Pinjore', 'Gurugram', 'Faridabad'],
  },
  {
    name: 'Chandigarh',
    code: 'CH',
    zone: 'North',
    isUnionTerritory: true,
    highlight: 'Modernist Architecture, Rose Gardens & Lake Promenades',
    popularHubs: ['Capitol Complex', 'Sukhna Lake', 'Rock Garden Quarter'],
  },

  // ─── WEST (4 States & UTs) ────────────────────────────────────────────────
  {
    name: 'Maharashtra',
    code: 'MH',
    zone: 'West',
    highlight: 'Sahyadri Forts, Art Deco Enclaves & Cave Sanctuaries',
    popularHubs: ['Mumbai', 'Pune', 'Nashik', 'Chhatrapati Sambhajinagar', 'Lonavala'],
  },
  {
    name: 'Gujarat',
    code: 'GJ',
    zone: 'West',
    highlight: 'Rann Salt Flats, Stepwells & Generational Weavers',
    popularHubs: ['Ahmedabad', 'Bhuj', 'Vadodara', 'Dwarka', 'Gir'],
  },
  {
    name: 'Goa',
    code: 'GA',
    zone: 'West',
    highlight: 'Latin Quarters, Spice Plantations & Coastal Sanctuaries',
    popularHubs: ['Panaji', 'Old Goa', 'Palolem', 'Anjuna', 'Margao'],
  },
  {
    name: 'Dadra & Nagar Haveli and Daman & Diu',
    code: 'DD',
    zone: 'West',
    isUnionTerritory: true,
    highlight: 'Portuguese Sea Forts, Coastal Promenades & Quiet Groves',
    popularHubs: ['Daman', 'Diu', 'Silvassa'],
  },

  // ─── SOUTH (6 States & UTs) ───────────────────────────────────────────────
  {
    name: 'Karnataka',
    code: 'KA',
    zone: 'South',
    highlight: 'Hampi Ruins, Coorg Coffee Valleys & Hoysala Stonecraft',
    popularHubs: ['Bengaluru', 'Mysuru', 'Hampi', 'Coorg', 'Gokarna', 'Chikmagalur'],
  },
  {
    name: 'Kerala',
    code: 'KL',
    zone: 'South',
    highlight: 'Backwater Canals, Kathakali Theatres & Ayurvedic Sanctuaries',
    popularHubs: ['Kochi', 'Alleppey', 'Munnar', 'Wayanad', 'Varkala'],
  },
  {
    name: 'Tamil Nadu',
    code: 'TN',
    zone: 'South',
    highlight: 'Dravidian Gopurams, Classical Carnatic & Bronze Guilds',
    popularHubs: ['Chennai', 'Madurai', 'Thanjavur', 'Mahabalipuram', 'Ooty', 'Kanyakumari'],
  },
  {
    name: 'Telangana',
    code: 'TS',
    zone: 'South',
    highlight: 'Deccani Citadels, Nizami Gastronomy & Pearl Bazaars',
    popularHubs: ['Hyderabad', 'Warangal', 'Karimnagar'],
  },
  {
    name: 'Andhra Pradesh',
    code: 'AP',
    zone: 'South',
    highlight: 'Sacred Hill Shrines, Kalamkari Art & Eastern Ghats',
    popularHubs: ['Visakhapatnam', 'Tirupati', 'Vijayawada', 'Araku Valley'],
  },
  {
    name: 'Puducherry',
    code: 'PY',
    zone: 'South',
    isUnionTerritory: true,
    highlight: 'French Colonial Villas, Promenade Breezes & Auroville',
    popularHubs: ['White Town', 'Auroville', 'Heritage French Quarter'],
  },

  // ─── EAST & CENTRAL (6 States) ────────────────────────────────────────────
  {
    name: 'West Bengal',
    code: 'WB',
    zone: 'East & Central',
    highlight: 'Colonial Art Enclaves, Terracotta Temples & Tea Hills',
    popularHubs: ['Kolkata', 'Darjeeling', 'Sundarbans', 'Santiniketan', 'Kalimpong'],
  },
  {
    name: 'Madhya Pradesh',
    code: 'MP',
    zone: 'East & Central',
    highlight: 'Khajuraho Stonecraft, Forest Reserves & Royal Palaces',
    popularHubs: ['Bhopal', 'Indore', 'Khajuraho', 'Ujjain', 'Gwalior', 'Orchha'],
  },
  {
    name: 'Odisha',
    code: 'OD',
    zone: 'East & Central',
    highlight: 'Sun Temple Stone Carvings, Puri Sanctuaries & Silver Filigree',
    popularHubs: ['Bhubaneswar', 'Puri', 'Konark', 'Chilika Lake'],
  },
  {
    name: 'Bihar',
    code: 'BR',
    zone: 'East & Central',
    highlight: 'Enlightenment Sites, Nalanda Ruins & Madhubani Art',
    popularHubs: ['Patna', 'Bodh Gaya', 'Nalanda', 'Rajgir'],
  },
  {
    name: 'Jharkhand',
    code: 'JH',
    zone: 'East & Central',
    highlight: 'Plateau Waterfalls, Sacred Hills & Tribal Crafts',
    popularHubs: ['Ranchi', 'Jamshedpur', 'Deoghar', 'Netarhat'],
  },
  {
    name: 'Chhattisgarh',
    code: 'CG',
    zone: 'East & Central',
    highlight: 'Bastar Bell Metal Guilds, Jungle Waterfalls & Ancient Temples',
    popularHubs: ['Raipur', 'Bastar', 'Jagdalpur', 'Sirpur'],
  },

  // ─── NORTHEAST (8 States) ─────────────────────────────────────────────────
  {
    name: 'Assam',
    code: 'AS',
    zone: 'Northeast',
    highlight: 'Brahmaputra Islands, Tea Gardens & Silk Handlooms',
    popularHubs: ['Guwahati', 'Majuli Island', 'Kaziranga', 'Tezpur'],
  },
  {
    name: 'Meghalaya',
    code: 'ML',
    zone: 'Northeast',
    highlight: 'Living Root Bridges, Cloud Forests & Crystal Clear Rivers',
    popularHubs: ['Shillong', 'Cherrapunji', 'Dawki', 'Mawlynnong'],
  },
  {
    name: 'Sikkim',
    code: 'SK',
    zone: 'Northeast',
    highlight: 'Kanchenjunga Vistas, Orchid Valleys & Monasteries',
    popularHubs: ['Gangtok', 'Pelling', 'Lachung', 'Ravangla'],
  },
  {
    name: 'Arunachal Pradesh',
    code: 'AR',
    zone: 'Northeast',
    highlight: 'Eastern Himalayan Frontiers, Monpa Ateliers & High Valleys',
    popularHubs: ['Tawang', 'Ziro Valley', 'Bomdila', 'Mechuka'],
  },
  {
    name: 'Nagaland',
    code: 'NL',
    zone: 'Northeast',
    highlight: 'Hornbill Traditions, Mist Valleys & Generational Woodcraft',
    popularHubs: ['Kohima', 'Dimapur', 'Dzukou Valley', 'Mokokchung'],
  },
  {
    name: 'Manipur',
    code: 'MN',
    zone: 'Northeast',
    highlight: 'Floating Lake Sanctuaries, Classical Dance & Handloom Guilds',
    popularHubs: ['Imphal', 'Loktak Lake', 'Ukhrul', 'Andro'],
  },
  {
    name: 'Mizoram',
    code: 'MZ',
    zone: 'Northeast',
    highlight: 'Bamboo Hills, Serene Ridges & Rich Weaving Heritage',
    popularHubs: ['Aizawl', 'Lunglei', 'Champhai', 'Reiek'],
  },
  {
    name: 'Tripura',
    code: 'TR',
    zone: 'Northeast',
    highlight: 'Rock-Carved Deities, Water Palaces & Bamboo Crafts',
    popularHubs: ['Agartala', 'Unakoti', 'Neermahal', 'Jampui Hills'],
  },

  // ─── ISLANDS (2 UTs) ──────────────────────────────────────────────────────
  {
    name: 'Andaman & Nicobar',
    code: 'AN',
    zone: 'Islands',
    isUnionTerritory: true,
    highlight: 'Turquoise Lagoons, Coral Reefs & Historic Maritime Heritage',
    popularHubs: ['Port Blair', 'Havelock Island', 'Neil Island'],
  },
  {
    name: 'Lakshadweep',
    code: 'LD',
    zone: 'Islands',
    isUnionTerritory: true,
    highlight: 'Pristine Coral Atolls, Coconut Groves & Lagoon Sanctuaries',
    popularHubs: ['Kavaratti', 'Agatti Island', 'Bangaram', 'Minicoy'],
  },
];

export function getStateForCity(cityName: string): string {
  if (!cityName) return 'India';
  const clean = cityName.trim().toLowerCase();
  if (clean.includes('ladakh') || clean.includes('leh')) return 'Ladakh';
  if (clean.includes('goa')) return 'Goa';
  if (clean.includes('delhi')) return 'Delhi';
  if (clean.includes('puducherry') || clean.includes('pondicherry')) return 'Puducherry';
  if (clean.includes('chandigarh')) return 'Chandigarh';

  for (const item of INDIAN_STATES_AND_CITIES) {
    if (item.state.toLowerCase() === clean) return item.state;
    if (
      item.cities.some(
        (c) =>
          c.toLowerCase() === clean ||
          clean.includes(c.toLowerCase()) ||
          c.toLowerCase().includes(clean)
      )
    ) {
      return item.state;
    }
  }

  for (const item of ALL_INDIAN_STATES_BY_ZONE) {
    if (item.name.toLowerCase() === clean) return item.name;
    if (
      item.popularHubs.some(
        (c) =>
          c.toLowerCase() === clean ||
          clean.includes(c.toLowerCase()) ||
          c.toLowerCase().includes(clean)
      )
    ) {
      return item.name;
    }
  }

  return 'India';
}

