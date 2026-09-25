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
  return 'India';
}

