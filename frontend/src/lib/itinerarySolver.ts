import { Experience } from '../types';
import {
  ItineraryTripDetails,
  ItineraryDay,
  ItineraryActivity,
  ItineraryPracticalInfo,
  TimeOfDaySlot,
} from '../types/itinerary';
import { getPlacesByCity, ALL_LOKIVA_PLACES } from '../data/places';
import { resolveImageUrl } from './api';

export interface GenerateTripOptions {
  city: string;
  state?: string;
  daysCount?: number;
  pace?: 'relaxed' | 'balanced' | 'packed';
  focusCategory?: string;
  budgetLimit?: number;
  travelers?: number;
}

// Haversine distance in kilometers
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Slot templates for different daily slots
const TIME_SLOT_DEFS: Array<{ slot: TimeOfDaySlot; timeRange: string; defaultCategory: string }> = [
  { slot: 'Morning', timeRange: '09:00 AM - 11:30 AM', defaultCategory: 'Local Walks' },
  { slot: 'Breakfast', timeRange: '12:00 PM - 01:30 PM', defaultCategory: 'Food & Culinary' },
  { slot: 'Afternoon', timeRange: '02:30 PM - 04:30 PM', defaultCategory: 'Art & Craft' },
  { slot: 'Evening', timeRange: '05:30 PM - 07:30 PM', defaultCategory: 'Heritage & History' },
  { slot: 'Dinner', timeRange: '08:00 PM - 09:30 PM', defaultCategory: 'Food & Culinary' },
];

