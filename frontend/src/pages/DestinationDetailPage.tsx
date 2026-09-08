import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { DestinationDetail, Experience, City } from '../types';
import { ExperienceCard } from '../components/experience/ExperienceCard';
import { deduplicateExperienceList } from '../lib/imageDeduplicator';
import {
  AGRA_POPULAR_DESTINATIONS,
  GOA_POPULAR_DESTINATIONS,
  SHIMLA_POPULAR_DESTINATIONS,
  ALMORA_POPULAR_DESTINATIONS,
  UDAIPUR_POPULAR_DESTINATIONS,
  ALLEPPEY_POPULAR_DESTINATIONS,
  KOCHI_POPULAR_DESTINATIONS,
  MUNNAR_POPULAR_DESTINATIONS,
  KERALA_POPULAR_DESTINATIONS,
  DARJEELING_POPULAR_DESTINATIONS,
  KOLKATA_POPULAR_DESTINATIONS,
  WEST_BENGAL_POPULAR_DESTINATIONS,
  ALIBAG_POPULAR_DESTINATIONS,
  CHHATRAPATI_SAMBHAJINAGAR_POPULAR_DESTINATIONS,
  LONAVALA_POPULAR_DESTINATIONS,
  NAGPUR_POPULAR_DESTINATIONS,
  NASHIK_POPULAR_DESTINATIONS,
  PUNE_POPULAR_DESTINATIONS,
  KOLHAPUR_POPULAR_DESTINATIONS,
  MAHARASHTRA_POPULAR_DESTINATIONS,
  JODHPUR_POPULAR_DESTINATIONS,
  JAISALMER_POPULAR_DESTINATIONS,
  PUSHKAR_POPULAR_DESTINATIONS,
  RAJASTHAN_POPULAR_DESTINATIONS,
} from '../data/userVerifiedPlacesData';
import {
  MapPin,
  ArrowLeft,
  Sparkles,
  Calendar,
  Compass,
  Sun,
  ShieldCheck,
  Landmark,
  Building2,
  ArrowRight,
} from 'lucide-react';

