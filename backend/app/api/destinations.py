from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.core.database import get_db
from backend.app.models import State, City, Area, Experience
from backend.app.schemas import StateOut, CityOut, AreaOut, DestinationSummaryOut, ExperienceOut

router = APIRouter(prefix="/destinations", tags=["destinations"])

@router.get("", response_model=List[DestinationSummaryOut])
def list_destinations(limit: int = 20, db: Session = Depends(get_db)):
    """
    Returns popular Indian destinations with experience counts and primary categories.
    """
    cities = db.query(City).filter(City.is_popular == True).limit(limit).all()
    results = []
    
    for city in cities:
        exp_count = db.query(Experience).filter(Experience.city == city.name, Experience.is_active == True).count()
        # Get top categories for this city
        cats = db.query(Experience.category, func.count(Experience.id)).filter(
            Experience.city == city.name, Experience.is_active == True
        ).group_by(Experience.category).order_by(func.count(Experience.id).desc()).limit(3).all()
        
        pop_cats = [c[0] for c in cats] if cats else ["food", "culture"]
        state_name = city.state.name if city.state else "India"
        state_code = city.state.code if city.state else "IN"

        results.append(
            DestinationSummaryOut(
                id=city.id,
                name=city.name,
                state_name=state_name,
                state_code=state_code,
                tagline=city.tagline or f"Discover the local charm of {city.name}",
                latitude=city.latitude,
                longitude=city.longitude,
                image_url=city.image_url or "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800",
                experience_count=exp_count,
                popular_categories=pop_cats
            )
        )
    return results


@router.get("/states", response_model=List[StateOut])
def list_states(region: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(State)
    if region:
        query = query.filter(State.region == region)
    states = query.order_by(State.name.asc()).all()
    
    out = []
    for s in states:
        exp_count = db.query(Experience).filter(Experience.state == s.name, Experience.is_active == True).count()
        out.append(StateOut(
            id=s.id,
            name=s.name,
            code=s.code,
            region=s.region,
            image_url=s.image_url,
            experience_count=exp_count
        ))
    return out


@router.get("/cities", response_model=List[CityOut])
def list_cities(state_id: Optional[int] = None, q: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(City)
    if state_id:
        query = query.filter(City.state_id == state_id)
    if q:
        query = query.filter(City.name.ilike(f"%{q}%"))
    cities = query.order_by(City.is_popular.desc(), City.name.asc()).all()
    
    out = []
    for c in cities:
        exp_count = db.query(Experience).filter(Experience.city == c.name, Experience.is_active == True).count()
        out.append(CityOut(
            id=c.id,
            state_id=c.state_id,
            name=c.name,
            tagline=c.tagline,
            description=c.description,
            latitude=c.latitude,
            longitude=c.longitude,
            image_url=c.image_url,
            is_popular=c.is_popular,
            state_name=c.state.name if c.state else None,
            experience_count=exp_count
        ))
    return out


@router.get("/detail/{state_slug}/{city_slug}")
def get_destination_detail(state_slug: str, city_slug: str, db: Session = Depends(get_db)):
    """
    Returns full destination landing page data for /destination/[state]/[city].
    """
    # Normalize slugs (e.g. "maharashtra" -> "Maharashtra", "mumbai" -> "Mumbai")
    clean_city = city_slug.replace("-", " ").title()
    clean_state = state_slug.replace("-", " ").title()

    city = db.query(City).filter(City.name.ilike(clean_city)).first()
    if not city:
        # Fallback search by prefix
        city = db.query(City).filter(City.name.ilike(f"%{clean_city}%")).first()
    
    if not city:
        raise HTTPException(status_code=404, detail=f"Destination '{clean_city}' not found")

    state_name = city.state.name if city.state else clean_state

    # Top experiences in this city
    experiences = db.query(Experience).filter(
        Experience.city == city.name,
        Experience.is_active == True
    ).order_by(Experience.rating.desc(), Experience.popularity_score.desc()).limit(20).all()

    # Areas in this city
    areas = db.query(Area).filter(Area.city_id == city.id).all()
    area_names = [a.name for a in areas] if areas else list(set([e.neighborhood for e in experiences if e.neighborhood]))

    # Weather simulation tailored to destination
    weather_map = {
        "Mumbai": "Coastal breeze, 29°C · Humid & sunny",
        "Goa": "Tropical sunny skies, 30°C · Beach breeze",
        "Kochi": "Lush tropical climate, 28°C · Gentle showers possible",
        "Delhi": "Pleasant, 24°C · Clear skies",
        "Jaipur": "Dry sunny weather, 27°C · Golden hour clarity",
        "Bengaluru": "Pleasant garden breeze, 23°C · Mild evening",
        "Varanasi": "Holy river breeze, 26°C · Clear sunset",
        "Rishikesh": "Crisp mountain breeze, 21°C · Ganges mist",
        "Kolkata": "Warm & cultural, 28°C · Breezy evening",
        "Shillong": "Misty hills, 18°C · Fresh pine air"
    }

    return {
        "city": CityOut(
            id=city.id,
            state_id=city.state_id,
            name=city.name,
            tagline=city.tagline,
            description=city.description,
            latitude=city.latitude,
            longitude=city.longitude,
            image_url=city.image_url,
            is_popular=city.is_popular,
            state_name=state_name,
            experience_count=len(experiences)
        ),
        "state_name": state_name,
        "state_code": city.state.code if city.state else "IN",
        "weather_context": weather_map.get(city.name, "Pleasant weather, 26°C"),
        "areas": area_names,
        "experiences": [ExperienceOut.model_validate(e) for e in experiences]
    }
