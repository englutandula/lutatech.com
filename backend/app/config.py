from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Luta Tech API"
    version: str = "1.0.0"
    cors_origins: list[str] = ["*"]
    temp_dir: str = "/tmp/lutatech"

    class Config:
        env_file = ".env"


settings = Settings()
