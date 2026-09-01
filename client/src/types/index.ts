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
  is_union_territory?: boolean;
  image_url?: string;
  description?: string;
  city_count?: number;
  heritage_count?: number;
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
  is_popular?: boolean;
  is_heritage_hub?: boolean;
  is_hidden_gem?: boolean;
  tier?: string;
  state_name?: string;
  state_code?: string;
  experience_count?: number;
  heritage_count?: number;
  popular_categories?: string[];
  categories?: string[];
  aliases?: string[];
  distance_km?: number;
  culture_summary?: string;
  best_time_to_visit?: string;
}

export interface SearchResponse {
  states: State[];
  cities: City[];
  experiences: Experience[];
}

export interface NearbyResponse {
  user_coords: { lat: number; lng: number };
  nearest_city: City | null;
  nearby_cities: City[];
  nearby_experiences: Experience[];
}

export interface Area {
  id: number;
  city_id: number;
  name: string;
  latitude: number;
  longitude: number;
}

export interface CategorySummary {
  category: string;
  icon?: string;
  experience_count: number;
  avg_price: number;
  tagline?: string;
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
  id?: number;
  name?: string;
  tagline?: string;
  description?: string;
  image_url?: string;
  city?: City;
  state_name: string;
  state_code: string;
  culture_summary?: string;
  best_time_to_visit?: string;
  weather_context?: string;
  areas: any[];
  experiences?: Experience[];
  top_experiences?: Experience[];
  weather_summary?: { temp_c: number; condition: string; is_raining: boolean };
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
  title?: string;
  comment: string;
  traveler_type?: string;
  created_at: string;
  user_name?: string;
}

export interface Experience {
  id: number;
  provider_id?: number;
  title: string;
  tagline?: string;
  description: string;
  category: string;
  cultural_context?: string;
  country?: string;
  state?: string;
  city?: string;
  city_name?: string;
  neighborhood?: string;
  area_name?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  price: number;
  currency?: string;
  duration_mins?: number;
  approx_duration_mins?: number;
  opening_time?: string;
  closing_time?: string;
  capacity?: number;
  max_capacity?: number;
  min_group?: number;
  max_group?: number;
  is_indoor?: boolean;
  is_rain_safe?: boolean;
  is_hidden_gem?: boolean;
  accessibility_low_walking?: boolean;
  low_walking?: boolean;
  accessibility_wheelchair?: boolean;
  wheelchair_accessible?: boolean;
  accessibility_step_free?: boolean;
  accessibility_family_friendly?: boolean;
  is_family_friendly?: boolean;
  accessibility_senior_friendly?: boolean;
  dietary_vegetarian?: boolean;
  dietary_vegan?: boolean;
  dietary_jain?: boolean;
  rating?: number | null;
  review_count?: number;
  popularity_score?: number;
  notability_score?: number | null;
  osm_id?: string;
  osm_type?: string;
  otm_xid?: string;
  wikidata_id?: string;
  source?: string;
  tags?: string[];
  image_url?: string;
  images?: string[];
  image_urls?: string[];
  why_it_fits?: string;
  target_audience?: string[];
  is_verified?: boolean;
  is_active?: boolean;
  created_at?: string;
  provider?: Provider;
  reviews?: Review[];
}

export interface ExperienceFilters {
  city?: string;
  state?: string;
  category?: string;
  max_price?: number;
  low_walking?: boolean;
  wheelchair?: boolean;
  is_hidden_gem?: boolean;
  is_indoor?: boolean;
  is_rain_safe?: boolean;
  search?: string;
  limit?: number;
}

export interface FeasibilityResult {
  is_feasible: boolean;
  score: number;
  total_duration_mins: number;
  total_cost: number;
  total_travel_mins: number;
  total_distance_km: number;
  fatigue_index?: string;
  warnings?: string[];
  items?: any[];
}

export interface ReplanResult {
  new_experience_ids: number[];
  feasibility: FeasibilityResult;
  replaced_experience_id?: number;
  replacement_reason: string;
  generation?: number;
}

export interface StructuredIntent {
  prompt?: string;
  limit?: number;
  city?: string;
  state?: string;
  destination_city?: string;
  destination_state?: string;
  destination?: string;
  location?: string;
  duration_minutes?: number;
  available_hours?: number;
  budget?: number;
  currency?: string;
  interests?: string[];
  group_type?: string;
  traveler_type?: string;
  group_size?: number;
  accessibility?: {
    low_walking?: boolean;
    wheelchair?: boolean;
    family_friendly?: boolean;
  };
  accessibility_prefs?: {
    low_walking?: boolean;
    wheelchair?: boolean;
    family_friendly?: boolean;
  };
  hidden_gem_preference?: boolean;
  radius_km?: number;
  preferred_start_time?: string;
  raw_query?: string;
}

export interface ScoredExperience {
  experience: Experience;
  overall_score?: number;
  score?: number;
  match_reasons?: string[];
  preference_score?: number;
  feasibility_score?: number;
  distance_score?: number;
  budget_score?: number;
  availability_score?: number;
}

export interface Itinerary {
  id: number;
  user_id?: number;
  title: string;
  city: string;
  state?: string;
  start_time: string;
  total_duration_mins: number;
  total_cost: number;
  feasibility_score: number;
  generation?: number;
  items: ItineraryItem[];
}

export interface ItineraryItem {
  id?: number;
  itinerary_id?: number;
  experience_id: number;
  item_order: number;
  title?: string;
  category?: string;
  start_time: string;
  end_time: string;
  duration_mins: number;
  travel_time_to_next_mins: number;
  distance_km: number;
  why_it_fits?: string;
}

export interface AdminStats {
  total_users: number;
  total_experiences: number;
  total_providers: number;
  total_revenue: number;
  total_cities?: number;
  total_bookings?: number;
  pending_verifications?: number;
  recent_activity?: Array<{ id: string | number; type: string; title: string; timestamp: string }>;
}
