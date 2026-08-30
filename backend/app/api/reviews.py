from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models import Review, Favorite, Experience, User
from backend.app.schemas import ReviewCreate, ReviewOut, ExperienceOut
from backend.app.api.auth import get_current_user

router = APIRouter(tags=["reviews & favorites"])

@router.post("/reviews", response_model=ReviewOut)
def create_review(
    review_in: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    exp = db.query(Experience).filter(Experience.id == review_in.experience_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")

    review = Review(
        experience_id=review_in.experience_id,
        user_id=current_user.id,
        rating=review_in.rating,
        comment=review_in.comment,
        traveler_type=review_in.traveler_type or "Family"
    )
    db.add(review)

    # Recalculate average rating
    all_reviews = db.query(Review).filter(Review.experience_id == exp.id).all()
    ratings = [r.rating for r in all_reviews] + [review_in.rating]
    exp.rating = round(sum(ratings) / len(ratings), 1)
    exp.review_count = len(ratings)

    db.commit()
    db.refresh(review)
    return ReviewOut(
        id=review.id,
        experience_id=review.experience_id,
        user_id=review.user_id,
        rating=review.rating,
        comment=review.comment,
        traveler_type=review.traveler_type,
        created_at=review.created_at,
        user_name=current_user.full_name
    )


@router.get("/reviews/{experience_id}", response_model=List[ReviewOut])
def get_experience_reviews(experience_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.experience_id == experience_id).order_by(Review.created_at.desc()).all()
    results = []
    for r in reviews:
        user_name = r.user.full_name if r.user else "Traveler"
        results.append(ReviewOut(
            id=r.id,
            experience_id=r.experience_id,
            user_id=r.user_id,
            rating=r.rating,
            comment=r.comment,
            traveler_type=r.traveler_type,
            created_at=r.created_at,
            user_name=user_name
        ))
    return results


@router.post("/favorites/{experience_id}")
def toggle_favorite(
    experience_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    fav = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.experience_id == experience_id
    ).first()

    if fav:
        db.delete(fav)
        db.commit()
        return {"favorited": False, "experience_id": experience_id}
    else:
        fav = Favorite(user_id=current_user.id, experience_id=experience_id)
        db.add(fav)
        db.commit()
        return {"favorited": True, "experience_id": experience_id}


@router.get("/favorites", response_model=List[ExperienceOut])
def get_user_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    favorites = db.query(Favorite).filter(Favorite.user_id == current_user.id).all()
    exp_ids = [f.experience_id for f in favorites]
    experiences = db.query(Experience).filter(Experience.id.in_(exp_ids)).all()
    return [ExperienceOut.model_validate(e) for e in experiences]
