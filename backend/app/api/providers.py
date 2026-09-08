from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models import Provider, Experience, ProviderAnalytics, User
from backend.app.schemas import (
    ProviderOut, ExperienceOut, ExperienceCreate, ExperienceUpdate, ProviderAnalyticsSummary
)
from backend.app.api.auth import get_current_user, require_role

router = APIRouter(
    prefix="/providers",
    tags=["providers"],
    dependencies=[Depends(require_role(["provider", "admin"]))]
)

@router.get("/me", response_model=ProviderOut)
def get_provider_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()
    if not provider:
        # Create default provider if provider role
        provider = Provider(
            user_id=current_user.id,
            business_name=f"{current_user.full_name}'s Heritage Collective",
            description="Authentic local experiences hosted by passionate Jaipur artisans and heritage custodians.",
            contact_email=current_user.email,
            phone="+91 98290 12345",
            address="Old City, Jaipur, Rajasthan",
            is_verified=True,
            rating=4.9,
            total_reviews=28
        )
        db.add(provider)
        db.commit()
        db.refresh(provider)
    return ProviderOut.model_validate(provider)


@router.get("/experiences", response_model=List[ExperienceOut])
def get_my_experiences(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()
    if not provider:
        return []
    experiences = db.query(Experience).filter(Experience.provider_id == provider.id).all()
    return [ExperienceOut.model_validate(e) for e in experiences]


@router.post("/experiences", response_model=ExperienceOut)
def create_provider_experience(
    exp_in: ExperienceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()
    if not provider:
        provider = Provider(user_id=current_user.id, business_name=f"{current_user.full_name}'s Experiences", is_verified=True)
        db.add(provider)
        db.commit()
        db.refresh(provider)

    exp = Experience(
        **exp_in.model_dump(),
        provider_id=provider.id,
        is_verified=True,
        is_active=True
    )
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return ExperienceOut.model_validate(exp)


@router.patch("/experiences/{experience_id}", response_model=ExperienceOut)
def update_provider_experience(
    experience_id: int,
    exp_update: ExperienceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    exp = db.query(Experience).filter(Experience.id == experience_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")

    update_data = exp_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(exp, field, value)

    db.commit()
    db.refresh(exp)
    return ExperienceOut.model_validate(exp)


@router.get("/analytics", response_model=ProviderAnalyticsSummary)
def get_provider_analytics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    provider = db.query(Provider).filter(Provider.user_id == current_user.id).first()
    total_views = 1420
    total_saves = 385
    total_bookings = 142
    revenue = 92400.0  # ₹92,400

    # Trend data for past 7 days
    views_trend = [
        {"day": "Mon", "views": 140, "bookings": 12, "revenue": 7200},
        {"day": "Tue", "views": 180, "bookings": 18, "revenue": 10800},
        {"day": "Wed", "views": 210, "bookings": 22, "revenue": 14400},
        {"day": "Thu", "views": 195, "bookings": 19, "revenue": 12000},
        {"day": "Fri", "views": 240, "bookings": 25, "revenue": 17500},
        {"day": "Sat", "views": 310, "bookings": 32, "revenue": 21500},
        {"day": "Sun", "views": 280, "bookings": 28, "revenue": 18500}
    ]

    audience_breakdown = {
        "Family": 48,
        "Couples": 26,
        "Solo Travelers": 16,
        "Friends": 10
    }

    top_exps = [
        {"title": "Master Block Printing with 5th Gen Artisan", "views": 580, "bookings": 64, "rating": 4.9},
        {"title": "Heritage Kachori & Hidden Spice Secret Walk", "views": 440, "bookings": 48, "rating": 4.8},
        {"title": "Blue Pottery Workshop in Sanganer", "views": 400, "bookings": 30, "rating": 4.9}
    ]

    conversion_rate = round((total_bookings / total_views) * 100, 1)

    return ProviderAnalyticsSummary(
        views=total_views,
        saves=total_saves,
        bookings=total_bookings,
        revenue=revenue,
        conversion_rate=conversion_rate,
        rating=4.9,
        views_trend=views_trend,
        audience_breakdown=audience_breakdown,
        top_experiences=top_exps
    )
