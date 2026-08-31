import os
import secrets
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Luta Tech API"
    version: str = "1.0.0"
    cors_origins: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "https://lutatech.com",
        "https://www.lutatech.com",
    ]
    temp_dir: str = "/tmp/lutatech"
    rembg_model: str = "u2netp"

    # Database (MySQL via PyMySQL)
    database_url: str = "mysql+pymysql://root:@127.0.0.1:3306/luta_studio"

    # JWT Auth (Secret key should be set via environment variable SECRET_KEY in production)
    secret_key: str = os.environ.get("SECRET_KEY", "luta-tech-secure-jwt-key-2026-production-fallback")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080  # 7 days

    @field_validator("cors_origins", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["*"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
