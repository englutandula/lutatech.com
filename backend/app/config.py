from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Luta Tech API"
    version: str = "1.0.0"
    cors_origins: list[str] = ["*"]
    temp_dir: str = "/tmp/lutatech"
    rembg_model: str = "u2netp"

    # Database
    database_url: str = "postgresql://luta_user:luta_secret_local@localhost:5432/luta_studio"

    # JWT Auth
    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080  # 7 days

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

