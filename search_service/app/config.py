from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "power_market"
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "password"
    
    TYPESENSE_HOST: str = "localhost"
    TYPESENSE_PORT: str = "8108"
    TYPESENSE_PROTOCOL: str = "http"
    TYPESENSE_API_KEY: str = "xyz123"
    
    SERVICE_PORT: int = 8081
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"

settings = Settings()