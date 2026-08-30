import pytest
from backend.app.core.database import SessionLocal, Base, engine
from backend.app.models import Experience, User, TravelerProfile
from backend.app.services.ai_service import extract_intent_fallback, generate_why_it_fits_bullets
from backend.app.services.recommendation_engine import rank_experiences
from backend.app.services.feasibility_engine import calculate_itinerary_feasibility
from backend.app.services.replan_engine import dynamic_replan
from backend.app.schemas import StructuredIntent

@pytest.fixture(scope="module")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    yield db
    db.close()

def test_pan_india_intent_extraction():
    # Mumbai query
    mumbai_q = "I'm with my parents in Mumbai. We have 4 hours, ₹2,000 total, want local food and culture, and low walking."
    intent_mumbai = extract_intent_fallback(mumbai_q)
    assert intent_mumbai.destination_city == "Mumbai"
    assert intent_mumbai.duration_minutes == 240
    assert intent_mumbai.budget == 2000.0
    assert intent_mumbai.group_type == "family"
    assert intent_mumbai.accessibility.get("low_walking") is True
    assert "food" in intent_mumbai.interests

    # Goa query
    goa_q = "What can I do in Goa under ₹3000 with adventure and beaches?"
    intent_goa = extract_intent_fallback(goa_q)
    assert intent_goa.destination_city == "Goa"
    assert intent_goa.budget == 3000.0
    assert "adventure" in intent_goa.interests or "nature" in intent_goa.interests

    # Kochi query
    kochi_q = "I have 3 hours in Kochi and want authentic cultural experiences"
    intent_kochi = extract_intent_fallback(kochi_q)
    assert intent_kochi.destination_city == "Kochi"
    assert intent_kochi.duration_minutes == 180
    assert "culture" in intent_kochi.interests

def test_mumbai_recommendation_ranking(db_session):
    intent = StructuredIntent(
        destination_city="Mumbai",
        location="Bandra",
        duration_minutes=240,
        budget=2000.0,
        currency="INR",
        interests=["food", "culture"],
        group_type="family",
        group_size=4,
        accessibility={"low_walking": True}
    )
    
    ranked = rank_experiences(
        db=db_session,
        intent=intent,
        city="Mumbai",
        user_lat=19.0596,
        user_lng=72.8295,
        limit=5
    )
    
    assert len(ranked) > 0
    for r in ranked:
        assert r.experience.city == "Mumbai"
    top_pick = ranked[0]
    assert top_pick.overall_score > 0.5
    assert len(top_pick.why_it_fits) > 0

def test_kochi_recommendation_ranking(db_session):
    intent = StructuredIntent(
        destination_city="Kochi",
        duration_minutes=180,
        budget=1500.0,
        currency="INR",
        interests=["culture", "shopping"],
        group_type="couple",
        group_size=2,
        accessibility={"low_walking": True}
    )
    
    ranked = rank_experiences(
        db=db_session,
        intent=intent,
        city="Kochi",
        user_lat=9.9678,
        user_lng=76.2428,
        limit=5
    )
    
    assert len(ranked) > 0
    for r in ranked:
        assert r.experience.city == "Kochi"

def test_near_me_geospatial_radius(db_session):
    # Search within 10 km of Delhi center
    delhi_lat, delhi_lng = 28.6139, 77.2090
    intent = StructuredIntent(
        destination_city="Delhi",
        duration_minutes=240,
        budget=2000.0,
        currency="INR",
        interests=["food", "culture"],
        group_size=2,
        radius_km=10.0
    )
    
    ranked = rank_experiences(
        db=db_session,
        intent=intent,
        user_lat=delhi_lat,
        user_lng=delhi_lng,
        radius_km=10.0,
        limit=5
    )
    
    assert len(ranked) > 0
    for r in ranked:
        assert r.distance_km <= 15.0 # realistic within cluster

def test_feasibility_engine(db_session):
    mumbai_exps = db_session.query(Experience).filter(Experience.city == "Mumbai", Experience.is_active == True).limit(2).all()
    assert len(mumbai_exps) == 2
    
    result = calculate_itinerary_feasibility(
        experiences=mumbai_exps,
        start_time="10:00",
        available_duration_mins=240,
        total_budget=2000.0,
        group_size=2,
        origin_lat=19.0760,
        origin_lng=72.8777
    )
    
    assert result.feasibility_score >= 60.0
    assert result.total_duration_mins > 0
    assert len(result.timeline_items) == 2

def test_dynamic_replan_multi_destination(db_session):
    # Select outdoor experience in Goa
    goa_outdoor = db_session.query(Experience).filter(Experience.city == "Goa", Experience.is_indoor == False, Experience.is_active == True).first()
    goa_indoor = db_session.query(Experience).filter(Experience.city == "Goa", Experience.is_indoor == True, Experience.is_active == True).first()
    
    if goa_outdoor and goa_indoor:
        current_ids = [goa_outdoor.id, goa_indoor.id]
        replan = dynamic_replan(
            db=db_session,
            current_experience_ids=current_ids,
            scenario="weather_rain",
            city="Goa"
        )
        
        assert replan["scenario"] == "weather_rain"
        assert replan["city"] == "Goa"
        assert len(replan["updated_ids"]) == 2
