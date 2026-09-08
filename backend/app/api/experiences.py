from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from backend.app.core.database import get_db
from backend.app.models import Experience, Provider, User
from backend.app.schemas import ExperienceOut, ExperienceCreate, ExperienceUpdate
from backend.app.api.auth import get_current_user
from backend.app.utils.geo import haversine_distance_km

router = APIRouter(prefix="/experiences", tags=["experiences"])

@router.get("", response_model=List[ExperienceOut])
def list_experiences(
    category: Optional[str] = None,
    q: Optional[str] = None,
    city: Optional[str] = None,
    state: Optional[str] = None,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    radius_km: Optional[float] = None,
    max_price: Optional[float] = None,
    max_duration_mins: Optional[int] = None,
    is_hidden_gem: Optional[bool] = None,
    low_walking: Optional[bool] = None,
    wheelchair: Optional[bool] = None,
    family_friendly: Optional[bool] = None,
    is_indoor: Optional[bool] = None,
    vegetarian_only: Optional[bool] = None,
    limit: int = Query(50, le=150),
    offset: int = 0,
    db: Session = Depends(get_db)
):
    query = db.query(Experience).filter(Experience.is_active == True)

    if category and category != "all":
        query = query.filter(Experience.category == category)
    if city and city.lower() != "all":
        query = query.filter(Experience.city.ilike(f"%{city}%"))
    if state and state.lower() != "all":
        query = query.filter(Experience.state.ilike(f"%{state}%"))
    if max_price is not None:
        query = query.filter(Experience.price <= max_price)
    if max_duration_mins is not None:
        query = query.filter(Experience.duration_mins <= max_duration_mins)
    if is_hidden_gem is not None:
        query = query.filter(Experience.is_hidden_gem == is_hidden_gem)
    if low_walking:
        query = query.filter(Experience.accessibility_low_walking == True)
    if wheelchair:
        query = query.filter(Experience.accessibility_wheelchair == True)
    if family_friendly:
        query = query.filter(Experience.accessibility_family_friendly == True)
    if is_indoor is not None:
        query = query.filter(Experience.is_indoor == is_indoor)
    if vegetarian_only:
        query = query.filter(Experience.dietary_vegetarian == True)
    if q:
        query = query.filter(
            or_(
                Experience.title.ilike(f"%{q}%"),
                Experience.description.ilike(f"%{q}%"),
                Experience.neighborhood.ilike(f"%{q}%"),
                Experience.city.ilike(f"%{q}%"),
                Experience.state.ilike(f"%{q}%"),
                Experience.category.ilike(f"%{q}%")
            )
        )

    experiences = query.order_by(Experience.rating.desc(), Experience.popularity_score.desc()).all()

    # If GPS coordinates & radius are provided, filter by geospatial distance
    if latitude is not None and longitude is not None and radius_km is not None:
        filtered = []
        for exp in experiences:
            dist = haversine_distance_km(latitude, longitude, exp.latitude, exp.longitude)
            if dist <= radius_km:
                filtered.append(exp)
        experiences = filtered

    paginated = experiences[offset:offset + limit]
    return [ExperienceOut.model_validate(e) for e in paginated]


@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    results = db.query(
        Experience.category,
        func.count(Experience.id).label("count")
    ).filter(Experience.is_active == True).group_by(Experience.category).all()
    
    category_meta = {
        "food": {"name": "Food & Regional Cuisine", "icon": "Utensils", "tagline": "Street food walks, royal feasts & coastal seafood"},
        "culture": {"name": "Heritage & Culture", "icon": "Landmark", "tagline": "Living traditions, centuries-old monuments & art"},
        "workshop": {"name": "Artisan Workshops", "icon": "Palette", "tagline": "Pottery, block printing, wood carving & handloom"},
        "hidden_gem": {"name": "Hidden Gems", "icon": "Sparkles", "tagline": "Secret sunset vistas & tucked-away neighborhood spots"},
        "adventure": {"name": "Adventures & Treks", "icon": "Compass", "tagline": "Mountain trails, river rafting & coastal cycling"},
        "nature": {"name": "Nature & Wildlife", "icon": "Trees", "tagline": "Pristine waterfalls, backwaters, tea gardens & valleys"},
        "shopping": {"name": "Artisanal Bazaars", "icon": "ShoppingBag", "tagline": "Direct-from-weaver textiles, spices & crafts"},
        "nightlife": {"name": "Nightlife & Rooftops", "icon": "Moon", "tagline": "Live acoustic evenings, night markets & sea-view lounges"},
        "events": {"name": "Festivals & Events", "icon": "PartyPopper", "tagline": "Local celebrations, seasonal fairs & music circles"}
    }
    
    return [
        {
            "key": r[0],
            "count": r[1],
            "name": category_meta.get(r[0], {}).get("name", r[0].title()),
            "icon": category_meta.get(r[0], {}).get("icon", "MapPin"),
            "tagline": category_meta.get(r[0], {}).get("tagline", "Discover authentic experiences")
        }
        for r in results
    ]


@router.get("/{experience_id}", response_model=ExperienceOut)
def get_experience_detail(experience_id: int, db: Session = Depends(get_db)):
    exp = db.query(Experience).filter(Experience.id == experience_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")
    return ExperienceOut.model_validate(exp)


@router.post("", response_model=ExperienceOut)
def create_experience(
    exp_in: ExperienceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()
    provider_id = provider.id if provider else None
    
    exp = Experience(
        **exp_in.model_dump(),
        provider_id=provider_id,
        is_verified=current_user.role == "admin",
        is_active=True
    )
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return ExperienceOut.model_validate(exp)
