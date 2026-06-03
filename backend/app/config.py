from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://user:password@db:5432/inventory"

    class Config:
        env_file = ".env"

settings = Settings()