from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from backend.app.models import Experience, Itinerary, ItineraryItem
from backend.app.services.feasibility_engine import calculate_itinerary_feasibility
from backend.app.utils.geo import estimate_travel_time_mins

def dynamic_replan(
    db: Session,
    current_experience_ids: List[int],
    scenario: str,
    city: Optional[str] = None,
    affected_experience_id: Optional[int] = None,
    new_budget: Optional[float] = None,
    new_duration_mins: Optional[int] = None,
    user_lat: Optional[float] = None,
    user_lng: Optional[float] = None
) -> Dict[str, Any]:
    """
    Intelligent Dynamic Re-planner that preserves as much of the existing itinerary as possible
    while adapting to live context changes across any Indian destination.
    """
    current_exps = db.query(Experience).filter(Experience.id.in_(current_experience_ids)).all()
    # Preserve original order
    id_to_exp = {e.id: e for e in current_exps}
    ordered_exps = [id_to_exp[eid] for eid in current_experience_ids if eid in id_to_exp]

    target_city = city or (ordered_exps[0].city if ordered_exps else "Mumbai")
    target_lat = user_lat or (ordered_exps[0].latitude if ordered_exps else 19.0760)
    target_lng = user_lng or (ordered_exps[0].longitude if ordered_exps else 72.8777)

    # Filter available alternatives to the same city first
    all_available = db.query(Experience).filter(
        Experience.is_active == True,
        Experience.city.ilike(f"%{target_city}%"),
        ~Experience.id.in_(current_experience_ids)
    ).all()

    if not all_available:
        all_available = db.query(Experience).filter(
            Experience.is_active == True,
            ~Experience.id.in_(current_experience_ids)
        ).all()

    updated_exps = list(ordered_exps)
    replaced_id = None
    replacement_exp = None
    summary = ""
    explanation = ""

    # SCENARIO 1: WEATHER (RAIN / STORM)
    if scenario == "weather_rain":
        outdoor_target = None
        if affected_experience_id and affected_experience_id in id_to_exp:
            outdoor_target = id_to_exp[affected_experience_id]
        else:
            for exp in ordered_exps:
                if not exp.is_indoor:
                    outdoor_target = exp
                    break

        if outdoor_target:
            replaced_id = outdoor_target.id
            indoor_candidates = [
                e for e in all_available 
                if e.is_indoor and (e.category in [outdoor_target.category, "culture", "workshop", "food"])
            ]
            if not indoor_candidates:
                indoor_candidates = [e for e in all_available if e.is_indoor]

            indoor_candidates.sort(
                key=lambda x: estimate_travel_time_mins(outdoor_target.latitude, outdoor_target.longitude, x.latitude, x.longitude)[0]
            )

            if indoor_candidates:
                replacement_exp = indoor_candidates[0]
                idx = updated_exps.index(outdoor_target)
                updated_exps[idx] = replacement_exp
                summary = f"Replaced outdoor '{outdoor_target.title}' with indoor '{replacement_exp.title}' due to rain alert."
                explanation = f"🌧️ Rain expected in {target_city}! We protected your schedule by swapping your outdoor stop with '{replacement_exp.title}', an authentic covered experience in {replacement_exp.neighborhood} only {estimate_travel_time_mins(outdoor_target.latitude, outdoor_target.longitude, replacement_exp.latitude, replacement_exp.longitude)[1]} mins away."
            else:
                summary = f"No indoor replacement found for '{outdoor_target.title}'."
                explanation = "Could not find an indoor replacement."
        else:
            summary = "All current activities are already indoor. Your itinerary is rain-safe!"
            explanation = f"Your itinerary in {target_city} is 100% weather-proof with indoor heritage and culinary spots."

    # SCENARIO 2: ACTIVITY UNAVAILABLE / CLOSED / FULL
    elif scenario == "activity_unavailable":
        target = None
        if affected_experience_id and affected_experience_id in id_to_exp:
            target = id_to_exp[affected_experience_id]
        elif ordered_exps:
            target = ordered_exps[0]

        if target:
            replaced_id = target.id
            same_cat = [e for e in all_available if e.category == target.category]
            if not same_cat:
                same_cat = all_available

            same_cat.sort(
                key=lambda x: estimate_travel_time_mins(target.latitude, target.longitude, x.latitude, x.longitude)[0]
            )

            if same_cat:
                replacement_exp = same_cat[0]
                idx = updated_exps.index(target)
                updated_exps[idx] = replacement_exp
                summary = f"Swapped unavailable '{target.title}' with '{replacement_exp.title}'."
                explanation = f"⚠️ '{target.title}' is currently at capacity. We hot-swapped it with verified alternative '{replacement_exp.title}' (Rating: {replacement_exp.rating}★) in {replacement_exp.neighborhood}."

    # SCENARIO 3: REDUCED TIME (e.g. 4h -> 2h)
    elif scenario == "reduced_time":
        target_duration = new_duration_mins or 120
        feasibility = calculate_itinerary_feasibility(updated_exps, available_duration_mins=target_duration, origin_lat=target_lat, origin_lng=target_lng)
        if feasibility.is_time_exceeded and len(updated_exps) > 1:
            trimmed = sorted(updated_exps, key=lambda x: (x.rating, -x.duration_mins), reverse=True)
            kept = []
            accumulated = 0
            for e in trimmed:
                if accumulated + e.duration_mins + 20 <= target_duration:
                    kept.append(e)
                    accumulated += e.duration_mins + 20
            if not kept and trimmed:
                kept = [trimmed[0]]
            updated_exps = kept
            summary = f"Adjusted itinerary to fit within {target_duration // 60} hours."
            explanation = f"⏱️ Compressed your {target_city} plan to {len(updated_exps)} high-impact experience(s) so you won't feel rushed."

    # SCENARIO 4: REDUCED BUDGET (e.g. ₹2000 -> ₹1000)
    elif scenario == "reduced_budget":
        target_budget = new_budget or 1000.0
        current_cost = sum(e.price for e in updated_exps)
        if current_cost > target_budget:
            expensive = max(updated_exps, key=lambda x: x.price)
            replaced_id = expensive.id
            budget_candidates = [
                e for e in all_available 
                if e.price <= (target_budget / max(1, len(updated_exps)))
            ]
            if budget_candidates:
                budget_candidates.sort(key=lambda x: x.rating, reverse=True)
                replacement_exp = budget_candidates[0]
                idx = updated_exps.index(expensive)
                updated_exps[idx] = replacement_exp
                summary = f"Swapped '{expensive.title}' (₹{expensive.price}) with '{replacement_exp.title}' (₹{replacement_exp.price})."
                explanation = f"💰 Optimized your {target_city} plan to stay under ₹{int(target_budget):,} without compromising on authentic local culture."

    # Recalculate feasibility on updated itinerary
    duration_to_use = new_duration_mins or 240
    budget_to_use = new_budget or 2000.0
    feasibility_res = calculate_itinerary_feasibility(
        updated_exps,
        available_duration_mins=duration_to_use,
        total_budget=budget_to_use,
        origin_lat=target_lat,
        origin_lng=target_lng
    )

    return {
        "summary": summary or "Itinerary successfully re-planned.",
        "explanation": explanation or "Your schedule has been dynamically optimized.",
        "scenario": scenario,
        "city": target_city,
        "original_ids": current_experience_ids,
        "updated_ids": [e.id for e in updated_exps],
        "replaced_id": replaced_id,
        "replacement_exp": replacement_exp,
        "updated_experiences": updated_exps,
        "feasibility": feasibility_res
    }
