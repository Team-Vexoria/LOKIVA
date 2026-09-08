from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models import Itinerary, ItineraryItem, Experience, User
from backend.app.schemas import (
    ItineraryCreate, ItineraryOut, ItineraryItemOut, 
    FeasibilityCalculationResult, ReplanRequest, ReplanResponse, ExperienceOut
)
from backend.app.services.feasibility_engine import calculate_itinerary_feasibility
from backend.app.services.replan_engine import dynamic_replan
from backend.app.api.auth import get_current_user

router = APIRouter(prefix="/itineraries", tags=["itineraries"])

@router.post("", response_model=ItineraryOut)
def create_itinerary(
    itin_in: ItineraryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    experiences = db.query(Experience).filter(Experience.id.in_(itin_in.experience_ids)).all()
    id_map = {e.id: e for e in experiences}
    ordered_exps = [id_map[eid] for eid in itin_in.experience_ids if eid in id_map]

    if not ordered_exps:
        raise HTTPException(status_code=400, detail="No valid experiences provided")

    feasibility = calculate_itinerary_feasibility(
        experiences=ordered_exps,
        start_time=itin_in.start_time,
        available_duration_mins=itin_in.total_duration_mins,
        total_budget=itin_in.total_budget
    )

    city_name = itin_in.city or (ordered_exps[0].city if ordered_exps else "Mumbai")
    state_name = itin_in.state or (ordered_exps[0].state if ordered_exps else "Maharashtra")

    itinerary = Itinerary(
        user_id=current_user.id,
        title=itin_in.title or f"{city_name} Local Experience Itinerary",
        city=city_name,
        state=state_name,
        start_time=itin_in.start_time,
        total_duration_mins=itin_in.total_duration_mins,
        total_budget=itin_in.total_budget,
        actual_cost=feasibility.total_cost,
        feasibility_score=feasibility.feasibility_score,
        feasibility_status=feasibility.feasibility_status,
        buffer_time_mins=feasibility.buffer_time_mins,
        travel_time_mins=feasibility.total_travel_time_mins,
        notes=itin_in.notes
    )
    db.add(itinerary)
    db.commit()
    db.refresh(itinerary)

    for item_data in feasibility.timeline_items:
        exp = id_map[item_data["experience_id"]]
        item = ItineraryItem(
            itinerary_id=itinerary.id,
            experience_id=exp.id,
            order_index=item_data["order_index"],
            scheduled_start=item_data["scheduled_start"],
            scheduled_end=item_data["scheduled_end"],
            duration_mins=item_data["duration_mins"],
            travel_time_from_prev_mins=item_data["travel_time_from_prev_mins"],
            distance_km=item_data["distance_km"],
            cost=item_data["cost"],
            why_it_fits=[
                f"✓ {exp.category.title()} highlight",
                f"✓ {item_data['travel_time_from_prev_mins']} min transit from previous stop",
                f"✓ Cost: ₹{int(item_data['cost'])}"
            ]
        )
        db.add(item)

    db.commit()
    db.refresh(itinerary)
    return ItineraryOut.model_validate(itinerary)


@router.get("/{itinerary_id}", response_model=ItineraryOut)
def get_itinerary(itinerary_id: int, db: Session = Depends(get_db)):
    itinerary = db.query(Itinerary).filter(Itinerary.id == itinerary_id).first()
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")
    return ItineraryOut.model_validate(itinerary)


@router.get("/user/me", response_model=List[ItineraryOut])
def get_my_itineraries(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    itineraries = db.query(Itinerary).filter(Itinerary.user_id == current_user.id).order_by(Itinerary.created_at.desc()).all()
    return [ItineraryOut.model_validate(i) for i in itineraries]


@router.post("/feasibility-check", response_model=FeasibilityCalculationResult)
def check_feasibility(itin_in: ItineraryCreate, db: Session = Depends(get_db)):
    experiences = db.query(Experience).filter(Experience.id.in_(itin_in.experience_ids)).all()
    id_map = {e.id: e for e in experiences}
    ordered_exps = [id_map[eid] for eid in itin_in.experience_ids if eid in id_map]

    return calculate_itinerary_feasibility(
        experiences=ordered_exps,
        start_time=itin_in.start_time,
        available_duration_mins=itin_in.total_duration_mins,
        total_budget=itin_in.total_budget
    )


@router.post("/replan", response_model=ReplanResponse)
def replan_itinerary(
    req: ReplanRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Dynamic Re-planning API:
    Adapts an existing itinerary to sudden changes (weather alert, sold-out experience, reduced time/budget).
    """
    replan_result = dynamic_replan(
        db=db,
        current_experience_ids=req.current_experience_ids,
        scenario=req.scenario,
        city=req.city,
        affected_experience_id=req.affected_experience_id,
        new_budget=req.new_budget,
        new_duration_mins=req.new_duration_mins,
        user_lat=req.user_lat,
        user_lng=req.user_lng
    )

    # Save or update itinerary
    updated_exps = replan_result["updated_experiences"]
    feasibility: FeasibilityCalculationResult = replan_result["feasibility"]
    target_city = replan_result["city"]

    weather_label = f"Rain expected in {target_city} (Indoor Safe Plan)" if req.scenario == "weather_rain" else "Clear skies, 28°C"
    
    itinerary = Itinerary(
        user_id=current_user.id,
        title=f"{target_city}: {req.scenario.replace('_', ' ').title()}",
        city=target_city,
        state=updated_exps[0].state if updated_exps else "Maharashtra",
        start_time="10:00",
        total_duration_mins=req.new_duration_mins or 240,
        total_budget=req.new_budget or 2000.0,
        actual_cost=feasibility.total_cost,
        feasibility_score=feasibility.feasibility_score,
        feasibility_status=feasibility.feasibility_status,
        buffer_time_mins=feasibility.buffer_time_mins,
        travel_time_mins=feasibility.total_travel_time_mins,
        weather_context=weather_label,
        notes=replan_result["explanation"]
    )
    db.add(itinerary)
    db.commit()
    db.refresh(itinerary)

    for item_data in feasibility.timeline_items:
        exp = next((e for e in updated_exps if e.id == item_data["experience_id"]), None)
        if exp:
            item = ItineraryItem(
                itinerary_id=itinerary.id,
                experience_id=exp.id,
                order_index=item_data["order_index"],
                scheduled_start=item_data["scheduled_start"],
                scheduled_end=item_data["scheduled_end"],
                duration_mins=item_data["duration_mins"],
                travel_time_from_prev_mins=item_data["travel_time_from_prev_mins"],
                distance_km=item_data["distance_km"],
                cost=item_data["cost"],
                why_it_fits=[
                    f"✓ Re-planned for {req.scenario.replace('_', ' ')}",
                    f"✓ {item_data['travel_time_from_prev_mins']} min transit",
                    f"✓ Cost: ₹{int(item_data['cost'])}"
                ]
            )
            db.add(item)

    db.commit()
    db.refresh(itinerary)

    repl_exp_out = ExperienceOut.model_validate(replan_result["replacement_exp"]) if replan_result["replacement_exp"] else None

    return ReplanResponse(
        replan_summary=replan_result["summary"],
        scenario=req.scenario,
        city=target_city,
        original_experience_ids=req.current_experience_ids,
        updated_experience_ids=replan_result["updated_ids"],
        replaced_experience_id=replan_result["replaced_id"],
        replacement_experience=repl_exp_out,
        itinerary=ItineraryOut.model_validate(itinerary),
        explanation=replan_result["explanation"]
    )
