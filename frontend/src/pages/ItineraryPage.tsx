import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ItineraryTripDetails,
  ItineraryDay,
  ItineraryActivity,
  ItineraryPracticalInfo,
  ItineraryViewMode,
  BookingStatus,
} from '../types/itinerary';
import { TripHeaderOverview } from '../components/itinerary/TripHeaderOverview';
import { ItineraryViewTabs } from '../components/itinerary/ItineraryViewTabs';
import { DayCardTimeline } from '../components/itinerary/DayCardTimeline';
import { TripSummarySidebar } from '../components/itinerary/TripSummarySidebar';
import { ItineraryMapView } from '../components/itinerary/ItineraryMapView';
import { ItineraryListView } from '../components/itinerary/ItineraryListView';
import { ItineraryBudgetView } from '../components/itinerary/ItineraryBudgetView';
import { ShareItineraryModal } from '../components/itinerary/ShareItineraryModal';
import { EditTripModal } from '../components/itinerary/EditTripModal';
import { AddActivityModal } from '../components/itinerary/AddActivityModal';
import { generateDynamicTripPlan } from '../lib/itinerarySolver';
import { INDIAN_STATES_AND_CITIES, POPULAR_CITIES_LIST } from '../data/places';
import {
  Plus,
  Sparkles,
  Compass,
  MapPin,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Check,
  Calendar,
  Layers,
} from 'lucide-react';

// Generate dynamic current dates for the multi-day journey
const getDatesInfo = () => {
  const now = new Date();
  const d1 = new Date(now);
  const d2 = new Date(now);
  d2.setDate(d1.getDate() + 1);
  const d3 = new Date(now);
  d3.setDate(d1.getDate() + 2);

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const formatDayOfWeek = (d: Date) =>
    d.toLocaleDateString('en-US', { weekday: 'long' });

  return {
    d1Date: formatDate(d1),
    d1Day: formatDayOfWeek(d1),
    d2Date: formatDate(d2),
    d2Day: formatDayOfWeek(d2),
    d3Date: formatDate(d3),
    d3Day: formatDayOfWeek(d3),
    startDate: formatDate(d1),
    endDate: `${formatDate(d3)}, ${d3.getFullYear()}`,
  };
};

const datesInfo = getDatesInfo();

// Default Curated Multi-Day Cultural Journey
const DEFAULT_TRIP_DETAILS: ItineraryTripDetails = {
  title: 'Your 3-Day Mumbai & Coastal Heritage Journey',
  destination: 'Mumbai',
  state: 'Maharashtra',
  startDate: datesInfo.startDate,
  endDate: datesInfo.endDate,
  travelers: 2,
  totalBudgetLimit: 25000,
  hotel: 'Taj Heritage Quarter, Colaba',
};

const DEFAULT_PRACTICAL_INFO: ItineraryPracticalInfo = {
  weatherSummary: 'Sunny & Coastal Breeze',
  temperature: '28°C - 32°C',
  packingList: [
    'Breathable light cottons',
    'Comfortable walking shoes',
    'Modesty scarf for temples',
    'Sunscreen & sunglasses',
  ],
  accessibilityNotes:
    'Promenades and major shrines feature step-free ramps. Rock-cut cave sections have uneven stone steps.',
  transitNotes:
    'Metered black-and-yellow taxis are plentiful in South Mumbai; auto-rickshaws operate throughout the suburbs.',
  languages: ['Hindi', 'Marathi', 'English'],
};

