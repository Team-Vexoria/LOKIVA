from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field
import datetime

# --- Geographic Schemas ---
class StateOut(BaseModel):
    id: int
    name: str
    code: str
    region: str
    image_url: Optional[str] = None
    experience_count: Optional[int] = 0

    class Config:
        from_attributes = True

class CityOut(BaseModel):
    id: int
    state_id: int
    name: str
    tagline: Optional[str] = None
    description: Optional[str] = None
    latitude: float
    longitude: float
    image_url: Optional[str] = None
    is_popular: bool
    state_name: Optional[str] = None
    experience_count: Optional[int] = 0

    class Config:
        from_attributes = True

class AreaOut(BaseModel):
    id: int
    city_id: int
    name: str
    latitude: float
    longitude: float

    class Config:
        from_attributes = True

class DestinationSummaryOut(BaseModel):
    id: int
    name: str
    state_name: str
    state_code: str
    tagline: str
    latitude: float
    longitude: float
    image_url: str
    experience_count: int
    popular_categories: List[str]

# --- Auth & User ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: Optional[str] = "traveler"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class FirebaseLoginRequest(BaseModel):
    id_token: Optional[str] = None
    email: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = "traveler"
    firebase_uid: Optional[str] = None

class TravelerProfileOut(BaseModel):
    traveler_type: str
    group_size: int
    budget: float
    available_hours: float
    interests: List[str]
    accessibility_prefs: Dict[str, Any]
    current_city: Optional[str] = "Mumbai"
    current_state: Optional[str] = "Maharashtra"
    location_name: str
    hotel_lat: float
    hotel_lng: float

    class Config:
        from_attributes = True

class UserOut(UserBase):
    id: int
    role: str
    is_active: bool
    created_at: datetime.datetime
    profile: Optional[TravelerProfileOut] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None

# --- Provider ---
class ProviderBase(BaseModel):
    business_name: str
    description: Optional[str] = None
    contact_email: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = "Mumbai"
    state: Optional[str] = "Maharashtra"
    address: Optional[str] = None
    website: Optional[str] = None

class ProviderCreate(ProviderBase):
    pass

class ProviderOut(ProviderBase):
    id: int
    user_id: int
    is_verified: bool
    rating: float
    total_reviews: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# --- Experience ---
class ExperienceBase(BaseModel):
    title: str
    description: str
    category: str
    country: Optional[str] = "India"
    state: Optional[str] = "Maharashtra"
    city: Optional[str] = "Mumbai"
    neighborhood: Optional[str] = "Bandra"
    latitude: float
    longitude: float
    address: str
    price: float = 0.0
    duration_mins: int = 60
    opening_time: Optional[str] = "09:00"
    closing_time: Optional[str] = "21:00"
    capacity: Optional[int] = 15
    min_group: Optional[int] = 1
    max_group: Optional[int] = 10
    is_indoor: Optional[bool] = False
    is_hidden_gem: Optional[bool] = False
    accessibility_low_walking: Optional[bool] = False
    accessibility_wheelchair: Optional[bool] = False
    accessibility_step_free: Optional[bool] = False
    accessibility_family_friendly: Optional[bool] = True
    accessibility_senior_friendly: Optional[bool] = False
    dietary_vegetarian: Optional[bool] = True
    dietary_vegan: Optional[bool] = False
    dietary_jain: Optional[bool] = False
    tags: Optional[List[str]] = []
    images: Optional[List[str]] = []
    target_audience: Optional[List[str]] = []

class ExperienceCreate(ExperienceBase):
    state_id: Optional[int] = None
    city_id: Optional[int] = None
    area_id: Optional[int] = None

class ExperienceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    duration_mins: Optional[int] = None
    opening_time: Optional[str] = None
    closing_time: Optional[str] = None
    capacity: Optional[int] = None
    is_indoor: Optional[bool] = None
    is_hidden_gem: Optional[bool] = None
    accessibility_low_walking: Optional[bool] = None
    accessibility_wheelchair: Optional[bool] = None
    accessibility_step_free: Optional[bool] = None
    accessibility_family_friendly: Optional[bool] = None
    accessibility_senior_friendly: Optional[bool] = None
    tags: Optional[List[str]] = None
    images: Optional[List[str]] = None
    target_audience: Optional[List[str]] = None
    is_active: Optional[bool] = None

class ExperienceOut(ExperienceBase):
    id: int
    provider_id: Optional[int] = None
    rating: float
    review_count: int
    popularity_score: float
    is_verified: bool
    is_active: bool
    created_at: datetime.datetime
    provider: Optional[ProviderOut] = None

    class Config:
        from_attributes = True

# --- AI & Structured Intent ---
class IntentExtractionRequest(BaseModel):
    query: str
    user_location: Optional[Dict[str, float]] = None # {"lat": 19.0760, "lng": 72.8777}
    current_city: Optional[str] = None
    current_time: Optional[str] = "10:00"

