import datetime
import json
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class State(Base):
    __tablename__ = "states"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    code = Column(String(10), unique=True, nullable=False) # e.g. MH, RJ, GA, KL, DL, KA
    region = Column(String(50), default="North") # North, South, West, East, Northeast, Central
    image_url = Column(String(500), nullable=True)

    cities = relationship("City", back_populates="state", cascade="all, delete-orphan")
    experiences = relationship("Experience", back_populates="state_ref")


class City(Base):
    __tablename__ = "cities"

    id = Column(Integer, primary_key=True, index=True)
    state_id = Column(Integer, ForeignKey("states.id"), nullable=False)
    name = Column(String(100), index=True, nullable=False) # e.g. Mumbai, Jaipur, Kochi, Goa, Delhi
    tagline = Column(String(255), nullable=True) # e.g. "The City of Dreams & Coastal Alleys"
    description = Column(Text, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    image_url = Column(String(500), nullable=True)
    is_popular = Column(Boolean, default=True)

    state = relationship("State", back_populates="cities")
    areas = relationship("Area", back_populates="city", cascade="all, delete-orphan")
    experiences = relationship("Experience", back_populates="city_ref")


class Area(Base):
    __tablename__ = "areas"

    id = Column(Integer, primary_key=True, index=True)
    city_id = Column(Integer, ForeignKey("cities.id"), nullable=False)
    name = Column(String(100), index=True, nullable=False) # e.g. Bandra, Fort Kochi, Amer, Colaba, Anjuna
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    city = relationship("City", back_populates="areas")
    experiences = relationship("Experience", back_populates="area_ref")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="traveler")  # traveler, provider, admin
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    profile = relationship("TravelerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    provider = relationship("Provider", back_populates="user", uselist=False, cascade="all, delete-orphan")
    itineraries = relationship("Itinerary", back_populates="user", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="user", cascade="all, delete-orphan")


class TravelerProfile(Base):
    __tablename__ = "traveler_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    traveler_type = Column(String(50), default="Solo")  # Solo, Couple, Family, Friends, Seniors
    group_size = Column(Integer, default=1)
    budget = Column(Float, default=2000.0)  # INR
    available_hours = Column(Float, default=4.0)
    interests = Column(JSON, default=list)  # ["food", "culture", "hidden_gem", etc.]
    accessibility_prefs = Column(JSON, default=dict)  # {"low_walking": True, "wheelchair": False, etc.}
    current_city = Column(String(100), default="Mumbai")
    current_state = Column(String(100), default="Maharashtra")
    location_name = Column(String(255), default="City Center")
    hotel_lat = Column(Float, default=19.0760)
    hotel_lng = Column(Float, default=72.8777)

    user = relationship("User", back_populates="profile")


class Provider(Base):
    __tablename__ = "providers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    business_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    contact_email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    city = Column(String(100), default="Mumbai")
    state = Column(String(100), default="Maharashtra")
    address = Column(String(255), nullable=True)
    website = Column(String(255), nullable=True)
    is_verified = Column(Boolean, default=False)
    rating = Column(Float, default=4.8)
    total_reviews = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="provider")
    experiences = relationship("Experience", back_populates="provider", cascade="all, delete-orphan")
    analytics = relationship("ProviderAnalytics", back_populates="provider", cascade="all, delete-orphan")


class Experience(Base):
    __tablename__ = "experiences"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=True)
    state_id = Column(Integer, ForeignKey("states.id"), nullable=True)
    city_id = Column(Integer, ForeignKey("cities.id"), nullable=True)
    area_id = Column(Integer, ForeignKey("areas.id"), nullable=True)

    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False, index=True)  # food, culture, workshop, hidden_gem, adventure, nature, shopping, nightlife, events
    
    country = Column(String(50), default="India")
    state = Column(String(100), default="Maharashtra", index=True)
    city = Column(String(100), default="Mumbai", index=True)
    neighborhood = Column(String(100), default="Bandra", index=True)
    
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    address = Column(String(255), nullable=False)
    
    price = Column(Float, nullable=False, default=0.0)  # INR
    duration_mins = Column(Integer, nullable=False, default=60)
    opening_time = Column(String(10), default="09:00")  # HH:MM
    closing_time = Column(String(10), default="21:00")  # HH:MM
    capacity = Column(Integer, default=15)
    min_group = Column(Integer, default=1)
    max_group = Column(Integer, default=10)

    is_indoor = Column(Boolean, default=False)
    is_hidden_gem = Column(Boolean, default=False)
    
    # Accessibility & Dietary & Audience flags
    accessibility_low_walking = Column(Boolean, default=False)
    accessibility_wheelchair = Column(Boolean, default=False)
    accessibility_step_free = Column(Boolean, default=False)
    accessibility_family_friendly = Column(Boolean, default=True)
    accessibility_senior_friendly = Column(Boolean, default=False)
    dietary_vegetarian = Column(Boolean, default=True)
    dietary_vegan = Column(Boolean, default=False)
    dietary_jain = Column(Boolean, default=False)
    
    rating = Column(Float, default=4.8)
    review_count = Column(Integer, default=12)
    popularity_score = Column(Float, default=0.85)
    
    tags = Column(JSON, default=list)  # ["heritage", "street food", "organic"]
    images = Column(JSON, default=list)  # List of URLs
    target_audience = Column(JSON, default=list)  # ["family", "solo", "couples"]
    
    is_verified = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    provider = relationship("Provider", back_populates="experiences")
    state_ref = relationship("State", back_populates="experiences")
    city_ref = relationship("City", back_populates="experiences")
    area_ref = relationship("Area", back_populates="experiences")
    reviews = relationship("Review", back_populates="experience", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="experience", cascade="all, delete-orphan")
    itinerary_items = relationship("ItineraryItem", back_populates="experience")
    availabilities = relationship("Availability", back_populates="experience", cascade="all, delete-orphan")


