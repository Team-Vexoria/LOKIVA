import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "LOKIVA"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./lokiva.db")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "lokiva_super_secure_jwt_secret_key_2026_hackathon")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # Optional integrations with fallback
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", None)
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    MAPBOX_TOKEN: Optional[str] = os.getenv("MAPBOX_TOKEN", None)
    WEATHER_API_KEY: Optional[str] = os.getenv("WEATHER_API_KEY", None)
    
    # Default pan-india context
    DEFAULT_COUNTRY: str = "India"
    DEFAULT_CITY: str = "Mumbai"
    DEFAULT_LAT: float = 19.0760
    DEFAULT_LNG: float = 72.8777

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
