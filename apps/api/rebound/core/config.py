import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Rebound API"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    DEMO_MODE: bool = True
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./rebound.db")
    
    # Auth & Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "rebound-secret-key-32chars-min-prod-key-xyz123")
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TTL_MINUTES: int = 1440  # 24 hours for demo/dev
    
    # Encryption key (32 bytes base64 for AES-GCM)
    APP_ENC_KEY: str = os.getenv("APP_ENC_KEY", "uN4sVb12W9zK8qL0pM4eR7tY2uI5oP8aScDfGhJkLmN=")
    
    # Governor & Nudges
    NUDGE_MAX_PER_DAY: int = 3
    MRT_SEND_PROB: float = 0.6
    
    # Analytics & Privacy
    DP_EPSILON: float = 1.0
    K_MIN: int = 20
    
    # Simulation
    SIM_DEFAULT_SEED: int = 42

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
