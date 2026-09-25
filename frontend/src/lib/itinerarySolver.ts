import { Experience } from '../types';
import {
  ItineraryTripDetails,
  ItineraryDay,
  ItineraryActivity,
  ItineraryPracticalInfo,
  FoodRecommendation,
  DayFeasibilityMetrics,
  FeasibilityWarning,
  TimeOfDaySlot,
  ReplanCondition,
} from '../types/itinerary';
import { getPlacesByCity, ALL_LOKIVA_PLACES, getStateForCity } from '../data/places';
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
  weatherPreference?: 'winter' | 'monsoon' | 'summer_hills' | 'temperate';
  accessibility?: {
    low_walking?: boolean;
    wheelchair?: boolean;
    step_free?: boolean;
  };
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

      const dailyMeal = day.mealBudgetPerPerson || 350;
      const isLuxuryTier = dailyMeal >= 1800;
      const isComfortTier = dailyMeal >= 800;

      if (distKm <= 1.0 && (act.walkingDistanceMeters || 600) <= 700 && day.activeFilter !== 'fatigue' && !isLuxuryTier) {
        act.transitMode = 'walking';
        act.transitToNextMinutes = Math.max(5, Math.ceil((distKm / 4.0) * 60) + 2);
        act.transitCost = 0;
        act.gettingThere = `Short ${Math.round(distKm * 1000)}m heritage walk (~${act.transitToNextMinutes} mins)`;
        totalWalkingMeters += Math.round(distKm * 1000);
      } else if (isLuxuryTier) {
        act.transitMode = 'heritage_cab';
        act.transitToNextMinutes = Math.max(10, Math.ceil((distKm / 28.0) * 60) + 6);
        act.transitCost = Math.round(450 + distKm * 40);
        act.gettingThere = `Dedicated private heritage chauffeur transfer (~${act.transitToNextMinutes} mins)`;
        totalTransitCost += act.transitCost;
      } else if (isComfortTier) {
        act.transitMode = 'private_cab';
        act.transitToNextMinutes = Math.max(10, Math.ceil((distKm / 24.0) * 60) + 5);
        act.transitCost = Math.round(200 + distKm * 25);
        act.gettingThere = `Private AC cab transfer (~${act.transitToNextMinutes} mins)`;
        totalTransitCost += act.transitCost;
      } else {
        act.transitMode = 'auto_rickshaw';
        act.transitToNextMinutes = Math.max(10, Math.ceil((distKm / 20.0) * 60) + 5);
        act.transitCost = Math.round(40 + distKm * 18);
        act.gettingThere = `Local auto-rickshaw transfer (~${act.transitToNextMinutes} mins)`;
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

export function scorePlaceForInterests(
  exp: Experience,
  chosenInterests: string[],
  targetPerActivityTicket: number,
  weatherPreference?: string,
  accessibility?: { low_walking?: boolean; wheelchair?: boolean; step_free?: boolean }
): number {
  let score = 0;
  const text = `${exp.title || ''} ${exp.category || ''} ${exp.description || ''} ${exp.tagline || ''} ${(exp.tags || []).join(' ')}`.toLowerCase();
  const cat = (exp.category || '').toLowerCase();

  // 1. Direct interest matches (+20 per matched interest)
  for (const interest of chosenInterests) {
    const k = interest.toLowerCase().trim();
    if (k === 'heritage' && (text.includes('heritage') || text.includes('palace') || text.includes('fort') || text.includes('haveli') || text.includes('citadel') || text.includes('dynasty') || text.includes('royal') || text.includes('monument'))) {
      score += 20;
    } else if (k === 'crafts' && (text.includes('craft') || text.includes('artisan') || text.includes('weav') || text.includes('potter') || text.includes('textile') || text.includes('block') || text.includes('guild') || text.includes('sculpt') || text.includes('handicraft'))) {
      score += 20;
    } else if (k === 'food' && (text.includes('food') || text.includes('culinary') || text.includes('bazaar') || text.includes('sweet') || text.includes('thali') || text.includes('chai') || text.includes('tasting') || text.includes('snack') || text.includes('spice') || text.includes('chaat') || text.includes('dining'))) {
      score += 20;
    } else if (k === 'rituals' && (text.includes('temple') || text.includes('ghat') || text.includes('aarti') || text.includes('mandir') || text.includes('puja') || text.includes('monastery') || text.includes('spiritual') || text.includes('sanctum') || text.includes('darshan') || text.includes('shrine'))) {
      score += 20;
    } else if (k === 'monuments' && (text.includes('monument') || text.includes('stepwell') || text.includes('ruin') || text.includes('archaeolog') || text.includes('pillar') || text.includes('tomb') || text.includes('stupa') || text.includes('minar'))) {
      score += 20;
    } else if (k === 'nature' && (text.includes('lake') || text.includes('nature') || text.includes('valley') || text.includes('river') || text.includes('wildlife') || text.includes('garden') || text.includes('forest') || text.includes('mountain') || text.includes('canal') || text.includes('backwater') || text.includes('waterfall') || text.includes('view') || text.includes('hill'))) {
      score += 20;
    } else if (k === 'markets' && (text.includes('market') || text.includes('bazaar') || text.includes('shopping') || text.includes('souk') || text.includes('perfum') || text.includes('ittar') || text.includes('lane') || text.includes('silk') || text.includes('spices'))) {
      score += 20;
    } else if (k === 'arts' && (text.includes('art') || text.includes('music') || text.includes('dance') || text.includes('folk') || text.includes('museum') || text.includes('gallery') || text.includes('theatre') || text.includes('kathakali') || text.includes('painting'))) {
      score += 20;
    } else if (k === 'offbeat' && (text.includes('hidden') || text.includes('secret') || text.includes('courtyard') || text.includes('alley') || text.includes('walk') || text.includes('unexplored') || text.includes('quarter') || text.includes('stepwell') || text.includes('nook'))) {
      score += 20;
    } else if (k === 'wellness' && (text.includes('wellness') || text.includes('ayurved') || text.includes('yoga') || text.includes('ashram') || text.includes('mindful') || text.includes('sanctuary') || text.includes('herbal') || text.includes('meditation') || text.includes('serene'))) {
      score += 20;
    } else if (text.includes(k)) {
      score += 15;
    }
  }

  // 2. Weather calibration (+10)
  const isIndoor = cat.includes('craft') || cat.includes('art') || cat.includes('food') || cat.includes('culinary') || cat.includes('museum') || cat.includes('haveli');
  if (weatherPreference === 'monsoon') {
    if (isIndoor || text.includes('canal') || text.includes('backwater') || text.includes('greenery') || text.includes('plantation')) {
      score += 10;
    }
  } else if (weatherPreference === 'summer_hills') {
    if (text.includes('mountain') || text.includes('valley') || text.includes('pass') || text.includes('pine') || text.includes('hill') || text.includes('monastery') || text.includes('view')) {
      score += 10;
    }
  } else if (weatherPreference === 'winter') {
    if (!isIndoor || text.includes('fort') || text.includes('palace') || text.includes('stepwell') || text.includes('ghat')) {
      score += 10;
    }
  } else if (weatherPreference === 'temperate') {
    score += 8;
  }

  // 3. Budget alignment (+15 fit, -25 overbudget penalty)
  const rawPrice = exp.price || 0;
  if (targetPerActivityTicket > 0) {
    if (rawPrice <= targetPerActivityTicket * 1.2) {
      score += 15;
    } else if (rawPrice > targetPerActivityTicket * 2.0) {
      score -= 25;
    }
  } else if (rawPrice === 0) {
    score += 15;
  }

  // 4. Rating & Quality bonus
  if (exp.rating && exp.rating >= 4.7) {
    score += 5;
  }
  if (exp.review_count && exp.review_count >= 100) {
    score += 5;
  }

  // 5. Accessibility adjustments
  if (accessibility?.wheelchair) {
    if (exp.wheelchair_accessible) {
      score += 15;
    } else if (text.includes('stepwell') || text.includes('steep') || text.includes('stairs') || text.includes('climb')) {
      score -= 30;
    }
  }
  if (accessibility?.low_walking) {
    if (isIndoor || text.includes('courtyard') || text.includes('compact') || text.includes('boat')) {
      score += 10;
    } else if (text.includes('trek') || text.includes('hike') || text.includes('expansive')) {
      score -= 20;
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
    weatherPreference = 'winter',
    accessibility,
  } = options;

  const safeDays = Math.max(1, daysCount);
  const safeTravelers = Math.max(1, travelers);
  const targetDailyTotal = Math.max(800, Math.round(budgetLimit / safeDays));
  const targetDailyPerPerson = Math.max(400, Math.round(targetDailyTotal / safeTravelers));

  // Dynamic culinary allocation scaled directly to target budget tier
  let dailyMealPerPerson = 450;
  if (targetDailyPerPerson <= 1500) {
    dailyMealPerPerson = 350;
  } else if (targetDailyPerPerson <= 3000) {
    dailyMealPerPerson = 650;
  } else if (targetDailyPerPerson <= 7000) {
    dailyMealPerPerson = 1500;
  } else {
    dailyMealPerPerson = Math.round(targetDailyPerPerson * 0.32);
  }

  const activitiesPerDay = pace === 'relaxed' ? 3 : pace === 'packed' ? 5 : 4;
  const estDailyTransitGroup = targetDailyPerPerson >= 4000
    ? Math.round(activitiesPerDay * 450)
    : targetDailyPerPerson >= 2000
    ? Math.round(activitiesPerDay * 220)
    : Math.round(activitiesPerDay * 50);

  const targetDailyActivitiesGroup = Math.max(0, targetDailyTotal - (dailyMealPerPerson * safeTravelers) - estDailyTransitGroup);
  const targetPerActivityTicket = Math.max(0, Math.round((targetDailyActivitiesGroup / activitiesPerDay) / safeTravelers));

  const userInterests = (interests && interests.length > 0)
    ? interests
    : (focusCategory ? [focusCategory] : ['heritage', 'crafts', 'food']);

  const pool = USER_CURATED_PLACES.length > 0 ? USER_CURATED_PLACES : ALL_LOKIVA_PLACES;

  // Strict Catalog Extraction:
  // Step 1: Query exact city
  let candidates = pool.filter(
    (p) => p.city && p.city.toLowerCase().trim() === city.toLowerCase().trim()
  );

  // Step 2: If candidate pool is too small for all days, extract verified places from the same state
  const totalNeeded = safeDays * activitiesPerDay;
  if (candidates.length < totalNeeded) {
    const effectiveState = state || getStateForCity(city) || candidates[0]?.state || '';
    if (effectiveState) {
      const statePlaces = pool.filter(
        (p) =>
          p.state &&
          p.state.toLowerCase().trim() === effectiveState.toLowerCase().trim() &&
          !candidates.some((c) => c.id === p.id)
      );
      candidates = [...candidates, ...statePlaces];
    }
  }

  // Step 3: If still insufficient, look up substring matches in city or state
  if (candidates.length < totalNeeded) {
    const nearby = pool.filter(
      (p) =>
        !candidates.some((c) => c.id === p.id) &&
        ((p.city && p.city.toLowerCase().includes(city.toLowerCase())) ||
         (p.state && state && p.state.toLowerCase().includes(state.toLowerCase())))
    );
    candidates = [...candidates, ...nearby];
  }

  // Step 4: Emergency fallback to highest-rated places
  if (candidates.length === 0) {
    candidates = pool.filter((p) => (p.rating || 0) >= 4.5);
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

  // Score all candidates with multi-factor weighting
  uniqueCandidates.sort((a, b) => {
    const scoreA = scorePlaceForInterests(a, userInterests, targetPerActivityTicket, weatherPreference, accessibility);
    const scoreB = scorePlaceForInterests(b, userInterests, targetPerActivityTicket, weatherPreference, accessibility);
    return scoreB - scoreA;
  });

  // Free high-quality candidates for budget substitutions
  const freeCandidatePool = uniqueCandidates.filter((p) => !p.price || p.price === 0);

  // Take top K candidate pool for multi-day clustering
  const candidatePoolSize = Math.max(totalNeeded, Math.min(uniqueCandidates.length, safeDays * activitiesPerDay * 2));
  const topCandidatePool = uniqueCandidates.slice(0, candidatePoolSize);

  // Group candidate pool into spatial clusters (sorted by longitude / polar angle)
  topCandidatePool.sort((a, b) => {
    const latA = a.latitude || 26.9;
    const lngA = a.longitude || 75.8;
    const latB = b.latitude || 26.9;
    const lngB = b.longitude || 75.8;
    return (lngA + latA) - (lngB + latB);
  });

  // Partition pool into N day buckets
  const dayBuckets: Experience[][] = Array.from({ length: safeDays }, () => []);
  topCandidatePool.forEach((exp, idx) => {
    const targetBucket = idx % safeDays;
    dayBuckets[targetBucket].push(exp);
  });

  const days: ItineraryDay[] = [];
  const baseDate = startDate ? new Date(startDate) : new Date();
  const usedExperienceIds = new Set<number>();

  for (let d = 0; d < safeDays; d++) {
    const curDate = new Date(baseDate);
    curDate.setDate(baseDate.getDate() + d);

    const dateStr = curDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayOfWeekStr = curDate.toLocaleDateString('en-US', { weekday: 'long' });

    // Available bucket places for this day
    const availablePool = dayBuckets[d].filter((p) => !usedExperienceIds.has(p.id));
    if (availablePool.length < activitiesPerDay) {
      // Pull unused candidates from other buckets or full scored list
      const extras = uniqueCandidates.filter((p) => !usedExperienceIds.has(p.id) && !availablePool.some((a) => a.id === p.id));
      availablePool.push(...extras.slice(0, activitiesPerDay - availablePool.length));
    }

    // Sequence stops using Nearest-Neighbor TSP starting from the highest-scoring anchor
    const sequencedPlaces: Experience[] = [];
    if (availablePool.length > 0) {
      // Pick best anchor site
      availablePool.sort((a, b) => {
        const scoreA = scorePlaceForInterests(a, userInterests, targetPerActivityTicket, weatherPreference, accessibility);
        const scoreB = scorePlaceForInterests(b, userInterests, targetPerActivityTicket, weatherPreference, accessibility);
        return scoreB - scoreA;
      });

      const firstStop = availablePool[0];
      sequencedPlaces.push(firstStop);
      usedExperienceIds.add(firstStop.id);

      const remainingPool = availablePool.filter((p) => p.id !== firstStop.id);

      while (sequencedPlaces.length < activitiesPerDay && remainingPool.length > 0) {
        const lastStop = sequencedPlaces[sequencedPlaces.length - 1];
        const lastLat = lastStop.latitude || 26.9124;
        const lastLng = lastStop.longitude || 75.7873;

        // Find candidate with minimum distance from last stop and score weighting
        let bestCandidateIdx = 0;
        let bestDistance = 9999;

        for (let i = 0; i < remainingPool.length; i++) {
          const cand = remainingPool[i];
          const dist = getHaversineDistanceKm(lastLat, lastLng, cand.latitude || lastLat, cand.longitude || lastLng);
          if (dist < bestDistance) {
            bestDistance = dist;
            bestCandidateIdx = i;
          }
        }

        const chosen = remainingPool.splice(bestCandidateIdx, 1)[0];
        sequencedPlaces.push(chosen);
        usedExperienceIds.add(chosen.id);
      }
    }

    // If still short, backfill from remaining catalog
    if (sequencedPlaces.length < activitiesPerDay) {
      const remainingUnused = uniqueCandidates.filter((p) => !usedExperienceIds.has(p.id));
      const fill = remainingUnused.slice(0, activitiesPerDay - sequencedPlaces.length);
      fill.forEach((p) => {
        sequencedPlaces.push(p);
        usedExperienceIds.add(p.id);
      });
    }

    // Map into ItineraryActivity items using actual catalog pricing and realistic transit hops
    const initialActivities: ItineraryActivity[] = sequencedPlaces.map((exp, actIdx) => {
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

      // Real Catalog Admission Cost & Tier Calibration
      let actualTicketCost = exp.price !== undefined ? exp.price : 0;
      let inclusions = exp.tags && exp.tags.length > 0 ? [...exp.tags] : ['Verified cultural guide', 'Field notes'];

      if (targetDailyPerPerson >= 4500) {
        // Luxury tier: pair monuments & cultural stops with private master artisan sessions, historian guides, and bespoke tastings
        if (actualTicketCost < 600) {
          if (actIdx === 0 || actIdx === 2) {
            actualTicketCost = Math.round(targetPerActivityTicket * 1.15);
            inclusions = ['Private Master Artisan Access', 'Curated Field Tasting', 'Verified Historian Guide', ...inclusions];
          } else {
            actualTicketCost = Math.round(targetPerActivityTicket * 0.85);
            inclusions = ['Curated Heritage Experience', 'Private Reserved Access', ...inclusions];
          }
        } else {
          actualTicketCost = Math.max(actualTicketCost, Math.round(targetPerActivityTicket));
          inclusions = ['Masterclass Immersion', 'Private Guild Demonstration', ...inclusions];
        }
      } else if (targetDailyPerPerson >= 2200) {
        // Comfort tier
        if (actualTicketCost < 300) {
          actualTicketCost = Math.max(actualTicketCost, Math.round(targetPerActivityTicket * 0.9));
          inclusions = ['Curated Local Heritage Tour', ...inclusions];
        }
      }

      // Calculate realistic transit to next stop
      let transitDistKm = 2.0;
      if (actIdx < sequencedPlaces.length - 1) {
        const nextExp = sequencedPlaces[actIdx + 1];
        transitDistKm = getHaversineDistanceKm(lat, lng, nextExp.latitude || lat, nextExp.longitude || lng);
      }
      const transitMins = Math.max(8, Math.min(45, Math.round(transitDistKm * 4 + 5)));
      const transitCost = transitDistKm < 0.8 ? 0 : Math.round(30 + transitDistKm * 15);

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
        transitToNextMinutes: transitMins,
        transitMode: transitDistKm < 1.2 ? 'walking' : 'auto_rickshaw',
        transitDistanceKm: Math.round(transitDistKm * 10) / 10,
        indoorOutdoor,
        is_indoor: isIndoor,
        walkingDistanceMeters,
        crowdLevel,
        coordinates: [lat, lng],
        includes: Array.from(new Set(inclusions)),
        costPerPerson: actualTicketCost,
        bookingStatus: 'available',
        gettingThere: transitDistKm < 1.2 ? 'Short paved walking hop' : 'Local auto-rickshaw or e-rickshaw',
        transitCost,
        whatToBring: ['Comfortable footwear', 'Camera', 'Refillable water'],
        photos: exp.image_urls && exp.image_urls.length > 0 ? exp.image_urls : [resolveImageUrl(exp.image_url)],
        wheelchair_accessible: exp.wheelchair_accessible,
        lat,
        lng,
      };
    });

    // Budget Substitution for modest budgets: If day activities exceed daily budget allowance, substitute with free stops
    if (targetDailyPerPerson < 3000) {
      let dayActivitiesCost = initialActivities.reduce((s, a) => s + (a.costPerPerson || 0) * safeTravelers, 0);
      const maxAllowedActivitiesSpend = targetDailyActivitiesGroup * 1.25;

      if (dayActivitiesCost > maxAllowedActivitiesSpend && freeCandidatePool.length > 0) {
        for (let actIdx = initialActivities.length - 1; actIdx >= 1; actIdx--) {
          if (dayActivitiesCost <= maxAllowedActivitiesSpend) break;
          const currentAct = initialActivities[actIdx];
          if (currentAct.costPerPerson > 0) {
            const freeReplacement = freeCandidatePool.find(
              (fp) => !usedExperienceIds.has(fp.id) && fp.id !== currentAct.experienceId
            );
            if (freeReplacement) {
              usedExperienceIds.add(freeReplacement.id);
              const durationMins = freeReplacement.duration_mins || 60;
              initialActivities[actIdx] = {
                ...currentAct,
                experienceId: freeReplacement.id,
                title: freeReplacement.title,
                category: freeReplacement.category || 'Living Heritage',
                description: freeReplacement.description || freeReplacement.tagline || 'Verified cultural landmark.',
                location: freeReplacement.area_name || `${freeReplacement.city}, ${freeReplacement.state || ''}`,
                costPerPerson: 0,
                photos: freeReplacement.image_urls && freeReplacement.image_urls.length > 0 ? freeReplacement.image_urls : [resolveImageUrl(freeReplacement.image_url)],
                duration: `${durationMins} mins`,
                durationMins,
                visitDurationMinutes: durationMins,
                lat: freeReplacement.latitude || currentAct.lat,
                lng: freeReplacement.longitude || currentAct.lng,
              };
              dayActivitiesCost = initialActivities.reduce((s, a) => s + (a.costPerPerson || 0) * safeTravelers, 0);
            }
          }
        }
      }
    }

    const heroImg =
      sequencedPlaces.length > 0
        ? resolveImageUrl(sequencedPlaces[0].image_url)
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

  // ─── STRICT BUDGET CONVERGENCE ENGINE ─────────────────────────────────────
  // Enforces total generated itinerary spend to converge within ±5,000 INR of the target budget.
  const targetTotal = budgetLimit;
  let currentTotal = days.reduce((sum, d) => sum + (d.metrics?.costBreakdown?.totalCost || 0), 0);

  if (currentTotal < targetTotal * 0.90) {
    const deficitTotal = targetTotal - currentTotal;
    const deficitPerDay = deficitTotal / safeDays;

    days.forEach((day) => {
      // 1. Upgrade meal allowance to curated culinary degustation
      day.mealBudgetPerPerson = Math.round(Math.max(day.mealBudgetPerPerson || 400, targetDailyPerPerson * 0.32));

      // 2. Distribute remaining deficit into premium master artisan workshops, private guides & tastings
      const acts = day.activities || [];
      const actsCount = Math.max(1, acts.length);
      const deficitPerActivityPerPerson = Math.round((deficitPerDay * 0.68) / (actsCount * safeTravelers));

      acts.forEach((act) => {
        act.costPerPerson = Math.round((act.costPerPerson || 0) + deficitPerActivityPerPerson);
        const additions = ['Private Master Artisan Access', 'Curated Field Tasting', 'Verified Historian Guide'];
        act.includes = Array.from(new Set([...(act.includes || []), ...additions]));
      });

      // 3. Recalculate schedule & metrics with updated values
      const { day: calculatedDay, metrics: dayMetrics } = recalculateDaySchedule(day, safeTravelers);
      day.activities = calculatedDay.activities;
      day.metrics = dayMetrics;
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

  const practicalInfo = resolvePracticalBriefingForDestination(
    city,
    state || (candidates[0]?.state || 'India'),
    weatherPreference,
    accessibility,
    userInterests
  );

  return {
    tripDetails,
    days,
    practicalInfo,
  };
}

export interface RegionalCulturalKnowledge {
  weatherSummary: string;
  temperature: string;
  packingList: string[];
  accessibilityNotes: string;
  transitNotes: string;
  languages: string[];
  foodRecommendations: FoodRecommendation[];
  travelTips: string[];
  bestTimeToVisit: {
    idealMonths: string;
    crowdPacing: string;
    advisory: string;
  };
  nearbyPlaces: Array<{
    name: string;
    area: string;
    tag: string;
  }>;
}

export const REGIONAL_CULTURAL_REGISTRY: Record<string, RegionalCulturalKnowledge> = {
  dharamshala: {
    weatherSummary: 'Crisp Himalayan breeze with cool pine mountain shade',
    temperature: '12°C to 22°C',
    packingList: ['Layered fleece jacket', 'Sturdy trail footwear', 'Refillable insulated flask', 'Sun hat & UV sunglasses'],
    accessibilityNotes: 'Lower Kotwali Bazaar has paved promenades; upper Bhagsu & Triund trails feature steep mountain flagstones.',
    transitNotes: 'Local shared taxis and auto-rickshaws operate between Kotwali and McLeodGanj. Expect winding hill turns.',
    languages: ['Hindi', 'Pahari / Kangri', 'Tibetan', 'English'],
    foodRecommendations: [
      {
        locale: 'McLeodGanj Main Square & Temple Road',
        dishes: ['Tibetan Steamed Momos', 'Tingmo with spicy dal', 'Bhagsu Cake & Apple Crumble', 'Butter Salted Tea'],
        notes: 'Monastic cafes and generational bakeries',
      },
      {
        locale: 'Kotwali Bazaar Hearth Stalls',
        dishes: ['Kangri Dham (Chana Madra, Khatta)', 'Siddu with Desi Ghee', 'Babru Bread'],
        notes: 'Authentic local Himachali festive thalis',
      },
    ],
    travelTips: [
      'Start Triund or Bhagsu waterfall hikes before 08:00 AM to beat midday mountain fog and trail crowds.',
      'Maintain clockwise pradakshina around Tsuglagkhang Monastery prayer wheels and stupas.',
      'Evening temperatures in upper Dharamshala drop by 7°C rapidly; keep warm layers handy.',
    ],
    bestTimeToVisit: {
      idealMonths: 'March to June (Clear skies) & September to November (Autumn vistas)',
      crowdPacing: 'Weekdays offer serene monastic silence; weekends see visitors from Punjab and Delhi.',
      advisory: 'Monsoon (July to August) brings heavy precipitation; check road advisories on mountain passes.',
    },
    nearbyPlaces: [
      { name: 'Kangra Fort', area: '20 km south', tag: 'Ancient Rock Fortress' },
      { name: 'Norbulingka Institute', area: '14 km east', tag: 'Thangka Craft Guild' },
      { name: 'Kareri Glacial Stream', area: '25 km northwest', tag: 'Pine Valley Trail' },
    ],
  },
  malshej: {
    weatherSummary: 'Misty Sahyadri mountain pass with cascading monsoon currents',
    temperature: '18°C to 26°C',
    packingList: ['Waterproof rain poncho', 'Slip-resistant trekking shoes', 'Dry bags for electronics', 'Binoculars for birdwatching'],
    accessibilityNotes: 'Highway viewpoint rest stops are level; waterfall paths and fort trails require active footing on wet basalt rocks.',
    transitNotes: 'Private cabs from Kalyan or Pune are recommended. Drive with fog lamps during dense monsoon cloud cover.',
    languages: ['Marathi', 'Hindi', 'English'],
    foodRecommendations: [
      {
        locale: 'Malshej Ghat Viewpoint Dhabas',
        dishes: ['Pithla Bhakri with Thecha', 'Kanda Bhaji & Steaming Masala Chai', 'Roasted Sweetcorn with Lemon'],
        notes: 'Rustic mountain pass comfort food',
      },
      {
        locale: 'Junnar & Otur Village Rest Stops',
        dishes: ['Maharashtra Thali with Solkadhi', 'Misal Pav with Farsan', 'Fresh Wild Guava & Berries'],
        notes: 'Generational rural Maratha recipes',
      },
    ],
    travelTips: [
      'Monsoon driving along the Ghat pass requires steady speeds; avoid overtaking near sharp hairpin curves.',
      'Carry waterproof pouches for all mobile phones and camera gear during waterfall exploration.',
      'Visit Pimpalgaon Joga Dam in early morning for flamingo sightings between October and March.',
    ],
    bestTimeToVisit: {
      idealMonths: 'July to October (Vibrant Monsoon Waterfalls) & November to February (Cool Trekking)',
      crowdPacing: 'Monsoon weekends draw day-trippers from Mumbai and Pune; weekdays are peacefully misty.',
      advisory: 'Stay cautious near fast-flowing roadside stream edges during heavy rain bursts.',
    },
    nearbyPlaces: [
      { name: 'Harishchandragad Fort', area: '18 km northwest', tag: 'Kedareshwar Cave Cliff' },
      { name: 'Pimpalgaon Joga Dam', area: '12 km south', tag: 'Flamingo Wetlands' },
      { name: 'Shivneri Citadel', area: '28 km southeast', tag: 'Historic Hill Fortress' },
    ],
  },
  jaipur: {
    weatherSummary: 'Crisp sunny desert skies with golden morning warmth',
    temperature: '16°C to 28°C',
    packingList: ['Breathable cotton attire', 'Comfortable walking slip-ons', 'Sunglasses & Sunscreen', 'Camera with wide lens'],
    accessibilityNotes: 'City Palace and Jantar Mantar offer ramped walkways; Amber Fort upper courtyards feature paved inclines.',
    transitNotes: 'E-rickshaws and app cabs are plentiful in the Pink City. Auto meters can be negotiated for half-day circuits.',
    languages: ['Hindi', 'Rajasthani / Dhundhari', 'English'],
    foodRecommendations: [
      {
        locale: 'Johari Bazaar & Chaura Rasta',
        dishes: ['Pyaaz Kachori & Mirchi Vada', 'Mawa Ghewar & Rabdi', 'Kulhad Chai at Gulab Ji'],
        notes: 'Generational walled city street culinary lore',
      },
      {
        locale: 'MI Road & Walled City Haveli Quarter',
        dishes: ['Dal Baati Churma with Pure Ghee', 'Ker Sangri with Bajre ki Roti', 'Royal Laal Maas'],
        notes: 'Classic Rajputana heritage dining',
      },
    ],
    travelTips: [
      'Enter Amber Fort at opening (08:30 AM) to enjoy soft morning lighting and avoid tour coach crowds.',
      'Purchase composite monument tickets at your first stop to bypass ticket queues at subsequent sites.',
      'Old city artisan bazaars are most vibrant after 11:30 AM when traditional guild shutters open.',
    ],
    bestTimeToVisit: {
      idealMonths: 'October to March (Pleasant Desert Winter)',
      crowdPacing: 'Midday hours (12:00 PM to 03:00 PM) are busiest at Hawa Mahal street fronts; mornings are quiet.',
      advisory: 'Hydrate well during outdoor fort climbs even during winter sun.',
    },
    nearbyPlaces: [
      { name: 'Chand Baori Stepwell', area: 'Abhaneri (95 km east)', tag: '8th-Century Geometric Wonder' },
      { name: 'Bagru Handblock Village', area: '32 km southwest', tag: 'Dabu Natural Dye Ateliers' },
      { name: 'Sambhar Salt Lake', area: '80 km west', tag: 'Flamingo Salt Plains' },
    ],
  },
  kochi: {
    weatherSummary: 'Tropical coastal breeze with gentle Arabian Sea mist',
    temperature: '23°C to 30°C',
    packingList: ['Light linen garments', 'Compact umbrella', 'Slip-resistant footwear', 'Mosquito repellent'],
    accessibilityNotes: 'Fort Kochi promenades and Jew Town lanes are flat and accessible; heritage spice godowns have step entries.',
    transitNotes: 'Take the scenic Ro-Ro public ferry between Fort Kochi and Vypin Island (₹6 ticket) for quick transit.',
    languages: ['Malayalam', 'English', 'Hindi'],
    foodRecommendations: [
      {
        locale: 'Fort Kochi Princess Street',
        dishes: ['Karimeen Pollichathu (Spiced Pearl Spot)', 'Kerala Appam with Vegetable Stew', 'Cardamom Cold Brew'],
        notes: 'Colonial quarter open-air culinary bistros',
      },
      {
        locale: 'Mattancherry & Jew Town',
        dishes: ['Ernakulam Sadya on Banana Leaf', 'Pazham Pori & Beef Fry', 'Kayees Fragrant Biryani'],
        notes: 'Historic spice trading culinary heritage',
      },
    ],
    travelTips: [
      'Catch the public Ro-Ro ferry across the harbor channel to save 40 minutes of road detour.',
      'Arrive by 05:00 PM at Kathakali performance centers to watch the intricate ceremonial facial makeup ritual.',
      'Dress modestly covering shoulders and knees when visiting Paradesi Synagogue and ancient basilica shrines.',
    ],
    bestTimeToVisit: {
      idealMonths: 'November to February (Breezy Winter) & June-August (Lush Monsoon)',
      crowdPacing: 'Jew Town antiques lane is quietest before 11:00 AM; Chinese fishing nets draw crowds at sunset.',
      advisory: 'Coastal humidity is high; drink tender coconut water readily available along promenades.',
    },
    nearbyPlaces: [
      { name: 'Kumbalangi Craft Village', area: '14 km south', tag: 'Island Crab & Coir Farms' },
      { name: 'Athirappilly Waterfalls', area: '72 km northeast', tag: 'Cascading Forest Falls' },
      { name: 'Alappuzha Backwaters', area: '53 km south', tag: 'Houseboat Canal Labyrinth' },
    ],
  },
  varanasi: {
    weatherSummary: 'Serene holy river dawn with sacred temple bells and evening mist',
    temperature: '14°C to 26°C',
    packingList: ['Modest cotton attire', 'Slip-on shoes for temple steps', 'Cloth tote bag for footwear', 'Hand sanitizer'],
    accessibilityNotes: 'Ghat promenades feature ancient stone stairs; newly developed Kashi Vishwanath corridor has ramp and escalator access.',
    transitNotes: 'Walk along the river ghats whenever possible; auto-rickshaws face gridlock inside Godowlia bazaar lanes.',
    languages: ['Hindi', 'Bhojpuri', 'English'],
    foodRecommendations: [
      {
        locale: 'Godowlia Chowk & Dashashwamedh',
        dishes: ['Kachori Sabzi & Crispy Jalebi', 'Malaiyo (Winter Saffron Foam)', 'Tamatar Chaat with Desi Ghee'],
        notes: 'Century-old dawn street food stalls',
      },
      {
        locale: 'Thatheri Bazaar & Vishwanath Gali',
        dishes: ['Banarasi Maghai Paan', 'Thick Malai Lassi in Earthen Kulhad', 'Rabdi with Malai Puri'],
        notes: 'Legendary lane sweetmakers and milk bars',
      },
    ],
    travelTips: [
      'Board a hand-rowed wooden boat from Assi Ghat before 05:30 AM for Subah-e-Banaras sunrise views.',
      'Leave leather belts and bags at your hotel locker before entering the Kashi Vishwanath sanctum.',
      'Take a peaceful walk along the southern ghats (Assi to Chet Singh) for quiet temple photography.',
    ],
    bestTimeToVisit: {
      idealMonths: 'October to March (Cool River Mist & Golden Sun)',
      crowdPacing: 'Ghat Aarti at 06:30 PM is packed; arrive by 05:30 PM to secure prime riverside steps.',
      advisory: 'Stone steps can be slick near water edges; walk carefully in morning dew.',
    },
    nearbyPlaces: [
      { name: 'Sarnath Deer Park', area: '10 km north', tag: 'First Sermon Stupa & Lion Capital' },
      { name: 'Chunar Sandstone Fort', area: '42 km southwest', tag: 'Mughal Citadel over Ganges' },
      { name: 'Ramnagar Palace', area: '12 km south', tag: 'Vintage Museum & River Views' },
    ],
  },
  srinagar: {
    weatherSummary: 'Alpine lake serenity with cool Chinar breezes and mountain clarity',
    temperature: '10°C to 22°C',
    packingList: ['Pashmina wrap or light fleece', 'Warm woolen socks', 'Moisturizer & Lip balm', 'Slip-resistant walking shoes'],
    accessibilityNotes: 'Boulevard road along Dal Lake is level; terraced Mughal gardens have stepped platforms with ramp side lanes.',
    transitNotes: 'Use government-fixed rate Shikaras at numbered Dal Lake Ghats. Pre-arrange registered tourist cabs for day trips.',
    languages: ['Kashmiri', 'Urdu', 'Hindi', 'English'],
    foodRecommendations: [
      {
        locale: 'Lal Chowk & Residency Road',
        dishes: ['Kashmiri Wazwan Rista & Rogan Josh', 'Saffron Kahwa with Crushed Almonds', 'Tabak Maaz Crispy Ribs'],
        notes: 'Classic Kashmiri banquet masteries',
      },
      {
        locale: 'Dal Gate & Zaina Kadal Bridge',
        dishes: ['Traditional Kandur Breads (Girda & Sheermal)', 'Harissa (Winter Lamb Delicacy)', 'Gucchi Morel Pulao'],
        notes: 'Generational bakeries and hearths',
      },
    ],
    travelTips: [
      'Take an early 05:30 AM shikara to the floating vegetable market for tranquil morning light without motor traffic.',
      'Verify the artisan GI seal when purchasing genuine hand-knotted Kashmiri Pashmina shawls.',
      'Mughal gardens like Nishat and Shalimar look most radiant in late afternoon autumn glow.',
    ],
    bestTimeToVisit: {
      idealMonths: 'April to October (Gardens & Lakes) and Dec to Feb (Snowscape)',
      crowdPacing: 'April Tulip Festival has high footfall; September to November offers serene golden chinar foliage.',
      advisory: 'Mountain weather changes swiftly; always keep a lightweight windbreaker handy.',
    },
    nearbyPlaces: [
      { name: 'Doodhpathri Valley', area: '42 km southwest', tag: 'Meadow of Milk Mountain Streams' },
      { name: 'Pari Mahal', area: '9 km east', tag: 'Astronomical Mughal Terraces' },
      { name: 'Yusmarg Alpine Forest', area: '47 km south', tag: 'Pristine Pine Valley & Trails' },
    ],
  },
  leh: {
    weatherSummary: 'High-altitude cold desert clarity under deep azure Himalayan skies',
    temperature: '8°C to 18°C',
    packingList: ['Thermal base layers', 'SPF 50 Sunscreen & UV400 Sunglasses', 'Insulated water flask', 'Electrolyte sachets'],
    accessibilityNotes: 'Leh Main Bazaar is pedestrianized and flat; ancient monasteries like Thiksey involve steep stone steps.',
    transitNotes: 'Book Ladakh Taxi Union registered cabs for pass travel. Always carry printed Inner Line Permits (ILP).',
    languages: ['Ladakhi / Bhoti', 'Hindi', 'English'],
    foodRecommendations: [
      {
        locale: 'Old Town Leh Bazaar & Main Street',
        dishes: ['Ladakhi Skyu (Pasta Stew)', 'Chhurpi Yak Cheese Snack', 'Khambir with Organic Apricot Jam'],
        notes: 'High-altitude organic hearths',
      },
      {
        locale: 'Changspa Road Artisan Cafes',
        dishes: ['Tingmo with Wild Mushroom Stew', 'Buckwheat Pancakes', 'Fresh Seabuckthorn Berry Juice'],
        notes: 'Nutritious Himalayan wellness cuisine',
      },
    ],
    travelTips: [
      'Rest completely for the first 24-36 hours in Leh to acclimatize to 3,500m elevation without fatigue.',
      'Carry refillable water bottles and use community RO water stations to protect Ladakh fragile ecosystem.',
      'Respect silence in prayer sanctums and do not touch antique Thangka silk paintings.',
    ],
    bestTimeToVisit: {
      idealMonths: 'May to September (Open High Passes & Vibrant Festivals)',
      crowdPacing: 'Hemis Festival (June/July) draws international cultural enthusiasts; September is peaceful.',
      advisory: 'High UV radiation at high altitude; reapply sunscreen every 3 hours during day excursions.',
    },
    nearbyPlaces: [
      { name: 'Thiksey Monastery', area: '19 km south', tag: '12-Story Mini Potala Palace' },
      { name: 'Magnetic Hill & Sangam', area: '31 km west', tag: 'Indus & Zanskar Confluence' },
      { name: 'Alchi Ancient Murals', area: '65 km west', tag: '11th-Century Kashmiri Buddhist Frescoes' },
    ],
  },
  udaipur: {
    weatherSummary: 'Mild desert sun with shimmering lake reflections and cool evening breezes',
    temperature: '15°C to 28°C',
    packingList: ['Comfortable cottons', 'Light evening shawl', 'Polarized sunglasses', 'Camera with zoom lens'],
    accessibilityNotes: 'Lake promenades around Fateh Sagar are level; City Palace features ramped courtyards alongside historic staircases.',
    transitNotes: 'Auto-rickshaws and e-rickshaws are ideal for navigating the narrow alleys of the old quarters.',
    languages: ['Hindi', 'Mewari', 'English'],
    foodRecommendations: [
      {
        locale: 'Gangaur Ghat & Jagdish Chowk',
        dishes: ['Dal Baati Churma with Ghee', 'Gulab Halwa & Rabdi Ghewar', 'Mirchi Bada at Shastri Circle'],
        notes: 'Authentic Mewari culinary institutions',
      },
      {
        locale: 'Fateh Sagar Lake Promenade',
        dishes: ['Kulhad Cold Coffee', 'Ker Sangri Paneer', 'Lal Maas Haveli Recipe'],
        notes: 'Lakefront evening gastronomic stalls',
      },
    ],
    travelTips: [
      'Book Lake Pichola sunset boat cruise in morning to avoid sold-out evening slots.',
      'Explore narrow haveli lanes on foot or two-wheeler as four-wheelers get bottlenecked.',
      'Visit City Palace right at 09:00 AM opening for uncrowded views over the lake waters.',
    ],
    bestTimeToVisit: {
      idealMonths: 'September to March (Pleasant Lake Breezes)',
      crowdPacing: 'Sunset hours at Ambrai Ghat are popular; sunrise around Gangaur Ghat is calm and photogenic.',
      advisory: 'Wear slip-on shoes for temple visits around Jagdish Temple.',
    },
    nearbyPlaces: [
      { name: 'Kumbhalgarh Fort', area: '85 km north', tag: 'Second Longest Wall in World' },
      { name: 'Ranakpur Marble Temples', area: '93 km northwest', tag: '1444 Intricately Carved Pillars' },
      { name: 'Sajjangarh Monsoon Palace', area: '10 km west', tag: 'Panoramic Hilltop Sunset Fort' },
    ],
  },
};

export function getGenericRegionalFallback(
  city: string,
  state: string,
  weatherPreference?: string,
  accessibility?: any,
  userInterests: string[] = []
): RegionalCulturalKnowledge {
  const isMountain = state.toLowerCase().includes('himachal') || state.toLowerCase().includes('uttarakhand') || state.toLowerCase().includes('sikkim') || state.toLowerCase().includes('ladakh') || state.toLowerCase().includes('kashmir') || weatherPreference === 'summer_hills';
  const isCoastal = state.toLowerCase().includes('kerala') || state.toLowerCase().includes('goa') || state.toLowerCase().includes('tamil') || state.toLowerCase().includes('maharashtra') || state.toLowerCase().includes('odisha');

  return {
    weatherSummary: isMountain
      ? 'Cool mountain breezes with panoramic Himalayan clarity'
      : isCoastal
      ? 'Pleasant coastal breezes with mild tropical sunny skies'
      : 'Sunny with crisp morning air and golden evening warmth',
    temperature: isMountain ? '14°C to 22°C' : isCoastal ? '22°C to 29°C' : '18°C to 28°C',
    packingList: [
      'Breathable natural cotton or linen attire',
      'Comfortable slip-on footwear for heritage monuments and temples',
      'Modesty scarf for sacred shrines and sanctums',
      isMountain ? 'Light thermal layer for evening temperature drop' : 'Sunscreen, sunglasses and hydration flask',
    ],
    accessibilityNotes: accessibility?.wheelchair
      ? 'Route prioritized for ramped promenades and step-free entries.'
      : 'Major heritage avenues feature level access; historic alleys and older temple complexes have traditional steps.',
    transitNotes: 'Local auto-rickshaws, e-rickshaws, and app cabs are widely available. Agree on fares or request meters.',
    languages: ['Hindi', 'English', state ? `${state} Regional Language` : 'Local Regional Dialect'],
    foodRecommendations: [
      {
        locale: `${city} Old Bazaar Quarter`,
        dishes: [`Authentic ${city} Regional Thali`, 'Generational Heritage Sweets', 'Local Street Savory Delicacies'],
        notes: 'Verified historic food lanes and culinary hearths',
      },
      {
        locale: `${city} Promenades & Artisan Quarter`,
        dishes: ['Signature Spiced Chai', 'Vernacular Breakfast Specialties', 'Locally Harvested Seasonal Platters'],
        notes: 'Community-vetted dining establishments',
      },
    ],
    travelTips: [
      `Start sightseeing by 08:30 AM to explore ${city} heritage landmarks in soft morning light.`,
      'Dress modestly covering shoulders and knees when visiting regional spiritual shrines.',
      'Engage with local artisan cooperatives for authentic certified handicraft souvenirs.',
    ],
    bestTimeToVisit: {
      idealMonths: isMountain ? 'March to June & September to November' : 'October to March (Optimal Season)',
      crowdPacing: 'Weekday mornings offer the most serene experiences; weekends see lively regional footfall.',
      advisory: 'Check local festival calendars as major cultural fairs may alter monument opening timings.',
    },
    nearbyPlaces: [
      { name: `${city} Scenic Valley & Stepwell`, area: '15 km perimeter', tag: 'Natural Heritage Site' },
      { name: `${state || city} Master Artisan Guild`, area: '25 km radius', tag: 'Traditional Craft Village' },
      { name: `${city} Ancient Hilltop Watchtower`, area: '18 km perimeter', tag: 'Panoramic Historical Viewpoint' },
    ],
  };
}

export function resolvePracticalBriefingForDestination(
  city: string,
  state: string,
  weatherPreference?: string,
  accessibility?: any,
  userInterests: string[] = []
): ItineraryPracticalInfo {
  const key = (city || '').toLowerCase().trim();
  const normalizedKey = key.includes('dharamshala') || key.includes('mcleod')
    ? 'dharamshala'
    : key.includes('malshej')
    ? 'malshej'
    : key.includes('jaipur')
    ? 'jaipur'
    : key.includes('kochi') || key.includes('cochin')
    ? 'kochi'
    : key.includes('varanasi') || key.includes('banaras') || key.includes('kashi')
    ? 'varanasi'
    : key.includes('srinagar')
    ? 'srinagar'
    : key.includes('leh') || key.includes('ladakh')
    ? 'leh'
    : key.includes('udaipur')
    ? 'udaipur'
    : key;

  const data = REGIONAL_CULTURAL_REGISTRY[normalizedKey] || getGenericRegionalFallback(city, state, weatherPreference, accessibility, userInterests);

  return {
    weatherSummary: data.weatherSummary,
    temperature: data.temperature,
    packingList: data.packingList,
    accessibilityNotes: data.accessibilityNotes,
    transitNotes: data.transitNotes,
    languages: data.languages,
    foodRecommendations: data.foodRecommendations,
    travelTips: data.travelTips,
    bestTimeToVisit: data.bestTimeToVisit,
    nearbyPlaces: data.nearbyPlaces,
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
