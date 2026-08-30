import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Luta Tech Python AI Service"
    version: str = "1.0.0"
    environment: str = os.getenv("ENVIRONMENT", "development")
    internal_api_secret: str = os.getenv("INTERNAL_API_SECRET", "dev_internal_secret_key_123")
    rembg_model: str = os.getenv("REMBG_MODEL", "u2netp")
    max_image_size_mb: int = int(os.getenv("MAX_IMAGE_SIZE_MB", "12"))

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
