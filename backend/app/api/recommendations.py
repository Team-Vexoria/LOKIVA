from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.schemas import RecommendationRequest, ScoredExperienceOut, StructuredIntent
from backend.app.services.ai_service import extract_intent_fallback, extract_intent_with_llm
from backend.app.services.recommendation_engine import rank_experiences

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

@router.post("", response_model=List[ScoredExperienceOut])
async def get_recommendations(req: RecommendationRequest, db: Session = Depends(get_db)):
    """
    Core AI Recommendation Pipeline:
    1. If query is supplied without explicit intent, extract structured constraints via AI/NLP.
    2. Apply hard constraints (budget, time, capacity, accessibility).
    3. Calculate multi-criteria transparent ranking score.
    4. Return ranked list with explainable 'Why this fits you' bullets.
    """
    if req.intent:
        intent = req.intent
    elif req.query:
        intent = await extract_intent_with_llm(req.query, {"lat": req.user_lat, "lng": req.user_lng})
    else:
        # Build default intent from fields
        intent = StructuredIntent(
            duration_minutes=req.available_duration_mins or 240,
            budget=req.max_budget or 2000.0,
            interests=req.categories or ["food", "culture"],
            group_size=req.group_size or 4,
            accessibility={
                "low_walking": req.accessibility_low_walking or False,
                "wheelchair": req.accessibility_wheelchair or False
            },
            hidden_gem_preference=req.is_hidden_gem_only or False
        )

    results = rank_experiences(
        db=db,
        intent=intent,
        user_lat=req.user_lat or 26.9124,
        user_lng=req.user_lng or 75.7873,
        is_hidden_gem_only=req.is_hidden_gem_only or False,
        categories=req.categories,
        limit=req.limit or 10
    )
    return results