const DEFAULT_DAYS: ItineraryDay[] = [
  {
    dayNumber: 1,
    date: datesInfo.d1Date,
    dayOfWeek: datesInfo.d1Day,
    title: 'South Mumbai Architectural Heritage & Arabian Coast',
    heroImage:
      'https://images.pexels.com/photos/33948766/pexels-photo-33948766.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    hotel: 'Colaba Heritage Quarter',
    activities: [
      {
        id: 101,
        timeSlot: 'Morning',
        timeRange: '09:00 AM - 11:30 AM',
        title: 'Gateway Waterfront & Indo-Saracenic Architecture Walk',
        category: 'Heritage & History',
        location: 'Apollo Bunder, Colaba',
        description:
          'Stroll past the iconic 1924 basalt ceremonial arch overlooking the naval harbour, discovering colonial history and maritime trade tales.',
        duration: '2.5 hours',
        durationMins: 150,
        includes: ['Heritage walking guide', 'Historical booklet'],
        costPerPerson: 450,
        bookingStatus: 'confirmed',
        gettingThere: '5-min walk from Colaba hotel base',
        transitTimeMins: 5,
        transitCost: 0,
        whatToBring: ['Comfortable sneakers', 'Camera', 'Sun hat'],
        notes: 'Meet guide Ramesh near the statue at 8:50 AM.',
        photos: [
          '/assets/monuments/gateway-of-india-cutout.png',
        ],
      },
      {
        id: 102,
        timeSlot: 'Breakfast',
        timeRange: '12:00 PM - 01:30 PM',
        title: 'Authentic Parsi Cafe Berry Pulao & Bun Maska Tasting',
        category: 'Food & Culinary',
        location: 'Kala Ghoda Heritage Precinct',
        description:
          'Savor heritage Irani chai, bun maska, and fragrant berry pulao inside one of the city’s century-old atmospheric cafes.',
        duration: '1.5 hours',
        durationMins: 90,
        includes: ['Curated 3-course tasting menu', 'Fresh Irani chai'],
        costPerPerson: 650,
        bookingStatus: 'confirmed',
        gettingThere: '8-min heritage walk through Kala Ghoda art district',
        transitTimeMins: 8,
        transitCost: 0,
        whatToBring: ['Appetite for rich regional spices'],
        notes: 'Table reserved under Piyush.',
        photos: [
          'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80',
        ],
      },
      {
        id: 103,
        timeSlot: 'Afternoon',
        timeRange: '02:30 PM - 04:30 PM',
        title: 'Victorian Gothic Art District & Jehangir Gallery Tour',
        category: 'Art & Craft',
        location: 'Fort & Kala Ghoda, Mumbai',
        description:
          'Discover contemporary Indian paintings, pavement sketch artists, and Indo-Saracenic facades in Mumbai’s cultural art enclave.',
        duration: '2 hours',
        durationMins: 120,
        includes: ['Gallery admission', 'Art curator introduction'],
        costPerPerson: 250,
        bookingStatus: 'available',
        gettingThere: '5-min stroll across the tree-lined avenue',
        transitTimeMins: 5,
        transitCost: 0,
        whatToBring: ['Notebook', 'Reading glasses'],
        notes: '',
        photos: [
          'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&q=80',
        ],
      },
      {
        id: 104,
        timeSlot: 'Evening',
        timeRange: '05:30 PM - 07:30 PM',
        title: "Marine Drive Queen's Necklace Sunset Promenade",
        category: 'Nature & Wildlife',
        location: 'Marine Drive, Netaji Subhash Road',
        description:
          'Watch the golden hour turn into the illuminated Queen’s Necklace lights along the 3.6 km sweeping Arabian Sea boulevard.',
        duration: '2 hours',
        durationMins: 120,
        includes: ['Public coastal promenade access', 'Roasted corn snack stop'],
        costPerPerson: 0,
        bookingStatus: 'confirmed',
        gettingThere: '10-min scenic taxi along Netaji Subhash Road',
        transitTimeMins: 10,
        transitCost: 110,
        whatToBring: ['Light evening jacket', 'Camera'],
        notes: 'Best sunset viewpoint is opposite Churchgate promenade.',
        photos: [
          'https://images.pexels.com/photos/33948766/pexels-photo-33948766.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
        ],
      },
    ],
  },
  {
    dayNumber: 2,
    date: datesInfo.d2Date,
    dayOfWeek: datesInfo.d2Day,
    title: 'Sacred Sanctums & Ancient Basalt Monasteries',
    heroImage:
      'https://images.pexels.com/photos/30722659/pexels-photo-30722659.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    hotel: 'Colaba Heritage Quarter',
    activities: [
      {
        id: 201,
        timeSlot: 'Morning',
        timeRange: '08:00 AM - 10:00 AM',
        title: 'Shree Siddhivinayak Ganpati Temple Morning Aarti',
        category: 'Spiritual & Wellness',
        location: 'Prabhadevi, Dadar',
        description:
          'Experience the morning bells, devotional floral garlands, and gold-plated sanctum of Lord Ganesha, patron deity of Mumbai.',
        duration: '2 hours',
        durationMins: 120,
        includes: ['Priority darshan pass', 'Traditional modak prasad'],
        costPerPerson: 250,
        bookingStatus: 'confirmed',
        gettingThere: '25-min taxi through the coastal Sea Link route',
        transitTimeMins: 25,
        transitCost: 280,
        whatToBring: ['Modest shoulder-covering clothing', 'Slip-on footwear'],
        notes: 'Deposit shoes at counter #3 near the north entrance.',
        photos: [
          'https://images.pexels.com/photos/30722659/pexels-photo-30722659.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
        ],
      },
      {
        id: 202,
        timeSlot: 'Breakfast',
        timeRange: '10:30 AM - 11:30 AM',
        title: 'Authentic Maharashtrian Kothimbir Vadi & Thalipeeth',
        category: 'Food & Culinary',
        location: 'Dadar West',
        description:
          'Taste crispy cilantro cakes, spiced thalipeeth, and fresh filter coffee at iconic regional eatery Prakash.',
        duration: '1 hour',
        durationMins: 60,
        includes: ['Regional breakfast platter', 'Masala chai'],
        costPerPerson: 300,
        bookingStatus: 'available',
        gettingThere: '6-min auto-rickshaw from temple gate',
        transitTimeMins: 6,
        transitCost: 40,
        whatToBring: ['Cash for tip'],
        notes: '',
        photos: [
          'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80',
        ],
      },
      {
        id: 203,
        timeSlot: 'Afternoon',
        timeRange: '01:00 PM - 04:30 PM',
        title: 'Kanheri Caves & Sanjay Gandhi National Park Forest Trail',
        category: 'Heritage & History',
        location: 'Borivali East, Mumbai',
        description:
          'Climb basalt hills to explore 109 rock-cut Buddhist prayer halls and monastic viharas dating back to 1st century BCE amidst dense teak forests.',
        duration: '3.5 hours',
        durationMins: 210,
        includes: ['National park entry', 'ASI monuments pass', 'Park eco-bus'],
        costPerPerson: 180,
        bookingStatus: 'pending',
        gettingThere: 'Metro or direct cab to park gate, then internal shuttle',
        transitTimeMins: 45,
        transitCost: 350,
        whatToBring: ['Walking shoes with grip', 'Mosquito repellent', 'Water bottle'],
        notes: 'Cave 3 has the massive 7-meter Buddha relief.',
        photos: [
          'https://images.pexels.com/photos/18209328/pexels-photo-18209328.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
        ],
      },
      {
        id: 204,
        timeSlot: 'Evening',
        timeRange: '06:00 PM - 07:30 PM',
        title: 'Haji Ali Dargah Tidal Causeway & Sunset Sufi Qawwali',
        category: 'Spiritual & Wellness',
        location: 'Mahalaxmi, Mumbai',
        description:
          'Walk the 500-meter paved causeway projecting into the Arabian Sea to the 15th-century marble Indo-Islamic sanctuary, listening to sea breeze devotional songs.',
        duration: '1.5 hours',
        durationMins: 90,
        includes: ['Open tidal causeway entry', 'Fresh sugarcane juice stop'],
        costPerPerson: 0,
        bookingStatus: 'confirmed',
        gettingThere: '25-min coastal return taxi toward Mahalaxmi',
        transitTimeMins: 25,
        transitCost: 200,
        whatToBring: ['Head covering scarf', 'Small change for flower offerings'],
        notes: 'Check high tide chart; best visited between 5:30 and 7:00 PM.',
        photos: [
          'https://images.pexels.com/photos/2643760/pexels-photo-2643760.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
        ],
      },
    ],
  },
  {
    dayNumber: 3,
    date: datesInfo.d3Date,
    dayOfWeek: datesInfo.d3Day,
    title: 'Textile Guilds, Fragrance Bazaars & Coastal Farewell',
    heroImage:
      'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=800&q=80',
    hotel: 'Colaba Heritage Quarter',
    activities: [
      {
        id: 301,
        timeSlot: 'Morning',
        timeRange: '09:30 AM - 11:30 AM',
        title: 'Traditional Textile Block-Printing & Indigo Dyeing Atelier',
        category: 'Art & Craft',
        location: 'Heritage Guild Studio',
        description:
          'Learn traditional handblock wooden stamping techniques with natural madder and indigo plant dyes, crafting your own silk pocket square.',
        duration: '2 hours',
        durationMins: 120,
        includes: ['Hands-on dye vat materials', 'Pure silk fabric to take home', 'Master artisan guidance'],
        costPerPerson: 850,
        bookingStatus: 'available',
        gettingThere: '12-min cab from hotel',
        transitTimeMins: 12,
        transitCost: 90,
        whatToBring: ['Apron provided, avoid delicate white clothes'],
        notes: 'Artisan workshop starts promptly at 9:30 AM.',
        photos: [
          'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=80',
        ],
      },
      {
        id: 302,
        timeSlot: 'Afternoon',
        timeRange: '12:30 PM - 03:00 PM',
        title: 'Historic Spice Bazaar Sensory Walk & Cardamom Tea',
        category: 'Food & Culinary',
        location: 'Crawford Market & Mirchi Galli',
        description:
          'Weave through narrow trading alleys filled with sacks of Malabar pepper, golden turmeric, dried ginger, and roasted cashews.',
        duration: '2.5 hours',
        durationMins: 150,
        includes: ['Culinary guild host', 'Spices tasting samples', 'Fresh chai'],
        costPerPerson: 550,
        bookingStatus: 'confirmed',
        gettingThere: '15-min taxi through Victorian Fort district',
        transitTimeMins: 15,
        transitCost: 120,
        whatToBring: ['Tote bag for spices', 'Cash for merchant stalls'],
        notes: 'Ask merchant for vacuum-sealed spice packets for flight travel.',
        photos: [
          'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=800&q=80',
        ],
      },
      {
        id: 303,
        timeSlot: 'Evening',
        timeRange: '05:30 PM - 07:30 PM',
        title: 'Arabian Sea Sailboat Sunset Cruise',
        category: 'Nature & Wildlife',
        location: 'Mumbai Harbour Jetty',
        description:
          'Board a wooden seabird sailboat at the Apollo Bunder jetty, catching twilight breezes with views of the illuminated city skyline.',
        duration: '2 hours',
        durationMins: 120,
        includes: ['Private sailboat charter', 'Life jackets & skipper', 'Sunset refreshments'],
        costPerPerson: 1200,
        bookingStatus: 'pending',
        gettingThere: '10-min walk back to Apollo Bunder jetty',
        transitTimeMins: 10,
        transitCost: 0,
        whatToBring: ['Windbreaker', 'Motion sickness tablets if sensitive to waves'],
        notes: 'Arrive at jetty #5 by 5:15 PM for safety briefing.',
        photos: [
          'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
        ],
      },
    ],
  },
];

