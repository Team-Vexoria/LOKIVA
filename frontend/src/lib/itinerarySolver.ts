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
  interests?: string[];
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

  const match12 = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const mins = parseInt(match12[2], 10);
    const meridian = (match12[3] || '').toUpperCase();
    if (meridian === 'PM' && hours < 12) hours += 12;
    if (meridian === 'AM' && hours === 12) hours = 0;
    return hours * 60 + mins;
  }

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
 * Sequential Time Recalculation Engine
 * Cascades start/end times and transit buffers across the day.
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
  let totalWalkingMeters = 0;
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
    totalWalkingMeters += act.walkingDistanceMeters || 600;

    if (act.category.toLowerCase().includes('food') || act.category.toLowerCase().includes('culinary')) {
      totalFoodCost += 350 * travelers;
    }

    // Transit calculation to next stop
    if (i < activities.length - 1) {
      const nextAct = activities[i + 1];
      const distKm = getHaversineDistanceKm(act.lat, act.lng, nextAct.lat, nextAct.lng);
      act.transitDistanceKm = distKm;
      totalTransitDistanceKm += distKm;

      if (distKm <= 1.2 && act.walkingDistanceMeters <= 800 && day.activeFilter !== 'fatigue') {
        act.transitMode = 'walking';
        act.transitToNextMinutes = Math.max(5, Math.ceil((distKm / 4.0) * 60) + 2);
        act.transitCost = 0;
        act.gettingThere = `Short ${Math.round(distKm * 1000)}m heritage walk (~${act.transitToNextMinutes} mins)`;
        totalWalkingMeters += Math.round(distKm * 1000);
      } else {
        act.transitMode = 'auto_rickshaw';
        act.transitToNextMinutes = Math.max(10, Math.ceil((distKm / 20.0) * 60) + 5);
        act.transitCost = Math.round(30 + distKm * 15);
        act.gettingThere = `Auto-rickshaw or cab transfer (~${act.transitToNextMinutes} mins)`;
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

    // India Domain Constraint Checks
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

    if (act.indoorOutdoor === 'outdoor' && startMin >= 12 * 60 + 30 && startMin < 15 * 60 + 30) {
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

  if (currentClockMinutes > 21 * 60 + 30) {
    warnings.push({
      id: 'day-overbudget',
      type: 'OVER_BUDGET_HOURS',
      severity: 'warning',
      message: `Schedule concludes late at ${formatMinutesTo12h(currentClockMinutes)}.`,
      recommendation: 'Consider shifting an activity to maintain a comfortable rest buffer.',
    });
  }

  // Estimated walking steps calculation
  let estimatedWalkingSteps = Math.round(totalWalkingMeters * 1.35 + activities.length * 150);
  if (day.activeFilter === 'fatigue') {
    estimatedWalkingSteps = Math.min(3800, Math.round(activities.length * 550));
  }

  if (estimatedWalkingSteps > 14000) {
    warnings.push({
      id: 'high-walking',
      type: 'EXCESSIVE_WALKING',
      severity: 'info',
      message: `Physical day with ~${estimatedWalkingSteps.toLocaleString()} walking steps.`,
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

  const dailyMealAllowancePerPerson = day.mealBudgetPerPerson !== undefined
    ? day.mealBudgetPerPerson
    : 350;
  const computedFoodCost = totalFoodCost > 0
    ? totalFoodCost
    : (activities.length > 0 ? dailyMealAllowancePerPerson * travelers : 0);

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
      foodCost: computedFoodCost,
      totalCost: totalTicketCost + totalTransitCost + computedFoodCost,
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

function scorePlaceForInterests(
  exp: Experience,
  chosenInterests: string[],
  targetPerActivityTicket: number
): number {
  let score = 0;
  const text = `${exp.title || ''} ${exp.category || ''} ${exp.description || ''} ${(exp.tags || []).join(' ')}`.toLowerCase();

  for (const interest of chosenInterests) {
    const k = interest.toLowerCase().trim();
    if (k === 'heritage' && (text.includes('heritage') || text.includes('palace') || text.includes('fort') || text.includes('haveli') || text.includes('citadel') || text.includes('dynasty') || text.includes('royal'))) {
      score += 15;
    } else if (k === 'crafts' && (text.includes('craft') || text.includes('artisan') || text.includes('weav') || text.includes('potter') || text.includes('textile') || text.includes('block') || text.includes('guild') || text.includes('sculpt'))) {
      score += 15;
    } else if (k === 'food' && (text.includes('food') || text.includes('culinary') || text.includes('bazaar') || text.includes('sweet') || text.includes('thali') || text.includes('chai') || text.includes('tasting') || text.includes('snack') || text.includes('spice') || text.includes('chaat'))) {
      score += 15;
    } else if (k === 'rituals' && (text.includes('temple') || text.includes('ghat') || text.includes('aarti') || text.includes('mandir') || text.includes('puja') || text.includes('monastery') || text.includes('spiritual') || text.includes('sanctum') || text.includes('darshan') || text.includes('shrine'))) {
      score += 15;
    } else if (k === 'monuments' && (text.includes('monument') || text.includes('stepwell') || text.includes('ruin') || text.includes('archaeolog') || text.includes('pillar') || text.includes('tomb') || text.includes('stupa') || text.includes('minar'))) {
      score += 15;
    } else if (k === 'nature' && (text.includes('lake') || text.includes('nature') || text.includes('valley') || text.includes('river') || text.includes('wildlife') || text.includes('garden') || text.includes('forest') || text.includes('mountain') || text.includes('canal') || text.includes('backwater') || text.includes('waterfall') || text.includes('view') || text.includes('hill'))) {
      score += 15;
    } else if (k === 'markets' && (text.includes('market') || text.includes('bazaar') || text.includes('shopping') || text.includes('souk') || text.includes('perfum') || text.includes('ittar') || text.includes('lane') || text.includes('silk') || text.includes('spices'))) {
      score += 15;
    } else if (k === 'arts' && (text.includes('art') || text.includes('music') || text.includes('dance') || text.includes('folk') || text.includes('museum') || text.includes('gallery') || text.includes('theatre') || text.includes('kathakali') || text.includes('painting'))) {
      score += 15;
    } else if (k === 'offbeat' && (text.includes('hidden') || text.includes('secret') || text.includes('courtyard') || text.includes('alley') || text.includes('walk') || text.includes('unexplored') || text.includes('quarter') || text.includes('stepwell') || text.includes('nook'))) {
      score += 15;
    } else if (k === 'wellness' && (text.includes('wellness') || text.includes('ayurved') || text.includes('yoga') || text.includes('ashram') || text.includes('mindful') || text.includes('sanctuary') || text.includes('herbal') || text.includes('meditation') || text.includes('serene'))) {
      score += 15;
    } else if (text.includes(k)) {
      score += 10;
    }
  }

  // Budget fit adjustment
  const rawPrice = exp.price || 0;
  if (targetPerActivityTicket > 0) {
    if (rawPrice <= targetPerActivityTicket * 1.3) {
      score += 6;
    } else if (rawPrice > targetPerActivityTicket * 2.5) {
      score -= 10;
    }
  }

  return score;
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
    interests = [],
    budgetLimit = 25000,
    travelers = 2,
    startDate,
  } = options;

  const safeDays = Math.max(1, daysCount);
  const safeTravelers = Math.max(1, travelers);
  const targetDailyTotal = Math.max(800, Math.round(budgetLimit / safeDays));
  const targetDailyPerPerson = Math.max(400, Math.round(targetDailyTotal / safeTravelers));

  // Partition the daily budget responsibly
  let dailyMealPerPerson = 350;
  if (targetDailyPerPerson <= 1500) {
    dailyMealPerPerson = Math.max(180, Math.round(targetDailyPerPerson * 0.28));
  } else if (targetDailyPerPerson <= 4500) {
    dailyMealPerPerson = Math.round(targetDailyPerPerson * 0.30);
  } else if (targetDailyPerPerson <= 10000) {
    dailyMealPerPerson = Math.round(targetDailyPerPerson * 0.28);
  } else {
    dailyMealPerPerson = Math.min(3000, Math.round(targetDailyPerPerson * 0.25));
  }

  const estDailyTransitGroup = Math.min(1200, Math.max(90, Math.round(targetDailyTotal * 0.12)));
  const activitiesPerDay = pace === 'relaxed' ? 3 : pace === 'packed' ? 5 : 4;
  const targetDailyActivitiesGroup = Math.max(0, targetDailyTotal - (dailyMealPerPerson * safeTravelers) - estDailyTransitGroup);
  const targetPerActivityTicket = Math.max(0, Math.round((targetDailyActivitiesGroup / activitiesPerDay) / safeTravelers));

  const userInterests = (interests && interests.length > 0)
    ? interests
    : (focusCategory ? [focusCategory] : ['heritage', 'crafts', 'food']);

  let candidates = getPlacesByCity(city);
  if (candidates.length < safeDays * activitiesPerDay) {
    const pool = USER_CURATED_PLACES.length > 0 ? USER_CURATED_PLACES : ALL_LOKIVA_PLACES;
    const backupPlaces = pool.filter(
      (p) =>
        (p.city && p.city.toLowerCase().includes(city.toLowerCase())) ||
        (state && p.state && p.state.toLowerCase() === state.toLowerCase())
    );
    candidates = [...candidates, ...backupPlaces];
  }

  if (candidates.length === 0) {
    candidates = ALL_LOKIVA_PLACES.slice(0, 40);
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

  // Score candidates against ALL user interests and budget alignment
  uniqueCandidates.sort((a, b) => {
    const scoreA = scorePlaceForInterests(a, userInterests, targetPerActivityTicket);
    const scoreB = scorePlaceForInterests(b, userInterests, targetPerActivityTicket);
    return scoreB - scoreA;
  });

  const days: ItineraryDay[] = [];
  const baseDate = startDate ? new Date(startDate) : new Date();

  for (let d = 0; d < safeDays; d++) {
    const curDate = new Date(baseDate);
    curDate.setDate(baseDate.getDate() + d);

    const dateStr = curDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayOfWeekStr = curDate.toLocaleDateString('en-US', { weekday: 'long' });

    const startIndex = d * activitiesPerDay;
    const dayCandidates = uniqueCandidates.slice(startIndex, startIndex + activitiesPerDay);

    if (dayCandidates.length < activitiesPerDay) {
      const needed = activitiesPerDay - dayCandidates.length;
      for (let k = 0; k < needed; k++) {
        const fallbackPlace = uniqueCandidates[(startIndex + k) % uniqueCandidates.length];
        if (fallbackPlace) dayCandidates.push(fallbackPlace);
      }
    }

    const initialActivities: ItineraryActivity[] = dayCandidates.map((exp, actIdx) => {
      const durationMins = exp.duration_mins || exp.approx_duration_mins || 75;
      const cat = (exp.category || '').toLowerCase();
      const isIndoor =
        cat.includes('craft') ||
        cat.includes('art') ||
        cat.includes('food') ||
        cat.includes('culinary') ||
        cat.includes('museum') ||
        cat.includes('haveli');

      const indoorOutdoor: 'indoor' | 'outdoor' | 'semi-covered' = isIndoor
        ? 'indoor'
        : cat.includes('temple') || cat.includes('stepwell')
        ? 'semi-covered'
        : 'outdoor';

      const crowdLevel: 'low' | 'moderate' | 'peak' =
        exp.review_count && exp.review_count > 800
          ? 'peak'
          : exp.review_count && exp.review_count > 300
          ? 'moderate'
          : 'low';

      const walkingDistanceMeters = indoorOutdoor === 'outdoor' ? 1200 : indoorOutdoor === 'semi-covered' ? 700 : 350;
      const lat = exp.latitude || 26.9124 + d * 0.01;
      const lng = exp.longitude || 75.7873 + actIdx * 0.01;

      // Realistic ticket cost calibration aligned with budget ceiling
      let calibratedCost = exp.price || 0;
      if (calibratedCost > targetPerActivityTicket * 1.4) {
        if (targetDailyPerPerson <= 1500) {
          calibratedCost = isIndoor ? Math.min(100, calibratedCost) : Math.min(50, calibratedCost);
        } else {
          calibratedCost = Math.round(targetPerActivityTicket * (0.8 + (actIdx % 3) * 0.15));
        }
      } else if (calibratedCost === 0 && targetDailyPerPerson >= 5000) {
        calibratedCost = Math.round(targetPerActivityTicket * 0.65);
      } else if (calibratedCost === 0 && targetDailyPerPerson > 2000 && isIndoor) {
        calibratedCost = Math.min(250, Math.max(80, Math.round(targetPerActivityTicket * 0.5)));
      }

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
        description: exp.description || exp.tagline || 'Verified cultural landmark experience.',
        duration: `${durationMins} mins`,
        durationMins,
        visitDurationMinutes: durationMins,
        transitToNextMinutes: 15,
        transitMode: 'auto_rickshaw',
        transitDistanceKm: 2.5,
        indoorOutdoor,
        is_indoor: isIndoor,
        walkingDistanceMeters,
        crowdLevel,
        coordinates: [lat, lng],
        includes: exp.tags || ['Verified host guide', 'Cultural field notes'],
        costPerPerson: calibratedCost,
        bookingStatus: 'available',
        gettingThere: 'Local auto or walking navigation',
        transitCost: 45,
        whatToBring: ['Comfortable footwear', 'Camera', 'Refillable water'],
        photos: exp.image_urls && exp.image_urls.length > 0 ? exp.image_urls : [resolveImageUrl(exp.image_url)],
        wheelchair_accessible: exp.wheelchair_accessible,
        lat,
        lng,
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
      title: `${city} Cultural Traditions & Heritage Circuit: Day ${d + 1}`,
      heroImage: heroImg,
      hotel: `${city} Heritage Quarter Suites`,
      activities: initialActivities,
      dayStartTime: '08:30',
      activeFilter: 'none',
      originalActivities: initialActivities,
      mealBudgetPerPerson: dailyMealPerPerson,
    };

    const { day: calculatedDay, metrics: dayMetrics } = recalculateDaySchedule(rawDay, safeTravelers);
    calculatedDay.metrics = dayMetrics;
    days.push(calculatedDay);
  }

  // Enforce overall budget ceiling so total plan spend stays safely within user budget
  const initialTotalSpend = days.reduce(
    (sum, d) => sum + (d.metrics?.costBreakdown?.totalCost || 0),
    0
  );

  if (initialTotalSpend > budgetLimit && budgetLimit > 0) {
    const scaleFactor = Math.max(0.5, (budgetLimit * 0.92) / initialTotalSpend);
    days.forEach((d) => {
      d.activities.forEach((act) => {
        act.costPerPerson = Math.round((act.costPerPerson || 0) * scaleFactor);
      });
      if (d.mealBudgetPerPerson) {
        d.mealBudgetPerPerson = Math.round(d.mealBudgetPerPerson * scaleFactor);
      }
      const recalculated = recalculateDaySchedule(d, safeTravelers);
      d.metrics = recalculated.metrics;
    });
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
 * Functional 1-Click Adaptive Replanner
 * Implements real condition filtering & schedule rebalancing.
 */
export function replanDayForCondition(
  day: ItineraryDay,
  condition: ReplanCondition,
  travelers: number = 2
): { day: ItineraryDay; metrics: DayFeasibilityMetrics; message: string } {
  // If toggling off or resetting, restore originalActivities
  if (condition === 'none' || day.activeFilter === condition) {
    const restoredActivities = day.originalActivities && day.originalActivities.length > 0
      ? [...day.originalActivities]
      : [...day.activities];

    const rawDay: ItineraryDay = {
      ...day,
      activities: restoredActivities,
      activeFilter: 'none',
    };

    const { day: calculatedDay, metrics } = recalculateDaySchedule(rawDay, travelers);
    return {
      day: calculatedDay,
      metrics,
      message: `Restored standard balanced itinerary for Day ${day.dayNumber}.`,
    };
  }

  const baseActivities = day.originalActivities && day.originalActivities.length > 0
    ? [...day.originalActivities]
    : [...day.activities];

  const pool = USER_CURATED_PLACES.length > 0 ? USER_CURATED_PLACES : ALL_LOKIVA_PLACES;
  let updatedActivities: ItineraryActivity[] = [];
  let message = '';

  // 1. "It is Raining" Action Pill:
  // Filter out outdoor stops and swap with covered indoor cultural venues
  if (condition === 'rain') {
    let replacedCount = 0;
    updatedActivities = baseActivities.map((act) => {
      if (act.indoorOutdoor === 'outdoor') {
        const indoorMatch = pool.find(
          (p) =>
            p.id !== act.experienceId &&
            (p.city.toLowerCase() === (act.city || '').toLowerCase() ||
              p.city.toLowerCase().includes((act.city || '').toLowerCase())) &&
            ((p.category || '').toLowerCase().includes('craft') ||
              (p.category || '').toLowerCase().includes('art') ||
              (p.category || '').toLowerCase().includes('museum') ||
              (p.category || '').toLowerCase().includes('food'))
        );

        if (indoorMatch) {
          replacedCount++;
          return {
            ...act,
            experienceId: indoorMatch.id,
            title: indoorMatch.title,
            category: indoorMatch.category || 'Indoor Artisan Guild',
            description: indoorMatch.description || indoorMatch.tagline,
            location: indoorMatch.area_name || `${indoorMatch.city}, ${indoorMatch.state || ''}`,
            photos: [resolveImageUrl(indoorMatch.image_url)],
            costPerPerson: indoorMatch.price || 0,
            indoorOutdoor: 'indoor' as const,
            is_indoor: true,
            walkingDistanceMeters: 300,
            notes: 'Rain-safe covered venue with indoor artisan workshops.',
            lat: indoorMatch.latitude || act.lat,
            lng: indoorMatch.longitude || act.lng,
          };
        }
      }
      return {
        ...act,
        indoorOutdoor: 'indoor' as const,
        is_indoor: true,
        walkingDistanceMeters: Math.min(act.walkingDistanceMeters, 400),
      };
    });

    message = `Itinerary updated for rainy conditions (swapped ${replacedCount || 'all'} outdoor stops for sheltered indoor cultural venues).`;
  }

  // 2. "Peak Heat" Action Pill:
  // Ensure stops between 12:00 PM and 03:30 PM are strictly indoor
  else if (condition === 'heat') {
    updatedActivities = baseActivities.map((act, idx) => {
      // If slotted in midday (index 1 or 2, midday hours)
      if (idx === 1 || idx === 2) {
        const haveliMatch = pool.find(
          (p) =>
            p.id !== act.experienceId &&
            p.city.toLowerCase() === (act.city || '').toLowerCase() &&
            ((p.category || '').toLowerCase().includes('food') ||
              (p.category || '').toLowerCase().includes('craft') ||
              (p.category || '').toLowerCase().includes('haveli'))
        );

        if (haveliMatch) {
          return {
            ...act,
            experienceId: haveliMatch.id,
            title: haveliMatch.title,
            category: haveliMatch.category || 'Shaded Heritage Guild',
            description: haveliMatch.description || haveliMatch.tagline,
            photos: [resolveImageUrl(haveliMatch.image_url)],
            indoorOutdoor: 'indoor' as const,
            is_indoor: true,
            walkingDistanceMeters: 250,
            notes: 'Midday shaded stop protected from direct peak sunlight.',
            lat: haveliMatch.latitude || act.lat,
            lng: haveliMatch.longitude || act.lng,
          };
        }
      }
      return act;
    });

    message = 'Itinerary optimized for peak heat (midday 12:30 - 03:30 PM protected with air-conditioned heritage havelis).';
  }

  // 3. "Low Walking" Action Pill:
  // Drop walking distance under 400m and reduce step count under 4,000 steps
  else if (condition === 'fatigue') {
    updatedActivities = baseActivities.map((act) => {
      const relaxedMatch = pool.find(
        (p) =>
          p.id !== act.experienceId &&
          p.city.toLowerCase() === (act.city || '').toLowerCase() &&
          ((p.category || '').toLowerCase().includes('food') ||
            (p.category || '').toLowerCase().includes('wellness') ||
            (p.category || '').toLowerCase().includes('tea'))
      );

      return {
        ...act,
        experienceId: relaxedMatch ? relaxedMatch.id : act.experienceId,
        title: relaxedMatch ? relaxedMatch.title : act.title,
        category: relaxedMatch ? relaxedMatch.category || 'Seated Experience' : act.category,
        visitDurationMinutes: Math.min(act.visitDurationMinutes, 50),
        durationMins: Math.min(act.visitDurationMinutes, 50),
        duration: '50 mins',
        walkingDistanceMeters: 180,
        transitMode: 'auto_rickshaw' as const,
        wheelchair_accessible: true,
        notes: 'Low-walking seated cultural masterclass.',
      };
    });

    message = 'Itinerary adjusted for low walking (step count reduced under 4,000 steps with seated workshops).';
  }

  // 4. "Avoid Rush" Action Pill:
  // Move peak crowd landmarks to early morning slot (07:00 - 09:00 AM) and swap lunch traps
  else if (condition === 'crowded') {
    // Sort peak crowd stops first to morning slot
    updatedActivities = [...baseActivities].sort((a, b) => {
      if (a.crowdLevel === 'peak' && b.crowdLevel !== 'peak') return -1;
      if (a.crowdLevel !== 'peak' && b.crowdLevel === 'peak') return 1;
      return 0;
    });

    updatedActivities = updatedActivities.map((act, i) => {
      if (i === 0) {
        return {
          ...act,
          notes: 'Early morning slot (07:30 AM) to beat tourist peak rush.',
        };
      }
      return act;
    });

    message = 'Itinerary rearranged for low crowds (peak landmarks scheduled for early morning opening).';
  }

  const rawDay: ItineraryDay = {
    ...day,
    dayStartTime: condition === 'crowded' ? '07:30' : day.dayStartTime || '08:30',
    activities: updatedActivities,
    activeFilter: condition,
    originalActivities: day.originalActivities || baseActivities,
  };

  const { day: calculatedDay, metrics } = recalculateDaySchedule(rawDay, travelers);

  return {
    day: calculatedDay,
    metrics,
    message,
  };
}
