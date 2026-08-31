import {
  Experience,
  ExperienceFilters,
  DestinationDetail,
  DestinationSummary,
  State,
  City,
  ScoredExperience,
  StructuredIntent,
  FeasibilityResult,
  ReplanResult,
  Itinerary,
  Provider,
  ProviderAnalyticsSummary,
  AdminStats,
  Review,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('lokiva_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errData.detail || errData.error || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Experiences
  async getExperiences(filters: ExperienceFilters = {}): Promise<Experience[]> {
    const params = new URLSearchParams();
    if (filters.city) params.append('city', filters.city);
    if (filters.state) params.append('state', filters.state);
    if (filters.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters.max_price) params.append('max_price', String(filters.max_price));
    if (filters.low_walking) params.append('low_walking', 'true');
    if (filters.wheelchair) params.append('wheelchair', 'true');
    if (filters.is_hidden_gem) params.append('is_hidden_gem', 'true');
    if (filters.is_indoor) params.append('is_indoor', 'true');
    if (filters.is_rain_safe) params.append('is_indoor', 'true');
    if (filters.search) params.append('q', filters.search);
    if (filters.limit) params.append('limit', String(filters.limit));

    const qs = params.toString();
    return request<Experience[]>(`/experiences${qs ? `?${qs}` : ''}`);
  },

  async getExperienceById(id: number): Promise<Experience> {
    return request<Experience>(`/experiences/${id}`);
  },

  async getExperienceCategories(params: { city?: string; state?: string } = {}) {
    const searchParams = new URLSearchParams();
    if (params.city) searchParams.append('city', params.city);
    if (params.state) searchParams.append('state', params.state);
    const qs = searchParams.toString();
    return request<any[]>(`/experiences/categories${qs ? `?${qs}` : ''}`);
  },

  // Destinations
  async getDestinations(limit: number = 20): Promise<DestinationSummary[]> {
    return request<DestinationSummary[]>(`/destinations?limit=${limit}`);
  },

  async getStates(): Promise<State[]> {
    return request<State[]>('/destinations/states');
  },

  async getCities(stateCode?: string): Promise<City[]> {
    return request<City[]>(`/destinations/cities${stateCode ? `?state_code=${stateCode}` : ''}`);
  },

  async getDestination(state: string, city: string): Promise<DestinationDetail> {
    return request<DestinationDetail>(`/destinations/${encodeURIComponent(state)}/${encodeURIComponent(city)}`);
  },

  // AI & Recommendations
  async getRecommendations(params: {
    city?: string;
    prompt?: string;
    traveler_type?: string;
    max_budget?: number;
    limit?: number;
  }): Promise<ScoredExperience[]> {
    const qs = new URLSearchParams();
    if (params.city) qs.append('city', params.city);
    if (params.prompt) qs.append('prompt', params.prompt);
    if (params.traveler_type) qs.append('traveler_type', params.traveler_type);
    if (params.max_budget) qs.append('max_budget', String(params.max_budget));
    if (params.limit) qs.append('limit', String(params.limit));

    return request<ScoredExperience[]>(`/ai/recommendations?${qs.toString()}`);
  },

  async chatWithCulturalGuide(data: {
    message: string;
    chat_history?: any[];
    city?: string;
  }): Promise<{
    reply: string;
    extracted_intent: StructuredIntent;
    suggested_experiences: Experience[];
    context_destination: string;
  }> {
    return request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async extractIntent(prompt: string): Promise<StructuredIntent> {
    return request<StructuredIntent>('/ai/intent', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  },

  // Itineraries & Feasibility
  async checkFeasibility(
    experienceIds: number[],
    hotelLat: number = 26.9124,
    hotelLng: number = 75.7873
  ): Promise<FeasibilityResult> {
    return request<FeasibilityResult>('/itineraries/feasibility', {
      method: 'POST',
      body: JSON.stringify({
        experience_ids: experienceIds,
        hotel_lat: hotelLat,
        hotel_lng: hotelLng,
      }),
    });
  },

  async replanItinerary(
    experienceIds: number[],
    triggerReason: string = 'rain',
    city: string = 'Jaipur'
  ): Promise<ReplanResult> {
    return request<ReplanResult>('/itineraries/replan', {
      method: 'POST',
      body: JSON.stringify({
        experience_ids: experienceIds,
        trigger_reason: triggerReason,
        city,
      }),
    });
  },

  async createItinerary(data: {
    title: string;
    city: string;
    state?: string;
    experience_ids: number[];
    user_id?: number;
  }): Promise<Itinerary> {
    return request<Itinerary>('/itineraries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getItinerary(id: number): Promise<Itinerary> {
    return request<Itinerary>(`/itineraries/${id}`);
  },

  async getUserItineraries(userId: number): Promise<Itinerary[]> {
    return request<Itinerary[]>(`/itineraries/user/${userId}`);
  },

  // Favorites & Reviews
  async getFavorites(userId: number = 1): Promise<Experience[]> {
    return request<Experience[]>(`/reviews/favorites?user_id=${userId}`);
  },

  async toggleFavorite(experienceId: number, userId: number = 1): Promise<{ favorited: boolean; experience_id: number }> {
    return request<{ favorited: boolean; experience_id: number }>(`/reviews/favorites/${experienceId}`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  },

  async getReviews(experienceId: number): Promise<Review[]> {
    return request<Review[]>(`/reviews/experience/${experienceId}`);
  },

  async addReview(data: {
    experience_id: number;
    rating: number;
    title?: string;
    comment: string;
    user_id?: number;
  }): Promise<Review> {
    return request<Review>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Provider
  async getProviderProfile(): Promise<Provider> {
    return request<Provider>('/providers/me');
  },

  async getProviderExperiences(): Promise<Experience[]> {
    return request<Experience[]>('/providers/experiences');
  },

  async getProviderAnalytics(): Promise<ProviderAnalyticsSummary> {
    return request<ProviderAnalyticsSummary>('/providers/analytics');
  },

  // Admin
  async getAdminStats(): Promise<AdminStats> {
    return request<AdminStats>('/admin/stats');
  },

  async getAdminProviders(): Promise<Provider[]> {
    return request<Provider[]>('/admin/providers');
  },

  async verifyProvider(id: number, isVerified: boolean = true): Promise<Provider> {
    return request<Provider>(`/admin/providers/${id}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ is_verified: isVerified }),
    });
  },

  // Ingestion & Pan-India Resolution
  async getIngestionStatus(): Promise<any> {
    return request<any>('/ingestion/status');
  },

  async resolveLocation(input: string | { lat: number; lng: number }): Promise<any> {
    let qs = '';
    if (typeof input === 'string') {
      qs = `?q=${encodeURIComponent(input)}`;
    } else {
      qs = `?lat=${input.lat}&lng=${input.lng}`;
    }
    return request<any>(`/ingestion/resolve${qs}`);
  },

  // Media & Pexels Dynamic Photo Engine
  async getMediaImage(params: {
    q?: string;
    city?: string;
    state?: string;
    category?: string;
    title?: string;
  }): Promise<{ photoUrl: string; photoUrls: string[]; photographer: string; photographerUrl: string }> {
    const qs = new URLSearchParams();
    if (params.q) qs.append('q', params.q);
    if (params.city) qs.append('city', params.city);
    if (params.state) qs.append('state', params.state);
    if (params.category) qs.append('category', params.category);
    if (params.title) qs.append('title', params.title);
    return request(`/media/image?${qs.toString()}`);
  },

  async getMediaGallery(params: {
    q?: string;
    city?: string;
    category?: string;
    title?: string;
    count?: number;
  }): Promise<{ photoUrl: string; photoUrls: string[]; photographer: string; photographerUrl: string }> {
    const qs = new URLSearchParams();
    if (params.q) qs.append('q', params.q);
    if (params.city) qs.append('city', params.city);
    if (params.category) qs.append('category', params.category);
    if (params.title) qs.append('title', params.title);
    if (params.count) qs.append('count', String(params.count));
    return request(`/media/gallery?${qs.toString()}`);
  },
};