export function generateDynamicTripPlan(options: GenerateTripOptions): {
  tripDetails: ItineraryTripDetails;
  days: ItineraryDay[];
  practicalInfo: ItineraryPracticalInfo;
} {
  const {
    city,
    daysCount = 3,
    pace = 'balanced',
    focusCategory = '',
    budgetLimit = 25000,
    travelers = 2,
  } = options;

  // Retrieve matching places for city
  let candidates = getPlacesByCity(city);

  // Fallback if city has fewer places than needed
  if (candidates.length < daysCount * 3) {
    const backupPlaces = ALL_LOKIVA_PLACES.filter(
      (p) =>
        p.city.toLowerCase().includes(city.toLowerCase()) ||
        (options.state && p.state && p.state.toLowerCase() === options.state.toLowerCase())
    );
    candidates = [...candidates, ...backupPlaces];
  }

  if (candidates.length === 0) {
    candidates = ALL_LOKIVA_PLACES.slice(0, 30);
  }

  // Deduplicate candidates by id
  const seenIds = new Set<number>();
  const uniqueCandidates: Experience[] = [];
  for (const c of candidates) {
    if (!seenIds.has(c.id)) {
      seenIds.add(c.id);
      uniqueCandidates.push(c);
    }
  }

  // Sort/filter by focusCategory if specified
  if (focusCategory && focusCategory.trim()) {
    uniqueCandidates.sort((a, b) => {
      const aMatches = (a.category || '').toLowerCase().includes(focusCategory.toLowerCase());
      const bMatches = (b.category || '').toLowerCase().includes(focusCategory.toLowerCase());
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return 0;
    });
  }

  // Determine activities per day based on pace
  const activitiesPerDay = pace === 'relaxed' ? 3 : pace === 'packed' ? 5 : 4;
  const totalRequired = daysCount * activitiesPerDay;

  // Select top candidates
  const selectedPlaces = uniqueCandidates.slice(0, Math.max(totalRequired, 6));

  // Determine State
  const resolvedState =
    options.state ||
    (selectedPlaces.length > 0 && selectedPlaces[0].state ? selectedPlaces[0].state : 'India');

  // Dates generator
  const now = new Date();
  const days: ItineraryDay[] = [];

  for (let d = 0; d < daysCount; d++) {
    const dayDate = new Date(now);
    dayDate.setDate(now.getDate() + d);

    const dateStr = dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayOfWeek = dayDate.toLocaleDateString('en-US', { weekday: 'long' });

    // Slice places for this day
    const dayPlaces = selectedPlaces.slice(d * activitiesPerDay, (d + 1) * activitiesPerDay);

    // If not enough unique places, wrap around gracefully
    if (dayPlaces.length < activitiesPerDay) {
      const needed = activitiesPerDay - dayPlaces.length;
      for (let i = 0; i < needed; i++) {
        const wrapIndex = (i + d * 2) % selectedPlaces.length;
        dayPlaces.push(selectedPlaces[wrapIndex]);
      }
    }

    // Sort day places geographically using nearest-neighbor starting from first item
    const sortedDayPlaces: Experience[] = [dayPlaces[0]];
    const remaining = dayPlaces.slice(1);

    while (remaining.length > 0) {
      const last = sortedDayPlaces[sortedDayPlaces.length - 1];
      let bestIdx = 0;
      let minDistance = Infinity;

      for (let i = 0; i < remaining.length; i++) {
        const dist = getDistanceKm(
          last.latitude || 20.0,
          last.longitude || 78.0,
          remaining[i].latitude || 20.0,
          remaining[i].longitude || 78.0
        );
        if (dist < minDistance) {
          minDistance = dist;
          bestIdx = i;
        }
      }

      sortedDayPlaces.push(remaining.splice(bestIdx, 1)[0]);
    }

    // Build activities
    const activities: ItineraryActivity[] = sortedDayPlaces.map((place, idx) => {
      const slotDef = TIME_SLOT_DEFS[idx % TIME_SLOT_DEFS.length];

      // Calculate transit from previous stop
      let gettingThere = 'Depart from accommodation';
      let transitTimeMins = 10;
      let transitCost = 0;

      if (idx > 0) {
        const prev = sortedDayPlaces[idx - 1];
        const distKm = getDistanceKm(
          prev.latitude || 20.0,
          prev.longitude || 78.0,
          place.latitude || 20.0,
          place.longitude || 78.0
        );

        if (distKm < 0.9) {
          const walkMins = Math.max(5, Math.round(distKm * 15));
          gettingThere = `${walkMins}-min heritage stroll through ${place.area_name || 'the local quarter'}`;
          transitTimeMins = walkMins;
          transitCost = 0;
        } else {
          const rideMins = Math.max(8, Math.round(distKm * 4 + 6));
          const fare = Math.round(30 + distKm * 14);
          gettingThere = `${rideMins}-min auto-rickshaw or taxi (${distKm.toFixed(1)} km)`;
          transitTimeMins = rideMins;
          transitCost = fare;
        }
      }

      const photoUrl =
        place.image_url && !place.image_url.includes('PASTE_IMAGE')
          ? resolveImageUrl(place.image_url)
          : place.image_urls && place.image_urls.length > 0
          ? resolveImageUrl(place.image_urls[0])
          : 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80';

      return {
        id: 1000 + d * 100 + idx,
        experienceId: place.id,
        timeSlot: slotDef.slot,
        timeRange: slotDef.timeRange,
        title: place.title,
        category: place.category,
        location: place.area_name ? `${place.area_name}, ${city}` : `${city}, ${resolvedState}`,
        description: place.description || place.tagline || 'Curated cultural encounter.',
        duration: `${Math.round((place.approx_duration_mins || 60) / 60 * 10) / 10} hours`,
        durationMins: place.approx_duration_mins || 60,
        includes: [
          'Verified local cultural access',
          'Curated insider commentary',
          place.price === 0 ? 'Complimentary entry' : 'Admission pass included',
        ],
        costPerPerson: place.price || 0,
        bookingStatus: idx % 2 === 0 ? 'confirmed' : 'available',
        gettingThere,
        transitTimeMins,
        transitCost,
        whatToBring: [
          'Comfortable walking footwear',
          'Camera or smartphone',
          'Modest clothing for sacred places',
        ],
        notes: place.tagline ? `Highlight: ${place.tagline}` : undefined,
        photos: [photoUrl],
        accessibility: place.wheelchair_accessible ? 'Step-free access supported' : 'Standard walking route',
        lat: place.latitude,
        lng: place.longitude,
      };
    });

    const heroImage =
      activities.length > 0 && activities[0].photos.length > 0
        ? activities[0].photos[0]
        : 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80';

    const dayTitles = [
      `Historic Enclaves & Living Traditions of ${city}`,
      `Artisanal Workshops & Culinary Heritage of ${city}`,
      `Sacred Shrines & Natural Sanctuaries of ${city}`,
    ];

    days.push({
      dayNumber: d + 1,
      date: dateStr,
      dayOfWeek,
      title: dayTitles[d % dayTitles.length],
      heroImage,
      hotel: `${city} Heritage Haveli & Residency`,
      activities,
    });
  }

  // Start / End date strings
  const firstDate = days[0].date;
  const lastDate = `${days[days.length - 1].date}, ${now.getFullYear()}`;

  const tripDetails: ItineraryTripDetails = {
    title: `Your ${daysCount}-Day ${city} Cultural & Heritage Journey`,
    destination: city,
    state: resolvedState,
    startDate: firstDate,
    endDate: lastDate,
    travelers,
    totalBudgetLimit: budgetLimit,
    hotel: `${city} Heritage Haveli & Residency`,
  };

  const practicalInfo: ItineraryPracticalInfo = {
    weatherSummary: 'Pleasant & Mild Breeze',
    temperature: '22°C - 30°C',
    packingList: [
      'Breathable natural cottons',
      'Comfortable walking shoes with socks',
      'Light shawl or scarf for temple sanctums',
      'Sunscreen, hat, and sunglasses',
      'Refillable copper or steel water bottle',
    ],
    accessibilityNotes:
      'Major temple courtyards and promenades offer step-free access. Historic market alleys may have paved cobblestones.',
    transitNotes:
      'Prepaid auto-rickshaws, app-based rides, and walking routes connect all curated stops conveniently.',
    languages: ['Hindi', 'English', 'Regional Language'],
  };

  return { tripDetails, days, practicalInfo };
}
