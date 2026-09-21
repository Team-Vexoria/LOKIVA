import { create } from 'zustand';
import {
  ItineraryTripDetails,
  ItineraryDay,
  ItineraryActivity,
  ItineraryPracticalInfo,
  ItineraryViewMode,
  DayFeasibilityMetrics,
  ReplanCondition,
} from '../types/itinerary';
import {
  generateDynamicTripPlan,
  recalculateDaySchedule,
  replanDayForCondition,
  GenerateTripOptions,
} from '../lib/itinerarySolver';

const STORAGE_KEY = 'lokiva_dynamic_itinerary_store_v2';

interface ItineraryState {
  tripDetails: ItineraryTripDetails;
  days: ItineraryDay[];
  selectedDay: number;
  activeStopId: number | null;
  hoveredStopId: number | null;
  viewMode: ItineraryViewMode;
  feasibilityMetrics: Record<number, DayFeasibilityMetrics>;
  practicalInfo: ItineraryPracticalInfo;
  isGenerating: boolean;
  lastReplanMessage: string | null;

  // Actions
  setSelectedDay: (dayNumber: number) => void;
  setActiveStopId: (id: number | null) => void;
  setHoveredStopId: (id: number | null) => void;
  setViewMode: (mode: ItineraryViewMode) => void;
  reorderActivity: (dayNumber: number, fromIndex: number, toIndex: number) => void;
  deleteActivity: (dayNumber: number, activityId: number) => void;
  addActivity: (dayNumber: number, activity: ItineraryActivity, afterIndex?: number) => void;
  updateActivity: (dayNumber: number, activityId: number, patch: Partial<ItineraryActivity>) => void;
  setDayStartTime: (dayNumber: number, startTime: string) => void;
  replanDay: (dayNumber: number, condition: ReplanCondition) => void;
  generateTrip: (options: GenerateTripOptions) => void;
  clearReplanMessage: () => void;
}

// Initial default trip if localStorage is empty
function createInitialState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.days) && parsed.days.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Ignore parse error and fall back to default
  }

  const defaultPlan = generateDynamicTripPlan({
    city: 'Jaipur',
    state: 'Rajasthan',
    daysCount: 3,
    pace: 'balanced',
    travelers: 2,
    budgetLimit: 25000,
  });

  const metricsMap: Record<number, DayFeasibilityMetrics> = {};
  defaultPlan.days.forEach((d) => {
    const { metrics } = recalculateDaySchedule(d, 2);
    metricsMap[d.dayNumber] = metrics;
  });

  return {
    tripDetails: defaultPlan.tripDetails,
    days: defaultPlan.days,
    selectedDay: 1,
    activeStopId: null,
    hoveredStopId: null,
    viewMode: 'timeline' as ItineraryViewMode,
    feasibilityMetrics: metricsMap,
    practicalInfo: defaultPlan.practicalInfo,
    isGenerating: false,
    lastReplanMessage: null,
  };
}

const initialState = createInitialState();

