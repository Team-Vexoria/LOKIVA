export type QuickEscapeInterest =
  | 'Culture'
  | 'Food'
  | 'Heritage'
  | 'Shopping'
  | 'Nature'
  | 'Entertainment';

export type AvailableHours = 1 | 2 | 3 | 5;

export type StartPointType = 'current' | 'custom';

export interface QuickEscapeQuery {
  location: string;
  startPointType: StartPointType;
  customStartPoint?: string;
  availableHours: AvailableHours;
  interests: QuickEscapeInterest[];
  coords?: { latitude: number; longitude: number };
  isLiveGps?: boolean;
}

export interface QuickEscapeTransit {
  durationMins: number;
  distanceKm: number;
  mode: 'walk' | 'auto' | 'metro' | 'cab';
  description: string;
}

export interface QuickEscapeStop {
  id: string;
  title: string;
  category: QuickEscapeInterest | 'Return';
  categoryLabel: string;
  timeSlot: string; // e.g. "09:00 — 09:45"
  startTime: string; // e.g. "09:00"
  endTime: string; // e.g. "09:45"
  durationMins: number;
  areaName: string;
  description: string;
  whyItFits: string;
  imageUrl: string;
  rating?: number;
  reviewCount?: number;
  priceNote?: string;
  transitToNext?: QuickEscapeTransit;
}

export interface QuickEscapePlan {
  id: string;
  title: string; // e.g. "Your 3-Hour Delhi Escape"
  city: string;
  totalHours: AvailableHours;
  totalDurationMins: number;
  estimatedTravelTimeMins: number;
  approxDistanceKm: number;
  startPoint: string;
  endPoint: string;
  startTime: string; // e.g. "09:00"
  endTime: string; // e.g. "12:00"
  stops: QuickEscapeStop[];
  summary: string;
  feasibilityScore: number;
  feasibilityBadge: string;
  mapDirectionsUrl: string;
  isLiveGps?: boolean;
}
