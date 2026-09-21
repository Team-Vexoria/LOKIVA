import { Experience } from '../types';
import {
  ItineraryTripDetails,
  ItineraryDay,
  ItineraryActivity,
  ItineraryPracticalInfo,
  DayFeasibilityMetrics,
  FeasibilityWarning,
  TimeOfDaySlot,
  ReplanCondition,
} from '../types/itinerary';
import { getPlacesByCity, ALL_LOKIVA_PLACES } from '../data/places';
import { USER_CURATED_PLACES } from '../data/userVerifiedPlacesData';
import { resolveImageUrl } from './api';

export interface GenerateTripOptions {
  city: string;
  state?: string;
  daysCount?: number;
  pace?: 'relaxed' | 'balanced' | 'packed';
  focusCategory?: string;
  budgetLimit?: number;
  travelers?: number;
  startDate?: string;
}

// Haversine distance in kilometers between two geographic coordinates
export function getHaversineDistanceKm(
  lat1?: number,
  lon1?: number,
  lat2?: number,
  lon2?: number
): number {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return 2.5; // realistic fallback default for city transit
  }
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
  return Math.round(R * c * 10) / 10;
}

// Convert minutes from midnight to "HH:MM" 24h string
export function minutesToTime24(totalMinutes: number): string {
  const normalized = Math.max(0, Math.min(24 * 60 - 1, Math.round(totalMinutes)));
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

// Convert "HH:MM" or "08:30 AM" to minutes from midnight
export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr) return 8 * 60 + 30; // default 08:30 AM

  // Handle 12-hour format with AM/PM
  const match12 = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const mins = parseInt(match12[2], 10);
    const meridian = (match12[3] || '').toUpperCase();
    if (meridian === 'PM' && hours < 12) hours += 12;
    if (meridian === 'AM' && hours === 12) hours = 0;
    return hours * 60 + mins;
  }

  // Handle 24-hour "HH:MM"
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    const hours = parseInt(parts[0], 10) || 0;
    const mins = parseInt(parts[1], 10) || 0;
    return hours * 60 + mins;
  }

  return 8 * 60 + 30;
}

