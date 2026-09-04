export type BookingStatus = 'confirmed' | 'available' | 'pending' | 'unavailable';

export type ItineraryViewMode = 'timeline' | 'map' | 'list' | 'budget';

export type TimeOfDaySlot = 'Morning' | 'Breakfast' | 'Afternoon' | 'Evening' | 'Dinner';

export interface ItineraryActivity {
  id: number;
  experienceId?: number;
  timeSlot: TimeOfDaySlot;
  timeRange: string;
  title: string;
  category: string;
  location: string;
  description: string;
  duration: string;
  durationMins: number;
  includes: string[];
  costPerPerson: number;
  bookingStatus: BookingStatus;
  gettingThere: string;
  transitTimeMins: number;
  transitCost: number;
  whatToBring: string[];
  notes?: string;
  photos: string[];
  accessibility?: string;
  lat?: number;
  lng?: number;
}

export interface ItineraryDay {
  dayNumber: number;
  date: string;
  dayOfWeek: string;
  title: string;
  heroImage: string;
  hotel: string;
  activities: ItineraryActivity[];
}

export interface ItineraryTripDetails {
  title: string;
  destination: string;
  state: string;
  startDate: string;
  endDate: string;
  travelers: number;
  totalBudgetLimit: number;
  hotel: string;
}

export interface ItineraryPracticalInfo {
  weatherSummary: string;
  temperature: string;
  packingList: string[];
  accessibilityNotes: string;
  transitNotes: string;
  languages: string[];
}
