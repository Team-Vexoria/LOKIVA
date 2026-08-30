from typing import List, Dict, Any, Tuple
from datetime import datetime, timedelta
from backend.app.models import Experience
from backend.app.utils.geo import estimate_travel_time_mins
from backend.app.schemas import FeasibilityCalculationResult

def add_minutes_to_time_str(time_str: str, minutes_to_add: int) -> str:
    """Helper to add minutes to 'HH:MM' string."""
    try:
        t = datetime.strptime(time_str, "%H:%M")
        t_next = t + timedelta(minutes=minutes_to_add)
        return t_next.strftime("%H:%M")
    except Exception:
        return time_str

def calculate_itinerary_feasibility(
    experiences: List[Experience],
    start_time: str = "10:00",
    available_duration_mins: int = 240,
    total_budget: float = 2000.0,
    group_size: int = 1,
    origin_lat: float = 26.9124,
    origin_lng: float = 75.7873
) -> FeasibilityCalculationResult:
    """
    Computes a realistic travel timeline, inter-stop transit durations, buffer times,
    cost calculations, and feasibility confidence score.
    """
    if not experiences:
        return FeasibilityCalculationResult(
            feasibility_score=100.0,
            feasibility_status="excellent",
            total_duration_mins=0,
            total_cost=0.0,
            total_travel_time_mins=0,
            buffer_time_mins=available_duration_mins,
            is_budget_exceeded=False,
            is_time_exceeded=False,
            timeline_items=[],
            warnings=[]
        )

    current_lat = origin_lat
    current_lng = origin_lng
    current_time_str = start_time

    total_activity_time = 0
    total_travel_time = 0
    total_cost = 0.0
    warnings = []
    timeline_items = []

    for index, exp in enumerate(experiences):
        # 1. Travel from previous location to this experience
        dist_km, travel_mins = estimate_travel_time_mins(current_lat, current_lng, exp.latitude, exp.longitude)
        
        # Calculate item start time
        item_start_time = add_minutes_to_time_str(current_time_str, travel_mins)
        # Calculate item end time
        item_end_time = add_minutes_to_time_str(item_start_time, exp.duration_mins)
        
        # Buffer before next activity (10 mins standard rest / transit prep)
        buffer_mins = 10 if index < len(experiences) - 1 else 0
        current_time_str = add_minutes_to_time_str(item_end_time, buffer_mins)
        
        # Calculate cost
        item_cost = exp.price * group_size if exp.price > 0 else 0.0
        total_cost += item_cost
        
        total_activity_time += exp.duration_mins
        total_travel_time += travel_mins

        timeline_items.append({
            "experience_id": exp.id,
            "order_index": index,
            "scheduled_start": item_start_time,
            "scheduled_end": item_end_time,
            "duration_mins": exp.duration_mins,
            "travel_time_from_prev_mins": travel_mins,
            "distance_km": dist_km,
            "cost": item_cost,
            "is_indoor": exp.is_indoor,
            "title": exp.title,
            "category": exp.category
        })

        current_lat = exp.latitude
        current_lng = exp.longitude

    total_spent_time = total_activity_time + total_travel_time + (len(experiences) - 1) * 10
    remaining_buffer = available_duration_mins - total_spent_time

    is_time_exceeded = total_spent_time > available_duration_mins
    is_budget_exceeded = total_cost > total_budget

    if is_time_exceeded:
        over_mins = total_spent_time - available_duration_mins
        warnings.append(f"Itinerary exceeds available time by {over_mins} minutes.")
    if is_budget_exceeded:
        over_budget = total_cost - total_budget
        warnings.append(f"Itinerary exceeds target budget by ₹{int(over_budget):,}.")

    # Compute Feasibility Score (0 - 100%)
    if is_time_exceeded:
        time_penalty = min(50.0, (total_spent_time - available_duration_mins) * 1.5)
    else:
        # Healthy buffer gives higher score
        buffer_ratio = remaining_buffer / available_duration_mins
        time_penalty = max(0.0, (0.25 - buffer_ratio) * 40.0) if buffer_ratio < 0.10 else 0.0

    if is_budget_exceeded:
        budget_penalty = min(35.0, ((total_cost - total_budget) / total_budget) * 50.0)
    else:
        budget_penalty = 0.0

    base_score = 100.0 - time_penalty - budget_penalty
    feasibility_score = max(10.0, min(98.0, round(base_score, 1)))

    if feasibility_score >= 85.0:
        status = "excellent"
    elif feasibility_score >= 70.0:
        status = "good"
    elif feasibility_score >= 50.0:
        status = "tight"
    else:
        status = "not_feasible"

    return FeasibilityCalculationResult(
        feasibility_score=feasibility_score,
        feasibility_status=status,
        total_duration_mins=total_spent_time,
        total_cost=total_cost,
        total_travel_time_mins=total_travel_time,
        buffer_time_mins=max(0, remaining_buffer),
        is_budget_exceeded=is_budget_exceeded,
        is_time_exceeded=is_time_exceeded,
        timeline_items=timeline_items,
        warnings=warnings
    )