// Format minutes from midnight to clean 12-hour display e.g. "08:30 AM"
export function formatMinutesTo12h(totalMinutes: number): string {
  const normalized = Math.max(0, Math.min(24 * 60 - 1, Math.round(totalMinutes)));
  let hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  const meridian = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${meridian}`;
}

// Determine slot based on start minute
export function getSlotForMinutes(minutes: number, category: string = ''): TimeOfDaySlot {
  const cat = category.toLowerCase();
  if (minutes < 11 * 60 + 30) {
    return 'Morning';
  }
  if (minutes >= 11 * 60 + 30 && minutes < 14 * 60 + 30) {
    return cat.includes('food') || cat.includes('culinary') || cat.includes('dining')
      ? 'Breakfast'
      : 'Afternoon';
  }
  if (minutes >= 14 * 60 + 30 && minutes < 17 * 60 + 30) {
    return 'Afternoon';
  }
  if (minutes >= 17 * 60 + 30 && minutes < 20 * 60) {
    return 'Evening';
  }
  return 'Dinner';
}

/**
 * Recalculates sequentially all start/end times, transit times, and distances
 * across a single day's activity sequence starting from dayStartTime.
 */
export function recalculateDaySchedule(
  day: ItineraryDay,
  travelers: number = 2
): { day: ItineraryDay; metrics: DayFeasibilityMetrics } {
  const activities = [...day.activities];
  if (activities.length === 0) {
    return {
      day,
      metrics: {
        paceScore: 100,
        paceLabel: 'Relaxed',
        totalSightseeingMinutes: 0,
        totalTransitMinutes: 0,
        totalTransitDistanceKm: 0,
        estimatedWalkingSteps: 0,
        localImpactScore: 92,
        warnings: [],
        costBreakdown: { ticketCost: 0, transitCost: 0, foodCost: 0, totalCost: 0 },
      },
    };
  }

  let currentClockMinutes = timeStringToMinutes(day.dayStartTime || '08:30');
  let totalSightseeingMinutes = 0;
  let totalTransitMinutes = 0;
  let totalTransitDistanceKm = 0;
  let totalWalkingKm = 0;
  let totalTicketCost = 0;
  let totalTransitCost = 0;
  let totalFoodCost = 0;
  const warnings: FeasibilityWarning[] = [];

  const updatedActivities: ItineraryActivity[] = [];

  for (let i = 0; i < activities.length; i++) {
    const act = { ...activities[i] };
    const visitDuration = act.visitDurationMinutes || act.durationMins || 60;
    act.visitDurationMinutes = visitDuration;
    act.durationMins = visitDuration;
    act.duration = `${visitDuration} mins`;

    const startMin = currentClockMinutes;
    const endMin = startMin + visitDuration;

    act.startTime = formatMinutesTo12h(startMin);
    act.endTime = formatMinutesTo12h(endMin);
    act.timeRange = `${act.startTime} - ${act.endTime}`;
    act.timeSlot = getSlotForMinutes(startMin, act.category);

    totalSightseeingMinutes += visitDuration;
    totalTicketCost += (act.costPerPerson || 0) * travelers;

    if (act.category.toLowerCase().includes('food') || act.category.toLowerCase().includes('culinary')) {
      totalFoodCost += 350 * travelers;
    }

    // Transit to next stop if not last
    if (i < activities.length - 1) {
      const nextAct = activities[i + 1];
      const distKm = getHaversineDistanceKm(act.lat, act.lng, nextAct.lat, nextAct.lng);
      act.transitDistanceKm = distKm;
      totalTransitDistanceKm += distKm;

      if (distKm <= 1.2) {
        act.transitMode = 'walking';
        act.transitToNextMinutes = Math.max(5, Math.ceil((distKm / 4.0) * 60) + 2);
        act.transitCost = 0;
        act.gettingThere = `Short ${Math.round(distKm * 1000)}m heritage walk (~${act.transitToNextMinutes} mins)`;
        totalWalkingKm += distKm;
      } else {
        act.transitMode = 'auto_rickshaw';
        act.transitToNextMinutes = Math.max(10, Math.ceil((distKm / 20.0) * 60) + 5);
        act.transitCost = Math.round(30 + distKm * 15);
        act.gettingThere = `Auto-rickshaw or taxi across ${distKm} km (~${act.transitToNextMinutes} mins)`;
        totalTransitCost += act.transitCost;
      }

      totalTransitMinutes += act.transitToNextMinutes;
      currentClockMinutes = endMin + act.transitToNextMinutes;
    } else {
      act.transitDistanceKm = 0;
      act.transitToNextMinutes = 0;
      act.transitCost = 0;
      act.gettingThere = 'End of scheduled exploration for today';
      currentClockMinutes = endMin;
    }

    // ─── INDIA DOMAIN CONSTRAINT CHECKS ──────────────────────────────────────

    // 1. Temple Afternoon Closure (12:30 PM to 4:00 PM)
    const isTemple =
      act.category.toLowerCase().includes('spiritual') ||
      act.title.toLowerCase().includes('temple') ||
      act.title.toLowerCase().includes('mandir') ||
      act.title.toLowerCase().includes('dham');

    if (isTemple) {
      const templeOverlap =
        (startMin >= 12 * 60 + 30 && startMin < 16 * 60) ||
        (endMin > 12 * 60 + 30 && endMin <= 16 * 60);
      if (templeOverlap) {
        warnings.push({
          id: `temple-close-${act.id}`,
          type: 'TEMPLE_AFTERNOON_CLOSURE',
          severity: 'critical',
          activityId: act.id,
          message: `${act.title} is traditionally closed for Darshan between 12:30 PM and 04:00 PM.`,
          recommendation: 'Recommend rescheduling to early morning or after 04:30 PM evening Aarti.',
        });
      }
    }

    // 2. Weekly Landmark Closed Days
    const dayName = (day.dayOfWeek || '').toLowerCase();
    const titleLower = act.title.toLowerCase();

    if (titleLower.includes('taj mahal') && dayName === 'friday') {
      warnings.push({
        id: `closed-taj-${act.id}`,
        type: 'LANDMARK_CLOSED_DAY',
        severity: 'critical',
        activityId: act.id,
        message: 'Taj Mahal is strictly closed to the public on Fridays for prayers.',
        recommendation: 'Swap with Mehtab Bagh sunset garden or Agra Fort today.',
      });
    }

    if (
      (titleLower.includes('red fort') ||
        titleLower.includes('victoria memorial') ||
        titleLower.includes('sun temple')) &&
      dayName === 'monday'
    ) {
      warnings.push({
        id: `closed-mon-${act.id}`,
        type: 'LANDMARK_CLOSED_DAY',
        severity: 'critical',
        activityId: act.id,
        message: `${act.title} is closed to the public on Mondays.`,
        recommendation: 'Shift this landmark to a Tuesday or weekend day.',
      });
    }

    // 3. Midday Heat Buffer (12:30 PM to 03:30 PM) for non-indoor outdoor tours
    const isOutdoor =
      !act.is_indoor &&
      !act.category.toLowerCase().includes('food') &&
      !act.category.toLowerCase().includes('art') &&
      !act.category.toLowerCase().includes('craft');

    if (isOutdoor && startMin >= 12 * 60 + 30 && startMin < 15 * 60 + 30) {
      warnings.push({
        id: `heat-${act.id}`,
        type: 'MIDDAY_HEAT_EXPOSURE',
        severity: 'warning',
        activityId: act.id,
        message: `Midday peak sun exposure during outdoor stop at ${act.title}.`,
        recommendation: 'Consider an indoor shaded workshop or cultural thali lunch during peak heat.',
      });
    }

    updatedActivities.push(act);
  }

  // 4. Day Finish Boundary Check (After 21:30 / 9:30 PM)
  if (currentClockMinutes > 21 * 60 + 30) {
    warnings.push({
      id: 'day-overbudget',
      type: 'OVER_BUDGET_HOURS',
      severity: 'warning',
      message: `Schedule concludes late at ${formatMinutesTo12h(currentClockMinutes)}.`,
      recommendation: 'Consider removing or shifting an activity to maintain a comfortable rest buffer.',
    });
  }

  // Estimated walking steps
  const estimatedWalkingSteps = Math.round(
    totalSightseeingMinutes * 35 + totalWalkingKm * 1350 + (activities.length * 200)
  );

  if (estimatedWalkingSteps > 15000) {
    warnings.push({
      id: 'high-walking',
      type: 'EXCESSIVE_WALKING',
      severity: 'info',
      message: `Intense physical day with ~${estimatedWalkingSteps.toLocaleString()} walking steps.`,
      recommendation: 'Opt for auto-rickshaws between longer alleys if traveling with seniors.',
    });
  }

  // Compute Pace Score (0 to 100)
  let paceScore = 100;
  warnings.forEach((w) => {
    if (w.severity === 'critical') paceScore -= 18;
    else if (w.severity === 'warning') paceScore -= 10;
    else paceScore -= 4;
  });

  const totalDayHours = (currentClockMinutes - timeStringToMinutes(day.dayStartTime || '08:30')) / 60;
  if (totalDayHours > 10) paceScore -= 12;
  if (activities.length > 5) paceScore -= 10;
  paceScore = Math.max(25, Math.min(100, Math.round(paceScore)));

  const paceLabel: 'Relaxed' | 'Optimal' | 'Packed' | 'Overburdened' =
    paceScore >= 85
      ? 'Optimal'
      : paceScore >= 70
      ? 'Relaxed'
      : paceScore >= 50
      ? 'Packed'
      : 'Overburdened';

  const localImpactScore = Math.min(96, Math.max(78, 88 + ((day.dayNumber * 3) % 9)));

  const metrics: DayFeasibilityMetrics = {
    paceScore,
    paceLabel,
    totalSightseeingMinutes,
    totalTransitMinutes,
    totalTransitDistanceKm: Math.round(totalTransitDistanceKm * 10) / 10,
    estimatedWalkingSteps,
    localImpactScore,
    warnings,
    costBreakdown: {
      ticketCost: totalTicketCost,
      transitCost: totalTransitCost,
      foodCost: totalFoodCost || (activities.length > 0 ? 500 * travelers : 0),
      totalCost: totalTicketCost + totalTransitCost + (totalFoodCost || (activities.length > 0 ? 500 * travelers : 0)),
    },
  };

  return {
    day: {
      ...day,
      activities: updatedActivities,
    },
    metrics,
  };
}

/**
 * Generate a complete multi-day dynamic trip plan using the 5,000+ national places catalog.
 */
export function generateDynamicTripPlan(options: GenerateTripOptions): {
  tripDetails: ItineraryTripDetails;
  days: ItineraryDay[];
  practicalInfo: ItineraryPracticalInfo;
} {
  const {
    city,
    state = '',
    daysCount = 3,
    pace = 'balanced',
    focusCategory = '',
    budgetLimit = 25000,
    travelers = 2,
    startDate,
  } = options;

  let candidates = getPlacesByCity(city);
  if (candidates.length < daysCount * 4) {
    const pool = USER_CURATED_PLACES.length > 0 ? USER_CURATED_PLACES : ALL_LOKIVA_PLACES;
    const backupPlaces = pool.filter(
      (p) =>
        (p.city && p.city.toLowerCase().includes(city.toLowerCase())) ||
        (state && p.state && p.state.toLowerCase() === state.toLowerCase())
    );
    candidates = [...candidates, ...backupPlaces];
  }

  if (candidates.length === 0) {
    candidates = ALL_LOKIVA_PLACES.slice(0, 30);
  }

  // Deduplicate candidates by unique ID
  const seenIds = new Set<number>();
  const uniqueCandidates: Experience[] = [];
  for (const c of candidates) {
    if (!seenIds.has(c.id)) {
      seenIds.add(c.id);
      uniqueCandidates.push(c);
    }
  }

  // Sort by focusCategory if specified
  if (focusCategory && focusCategory.trim()) {
    const fc = focusCategory.toLowerCase().trim();
    uniqueCandidates.sort((a, b) => {
      const aMatches = (a.category || '').toLowerCase().includes(fc);
      const bMatches = (b.category || '').toLowerCase().includes(fc);
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return 0;
    });
  }

  const activitiesPerDay = pace === 'relaxed' ? 3 : pace === 'packed' ? 5 : 4;
  const days: ItineraryDay[] = [];

  const baseDate = startDate ? new Date(startDate) : new Date();

  for (let d = 0; d < daysCount; d++) {
    const curDate = new Date(baseDate);
    curDate.setDate(baseDate.getDate() + d);

    const dateStr = curDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayOfWeekStr = curDate.toLocaleDateString('en-US', { weekday: 'long' });

    const startIndex = d * activitiesPerDay;
    const dayCandidates = uniqueCandidates.slice(startIndex, startIndex + activitiesPerDay);

    // Fallback if we run out of unique candidates
    if (dayCandidates.length < activitiesPerDay) {
      const needed = activitiesPerDay - dayCandidates.length;
      for (let k = 0; k < needed; k++) {
        const fallbackPlace = uniqueCandidates[(startIndex + k) % uniqueCandidates.length];
        if (fallbackPlace) dayCandidates.push(fallbackPlace);
      }
    }

    const initialActivities: ItineraryActivity[] = dayCandidates.map((exp, actIdx) => {
      const durationMins = exp.duration_mins || exp.approx_duration_mins || 75;
      const isIndoor =
        (exp.category || '').toLowerCase().includes('craft') ||
        (exp.category || '').toLowerCase().includes('art') ||
        (exp.category || '').toLowerCase().includes('food') ||
        (exp.category || '').toLowerCase().includes('museum');

      return {
        id: exp.id * 100 + d * 10 + actIdx,
        experienceId: exp.id,
        timeSlot: 'Morning',
        timeRange: '08:30 AM - 10:00 AM',
        startTime: '08:30 AM',
        endTime: '10:00 AM',
        title: exp.title,
        category: exp.category || 'Living Heritage',
        location: exp.area_name || `${exp.city}, ${exp.state || ''}`,
        city: exp.city,
        state: exp.state,
        description: exp.description || exp.tagline || 'Verified cultural landmark.',
        duration: `${durationMins} mins`,
        durationMins,
        visitDurationMinutes: durationMins,
        transitToNextMinutes: 15,
        transitMode: 'auto_rickshaw',
        transitDistanceKm: 2.5,
        includes: exp.tags || ['Verified host guide', 'Cultural field notes'],
        costPerPerson: exp.price || 0,
        bookingStatus: 'available',
        gettingThere: 'Local auto or walking navigation',
        transitCost: 45,
        whatToBring: ['Comfortable footwear', 'Camera', 'Refillable water'],
        photos: exp.image_urls && exp.image_urls.length > 0 ? exp.image_urls : [resolveImageUrl(exp.image_url)],
        wheelchair_accessible: exp.wheelchair_accessible,
        is_indoor: isIndoor,
        lat: exp.latitude,
        lng: exp.longitude,
      };
    });

    const heroImg =
      dayCandidates.length > 0
        ? resolveImageUrl(dayCandidates[0].image_url)
        : 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80';

    const rawDay: ItineraryDay = {
      dayNumber: d + 1,
      date: dateStr,
      dayOfWeek: dayOfWeekStr,
      title: `${city} Cultural Traditions & Heritage Circuit - Day ${d + 1}`,
      heroImage: heroImg,
      hotel: `${city} Heritage Quarter Suites`,
      activities: initialActivities,
      dayStartTime: '08:30',
    };

    const { day: calculatedDay } = recalculateDaySchedule(rawDay, travelers);
    days.push(calculatedDay);
  }

  const tripDetails: ItineraryTripDetails = {
    title: `Your ${daysCount}-Day ${city} Cultural Heritage Journey`,
    destination: city,
    state: state || (candidates[0]?.state || 'India'),
    startDate: days[0]?.date || 'Today',
    endDate: `${days[days.length - 1]?.date || 'Day ' + daysCount}, ${new Date().getFullYear()}`,
    travelers,
    totalBudgetLimit: budgetLimit,
    hotel: `${city} Heritage Suites`,
    pace,
  };

  const practicalInfo: ItineraryPracticalInfo = {
    weatherSummary: 'Sunny with pleasant morning breeze',
    temperature: '24°C - 32°C',
    packingList: [
      'Breathable cotton attire',
      'Comfortable slip-on footwear for temples',
      'Modesty scarf for heritage shrines',
      'Sunscreen, sunglasses & hydration',
    ],
    accessibilityNotes:
      'Major promenades feature ramp access; older bazaar alleys and rock-cut shrines have stone steps.',
    transitNotes:
      'Auto-rickshaws and app cabs are widely available. Negotiate or insist on meter when boarding street autos.',
    languages: ['Hindi', 'English', 'Regional State Language'],
  };

  return {
    tripDetails,
    days,
    practicalInfo,
  };
}

/**
 * Smart Replanner: replaces matching activities based on live conditions
 * ('rain', 'heat', 'fatigue', 'crowded') within the surrounding area.
 */
export function replanDayForCondition(
  day: ItineraryDay,
  condition: ReplanCondition,
  travelers: number = 2
): { day: ItineraryDay; metrics: DayFeasibilityMetrics; replacedCount: number } {
  const currentActivities = [...day.activities];
  let replacedCount = 0;

  const pool = USER_CURATED_PLACES.length > 0 ? USER_CURATED_PLACES : ALL_LOKIVA_PLACES;

  const updatedActivities = currentActivities.map((act) => {
    if (condition === 'rain' && !act.is_indoor) {
      // Find nearby indoor place in same city or area
      const indoorMatch = pool.find(
        (p) =>
          p.id !== act.experienceId &&
          (p.city.toLowerCase() === (act.city || '').toLowerCase() ||
            p.city.toLowerCase().includes((act.city || '').toLowerCase())) &&
          ((p.category || '').toLowerCase().includes('craft') ||
            (p.category || '').toLowerCase().includes('art') ||
            (p.category || '').toLowerCase().includes('food') ||
            (p.category || '').toLowerCase().includes('museum'))
      );

      if (indoorMatch) {
        replacedCount++;
        return {
          ...act,
          experienceId: indoorMatch.id,
          title: indoorMatch.title,
          category: indoorMatch.category || 'Artisan Guild',
          description: indoorMatch.description || indoorMatch.tagline,
          location: indoorMatch.area_name || `${indoorMatch.city}, ${indoorMatch.state || ''}`,
          photos: [resolveImageUrl(indoorMatch.image_url)],
          costPerPerson: indoorMatch.price || 0,
          is_indoor: true,
          notes: 'Auto-swapped for rain-safe indoor artisan shelter.',
          lat: indoorMatch.latitude,
          lng: indoorMatch.longitude,
        };
      }
    }

    if (condition === 'fatigue' && (act.visitDurationMinutes > 75 || act.transitDistanceKm > 4)) {
      // Shorten duration and switch to seated/relaxing cultural place
      const relaxedMatch = pool.find(
        (p) =>
          p.id !== act.experienceId &&
          p.city.toLowerCase() === (act.city || '').toLowerCase() &&
          ((p.category || '').toLowerCase().includes('food') ||
            (p.category || '').toLowerCase().includes('wellness') ||
            (p.category || '').toLowerCase().includes('art'))
      );

      if (relaxedMatch) {
        replacedCount++;
        return {
          ...act,
          experienceId: relaxedMatch.id,
          title: relaxedMatch.title,
          category: relaxedMatch.category || 'Culinary Relaxation',
          description: relaxedMatch.description || relaxedMatch.tagline,
          visitDurationMinutes: 50,
          durationMins: 50,
          duration: '50 mins',
          photos: [resolveImageUrl(relaxedMatch.image_url)],
          costPerPerson: relaxedMatch.price || 0,
          wheelchair_accessible: true,
          notes: 'Auto-swapped for low-walking seated relaxation.',
          lat: relaxedMatch.latitude,
          lng: relaxedMatch.longitude,
        };
      }
    }

    if (condition === 'heat') {
      const startMin = timeStringToMinutes(act.startTime);
      if (startMin >= 12 * 60 + 30 && startMin <= 15 * 60 + 30 && !act.is_indoor) {
        const indoorShadeMatch = pool.find(
          (p) =>
            p.id !== act.experienceId &&
            p.city.toLowerCase() === (act.city || '').toLowerCase() &&
            ((p.category || '').toLowerCase().includes('craft') ||
              (p.category || '').toLowerCase().includes('food'))
        );

        if (indoorShadeMatch) {
          replacedCount++;
          return {
            ...act,
            experienceId: indoorShadeMatch.id,
            title: indoorShadeMatch.title,
            category: indoorShadeMatch.category || 'Shaded Guild',
            description: indoorShadeMatch.description || indoorShadeMatch.tagline,
            is_indoor: true,
            photos: [resolveImageUrl(indoorShadeMatch.image_url)],
            notes: 'Auto-swapped for peak midday air-conditioned shade.',
            lat: indoorShadeMatch.latitude,
            lng: indoorShadeMatch.longitude,
          };
        }
      }
    }

    return act;
  });

  const rawDay: ItineraryDay = {
    ...day,
    activities: updatedActivities,
  };

  const { day: recalculatedDay, metrics } = recalculateDaySchedule(rawDay, travelers);

  return {
    day: recalculatedDay,
    metrics,
    replacedCount,
  };
}
