from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models import Experience
from backend.app.schemas import StructuredIntent, ScoredExperienceOut, ExperienceOut
from backend.app.utils.geo import haversine_distance_km, estimate_travel_time_mins
from backend.app.services.ai_service import generate_why_it_fits_bullets

# Default scoring weights (configurable)
WEIGHTS = {
    "preference": 0.30,
    "feasibility": 0.20,
    "distance": 0.15,
    "budget": 0.10,
    "availability": 0.10,
    "rating": 0.05,
    "freshness": 0.05,
    "diversity": 0.05
}

def rank_experiences(
    db: Session,
    intent: StructuredIntent,
    user_lat: Optional[float] = None,
    user_lng: Optional[float] = None,
    city: Optional[str] = None,
    state: Optional[str] = None,
    radius_km: Optional[float] = None,
    is_hidden_gem_only: bool = False,
    categories: Optional[List[str]] = None,
    limit: int = 10
) -> List[ScoredExperienceOut]:
    """
    Two-stage Pan-India recommendation pipeline:
    Stage 1: Location Resolution & Hard constraint filtering (remove impossible experiences).
    Stage 2: Transparent multi-criteria scoring & ranking.
    """
    query = db.query(Experience).filter(Experience.is_active == True)

    target_city = city or intent.destination_city
    target_state = state or intent.destination_state
    target_radius = radius_km or intent.radius_km

    # 1. Geographic Filtering
    if target_city and target_city.lower() != "all":
        query = query.filter(Experience.city.ilike(f"%{target_city}%"))
    elif target_state and target_state.lower() != "all":
        query = query.filter(Experience.state.ilike(f"%{target_state}%"))

    experiences = query.all()

    # Determine reference coordinates for distance calculations
    if user_lat is not None and user_lng is not None:
        ref_lat, ref_lng = user_lat, user_lng
    elif experiences:
        # Fallback to the centroid or first experience of the target city
        ref_lat, ref_lng = experiences[0].latitude, experiences[0].longitude
    else:
        ref_lat, ref_lng = 19.0760, 72.8777 # Mumbai default

    candidates: List[Experience] = []
    
    # 2. HARD CONSTRAINTS FILTERING
    for exp in experiences:
        # Radius check if explicit radius requested (e.g. "within 5 km")
        if target_radius is not None:
            dist = haversine_distance_km(ref_lat, ref_lng, exp.latitude, exp.longitude)
            if dist > target_radius:
                continue

        # Mandatory group capacity check
        if intent.group_size > exp.max_group or intent.group_size < exp.min_group:
            continue
        
        # Mandatory single activity duration check (must not exceed total available time)
        if exp.duration_mins > intent.duration_minutes:
            continue
            
        # Hard budget check (single activity per-group cost shouldn't exceed full budget)
        item_total_cost = exp.price * intent.group_size if exp.price > 0 else 0
        if item_total_cost > intent.budget * 1.15:  # allow 15% slack for high matches
            continue
            
        # Mandatory wheelchair constraint if strict
        if intent.accessibility.get("wheelchair") and not exp.accessibility_wheelchair:
            continue
            
        # Category filter if explicitly provided
        if categories and exp.category not in categories:
            continue
            
        # Hidden gem only filter if requested
        if is_hidden_gem_only and not exp.is_hidden_gem:
            continue
            
        candidates.append(exp)

    # If too restrictive and no candidates found, fallback to broader city candidates
    if not candidates and experiences:
        candidates = experiences[:limit * 2]

    # 3. SCORING EACH CANDIDATE
    scored_results: List[ScoredExperienceOut] = []
    category_counts: Dict[str, int] = {}

    for exp in candidates:
        distance_km, travel_time_mins = estimate_travel_time_mins(ref_lat, ref_lng, exp.latitude, exp.longitude)
        
        # Preference Match (0.0 to 1.0)
        pref_score = 0.0
        if exp.category in intent.interests:
            pref_score += 0.50
        elif any(i in exp.tags for i in intent.interests):
            pref_score += 0.35
        else:
            pref_score += 0.15
            
        if intent.hidden_gem_preference and exp.is_hidden_gem:
            pref_score += 0.25
            
        if intent.accessibility.get("low_walking"):
            if exp.accessibility_low_walking:
                pref_score += 0.25
            else:
                pref_score -= 0.10
                
        if intent.group_type == "family" and exp.accessibility_family_friendly:
            pref_score += 0.15
            
        pref_score = min(1.0, max(0.0, pref_score))

        # Feasibility Match (0.0 to 1.0)
        total_time_needed = exp.duration_mins + (travel_time_mins * 2)
        if total_time_needed <= intent.duration_minutes * 0.75:
            feasibility_score = 1.0
        elif total_time_needed <= intent.duration_minutes:
            feasibility_score = 0.80
        elif total_time_needed <= intent.duration_minutes * 1.1:
            feasibility_score = 0.40
        else:
            feasibility_score = 0.10

        # Distance Score (0.0 to 1.0)
        if distance_km <= 2.0:
            distance_score = 1.0
        elif distance_km <= 5.0:
            distance_score = 0.85
        elif distance_km <= 10.0:
            distance_score = 0.60
        elif distance_km <= 15.0:
            distance_score = 0.35
        else:
            distance_score = 0.10

        # Budget Fit Score (0.0 to 1.0)
        item_total_cost = exp.price * intent.group_size if exp.price > 0 else 0
        if item_total_cost == 0:
            budget_score = 1.0
        elif item_total_cost <= intent.budget * 0.5:
            budget_score = 1.0
        elif item_total_cost <= intent.budget * 0.8:
            budget_score = 0.85
        elif item_total_cost <= intent.budget:
            budget_score = 0.70
        else:
            budget_score = 0.30

        # Availability Score (0.0 to 1.0)
        availability_score = 0.95 if exp.capacity >= intent.group_size else 0.50

        # Rating / Trust Score (0.0 to 1.0)
        rating_score = (exp.rating / 5.0) if exp.rating else 0.8

        # Freshness Score (0.0 to 1.0)
        freshness_score = 0.90 if exp.is_verified else 0.60

        # Diversity Penalty / Boost
        current_cat_count = category_counts.get(exp.category, 0)
        diversity_score = max(0.2, 1.0 - (current_cat_count * 0.25))

        # Overall Weighted Score
        overall = (
            WEIGHTS["preference"] * pref_score +
            WEIGHTS["feasibility"] * feasibility_score +
            WEIGHTS["distance"] * distance_score +
            WEIGHTS["budget"] * budget_score +
            WEIGHTS["availability"] * availability_score +
            WEIGHTS["rating"] * rating_score +
            WEIGHTS["freshness"] * freshness_score +
            WEIGHTS["diversity"] * diversity_score
        )
        
        # Boost hidden gem if requested
        if (intent.hidden_gem_preference or is_hidden_gem_only) and exp.is_hidden_gem:
            overall = min(1.0, overall + 0.08)

        # Generate "Why This Fits You"
        exp_dict = {
            "title": exp.title,
            "price": exp.price,
            "category": exp.category,
            "city": exp.city,
            "neighborhood": exp.neighborhood,
            "closing_time": exp.closing_time,
            "accessibility_low_walking": exp.accessibility_low_walking,
            "accessibility_wheelchair": exp.accessibility_wheelchair,
            "accessibility_family_friendly": exp.accessibility_family_friendly,
            "accessibility_senior_friendly": exp.accessibility_senior_friendly,
            "is_hidden_gem": exp.is_hidden_gem
        }
        why_bullets = generate_why_it_fits_bullets(exp_dict, intent, distance_km, travel_time_mins)

        # Convert to Pydantic
        exp_out = ExperienceOut.model_validate(exp)

        scored_results.append(
            ScoredExperienceOut(
                experience=exp_out,
                overall_score=round(overall, 3),
                preference_score=round(pref_score, 2),
                feasibility_score=round(feasibility_score, 2),
                distance_score=round(distance_score, 2),
                budget_score=round(budget_score, 2),
                availability_score=round(availability_score, 2),
                distance_km=distance_km,
                travel_time_mins=travel_time_mins,
                why_it_fits=why_bullets
            )
        )
        category_counts[exp.category] = current_cat_count + 1

    # Sort descending by overall score
    scored_results.sort(key=lambda x: x.overall_score, reverse=True)
    return scored_results[:limit]