class Availability(Base):
    __tablename__ = "availabilities"

    id = Column(Integer, primary_key=True, index=True)
    experience_id = Column(Integer, ForeignKey("experiences.id"), nullable=False)
    date = Column(String(20), nullable=False)  # YYYY-MM-DD
    start_time = Column(String(10), nullable=False)  # HH:MM
    end_time = Column(String(10), nullable=False)  # HH:MM
    available_slots = Column(Integer, default=10)
    status = Column(String(50), default="available")  # available, low, sold_out

    experience = relationship("Experience", back_populates="availabilities")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    experience_id = Column(Integer, ForeignKey("experiences.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Float, nullable=False)
    comment = Column(Text, nullable=False)
    traveler_type = Column(String(50), default="Family")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    experience = relationship("Experience", back_populates="reviews")
    user = relationship("User", back_populates="reviews")


class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    experience_id = Column(Integer, ForeignKey("experiences.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="favorites")
    experience = relationship("Experience", back_populates="favorites")


class Itinerary(Base):
    __tablename__ = "itineraries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), default="Custom Day Itinerary")
    city = Column(String(100), default="Mumbai")
    state = Column(String(100), default="Maharashtra")
    start_time = Column(String(10), default="10:00")
    total_duration_mins = Column(Integer, default=240)
    total_budget = Column(Float, default=2000.0)
    actual_cost = Column(Float, default=0.0)
    feasibility_score = Column(Float, default=90.0)  # 0 to 100%
    feasibility_status = Column(String(50), default="excellent")  # excellent, good, tight, not_feasible
    buffer_time_mins = Column(Integer, default=45)
    travel_time_mins = Column(Integer, default=30)
    weather_context = Column(String(100), default="Pleasant breeze, 28°C")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="itineraries")
    items = relationship("ItineraryItem", back_populates="itinerary", order_by="ItineraryItem.order_index", cascade="all, delete-orphan")


class ItineraryItem(Base):
    __tablename__ = "itinerary_items"

    id = Column(Integer, primary_key=True, index=True)
    itinerary_id = Column(Integer, ForeignKey("itineraries.id"), nullable=False)
    experience_id = Column(Integer, ForeignKey("experiences.id"), nullable=False)
    order_index = Column(Integer, nullable=False, default=0)
    scheduled_start = Column(String(10), default="10:00")
    scheduled_end = Column(String(10), default="11:00")
    duration_mins = Column(Integer, default=60)
    travel_time_from_prev_mins = Column(Integer, default=15)
    distance_km = Column(Float, default=2.5)
    cost = Column(Float, default=500.0)
    why_it_fits = Column(JSON, default=list)  # bullet points for explanation

    itinerary = relationship("Itinerary", back_populates="items")
    experience = relationship("Experience", back_populates="itinerary_items")


class ProviderAnalytics(Base):
    __tablename__ = "provider_analytics"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=False)
    experience_id = Column(Integer, ForeignKey("experiences.id"), nullable=True)
    views = Column(Integer, default=0)
    saves = Column(Integer, default=0)
    bookings = Column(Integer, default=0)
    revenue = Column(Float, default=0.0)
    date = Column(String(20), default=lambda: datetime.date.today().isoformat())

    provider = relationship("Provider", back_populates="analytics")


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    experience_id = Column(Integer, ForeignKey("experiences.id"), nullable=False)
    reason = Column(String(255), nullable=False)
    status = Column(String(50), default="pending")  # pending, resolved, dismissed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