class StructuredIntent(BaseModel):
    destination_city: Optional[str] = None # e.g. Mumbai, Jaipur, Kochi, Goa
    destination_state: Optional[str] = None
    location: Optional[str] = "city center"
    duration_minutes: int = 240
    budget: float = 2000.0
    currency: str = "INR"
    interests: List[str] = Field(default_factory=lambda: ["food", "culture"])
    group_type: str = "family"
    group_size: int = 3
    accessibility: Dict[str, bool] = Field(default_factory=lambda: {"low_walking": True})
    hidden_gem_preference: bool = False
    radius_km: Optional[float] = None
    preferred_start_time: Optional[str] = "10:00"
    raw_query: Optional[str] = None

class RecommendationRequest(BaseModel):
    intent: Optional[StructuredIntent] = None
    query: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    user_lat: Optional[float] = None
    user_lng: Optional[float] = None
    radius_km: Optional[float] = None
    max_budget: Optional[float] = 2000.0
    available_duration_mins: Optional[int] = 240
    categories: Optional[List[str]] = None
    is_hidden_gem_only: Optional[bool] = False
    accessibility_low_walking: Optional[bool] = False
    accessibility_wheelchair: Optional[bool] = False
    group_size: Optional[int] = 4
    limit: Optional[int] = 10

class WhyFitsBullet(BaseModel):
    text: str
    icon: Optional[str] = "check"
    type: Optional[str] = "positive"

class ScoredExperienceOut(BaseModel):
    experience: ExperienceOut
    overall_score: float
    preference_score: float
    feasibility_score: float
    distance_score: float
    budget_score: float
    availability_score: float
    distance_km: float
    travel_time_mins: int
    why_it_fits: List[str]

# --- Itinerary & Feasibility ---
class ItineraryItemOut(BaseModel):
    id: Optional[int] = None
    order_index: int
    scheduled_start: str
    scheduled_end: str
    duration_mins: int
    travel_time_from_prev_mins: int
    distance_km: float
    cost: float
    why_it_fits: List[str]
    experience: ExperienceOut

    class Config:
        from_attributes = True

class ItineraryCreate(BaseModel):
    title: Optional[str] = "My Personalized India Itinerary"
    city: Optional[str] = "Mumbai"
    state: Optional[str] = "Maharashtra"
    start_time: str = "10:00"
    total_duration_mins: int = 240
    total_budget: float = 2000.0
    experience_ids: List[int]
    notes: Optional[str] = None

class ItineraryOut(BaseModel):
    id: int
    user_id: int
    title: str
    city: Optional[str] = "Mumbai"
    state: Optional[str] = "Maharashtra"
    start_time: str
    total_duration_mins: int
    total_budget: float
    actual_cost: float
    feasibility_score: float
    feasibility_status: str
    buffer_time_mins: int
    travel_time_mins: int
    weather_context: Optional[str] = "Pleasant breeze, 28°C"
    notes: Optional[str] = None
    items: List[ItineraryItemOut] = []
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class FeasibilityCalculationResult(BaseModel):
    feasibility_score: float
    feasibility_status: str  # excellent, good, tight, not_feasible
    total_duration_mins: int
    total_cost: float
    total_travel_time_mins: int
    buffer_time_mins: int
    is_budget_exceeded: bool
    is_time_exceeded: bool
    timeline_items: List[Dict[str, Any]]
    warnings: List[str]

class ReplanRequest(BaseModel):
    itinerary_id: Optional[int] = None
    city: Optional[str] = None
    current_experience_ids: List[int]
    scenario: str  # "weather_rain", "activity_unavailable", "reduced_time", "reduced_budget", "custom"
    affected_experience_id: Optional[int] = None
    new_budget: Optional[float] = None
    new_duration_mins: Optional[int] = None
    weather_condition: Optional[str] = "Rain expected"
    user_lat: Optional[float] = None
    user_lng: Optional[float] = None

class ReplanResponse(BaseModel):
    replan_summary: str
    scenario: str
    city: str
    original_experience_ids: List[int]
    updated_experience_ids: List[int]
    replaced_experience_id: Optional[int] = None
    replacement_experience: Optional[ExperienceOut] = None
    itinerary: ItineraryOut
    explanation: str

# --- Reviews ---
class ReviewCreate(BaseModel):
    experience_id: int
    rating: float
    comment: str
    traveler_type: Optional[str] = "Family"

class ReviewOut(BaseModel):
    id: int
    experience_id: int
    user_id: int
    rating: float
    comment: str
    traveler_type: str
    created_at: datetime.datetime
    user_name: Optional[str] = "Aarav Sharma"

    class Config:
        from_attributes = True

# --- Analytics & Admin ---
class ProviderAnalyticsSummary(BaseModel):
    views: int
    saves: int
    bookings: int
    revenue: float
    conversion_rate: float
    rating: float
    views_trend: List[Dict[str, Any]]
    audience_breakdown: Dict[str, int]
    top_experiences: List[Dict[str, Any]]

class AdminStatsOut(BaseModel):
    total_travelers: int
    total_providers: int
    total_experiences: int
    total_cities: int
    total_states: int
    active_listings: int
    pending_verifications: int
    total_bookings: int
    demo_revenue: float
    popular_categories: List[Dict[str, Any]]
    category_demand: List[Dict[str, Any]]
    top_destinations: List[Dict[str, Any]]
    reports_pending: int
