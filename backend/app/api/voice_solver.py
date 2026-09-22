import os
import math
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models import Experience
from backend.app.utils.geo import haversine_distance_km, estimate_travel_time_mins

router = APIRouter(prefix="", tags=["voice-solver"])

class FindExperienceRequest(BaseModel):
    location_anchor: str
    time_available_minutes: float
    budget_max_inr: Optional[float] = None
    crowd_preference: Optional[str] = "any" # "low" | "any"
    activity_type: Optional[str] = None
    activeTripDeadlines: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    currentItinerary: Optional[Dict[str, Any]] = None
    will_rain_soon: Optional[bool] = False

class ExperienceRecommendation(BaseModel):
    name: str
    distance_meters: int
    walk_time_minutes: int
    price_inr: float
    crowd_tag: str
    time_remaining_after_visit_minutes: int
    category: str

class FindExperienceResponse(BaseModel):
    experience: Optional[ExperienceRecommendation] = None
    clarifying_question: Optional[str] = None

# Known prominent landmarks across India for fast resolution
KNOWN_POIS: Dict[str, Dict[str, Any]] = {
    "city palace": {"name": "City Palace", "city": "Jaipur", "lat": 26.9258, "lng": 75.8237},
    "hawa mahal": {"name": "Hawa Mahal", "city": "Jaipur", "lat": 26.9239, "lng": 75.8267},
    "amer fort": {"name": "Amer Fort", "city": "Jaipur", "lat": 26.9855, "lng": 75.8513},
    "jantar mantar": {"name": "Jantar Mantar", "city": "Jaipur", "lat": 26.9248, "lng": 75.8246},
    "albert hall": {"name": "Albert Hall Museum", "city": "Jaipur", "lat": 26.9116, "lng": 75.8195},
    "jaipur station": {"name": "Jaipur Railway Station", "city": "Jaipur", "lat": 26.9196, "lng": 75.7878},
    "jaipur junction": {"name": "Jaipur Railway Station", "city": "Jaipur", "lat": 26.9196, "lng": 75.7878},
    "kashi vishwanath": {"name": "Kashi Vishwanath Temple", "city": "Varanasi", "lat": 25.3109, "lng": 83.0107},
    "dashashwamedh ghat": {"name": "Dashashwamedh Ghat", "city": "Varanasi", "lat": 25.3069, "lng": 83.0104},
    "assi ghat": {"name": "Assi Ghat", "city": "Varanasi", "lat": 25.2885, "lng": 82.9998},
    "gateway of india": {"name": "Gateway of India", "city": "Mumbai", "lat": 18.9220, "lng": 72.8347},
    "marine drive": {"name": "Marine Drive", "city": "Mumbai", "lat": 18.9432, "lng": 72.8230},
    "bandra bandstand": {"name": "Bandra Bandstand", "city": "Mumbai", "lat": 19.0435, "lng": 72.8197},
    "taj mahal": {"name": "Taj Mahal", "city": "Agra", "lat": 27.1751, "lng": 78.0421},
    "red fort": {"name": "Red Fort", "city": "Delhi", "lat": 28.6562, "lng": 77.2410},
    "india gate": {"name": "India Gate", "city": "Delhi", "lat": 28.6129, "lng": 77.2295},
    "fort kochi": {"name": "Fort Kochi", "city": "Kochi", "lat": 9.9658, "lng": 76.2421},
    "jaipur": {"name": "Jaipur Center", "city": "Jaipur", "lat": 26.9124, "lng": 75.7873},
    "mumbai": {"name": "Mumbai Center", "city": "Mumbai", "lat": 19.0760, "lng": 72.8777},
    "delhi": {"name": "Delhi Center", "city": "Delhi", "lat": 28.6139, "lng": 77.2090},
    "varanasi": {"name": "Varanasi Center", "city": "Varanasi", "lat": 25.3176, "lng": 82.9739},
}

def resolve_anchor(location_str: str, db: Session) -> Optional[Dict[str, Any]]:
    query = location_str.strip().lower()
    
    # 1. Fast match against known POIs
    for key, val in KNOWN_POIS.items():
        if key in query or query in key:
            return val
            
    # 2. Match against database titles and areas
    match = db.query(Experience).filter(
        (Experience.title.ilike(f"%{query}%")) |
        (Experience.neighborhood.ilike(f"%{query}%")) |
        (Experience.city.ilike(f"%{query}%"))
    ).first()
    
    if match and match.latitude and match.longitude:
        return {
            "name": match.title,
            "city": match.city,
            "lat": match.latitude,
            "lng": match.longitude,
        }
        
    return None

def extract_next_committed_point(req: FindExperienceRequest) -> Optional[Dict[str, float]]:
    # Extract from active trip deadlines or current itinerary
    if req.activeTripDeadlines and len(req.activeTripDeadlines) > 0:
        for deadline in req.activeTripDeadlines:
            label = (deadline.get("label") or "").lower()
            if "train" in label or "station" in label:
                # Default to city railway station
                return {"lat": 26.9196, "lng": 75.7878}
            if "lat" in deadline and "lng" in deadline:
                return {"lat": float(deadline["lat"]), "lng": float(deadline["lng"])}
                
    if req.currentItinerary and "stops" in req.currentItinerary:
        stops = req.currentItinerary["stops"]
        if stops and len(stops) > 0:
            last_stop = stops[-1]
            if "lat" in last_stop and "lng" in last_stop:
                return {"lat": float(last_stop["lat"]), "lng": float(last_stop["lng"])}
                
    return None