export function DestinationDetailPage() {
  const { state, city } = useParams<{ state: string; city?: string }>();
  const [cityData, setCityData] = useState<DestinationDetail | null>(null);
  const [stateCities, setStateCities] = useState<City[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const decodedState = state ? decodeURIComponent(state).trim() : '';
  const decodedCity = city ? decodeURIComponent(city).trim() : '';
  const isStateView = !decodedCity;

  useEffect(() => {
    async function loadData() {
      if (!decodedState) return;
      setIsLoading(true);

      try {
        if (!isStateView) {
          // 1. SPECIFIC CITY VIEW: /destination/:state/:city
          if (decodedCity.toLowerCase() === 'agra') {
            setCityData({
              id: 101,
              name: 'Agra',
              state_name: 'Uttar Pradesh',
              state_code: 'UP',
              tagline: 'Imperial Mughal Capital, UNESCO World Heritage & Living Craft Bazaars',
              description: 'Home to the immortal white-marble Taj Mahal and towering red sandstone Agra Fort. Discover centuries of Mughal architectural mastery, serene Yamuna sunset gardens, fragrant Petha confectionery lanes, and intricate Zardozi embroidery guilds.',
              best_time_to_visit: 'October to March',
              areas: ['Tajganj', 'Rakabganj', 'Moti Bagh', 'Fatehpur Sikri', 'Sikandra', 'Kinari Bazaar', 'Sadar Bazaar'],
              top_experiences: AGRA_POPULAR_DESTINATIONS,
            });
            setExperiences(AGRA_POPULAR_DESTINATIONS);
          } else if (decodedState.toLowerCase() === 'goa' || decodedCity.toLowerCase() === 'goa') {
            setCityData({
              id: 302,
              name: decodedCity || 'Goa',
              state_name: 'Goa',
              state_code: 'GA',
              tagline: 'Sun-Drenched Golden Coastline, UNESCO Baroque Heritage & Cascade Wilderness',
              description: 'India’s premier coastal paradise. Discover golden Arabian Sea shores from Calangute to Palolem, 16th-century Portuguese fortress bastions, UNESCO baroque basilicas, and the roaring Dudhsagar cascade.',
              best_time_to_visit: 'November to March',
              areas: ['Calangute', 'Baga', 'Anjuna', 'Candolim', 'Palolem', 'Old Goa', 'Sinquerim', 'Sonaulim'],
              top_experiences: GOA_POPULAR_DESTINATIONS,
            });
            setExperiences(GOA_POPULAR_DESTINATIONS);
          } else if (decodedCity.toLowerCase() === 'shimla') {
            setCityData({
              id: 39,
              name: 'Shimla',
              state_name: 'Himachal Pradesh',
              state_code: 'HP',
              tagline: 'Colonial Summer Capital, The Ridge Promenade & Alpine Himalayan Panoramas',
              description: 'Nestled amidst cedar and pine clad slopes, Shimla is the Queen of Hills. From the pedestrian bustle of Mall Road and the neo-Gothic Christ Church on The Ridge to sacred Jakhoo summit, colonial Viceregal Lodge, and alpine meadows of Kufri.',
              best_time_to_visit: 'March to June & December to February (Snow)',
              areas: ['The Mall', 'The Ridge', 'Jakhoo Hill', 'Summer Hill', 'Kufri', 'Chotta Shimla'],
              top_experiences: SHIMLA_POPULAR_DESTINATIONS,
            });
            setExperiences(SHIMLA_POPULAR_DESTINATIONS);
          } else if (decodedCity.toLowerCase() === 'almora') {
            setCityData({
              id: 401,
              name: 'Almora',
              state_name: 'Uttarakhand',
              state_code: 'UK',
              tagline: 'Cultural Capital of Kumaon, Magnetic Van Allen Ridge & Himalayan Panoramas',
              description: 'Perched on a horse-saddle ridge in the Kumaon Himalayas, Almora captivates with the spiritual energy of Kasar Devi, sacred bell-ringing of Chitai Golu Devta, 9th-century Katyuri architecture of Katarmal Sun Temple, and 300-km Himalayan vistas at Binsar Zero Point.',
              best_time_to_visit: 'March to June & September to November',
              areas: ['Mall Road', 'Kasar Devi', 'Chitai', 'Binsar', 'Ranikhet Enclave', 'Katarmal'],
              top_experiences: ALMORA_POPULAR_DESTINATIONS,
            });
            setExperiences(ALMORA_POPULAR_DESTINATIONS);
          } else if (decodedCity.toLowerCase() === 'udaipur') {
            setCityData({
              id: 4,
              name: 'Udaipur',
              state_name: 'Rajasthan',
              state_code: 'RJ',
              tagline: 'The City of Lakes, Majestic Mewar Palaces & Sunset Ghats',
              description: 'Historic capital of the kingdom of Mewar, renowned for the colossal 400-year-old City Palace towering over Lake Pichola, hilltop Sajjangarh Monsoon Palace, island sanctuary of Jag Mandir, and the living spiritual carving of Jagdish Temple.',
              best_time_to_visit: 'October to March',
              areas: ['City Palace Complex', 'Lake Pichola Waterfront', 'Sajjangarh Bansdara Peak', 'Jag Mandir Island', 'Old City Jagdish Chowk'],
              top_experiences: UDAIPUR_POPULAR_DESTINATIONS,
            });
            setExperiences(UDAIPUR_POPULAR_DESTINATIONS);
          } else if (decodedCity.toLowerCase() === 'alleppey' || decodedCity.toLowerCase() === 'alappuzha') {
            setCityData({
              id: 501,
              name: 'Alleppey (Alappuzha)',
              state_name: 'Kerala',
              state_code: 'KL',
              tagline: 'The Venice of the East, Serene Backwater Labyrinths & Heritage Coastlines',
              description: 'World-famous network of tranquil canals, lagoons, and backwaters traversed by thatched Kettuvallam houseboats. Discover lush paddy fields cultivated below sea level, historic 150-year-old sea piers, and serene white-sand beaches.',
              best_time_to_visit: 'September to March',
              areas: ['Punnamada', 'Vembanad Backwaters', 'Alappuzha Beach', 'Mararikulam North', 'Kuttanad'],
              top_experiences: ALLEPPEY_POPULAR_DESTINATIONS,
            });
            setExperiences(ALLEPPEY_POPULAR_DESTINATIONS);
          } else if (decodedCity.toLowerCase() === 'kochi' || decodedCity.toLowerCase() === 'cochin') {
            setCityData({
              id: 502,
              name: 'Kochi (Cochin)',
              state_name: 'Kerala',
              state_code: 'KL',
              tagline: 'Queen of the Arabian Sea, 500-Year Spice Port & Colonial Enclaves',
              description: 'Gateway to Kerala shaped by half a millennium of Portuguese, Dutch, British, and Chinese maritime merchant voyages. Explore giant cantilevered Chinese fishing nets, the 1555 CE Dutch Palace murals, and the historic antique lanes of Jew Town & Paradesi Synagogue.',
              best_time_to_visit: 'October to April',
              areas: ['Fort Kochi', 'Mattancherry', 'Jew Town', 'Vasco da Gama Square', 'Marine Drive', 'Ernakulam'],
              top_experiences: KOCHI_POPULAR_DESTINATIONS,
            });
            setExperiences(KOCHI_POPULAR_DESTINATIONS);
          } else if (decodedCity.toLowerCase() === 'munnar') {
            setCityData({
              id: 503,
              name: 'Munnar',
              state_name: 'Kerala',
              state_code: 'KL',
              tagline: 'High-Altitude Western Ghats Tea Capital, Cloud Ridges & Nilgiri Sanctuaries',
              description: 'Perched at 1,600m to 2,695m in the Idukki district. Famous for emerald-green carpeted tea estates, the endangered Nilgiri Tahr at Eravikulam National Park, panoramic lake speedboating at Mattupetty Dam, and 360-degree mountain crest sweeps at Top Station.',
              best_time_to_visit: 'September to May',
              areas: ['Kannan Devan Hills', 'Mattupetty', 'Top Station Highway', 'Eravikulam Range', 'Old Munnar'],
              top_experiences: MUNNAR_POPULAR_DESTINATIONS,
            });
            setExperiences(MUNNAR_POPULAR_DESTINATIONS);
          } else if (decodedCity.toLowerCase() === 'darjeeling') {
            setCityData({
              id: 601,
              name: 'Darjeeling',
              state_name: 'West Bengal',
              state_code: 'WB',
              tagline: 'Queen of the Hills, UNESCO Toy Train & High-Altitude Himalayan Vistas',
              description: 'Perched in the Eastern Himalayas at 2,042m, Darjeeling is legendary for the 1881 UNESCO Toy Train, pre-dawn golden sunrises over Mt. Kanchenjunga from Tiger Hill, spiraling loops at Batasia, emerald slopes producing the Champagne of Teas, and the tranquil Japanese Peace Pagoda.',
              best_time_to_visit: 'March to May & October to December',
              areas: ['Mall Road & Chowrasta', 'Ghoom', 'Batasia', 'Jalapahar', 'Happy Valley', 'Lebong'],
              top_experiences: DARJEELING_POPULAR_DESTINATIONS,
            });
            setExperiences(DARJEELING_POPULAR_DESTINATIONS);
          } else if (decodedCity.toLowerCase() === 'kolkata' || decodedCity.toLowerCase() === 'calcutta') {
            setCityData({
              id: 602,
              name: 'Kolkata',
              state_name: 'West Bengal',
              state_code: 'WB',
              tagline: 'City of Joy, Imperial Marble Marvels & Living Intellectual Heritage',
              description: 'The cultural capital of India along the sacred Hooghly river. Renowned for the glistening white Makrana marble Victoria Memorial, the cantilever engineering wonder Howrah Bridge, Asia’s oldest museum Jadu Ghar, Rani Rashmoni’s sacred Dakshineswar Kali Temple, and Indo-Gothic St. Paul’s Cathedral.',
              best_time_to_visit: 'October to March',
              areas: ['Maidan', 'Park Street', 'Howrah Riverfront', 'Dakshineswar', 'College Street', 'BBD Bagh'],
              top_experiences: KOLKATA_POPULAR_DESTINATIONS,
            });
            setExperiences(KOLKATA_POPULAR_DESTINATIONS);
          } else if (decodedCity.toLowerCase() === 'alibag' || decodedCity.toLowerCase() === 'alibaug') {
            setCityData({
              id: 701,
              name: 'Alibag',
              state_name: 'Maharashtra',
              state_code: 'MH',
              tagline: 'Coastal Forts, Black-Sand Shallows & Pristine Konkan Shores',
              description: 'Gateway to the Konkan coast fringed by coconut and betel nut plantations. Discover 300-year-old Maratha sea bastions at Kolaba Fort, water sports along Alibag Beach, and pristine white sands at Kashid.',
              best_time_to_visit: 'October to May',
              areas: ['Alibag Beach', 'Kolaba Fort Shoal', 'Kashid Coastal Highway', 'Varsoli', 'Nagaon'],
              top_experiences: ALIBAG_POPULAR_DESTINATIONS,
            });
            setExperiences(ALIBAG_POPULAR_DESTINATIONS);
          } else if (
            decodedCity.toLowerCase().includes('sambhajinagar') ||
            decodedCity.toLowerCase().includes('aurangabad')
          ) {
            setCityData({
              id: 702,
              name: 'Chhatrapati Sambhajinagar',
              state_name: 'Maharashtra',
              state_code: 'MH',
              tagline: 'City of Gates, Rock-Cut UNESCO Masterpieces & Deccan Taj',
              description: 'Historical tourism capital of Maharashtra. Home to the 2nd-century BCE Buddhist frescoes of Ajanta, the colossal monolithic Kailasa rock temple of Ellora, and the white marble Mughal monument Bibi Ka Maqbara.',
              best_time_to_visit: 'October to March',
              areas: ['Ajanta Gorge', 'Ellora Charanandri Hills', 'Begumpura', 'Daulatabad', 'Panchakki'],
              top_experiences: CHHATRAPATI_SAMBHAJINAGAR_POPULAR_DESTINATIONS,
            });
            setExperiences(CHHATRAPATI_SAMBHAJINAGAR_POPULAR_DESTINATIONS);
          } else if (decodedCity.toLowerCase() === 'lonavala' || decodedCity.toLowerCase() === 'khandala') {
            setCityData({
              id: 703,
              name: 'Lonavala',
              state_name: 'Maharashtra',
              state_code: 'MH',
              tagline: 'Sahyadri Cloud Forests, Cliff Edges & Historic Maratha Treks',
              description: 'Premier mountain retreat perched high in the Western Ghats. Discover dramatic misty valley sweeps at Tiger’s Leap and Bhushi Dam, canyon overlooks at Khandala Duke’s Nose, and historic Sahyadri ramparts at Rajmachi Fort.',
              best_time_to_visit: 'July to March (Monsoon & Winter)',
              areas: ['Tiger’s Leap Ridge', 'Bhushi Dam', 'Duke’s Nose Khandala', 'Rajmachi Plateau', 'Bushi'],
              top_experiences: LONAVALA_POPULAR_DESTINATIONS,
            });
            setExperiences(LONAVALA_POPULAR_DESTINATIONS);
          } else if (decodedCity.toLowerCase() === 'nagpur') {
            setCityData({
              id: 704,
              name: 'Nagpur',
              state_name: 'Maharashtra',
              state_code: 'MH',
              tagline: 'The Orange City, Sacred Stupa Heritage & Tiger Heartland',
              description: 'Geographical center of India and winter capital of Maharashtra. Renowned for Asia’s largest hollow Buddhist stupa Deekshabhoomi, tranquil sunset promenades at historic Futala Lake, and the wild tiger jungles of Pench.',
              best_time_to_visit: 'October to March',
              areas: ['Ramdaspeth', 'Telangkhedi Waterfront', 'Pench National Park', 'Sitabuldi', 'Civil Lines'],
              top_experiences: NAGPUR_POPULAR_DESTINATIONS,
            });
            setExperiences(NAGPUR_POPULAR_DESTINATIONS);
          } else if (decodedCity.toLowerCase() === 'nashik') {
            setCityData({
              id: 705,
              name: 'Nashik',
              state_name: 'Maharashtra',
              state_code: 'MH',
              tagline: 'Wine Capital of India, Sacred Godavari Jyotirlinga & Ancient Caves',
              description: 'Spiritual and viticultural hub along the holy Godavari river. Home to the ancient Trimbakeshwar Jyotirlinga temple, premier vineyard tastings and barrel cellars at Sula, and the 1st-century BCE rock-cut Pandavleni Caves.',
              best_time_to_visit: 'October to March',
              areas: ['Trimbakeshwar', 'Gangapur Wine Belt', 'Pandavleni Hills', 'Panchavati', 'Godavari Ghats'],
              top_experiences: NASHIK_POPULAR_DESTINATIONS,
            });
            setExperiences(NASHIK_POPULAR_DESTINATIONS);
          } else if (decodedCity.toLowerCase() === 'pune') {
            setCityData({
              id: 706,
              name: 'Pune',
              state_name: 'Maharashtra',
              state_code: 'MH',
              tagline: 'Cultural & Historic Heart of the Marathas, Peshwa Seats & Mountain Citadels',
              description: 'The cultural capital of Maharashtra. Discover the 18th-century fortified seat of the Maratha Empire at Shaniwar Wada, the Italian-arched Gandhi memorial at Aga Khan Palace, and the rugged mountain ramparts of Sinhagad Fort.',
              best_time_to_visit: 'July to March',
              areas: ['Shaniwar Peth', 'Kalyani Nagar', 'Sinhagad Haveli', 'Deccan Gymkhana', 'Kothrud'],
              top_experiences: PUNE_POPULAR_DESTINATIONS,
            });
            setExperiences(PUNE_POPULAR_DESTINATIONS);
          } else if (decodedCity.toLowerCase() === 'kolhapur') {
            setCityData({
              id: 707,
              name: 'Kolhapur',
              state_name: 'Maharashtra',
              state_code: 'MH',
              tagline: 'City of Palaces, Ancient Shakti Peethas & Deccan Mountain Citadels',
              description: 'Historic princely city in Southern Maharashtra. Revered for the ancient 7th-century Chalukyan Mahalakshmi (Ambabai) Temple, the massive granaries and ramparts of Panhala Fort, and rich wrestling and culinary traditions.',
              best_time_to_visit: 'October to March',
              areas: ['Mahadwar Road', 'Panhala Hill Ridge', 'Rankala Lake', 'Bhavani Mandap', 'Shahupuri'],
              top_experiences: KOLHAPUR_POPULAR_DESTINATIONS,
            });
            setExperiences(KOLHAPUR_POPULAR_DESTINATIONS);
          } else if (decodedCity.toLowerCase() === 'jodhpur') {
            setCityData({
              id: 26,
              name: 'Jodhpur',
              state_name: 'Rajasthan',
              state_code: 'RJ',
              tagline: 'The Sun City & Blue Oasis of Marwar, Colossal Citadels & Royal Palaces',
              description: 'Historic capital of the Marwar kingdom, guarded by the invincible cliff-top Mehrangarh Fort. Marvel at the translucent marble cenotaphs of Jaswant Thada, the royal Art Deco grandeur of Umaid Bhawan Palace, and the ancient temple ruins of Mandore Gardens.',
              best_time_to_visit: 'October to March',
              areas: ['Mehrangarh Fort Road', 'Sodagaran Mohalla', 'Umaid Heritage', 'Mandore', 'Clock Tower & Sardar Market'],
              top_experiences: JODHPUR_POPULAR_DESTINATIONS,
            });
            setExperiences(JODHPUR_POPULAR_DESTINATIONS);
          } else if (decodedCity.toLowerCase() === 'jaisalmer') {
            setCityData({
              id: 27,
              name: 'Jaisalmer',
              state_name: 'Rajasthan',
              state_code: 'RJ',
              tagline: 'The Golden City of Thar, Living Sandstone Fortresses & Desert Dunes',
              description: 'Medieval desert jewel rising straight from the Thar Desert sands. Explore the living UNESCO citadel of Sonar Qila, undulating golden sands and camel treks at Sam Sand Dunes, and five centuries of merchant stone filigree at Patwon Ki Haveli.',
              best_time_to_visit: 'October to March',
              areas: ['Sonar Qila Citadel', 'Sam Desert Range', 'Patwa Complex', 'Gadisar Lake', 'Sadar Bazar'],
              top_experiences: JAISALMER_POPULAR_DESTINATIONS,
            });
            setExperiences(JAISALMER_POPULAR_DESTINATIONS);
          } else if (decodedCity.toLowerCase() === 'pushkar') {
            setCityData({
              id: 28,
              name: 'Pushkar',
              state_name: 'Rajasthan',
              state_code: 'RJ',
              tagline: 'Sacred Tirtha Raj, Holy Lake Ghats & Creator Brahma Sanctuary',
              description: 'One of the oldest and holiest pilgrimage towns in India, nestled around the sacred Pushkar Lake. Ringed by 52 bathing ghats, the rare 2,000-year-old Jagatpita Brahma Mandir, and the panoramic sunrise hill shrine of Savitri Mata.',
              best_time_to_visit: 'October to March (Pushkar Camel Fair in November)',
              areas: ['Pushkar Lake Ghats', 'Brahma Mandir Road', 'Ratnagiri Hill', 'Varaha Ghat', 'Bazaars'],
              top_experiences: PUSHKAR_POPULAR_DESTINATIONS,
            });
            setExperiences(PUSHKAR_POPULAR_DESTINATIONS);
          } else {
            const [c, expList] = await Promise.all([
              api.getDestination(decodedState, decodedCity).catch(() => null),
              api.getExperiences({ city: decodedCity, limit: 30 }).catch(() => []),
            ]);

            if (c) {
              setCityData(c);
            } else {
              setCityData({
                id: 999,
                name: decodedCity,
                state_name: decodedState,
                state_code: decodedState.slice(0, 2).toUpperCase(),
                tagline: `Authentic cultural gateway to ${decodedState}`,
                description: `Discover verified local workshops, artisanal guilds, and authentic heritage walks in ${decodedCity}, packed into feasible micro-moment itineraries.`,
                best_time_to_visit: 'October to March',
                areas: [],
                top_experiences: [],
              });
            }

            setExperiences(deduplicateExperienceList(expList || []));
          }
        } else {
          // 2. STATE VIEW: /destination/:state (e.g. /destination/Goa or /destination/Ladakh)
          const [citiesInState, stateExpList] = await Promise.all([
            api.getCities({ state_name: decodedState, limit: 50 }).catch(() => []),
            api.getExperiences({ state: decodedState, limit: 30 }).catch(() => []),
          ]);

          setStateCities(citiesInState || []);

          let combinedExperiences = stateExpList || [];
          if (decodedState.toLowerCase() === 'goa') {
            combinedExperiences = GOA_POPULAR_DESTINATIONS;
            setCityData({
              id: 302,
              name: 'Goa',
              state_name: 'Goa',
              state_code: 'GA',
              tagline: 'Sun-Drenched Golden Coastline, UNESCO Baroque Heritage & Cascade Wilderness',
              description: 'India’s premier coastal paradise. Discover golden Arabian Sea shores from Calangute to Palolem, 16th-century Portuguese fortress bastions, UNESCO baroque basilicas, and the roaring Dudhsagar cascade.',
              best_time_to_visit: 'November to March',
              areas: ['Calangute', 'Baga', 'Anjuna', 'Candolim', 'Palolem', 'Old Goa', 'Sinquerim', 'Sonaulim'],
              top_experiences: GOA_POPULAR_DESTINATIONS,
            });
          } else if (decodedState.toLowerCase() === 'shimla') {
            combinedExperiences = SHIMLA_POPULAR_DESTINATIONS;
            setCityData({
              id: 39,
              name: 'Shimla',
              state_name: 'Himachal Pradesh',
              state_code: 'HP',
              tagline: 'Colonial Summer Capital, The Ridge Promenade & Alpine Himalayan Panoramas',
              description: 'Nestled amidst cedar and pine clad slopes, Shimla is the Queen of Hills. From the pedestrian bustle of Mall Road and the neo-Gothic Christ Church on The Ridge to sacred Jakhoo summit, colonial Viceregal Lodge, and alpine meadows of Kufri.',
              best_time_to_visit: 'March to June & December to February (Snow)',
              areas: ['The Mall', 'The Ridge', 'Jakhoo Hill', 'Summer Hill', 'Kufri', 'Chotta Shimla'],
              top_experiences: SHIMLA_POPULAR_DESTINATIONS,
            });
          } else if (decodedState.toLowerCase() === 'almora') {
            combinedExperiences = ALMORA_POPULAR_DESTINATIONS;
            setCityData({
              id: 401,
              name: 'Almora',
              state_name: 'Uttarakhand',
              state_code: 'UK',
              tagline: 'Cultural Capital of Kumaon, Magnetic Van Allen Ridge & Himalayan Panoramas',
              description: 'Perched on a horse-saddle ridge in the Kumaon Himalayas, Almora captivates with the spiritual energy of Kasar Devi, sacred bell-ringing of Chitai Golu Devta, 9th-century Katyuri architecture of Katarmal Sun Temple, and 300-km Himalayan vistas at Binsar Zero Point.',
              best_time_to_visit: 'March to June & September to November',
              areas: ['Mall Road', 'Kasar Devi', 'Chitai', 'Binsar', 'Ranikhet Enclave', 'Katarmal'],
              top_experiences: ALMORA_POPULAR_DESTINATIONS,
            });
          } else if (decodedState.toLowerCase() === 'udaipur') {
            combinedExperiences = UDAIPUR_POPULAR_DESTINATIONS;
            setCityData({
              id: 4,
              name: 'Udaipur',
              state_name: 'Rajasthan',
              state_code: 'RJ',
              tagline: 'The City of Lakes, Majestic Mewar Palaces & Sunset Ghats',
              description: 'Historic capital of the kingdom of Mewar, renowned for the colossal 400-year-old City Palace towering over Lake Pichola, hilltop Sajjangarh Monsoon Palace, island sanctuary of Jag Mandir, and the living spiritual carving of Jagdish Temple.',
              best_time_to_visit: 'October to March',
              areas: ['City Palace Complex', 'Lake Pichola Waterfront', 'Sajjangarh Bansdara Peak', 'Jag Mandir Island', 'Old City Jagdish Chowk'],
              top_experiences: UDAIPUR_POPULAR_DESTINATIONS,
            });
          } else if (decodedState.toLowerCase().includes('uttar pradesh')) {
            const agraTitles = new Set(AGRA_POPULAR_DESTINATIONS.map((a) => a.title.toLowerCase().trim()));
            const agraIds = new Set(AGRA_POPULAR_DESTINATIONS.map((a) => a.id));
            const other = combinedExperiences.filter((e) => !agraIds.has(e.id) && !agraTitles.has(e.title.toLowerCase().trim()));
            combinedExperiences = [...AGRA_POPULAR_DESTINATIONS, ...other];
          } else if (decodedState.toLowerCase().includes('himachal')) {
            const shimlaTitles = new Set(SHIMLA_POPULAR_DESTINATIONS.map((s) => s.title.toLowerCase().trim()));
            const shimlaIds = new Set(SHIMLA_POPULAR_DESTINATIONS.map((s) => s.id));
            const other = combinedExperiences.filter((e) => !shimlaIds.has(e.id) && !shimlaTitles.has(e.title.toLowerCase().trim()));
            combinedExperiences = [...SHIMLA_POPULAR_DESTINATIONS, ...other];
          } else if (decodedState.toLowerCase().includes('uttarakhand')) {
            const almoraTitles = new Set(ALMORA_POPULAR_DESTINATIONS.map((a) => a.title.toLowerCase().trim()));
            const almoraIds = new Set(ALMORA_POPULAR_DESTINATIONS.map((a) => a.id));
            const other = combinedExperiences.filter((e) => !almoraIds.has(e.id) && !almoraTitles.has(e.title.toLowerCase().trim()));
            combinedExperiences = [...ALMORA_POPULAR_DESTINATIONS, ...other];
          } else if (decodedState.toLowerCase().includes('rajasthan')) {
            const udaipurTitles = new Set(UDAIPUR_POPULAR_DESTINATIONS.map((u) => u.title.toLowerCase().trim()));
            const udaipurIds = new Set(UDAIPUR_POPULAR_DESTINATIONS.map((u) => u.id));
            const other = combinedExperiences.filter((e) => !udaipurIds.has(e.id) && !udaipurTitles.has(e.title.toLowerCase().trim()));
            combinedExperiences = [...UDAIPUR_POPULAR_DESTINATIONS, ...other];
          } else if (decodedState.toLowerCase().includes('kerala')) {
            const keralaTitles = new Set(KERALA_POPULAR_DESTINATIONS.map((k) => k.title.toLowerCase().trim()));
            const keralaIds = new Set(KERALA_POPULAR_DESTINATIONS.map((k) => k.id));
            const other = combinedExperiences.filter((e) => !keralaIds.has(e.id) && !keralaTitles.has(e.title.toLowerCase().trim()));
            combinedExperiences = [...KERALA_POPULAR_DESTINATIONS, ...other];
            setCityData({
              id: 304,
              name: 'Kerala',
              state_name: 'Kerala',
              state_code: 'KL',
              tagline: "God's Own Country • Backwaters, Colonial Ports & Western Ghats Tea Mist",
              description: 'Traverse the backwater canals of Alleppey, 500-year spice enclaves and Chinese fishing nets of Fort Kochi, and high-altitude rolling tea plantations of Munnar.',
              best_time_to_visit: 'September to March',
              areas: ['Alleppey', 'Kochi', 'Munnar', 'Kumarakom', 'Wayanad', 'Varkala'],
              top_experiences: KERALA_POPULAR_DESTINATIONS,
            });
          } else if (decodedState.toLowerCase().includes('bengal')) {
            const wbTitles = new Set(WEST_BENGAL_POPULAR_DESTINATIONS.map((w) => w.title.toLowerCase().trim()));
            const wbIds = new Set(WEST_BENGAL_POPULAR_DESTINATIONS.map((w) => w.id));
            const other = combinedExperiences.filter((e) => !wbIds.has(e.id) && !wbTitles.has(e.title.toLowerCase().trim()));
            combinedExperiences = [...WEST_BENGAL_POPULAR_DESTINATIONS, ...other];
            setCityData({
              id: 305,
              name: 'West Bengal',
              state_name: 'West Bengal',
              state_code: 'WB',
              tagline: 'From Himalayan Ridges of Darjeeling to the Cultural Soul of Kolkata',
              description: 'Experience the duality of West Bengal: the crisp mountain air, UNESCO Toy Train and tea gardens of Darjeeling, paired with the grand imperial marble, Hooghly bridges, and spiritual temples of Kolkata.',
              best_time_to_visit: 'October to March',
              areas: ['Darjeeling', 'Kolkata', 'Kalimpong', 'Sundarbans', 'Shantiniketan', 'Digha'],
              top_experiences: WEST_BENGAL_POPULAR_DESTINATIONS,
            });
          } else if (decodedState.toLowerCase().includes('maharashtra')) {
            const mhTitles = new Set(MAHARASHTRA_POPULAR_DESTINATIONS.map((m) => m.title.toLowerCase().trim()));
            const mhIds = new Set(MAHARASHTRA_POPULAR_DESTINATIONS.map((m) => m.id));
            const other = combinedExperiences.filter((e) => !mhIds.has(e.id) && !mhTitles.has(e.title.toLowerCase().trim()));
            combinedExperiences = [...MAHARASHTRA_POPULAR_DESTINATIONS, ...other];
            setCityData({
              id: 306,
              name: 'Maharashtra',
              state_name: 'Maharashtra',
              state_code: 'MH',
              tagline: 'Maratha Citadels, UNESCO Basalt Caves, Sahyadri Ridges & Konkan Coast',
              description: 'Land of historic warrior kings and ancient rock-cut art. Explore the world-renowned Ajanta & Ellora caves, Sahyadri mountain fortresses of Rajmachi and Sinhagad, coastal bastions at Alibag, Jyotirlinga shrines at Trimbakeshwar, and rolling wine hills in Nashik.',
              best_time_to_visit: 'October to March',
              areas: ['Alibag', 'Chhatrapati Sambhajinagar', 'Lonavala', 'Nagpur', 'Nashik', 'Pune', 'Kolhapur'],
              top_experiences: MAHARASHTRA_POPULAR_DESTINATIONS,
            });
          } else if (decodedState.toLowerCase().includes('rajasthan')) {
            const rjTitles = new Set(RAJASTHAN_POPULAR_DESTINATIONS.map((r) => r.title.toLowerCase().trim()));
            const rjIds = new Set(RAJASTHAN_POPULAR_DESTINATIONS.map((r) => r.id));
            const other = combinedExperiences.filter((e) => !rjIds.has(e.id) && !rjTitles.has(e.title.toLowerCase().trim()));
            combinedExperiences = [...RAJASTHAN_POPULAR_DESTINATIONS, ...other];
            setCityData({
              id: 307,
              name: 'Rajasthan',
              state_name: 'Rajasthan',
              state_code: 'RJ',
              tagline: 'Land of Kings • Desert Citadels, Royal Palaces & Sacred Pilgrimage Ghats',
              description: 'Traverse the royal bastions of Mehrangarh and Umaid Bhawan in Jodhpur, the golden living desert citadel and shifting dunes of Jaisalmer, and the sacred lake ghats and Brahma shrine in holy Pushkar.',
              best_time_to_visit: 'October to March',
              areas: ['Jodhpur', 'Jaisalmer', 'Pushkar', 'Jaipur', 'Udaipur'],
              top_experiences: RAJASTHAN_POPULAR_DESTINATIONS,
            });
          } else if (combinedExperiences.length === 0 && citiesInState && citiesInState.length > 0) {
            const firstCityExp = await api
              .getExperiences({ city: citiesInState[0].name, limit: 30 })
              .catch(() => []);
            combinedExperiences = firstCityExp;
          }

          setExperiences(deduplicateExperienceList(combinedExperiences));

          if (
            decodedState.toLowerCase() !== 'goa' &&
            decodedState.toLowerCase() !== 'shimla' &&
            decodedState.toLowerCase() !== 'almora' &&
            decodedState.toLowerCase() !== 'udaipur' &&
            !decodedState.toLowerCase().includes('kerala') &&
            !decodedState.toLowerCase().includes('bengal') &&
            !decodedState.toLowerCase().includes('maharashtra') &&
            !decodedState.toLowerCase().includes('rajasthan')
          ) {
            setCityData({
              id: 888,
              name: decodedState,
              state_name: decodedState,
              state_code: decodedState.slice(0, 2).toUpperCase(),
              tagline: `Living Heritage, Traditions & Cultural Enclaves of ${decodedState}`,
              description: `Explore centuries of living regional heritage, artisanal craft guilds, historic monuments, and authentic local food chapters across ${decodedState}.`,
              best_time_to_visit: 'Year-round / Seasonal',
              areas: [],
              top_experiences: [],
            });
          }
        }
      } catch (err) {
        console.error('Failed to load destination details:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [decodedState, decodedCity, isStateView]);

  const categories = [
    'All',
    ...Array.from(new Set(experiences.map((e) => e.category).filter(Boolean))),
  ];

  const filteredExperiences =
    activeCategory === 'All'
      ? experiences
      : experiences.filter((e) => e.category === activeCategory);

  return (
    <div className="min-h-screen bg-paper text-ink py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-mono text-dusk-600">
          <Link to="/" className="hover:text-ink transition">
            Home
          </Link>
          <span>/</span>
          <Link to="/destinations" className="hover:text-ink transition">
            Destinations
          </Link>
          <span>/</span>
          {isStateView ? (
            <span className="text-ink font-bold">{decodedState}</span>
          ) : (
            <>
              <Link
                to={`/destination/${encodeURIComponent(decodedState)}`}
                className="text-teal-700 font-bold hover:underline transition"
              >
                {decodedState}
              </Link>
              <span>/</span>
              <span className="text-ink font-bold">{decodedCity}</span>
            </>
          )}
        </div>

        {/* Hero Banner for Destination / State */}
        <div className="bg-ink text-paper rounded-3xl p-8 sm:p-12 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-ink-800 border border-ink-700 text-marigold rounded-full text-xs font-mono font-bold">
              <Compass className="w-3.5 h-3.5" />
              <span>
                {isStateView ? `${decodedState} Cultural Gateway` : `${decodedState} Heritage Enclave`}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-paper-300">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-marigold" />
                <span>Best: {cityData?.best_time_to_visit || 'October to March'}</span>
              </span>
              <span className="flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-marigold" />
                <span>26°C Clear</span>
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight">
              {isStateView ? decodedState : decodedCity}
            </h1>
            <p className="text-sm sm:text-base text-marigold font-mono">
              {cityData?.tagline ||
                (isStateView
                  ? `Authentic regional discovery across ${decodedState}`
                  : `Authentic cultural gateway to ${decodedState}`)}
            </p>
            <p className="text-xs sm:text-sm text-dusk-100 max-w-3xl leading-relaxed font-sans">
              {cityData?.description ||
                cityData?.culture_summary ||
                `Discover verified local workshops, artisanal guilds, and authentic heritage walks in ${isStateView ? decodedState : decodedCity}, packed into feasible micro-moment itineraries.`}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-teal-100 border-t border-ink-700/60 pt-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
              <span>{experiences.length} Feasible Experiences</span>
            </span>
            {isStateView && stateCities.length > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-teal-300" />
                  <span>{stateCities.length} Destination Enclaves</span>
                </span>
              </>
            )}
            <span>•</span>
            <span>Wheelchair & Low Walking Vetted</span>
            <span>•</span>
            <span>Live Artisan & Craft Studios</span>
          </div>
        </div>

        {/* If State View: Show Destination Enclaves in this State */}
        {isStateView && stateCities.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-display font-bold text-ink">
                  Destination Enclaves in {decodedState}
                </h2>
                <p className="text-xs text-dusk-600 font-sans">
                  Select an enclave to explore local districts, neighborhood craft studios, and itineraries
                </p>
              </div>
              <span className="text-xs font-mono text-dusk">
                {stateCities.length} enclaves
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stateCities.map((ct) => (
                <Link
                  key={ct.id}
                  to={`/destination/${encodeURIComponent(decodedState)}/${encodeURIComponent(ct.name)}`}
                  className="group bg-white rounded-2xl border border-paper-400 p-5 shadow-sm hover:shadow-md hover:border-teal transition flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-teal font-bold bg-teal/10 px-2.5 py-0.5 rounded-full">
                        <MapPin className="w-3 h-3 text-marigold" />
                        <span>Enclave Hub</span>
                      </span>
                      <span className="text-xs font-mono text-dusk-500">
                        {ct.heritage_count || 6}+ Sites
                      </span>
                    </div>
                    <h3 className="text-lg font-display font-bold text-ink group-hover:text-teal transition">
                      {ct.name}
                    </h3>
                    <p className="text-xs text-dusk-600 font-sans line-clamp-2">
                      {ct.tagline || ct.description || `Historic enclave in ${decodedState}`}
                    </p>
                  </div>

                  <div className="pt-4 mt-2 border-t border-paper-200 flex items-center justify-between text-xs font-mono text-teal font-bold group-hover:translate-x-1 transition-transform">
                    <span>Explore Enclave</span>
                    <ArrowRight className="w-3.5 h-3.5 text-marigold" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Categories Bar */}
        {categories.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition whitespace-nowrap cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-ink text-white shadow-sm'
                    : 'bg-white border border-paper-400 hover:bg-paper-200 text-ink'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Experiences Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display font-bold text-ink">
              Vetted Cultural Experiences in {isStateView ? decodedState : decodedCity}
            </h2>
            <span className="text-xs font-mono text-dusk">
              Showing {filteredExperiences.length} of {experiences.length}
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-80 bg-white border border-paper-400 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : filteredExperiences.length === 0 ? (
            <div className="bg-white rounded-3xl border border-paper-400 p-12 text-center space-y-4">
              <div className="w-12 h-12 bg-paper-200 rounded-full flex items-center justify-center mx-auto text-ink">
                <Landmark className="w-6 h-6 text-dusk" />
              </div>
              <h3 className="text-lg font-display font-bold text-ink">
                No experiences listed yet for this category in {isStateView ? decodedState : decodedCity}
              </h3>
              <p className="text-xs text-dusk-600 max-w-md mx-auto">
                Explore our full catalogue of authentic micro-experiences or try switching categories.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setActiveCategory('All')}
                  className="px-4 py-2 bg-ink text-white rounded-xl text-xs font-mono font-bold cursor-pointer"
                >
                  Show All Experiences
                </button>
                <Link
                  to="/destinations"
                  className="px-4 py-2 bg-white border border-paper-400 text-ink rounded-xl text-xs font-mono font-bold hover:bg-paper-100"
                >
                  Browse Destinations
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredExperiences.map((exp) => (
                <ExperienceCard key={exp.id} experience={exp} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DestinationDetailPage;