export const useItineraryStore = create<ItineraryState>((set, get) => ({
  ...initialState,

  setSelectedDay: (dayNumber: number) => {
    set({ selectedDay: dayNumber, activeStopId: null, hoveredStopId: null });
  },

  setActiveStopId: (id: number | null) => {
    set({ activeStopId: id });
  },

  setHoveredStopId: (id: number | null) => {
    set({ hoveredStopId: id });
  },

  setViewMode: (mode: ItineraryViewMode) => {
    set({ viewMode: mode });
  },

  reorderActivity: (dayNumber: number, fromIndex: number, toIndex: number) => {
    const { days, tripDetails, feasibilityMetrics } = get();
    const dayIndex = days.findIndex((d) => d.dayNumber === dayNumber);
    if (dayIndex === -1) return;

    const currentDay = days[dayIndex];
    const activities = [...currentDay.activities];
    if (
      fromIndex < 0 ||
      fromIndex >= activities.length ||
      toIndex < 0 ||
      toIndex >= activities.length
    ) {
      return;
    }

    const [moved] = activities.splice(fromIndex, 1);
    activities.splice(toIndex, 0, moved);

    const { day: updatedDay, metrics } = recalculateDaySchedule(
      { ...currentDay, activities },
      tripDetails.travelers || 2
    );

    const newDays = [...days];
    newDays[dayIndex] = updatedDay;

    const newMetrics = {
      ...feasibilityMetrics,
      [dayNumber]: metrics,
    };

    set({ days: newDays, feasibilityMetrics: newMetrics });

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          tripDetails,
          days: newDays,
          practicalInfo: get().practicalInfo,
        })
      );
    } catch {
      // ignore
    }
  },

  deleteActivity: (dayNumber: number, activityId: number) => {
    const { days, tripDetails, feasibilityMetrics } = get();
    const dayIndex = days.findIndex((d) => d.dayNumber === dayNumber);
    if (dayIndex === -1) return;

    const currentDay = days[dayIndex];
    const activities = currentDay.activities.filter((a) => a.id !== activityId);

    const { day: updatedDay, metrics } = recalculateDaySchedule(
      { ...currentDay, activities },
      tripDetails.travelers || 2
    );

    const newDays = [...days];
    newDays[dayIndex] = updatedDay;

    const newMetrics = {
      ...feasibilityMetrics,
      [dayNumber]: metrics,
    };

    set({ days: newDays, feasibilityMetrics: newMetrics });

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          tripDetails,
          days: newDays,
          practicalInfo: get().practicalInfo,
        })
      );
    } catch {
      // ignore
    }
  },

  addActivity: (dayNumber: number, activity: ItineraryActivity, afterIndex?: number) => {
    const { days, tripDetails, feasibilityMetrics } = get();
    const dayIndex = days.findIndex((d) => d.dayNumber === dayNumber);
    if (dayIndex === -1) return;

    const currentDay = days[dayIndex];
    const activities = [...currentDay.activities];

    if (afterIndex !== undefined && afterIndex >= 0 && afterIndex < activities.length) {
      activities.splice(afterIndex + 1, 0, activity);
    } else {
      activities.push(activity);
    }

    const { day: updatedDay, metrics } = recalculateDaySchedule(
      { ...currentDay, activities },
      tripDetails.travelers || 2
    );

    const newDays = [...days];
    newDays[dayIndex] = updatedDay;

    const newMetrics = {
      ...feasibilityMetrics,
      [dayNumber]: metrics,
    };

    set({ days: newDays, feasibilityMetrics: newMetrics, activeStopId: activity.id });

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          tripDetails,
          days: newDays,
          practicalInfo: get().practicalInfo,
        })
      );
    } catch {
      // ignore
    }
  },

  updateActivity: (dayNumber: number, activityId: number, patch: Partial<ItineraryActivity>) => {
    const { days, tripDetails, feasibilityMetrics } = get();
    const dayIndex = days.findIndex((d) => d.dayNumber === dayNumber);
    if (dayIndex === -1) return;

    const currentDay = days[dayIndex];
    const activities = currentDay.activities.map((a) =>
      a.id === activityId ? { ...a, ...patch } : a
    );

    const { day: updatedDay, metrics } = recalculateDaySchedule(
      { ...currentDay, activities },
      tripDetails.travelers || 2
    );

    const newDays = [...days];
    newDays[dayIndex] = updatedDay;

    const newMetrics = {
      ...feasibilityMetrics,
      [dayNumber]: metrics,
    };

    set({ days: newDays, feasibilityMetrics: newMetrics });

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          tripDetails,
          days: newDays,
          practicalInfo: get().practicalInfo,
        })
      );
    } catch {
      // ignore
    }
  },

  setDayStartTime: (dayNumber: number, startTime: string) => {
    const { days, tripDetails, feasibilityMetrics } = get();
    const dayIndex = days.findIndex((d) => d.dayNumber === dayNumber);
    if (dayIndex === -1) return;

    const currentDay = days[dayIndex];
    const { day: updatedDay, metrics } = recalculateDaySchedule(
      { ...currentDay, dayStartTime: startTime },
      tripDetails.travelers || 2
    );

    const newDays = [...days];
    newDays[dayIndex] = updatedDay;

    const newMetrics = {
      ...feasibilityMetrics,
      [dayNumber]: metrics,
    };

    set({ days: newDays, feasibilityMetrics: newMetrics });
  },

  replanDay: (dayNumber: number, condition: ReplanCondition) => {
    const { days, tripDetails, feasibilityMetrics } = get();
    const dayIndex = days.findIndex((d) => d.dayNumber === dayNumber);
    if (dayIndex === -1) return;

    const currentDay = days[dayIndex];
    const { day: replannedDay, metrics, replacedCount } = replanDayForCondition(
      currentDay,
      condition,
      tripDetails.travelers || 2
    );

    const newDays = [...days];
    newDays[dayIndex] = replannedDay;

    const newMetrics = {
      ...feasibilityMetrics,
      [dayNumber]: metrics,
    };

    let msg = `Replanned Day ${dayNumber}: `;
    if (condition === 'rain') {
      msg += `Swapped ${replacedCount} outdoor stops with sheltered artisan guilds and indoor museums.`;
    } else if (condition === 'heat') {
      msg += `Protected midday slots with shaded workshops and air-conditioned heritage dining.`;
    } else if (condition === 'fatigue') {
      msg += `Optimized itinerary with low-walking seated cultural experiences.`;
    } else {
      msg += `Rearranged timing to avoid peak tourist congestion.`;
    }

    set({
      days: newDays,
      feasibilityMetrics: newMetrics,
      lastReplanMessage: msg,
    });

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          tripDetails,
          days: newDays,
          practicalInfo: get().practicalInfo,
        })
      );
    } catch {
      // ignore
    }
  },

  generateTrip: (options: GenerateTripOptions) => {
    set({ isGenerating: true });
    try {
      const plan = generateDynamicTripPlan(options);
      const metricsMap: Record<number, DayFeasibilityMetrics> = {};
      plan.days.forEach((d) => {
        const { metrics } = recalculateDaySchedule(d, options.travelers || 2);
        metricsMap[d.dayNumber] = metrics;
      });

      set({
        tripDetails: plan.tripDetails,
        days: plan.days,
        selectedDay: 1,
        activeStopId: null,
        hoveredStopId: null,
        feasibilityMetrics: metricsMap,
        practicalInfo: plan.practicalInfo,
        isGenerating: false,
        lastReplanMessage: `Generated conflict-free ${options.daysCount || 3}-Day itinerary for ${options.city}.`,
      });

      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            tripDetails: plan.tripDetails,
            days: plan.days,
            practicalInfo: plan.practicalInfo,
          })
        );
      } catch {
        // ignore
      }
    } finally {
      set({ isGenerating: false });
    }
  },

  clearReplanMessage: () => {
    set({ lastReplanMessage: null });
  },
}));