@router.post("/voice/find-experience", response_model=FindExperienceResponse)
@router.post("/api/v1/voice/find-experience", response_model=FindExperienceResponse)
def find_nearby_experience(req: FindExperienceRequest, db: Session = Depends(get_db)):
    """
    Spatiotemporal solver endpoint for voice assistant.
    Finds a nearby authentic experience constrained by time, budget, and crowd preference.
    """
    # Step 1: Resolve anchor
    anchor = resolve_anchor(req.location_anchor, db)
    if not anchor:
        return FindExperienceResponse(
            experience=None,
            clarifying_question=f"I couldn't locate '{req.location_anchor}'. Could you tell me which city or nearby landmark you are at?"
        )
        
    anchor_lat = anchor["lat"]
    anchor_lng = anchor["lng"]
    
    # Step 2: Next committed destination (station or scheduled stop)
    next_point = extract_next_committed_point(req)
    next_lat = next_point["lat"] if next_point else anchor_lat
    next_lng = next_point["lng"] if next_point else anchor_lng
    
    # Step 3: Query candidate listings within radius (start with 2.5 km, expand to 5.5 km, then 10.0 km)
    radius_km = 2.5
    all_exps = db.query(Experience).filter(Experience.is_active == True).all()
    
    candidates = []
    for exp in all_exps:
        if not exp.latitude or not exp.longitude:
            continue
        dist = haversine_distance_km(anchor_lat, anchor_lng, exp.latitude, exp.longitude)
        if dist <= radius_km:
            candidates.append((dist, exp))
            
    if len(candidates) == 0:
        radius_km = 5.5
        for exp in all_exps:
            if not exp.latitude or not exp.longitude:
                continue
            dist = haversine_distance_km(anchor_lat, anchor_lng, exp.latitude, exp.longitude)
            if dist <= radius_km:
                candidates.append((dist, exp))

    if len(candidates) == 0:
        radius_km = 10.0
        for exp in all_exps:
            if not exp.latitude or not exp.longitude:
                continue
            dist = haversine_distance_km(anchor_lat, anchor_lng, exp.latitude, exp.longitude)
            if dist <= radius_km:
                candidates.append((dist, exp))
                
    if len(candidates) == 0:
        city_name = anchor.get("city", "Jaipur")
        city_exps = db.query(Experience).filter(Experience.city.ilike(f"%{city_name}%")).all()
        for exp in city_exps:
            dist = haversine_distance_km(anchor_lat, anchor_lng, exp.latitude, exp.longitude)
            candidates.append((dist, exp))

    scored_candidates = []
    
    for dist_km, exp in candidates:
        # Travel time: anchor -> candidate (walking @ 4 km/h for <= 1.2km)
        mode = "walking" if dist_km <= 1.2 else "auto_rickshaw"
        _, travel_to_mins = estimate_travel_time_mins(anchor_lat, anchor_lng, exp.latitude, exp.longitude, mode=mode)
        
        # Travel time: candidate -> next committed point
        dist_to_next = haversine_distance_km(exp.latitude, exp.longitude, next_lat, next_lng)
        next_mode = "walking" if dist_to_next <= 1.2 else "auto_rickshaw"
        _, travel_from_mins = estimate_travel_time_mins(exp.latitude, exp.longitude, next_lat, next_lng, mode=next_mode)
        
        # Dwell time: must have at least 15 mins free at the experience
        available_for_dwell = int(req.time_available_minutes - travel_to_mins - travel_from_mins)
        if available_for_dwell < 15:
            continue
            
        exp_duration = exp.duration_mins or 30
        dwell_mins = min(exp_duration, available_for_dwell)
        total_time_mins = travel_to_mins + dwell_mins + travel_from_mins
        
        # Filter 1: Time constraint
        if total_time_mins > req.time_available_minutes:
            continue
            
        # Filter 2: Budget constraint
        if req.budget_max_inr is not None and exp.price > req.budget_max_inr:
            continue
            
        # Filter 3: Crowd preference (static seeded tag, usually quiet)
        crowd = getattr(exp, "crowd_tag", "low") or "low"
        if req.crowd_preference == "low" and crowd != "low":
            continue
            
        # Rain soft filter: deprioritize outdoor if rain is expected
        is_outdoor = not getattr(exp, "is_indoor", False)
        rain_penalty = 20 if (req.will_rain_soon and is_outdoor) else 0
        
        # Score candidate: closer distance is prioritized
        time_remaining = int(req.time_available_minutes - total_time_mins)
        score = 100 - (dist_km * 10) + (time_remaining * 0.2) - rain_penalty
        
        scored_candidates.append({
            "exp": exp,
            "dist_meters": int(dist_km * 1000),
            "walk_time_minutes": travel_to_mins,
            "time_remaining": time_remaining,
            "score": score,
            "crowd_tag": crowd,
        })
        
    if not scored_candidates:
        return FindExperienceResponse(
            experience=None,
            clarifying_question=f"I couldn't find an open experience near {anchor['name']} that fits within {int(req.time_available_minutes)} minutes and your budget. Would you like to check a slightly larger radius?"
        )
        
    # Sort by score descending
    scored_candidates.sort(key=lambda x: x["score"], reverse=True)
    best = scored_candidates[0]
    best_exp = best["exp"]
    
    rec = ExperienceRecommendation(
        name=best_exp.title,
        distance_meters=best["dist_meters"],
        walk_time_minutes=best["walk_time_minutes"],
        price_inr=best_exp.price,
        crowd_tag=best["crowd_tag"],
        time_remaining_after_visit_minutes=best["time_remaining"],
        category=best_exp.category,
    )
    
    return FindExperienceResponse(experience=rec, clarifying_question=None)
