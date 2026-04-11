from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    FRONTEND_URL: str = "http://localhost:3000"
    APP_ENV: str = "development"
    STRIPE_SECRET_KEY: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""
    ADMIN_EMAIL: str = "sajidahaider889@gmail.com"
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: str = "587"
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    OPENAI_API_KEY: str = ""

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
