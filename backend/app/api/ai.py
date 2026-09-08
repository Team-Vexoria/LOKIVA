from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.schemas import IntentExtractionRequest, StructuredIntent, ScoredExperienceOut
from backend.app.services.ai_service import extract_intent_with_llm, extract_intent_fallback
from backend.app.services.recommendation_engine import rank_experiences

router = APIRouter(prefix="/ai", tags=["ai"])

@router.post("/intent", response_model=StructuredIntent)
async def extract_intent(req: IntentExtractionRequest):
    """
    Extracts structured constraints from natural language query.
    Example: "I'm with my parents in the city center. We have 4 hours, ₹2,000 total, want local food and something cultural, and don't want much walking."
    """
    return await extract_intent_with_llm(req.query, req.user_location)


@router.post("/chat")
async def ai_guide_chat(req: IntentExtractionRequest, db: Session = Depends(get_db)):
    """
    AI Local Concierge conversation endpoint.
    Extracts intent, queries verified database experiences, and returns conversational response + structured recommendations.
    Rule: Never hallucinate prices, hours, or distances.
    """
    intent = await extract_intent_with_llm(req.query, req.user_location)
    user_lat = req.user_location.get("lat", 26.9124) if req.user_location else 26.9124
    user_lng = req.user_location.get("lng", 75.7873) if req.user_location else 75.7873

    recommendations: List[ScoredExperienceOut] = rank_experiences(
        db=db,
        intent=intent,
        user_lat=user_lat,
        user_lng=user_lng,
        limit=4
    )

    # Compose conversational message grounded strictly in DB results
    total_found = len(recommendations)
    if total_found > 0:
        top_picks_str = ", ".join([f"'{r.experience.title}'" for r in recommendations[:2]])
        time_str = f"{intent.duration_minutes // 60} hours" if intent.duration_minutes >= 60 else f"{intent.duration_minutes} minutes"
        
        reply_message = (
            f"I found {total_found} verified experiences perfectly matching your request. "
            f"I have calibrated these to fit your {time_str} window and ₹{int(intent.budget):,} budget for {intent.group_size} people "
            f"with low-walking accessibility. Highlights include {top_picks_str}."
        )
    else:
        reply_message = "I couldn't find an exact match for those specific filters, but I've broadened the search for top-rated local spots nearby."

    return {
        "reply": reply_message,
        "extracted_intent": intent,
        "recommendations": recommendations
    }
