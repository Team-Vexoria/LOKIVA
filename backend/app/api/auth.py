from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token
from backend.app.models import User, TravelerProfile, Provider
from backend.app.schemas import UserCreate, UserLogin, UserOut, Token, TravelerProfileOut

router = APIRouter(prefix="/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    if not token:
        # For development/demo convenience, fallback to demo traveler if no token provided
        user = db.query(User).filter(User.role == "traveler").first()
        if user:
            return user
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def require_role(allowed_roles: list[str]):
    def role_checker(user: User = Depends(get_current_user)):
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires one of {allowed_roles}"
            )
        return user
    return role_checker


@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role or "traveler"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    if user.role == "traveler":
        profile = TravelerProfile(
            user_id=user.id,
            traveler_type="Family",
            group_size=4,
            budget=2000.0,
            interests=["food", "culture"],
            accessibility_prefs={"low_walking": True}
        )
        db.add(profile)
    elif user.role == "provider":
        provider = Provider(
            user_id=user.id,
            business_name=f"{user.full_name}'s Heritage Experiences",
            is_verified=False
        )
        db.add(provider)
    
    db.commit()
    db.refresh(user)

    access_token = create_access_token(subject=user.id, role=user.role)
    user_out = UserOut.model_validate(user)
    return Token(access_token=access_token, token_type="bearer", user=user_out)


@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    email = login_in.email.lower().strip()
    user = db.query(User).filter(User.email == email).first()
    if not user and email.endswith("@lokiva.demo"):
        alt_email = email.replace("@lokiva.demo", "@lokiva.com")
        user = db.query(User).filter(User.email == alt_email).first()
    if not user and (email == "traveler@lokiva.com" or email == "traveler@lokiva.demo"):
        user = db.query(User).filter(User.email == "aarav@lokiva.com").first()

    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    access_token = create_access_token(subject=user.id, role=user.role)
    user_out = UserOut.model_validate(user)
    return Token(access_token=access_token, token_type="bearer", user=user_out)


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)


@router.post("/demo-login/{role}", response_model=Token)
def demo_login(role: str, db: Session = Depends(get_db)):
    """Instant 1-click login for demo presentations."""
    user = db.query(User).filter(User.role == role).first()
    if not user:
        # Create on the fly if not seeded yet
        if role == "admin":
            user = User(email="admin@lokiva.com", full_name="LOKIVA Admin", hashed_password=get_password_hash("admin123"), role="admin")
        elif role == "provider":
            user = User(email="provider@lokiva.com", full_name="Jaipur Crafts Collective", hashed_password=get_password_hash("provider123"), role="provider")
        else:
            user = User(email="aarav@lokiva.com", full_name="Aarav Sharma", hashed_password=get_password_hash("traveler123"), role="traveler")
        db.add(user)
        db.commit()
        db.refresh(user)
        
        if role == "traveler" and not user.profile:
            p = TravelerProfile(user_id=user.id, traveler_type="Family", group_size=4, budget=2000.0, interests=["food", "culture"], accessibility_prefs={"low_walking": True})
            db.add(p)
            db.commit()

    access_token = create_access_token(subject=user.id, role=user.role)
    user_out = UserOut.model_validate(user)
    return Token(access_token=access_token, token_type="bearer", user=user_out)
