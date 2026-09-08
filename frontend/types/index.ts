export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'traveler' | 'provider' | 'admin';
  is_active: boolean;
  created_at: string;
  profile?: TravelerProfile;
}

export interface TravelerProfile {
  traveler_type: string;
  group_size: number;
  budget: number;
  available_hours: number;
  interests: string[];
  accessibility_prefs: {
    low_walking?: boolean;
    wheelchair?: boolean;
    family_friendly?: boolean;
    [key: string]: any;
  };
  current_city?: string;
  current_state?: string;
  location_name: string;
  hotel_lat: number;
  hotel_lng: number;
}

export interface State {
  id: number;
  name: string;
  code: string;
  region: string;
  image_url?: string;
  experience_count?: number;
}

export interface City {
  id: number;
  state_id: number;
  name: string;
  tagline?: string;
  description?: string;
  latitude: number;
  longitude: number;
  image_url?: string;
  is_popular: boolean;
  state_name?: string;
  experience_count?: number;
}

export interface Area {
  id: number;
  city_id: number;
  name: string;
  latitude: number;
  longitude: number;
}

export interface DestinationSummary {
  id: number;
  name: string;
  state_name: string;
  state_code: string;
  tagline: string;
  latitude: number;
  longitude: number;
  image_url: string;
  experience_count: number;
  popular_categories: string[];
}

export interface DestinationDetail {
  city: City;
  state_name: string;
  state_code: string;
  weather_context: string;
  areas: string[];
  experiences: Experience[];
}

export interface Provider {
  id: number;
  user_id: number;
  business_name: string;
  description?: string;
  contact_email?: string;
  phone?: string;
  city: string;
  state?: string;
  address?: string;
  website?: string;
  is_verified: boolean;
  rating: number;
  total_reviews: number;
  created_at: string;
}

export interface ProviderAnalyticsSummary {
  views: number;
  saves: number;
  bookings: number;
  revenue: number;
  conversion_rate: number;
  rating: number;
  views_trend: Array<{ day: string; views: number; bookings: number }>;
  audience_breakdown: Record<string, number>;
  top_experiences: Array<{ id: number; title: string; views: number; bookings: number; revenue: number }>;
}

export interface Review {
  id: number;
  experience_id: number;
  user_id: number;
  rating: number;
  comment: string;
  traveler_type: string;
  created_at: string;
  user_name?: string;
}

export interface Experience {
  id: number;
  provider_id?: number;
  title: string;
  description: string;
  category: 'food' | 'culture' | 'workshop' | 'hidden_gem' | 'adventure' | 'nature' | 'shopping' | 'nightlife' | 'events';
  country?: string;
  state: string;
  city: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
  address: string;
  price: number;
  duration_mins: number;
  opening_time: string;
  closing_time: string;
  capacity: number;
  min_group: number;
  max_group: number;
  is_indoor: boolean;
  is_hidden_gem: boolean;
  accessibility_low_walking: boolean;
  accessibility_wheelchair: boolean;
  accessibility_step_free: boolean;
  accessibility_family_friendly: boolean;
  accessibility_senior_friendly: boolean;
  dietary_vegetarian: boolean;
  dietary_vegan?: boolean;
  dietary_jain?: boolean;
  rating: number;
  review_count: number;
  popularity_score: number;
  tags: string[];
  images: string[];
  target_audience: string[];
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  provider?: Provider;
}

export interface StructuredIntent {
  destination_city?: string;
  destination_state?: string;
  location?: string;
  duration_minutes: number;
  budget: number;
  currency: string;
  interests: string[];
  group_type: string;
  group_size: number;
  accessibility: {
    low_walking?: boolean;
    wheelchair?: boolean;
    family_friendly?: boolean;
  };
  hidden_gem_preference: boolean;
  radius_km?: number;
  preferred_start_time?: string;
  raw_query?: string;
}

export interface ScoredExperience {
  experience: Experience;
  overall_score: number;
  preference_score: number;
  feasibility_score: number;
  distance_score: number;
  budget_score: number;
  availability_score: number;
  distance_km: number;
  travel_time_mins: number;
  why_it_fits: string[];
}

export interface ItineraryItem {
  id?: number;
  order_index: number;
  scheduled_start: string;
  scheduled_end: string;
  duration_mins: number;
  travel_time_from_prev_mins: number;
  distance_km: number;
  cost: number;
  why_it_fits: string[];
  experience: Experience;
}

export interface Itinerary {
  id: number;
  user_id: number;
  title: string;
  city?: string;
  state?: string;
  start_time: string;
  total_duration_mins: number;
  total_budget: number;
  actual_cost: number;
  feasibility_score: number;
  feasibility_status: 'excellent' | 'good' | 'tight' | 'not_feasible';
  buffer_time_mins: number;
  travel_time_mins: number;
  weather_context?: string;
  notes?: string;
  items: ItineraryItem[];
  created_at: string;
}

export interface ReplanResult {
  replan_summary: string;
  scenario: string;
  city?: string;
  original_experience_ids: number[];
  updated_experience_ids: number[];
  replaced_experience_id?: number;
  replacement_experience?: Experience;
  itinerary: Itinerary;
  explanation: string;
}

export interface CategorySummary {
  key: string;
  count: number;
  name: string;
  icon: string;
  tagline: string;
}

export interface AdminStats {
  total_travelers: number;
  total_providers: number;
  total_experiences: number;
  total_cities: number;
  total_states: number;
  active_listings: number;
  pending_verifications: number;
  total_bookings: number;
  demo_revenue: number;
  popular_categories: Array<{ category: string; count: number }>;
  category_demand: Array<{ category: string; searches: number; conversion: number }>;
  top_destinations?: Array<{ city: string; experiences: number }>;
  reports_pending: number;
}