export function ItineraryPage() {
  const [viewMode, setViewMode] = useState<ItineraryViewMode>('timeline');
  const [tripDetails, setTripDetails] = useState<ItineraryTripDetails>(() => {
    try {
      const saved = localStorage.getItem('lokiva_saved_trip_details');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.startDate || parsed.startDate.includes('Nov 14')) {
          return DEFAULT_TRIP_DETAILS;
        }
        return parsed;
      }
      return DEFAULT_TRIP_DETAILS;
    } catch {
      return DEFAULT_TRIP_DETAILS;
    }
  });

  const [days, setDays] = useState<ItineraryDay[]>(() => {
    try {
      const saved = localStorage.getItem('lokiva_saved_itinerary_days');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed[0]?.date?.includes('Nov 14')) {
          return DEFAULT_DAYS;
        }
        return parsed;
      }
      return DEFAULT_DAYS;
    } catch {
      return DEFAULT_DAYS;
    }
  });

  const [practicalInfo, setPracticalInfo] = useState<ItineraryPracticalInfo>(DEFAULT_PRACTICAL_INFO);

  // Spatio-Temporal Constraint Solver state
  const [searchParams, setSearchParams] = useSearchParams();
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [solverState, setSolverState] = useState('');
  const [solverCity, setSolverCity] = useState(tripDetails.destination || 'Mumbai');
  const [solverDays, setSolverDays] = useState(3);
  const [solverPace, setSolverPace] = useState<'relaxed' | 'balanced' | 'packed'>('balanced');
  const [solverFocus, setSolverFocus] = useState('');
  const [solverBudget, setSolverBudget] = useState(tripDetails.totalBudgetLimit || 25000);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleRunSolver = (cityOverride?: string) => {
    setIsGenerating(true);
    const targetCity = cityOverride || solverCity || 'Mumbai';
    setTimeout(() => {
      const plan = generateDynamicTripPlan({
        city: targetCity,
        state: solverState || undefined,
        daysCount: solverDays,
        pace: solverPace,
        focusCategory: solverFocus,
        budgetLimit: solverBudget,
        travelers: tripDetails.travelers || 2,
      });

      setTripDetails(plan.tripDetails);
      setDays(plan.days);
      setPracticalInfo(plan.practicalInfo);
      setIsGenerating(false);
      setIsGeneratorOpen(false);
    }, 250);
  };

  useEffect(() => {
    const paramCity = searchParams.get('city');
    if (paramCity && paramCity.toLowerCase() !== tripDetails.destination.toLowerCase()) {
      setSolverCity(paramCity);
      const stateObj = INDIAN_STATES_AND_CITIES.find((s) => s.cities.includes(paramCity));
      if (stateObj) {
        setSolverState(stateObj.state);
      }
      handleRunSolver(paramCity);
    }
  }, [searchParams]);

  // Modals state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEditTripModalOpen, setIsEditTripModalOpen] = useState(false);
  const [addActivityDayNumber, setAddActivityDayNumber] = useState<number | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('lokiva_saved_trip_details', JSON.stringify(tripDetails));
    } catch (e) {
      console.warn('Failed to persist trip details:', e);
    }
  }, [tripDetails]);

  useEffect(() => {
    try {
      localStorage.setItem('lokiva_saved_itinerary_days', JSON.stringify(days));
    } catch (e) {
      console.warn('Failed to persist itinerary days:', e);
    }
  }, [days]);

  // Aggregate grand total
  const allActivities = days.flatMap((d) => d.activities);
  const totalExperiencesCost = allActivities.reduce((sum, act) => sum + act.costPerPerson, 0);
  const totalTransitCost = allActivities.reduce((sum, act) => sum + act.transitCost, 0);
  const totalMealsCost = days.length * 850 * tripDetails.travelers;
  const grandTotalCost = totalExperiencesCost + totalTransitCost + totalMealsCost;

  // Handlers for activity management
  const handleUpdateActivityStatus = (dayNumber: number, activityId: number, newStatus: BookingStatus) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.dayNumber !== dayNumber) return d;
        return {
          ...d,
          activities: d.activities.map((a) => (a.id === activityId ? { ...a, bookingStatus: newStatus } : a)),
        };
      })
    );
  };

  const handleUpdateActivityNotes = (dayNumber: number, activityId: number, notes: string) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.dayNumber !== dayNumber) return d;
        return {
          ...d,
          activities: d.activities.map((a) => (a.id === activityId ? { ...a, notes } : a)),
        };
      })
    );
  };

  const handleMoveActivity = (dayNumber: number, fromIndex: number, toIndex: number) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.dayNumber !== dayNumber) return d;
        if (toIndex < 0 || toIndex >= d.activities.length) return d;
        const acts = [...d.activities];
        const [moved] = acts.splice(fromIndex, 1);
        acts.splice(toIndex, 0, moved);
        return { ...d, activities: acts };
      })
    );
  };

  const handleRemoveActivity = (dayNumber: number, activityId: number) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.dayNumber !== dayNumber) return d;
        return {
          ...d,
          activities: d.activities.filter((a) => a.id !== activityId),
        };
      })
    );
  };

  const handleAddActivity = (dayNumber: number, newActivity: ItineraryActivity) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.dayNumber !== dayNumber) return d;
        return {
          ...d,
          activities: [...d.activities, newActivity],
        };
      })
    );
  };

  const handleAddNewDay = () => {
    const nextDayNum = days.length + 1;
    const newDay: ItineraryDay = {
      dayNumber: nextDayNum,
      date: `Day ${nextDayNum}`,
      dayOfWeek: 'Cultural Day',
      title: `Day ${nextDayNum}: Local Guilds & Exploration`,
      heroImage:
        'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=80',
      hotel: tripDetails.hotel,
      activities: [],
    };
    setDays([...days, newDay]);
  };

  const handleRemoveDay = (dayNumber: number) => {
    if (days.length <= 1) return;
    const filtered = days.filter((d) => d.dayNumber !== dayNumber);
    // Re-index remaining days
    const reindexed = filtered.map((d, idx) => ({ ...d, dayNumber: idx + 1 }));
    setDays(reindexed);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-paper text-ink py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Dynamic Spatio-Temporal Constraint Solver Card */}
        <div className="bg-[#FAF7F2] border border-[#E5DFD5] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 no-print">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C1443B]" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#C1443B]">
                  Spatio-Temporal Constraint Solver
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-ink">
                Plan Dynamic Journey in {tripDetails.destination}
              </h2>
              <p className="text-xs sm:text-sm text-dusk font-normal">
                Clusters verified local experiences, artisan workshops, and food spots to minimize transit and avoid zigzagging.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsGeneratorOpen(!isGeneratorOpen)}
              className="px-4 py-2.5 bg-ink hover:bg-ink-700 text-white rounded-xl text-xs sm:text-sm font-heading font-bold transition flex items-center gap-2 shrink-0 cursor-pointer shadow-xs"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#C1443B]" />
              <span>{isGeneratorOpen ? 'Hide Route Solver' : 'Customize Destination & Route'}</span>
              {isGeneratorOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Quick Popular Cities Carousel */}
          <div className="pt-2 border-t border-[#E5DFD5]/80 space-y-2">
            <span className="text-[11px] font-mono text-dusk uppercase tracking-wider block">
              Quick Pick Iconic Destinations:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none [-webkit-overflow-scrolling:touch]">
              {POPULAR_CITIES_LIST.map((cityName) => {
                const isActive = tripDetails.destination.toLowerCase() === cityName.toLowerCase();
                return (
                  <button
                    key={cityName}
                    type="button"
                    onClick={() => {
                      setSolverCity(cityName);
                      const sObj = INDIAN_STATES_AND_CITIES.find((s) => s.cities.includes(cityName));
                      if (sObj) setSolverState(sObj.state);
                      handleRunSolver(cityName);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-heading font-medium whitespace-nowrap transition cursor-pointer ${
                      isActive
                        ? 'bg-ink text-white font-semibold shadow-xs'
                        : 'bg-white text-ink hover:bg-[#F2ECE4] border border-[#E5DFD5] shadow-2xs'
                    }`}
                  >
                    {cityName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Collapsible Full Solver Parameters */}
          {isGeneratorOpen && (
            <div className="pt-4 border-t border-[#E5DFD5] grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* State */}
              <div className="md:col-span-3 space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-dusk font-bold">
                  State / Territory
                </label>
                <select
                  value={solverState}
                  onChange={(e) => {
                    setSolverState(e.target.value);
                    const s = INDIAN_STATES_AND_CITIES.find((it) => it.state === e.target.value);
                    if (s && s.cities.length > 0) {
                      setSolverCity(s.cities[0]);
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-[#E5DFD5] rounded-xl text-xs font-sans text-ink cursor-pointer focus:outline-none focus:border-ink shadow-xs"
                >
                  <option value="">All 36 States & UTs</option>
                  {INDIAN_STATES_AND_CITIES.map((s) => (
                    <option key={s.code} value={s.state}>
                      {s.state} ({s.cities.length} cities)
                    </option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div className="md:col-span-3 space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-dusk font-bold">
                  Destination City
                </label>
                <select
                  value={solverCity}
                  onChange={(e) => setSolverCity(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E5DFD5] rounded-xl text-xs font-sans text-ink cursor-pointer focus:outline-none focus:border-ink shadow-xs"
                >
                  {solverState ? (
                    INDIAN_STATES_AND_CITIES.find((s) => s.state === solverState)?.cities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))
                  ) : (
                    POPULAR_CITIES_LIST.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Duration */}
              <div className="md:col-span-2 space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-dusk font-bold">
                  Days Count
                </label>
                <div className="flex rounded-xl border border-[#E5DFD5] overflow-hidden bg-white shadow-xs">
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSolverDays(num)}
                      className={`flex-1 py-2 text-xs font-heading font-bold transition cursor-pointer ${
                        solverDays === num ? 'bg-ink text-white' : 'text-dusk hover:bg-paper-100'
                      }`}
                    >
                      {num} {num === 1 ? 'Day' : 'Days'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pace */}
              <div className="md:col-span-2 space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-dusk font-bold">
                  Travel Pace
                </label>
                <select
                  value={solverPace}
                  onChange={(e) => setSolverPace(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-[#E5DFD5] rounded-xl text-xs font-sans text-ink cursor-pointer focus:outline-none focus:border-ink shadow-xs"
                >
                  <option value="relaxed">Relaxed (3 stops/day)</option>
                  <option value="balanced">Balanced (4 stops/day)</option>
                  <option value="packed">Packed (5 stops/day)</option>
                </select>
              </div>

              {/* Focus Vertical */}
              <div className="md:col-span-2 space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-dusk font-bold">
                  Cultural Focus
                </label>
                <select
                  value={solverFocus}
                  onChange={(e) => setSolverFocus(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E5DFD5] rounded-xl text-xs font-sans text-ink cursor-pointer focus:outline-none focus:border-ink shadow-xs"
                >
                  <option value="">All Traditions (Balanced)</option>
                  <option value="Food & Culinary">Street Food & Iconic Eateries</option>
                  <option value="Art & Craft">Artisan Guilds & Workshops</option>
                  <option value="Local Walks">Local Walks & Bazaars</option>
                  <option value="Nature & Wildlife">Nature & Wilderness</option>
                  <option value="Heritage & History">Sacred Shrines & Heritage</option>
                </select>
              </div>

              {/* Run Solver CTA */}
              <div className="md:col-span-12 pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => handleRunSolver()}
                  disabled={isGenerating}
                  className="px-6 py-2.5 bg-[#C1443B] hover:bg-[#A83830] text-white text-xs font-heading font-bold rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isGenerating ? 'Optimizing Spatial Route...' : `Generate ${solverCity} Itinerary`}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Top Header Card */}
        <TripHeaderOverview
          tripDetails={tripDetails}
          totalCost={grandTotalCost}
          onEditTrip={() => setIsEditTripModalOpen(true)}
          onShare={() => setIsShareModalOpen(true)}
          onPrint={handlePrint}
        />

        {/* View Switcher Tabs (no-print) */}
        <div className="no-print">
          <ItineraryViewTabs currentView={viewMode} onViewChange={setViewMode} />
        </div>

        {/* Main Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left 2 Columns: Active View Content */}
          <div className="lg:col-span-2 space-y-8">
            {viewMode === 'timeline' && (
              <div className="space-y-8">
                {days.map((day) => (
                  <DayCardTimeline
                    key={day.dayNumber}
                    day={day}
                    totalDays={days.length}
                    onUpdateActivityStatus={handleUpdateActivityStatus}
                    onUpdateActivityNotes={handleUpdateActivityNotes}
                    onMoveActivity={handleMoveActivity}
                    onRemoveActivity={handleRemoveActivity}
                    onAddActivityClick={(dNum) => setAddActivityDayNumber(dNum)}
                    onRemoveDay={handleRemoveDay}
                  />
                ))}

                {/* Add Next Day Action Button */}
                <div className="text-center pt-2 no-print">
                  <button
                    type="button"
                    onClick={handleAddNewDay}
                    className="px-6 py-3.5 bg-white hover:bg-paper-100 text-ink rounded-2xl font-mono text-xs font-bold border border-paper-400 shadow-sm transition inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-marigold" />
                    <span>Add Day {days.length + 1} to Itinerary</span>
                  </button>
                </div>
              </div>
            )}

            {viewMode === 'map' && <ItineraryMapView days={days} />}

            {viewMode === 'list' && <ItineraryListView days={days} />}

            {viewMode === 'budget' && (
              <ItineraryBudgetView days={days} tripDetails={tripDetails} />
            )}
          </div>

          {/* Right 1 Column: Sticky Summary & Practical Sidebar */}
          <div className="no-print">
            <TripSummarySidebar
              tripDetails={tripDetails}
              days={days}
              practicalInfo={practicalInfo}
              onShare={() => setIsShareModalOpen(true)}
              onPrint={handlePrint}
            />
          </div>
        </div>
      </div>

      {/* Interactive Modals */}
      <ShareItineraryModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        tripDetails={tripDetails}
        onPrint={handlePrint}
      />

      <EditTripModal
        isOpen={isEditTripModalOpen}
        onClose={() => setIsEditTripModalOpen(false)}
        tripDetails={tripDetails}
        onSave={(updated) => setTripDetails(updated)}
      />

      {addActivityDayNumber !== null && (
        <AddActivityModal
          isOpen={true}
          dayNumber={addActivityDayNumber}
          onClose={() => setAddActivityDayNumber(null)}
          onAddActivity={handleAddActivity}
        />
      )}
    </main>
  );
}

export default ItineraryPage;
