"""
Конфигурация приложения
Настройки загружаются из переменных окружения
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """
    Настройки приложения.
    Значения загружаются из .env файла или переменных окружения.
    """

    # Database settings
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "power_market"
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "password"

    # Typesense settings
    TYPESENSE_HOST: str = "localhost"
    TYPESENSE_PORT: str = "8108"
    TYPESENSE_PROTOCOL: str = "http"
    TYPESENSE_API_KEY: str = "your-api-key-here"

    # Service settings
    SERVICE_PORT: int = 8081
    LOG_LEVEL: str = "INFO"

    # CORS settings (опционально)
    ALLOWED_ORIGINS: list = ["*"]

    class Config:
        env_file = ".env"
        case_sensitive = True


# Создаем глобальный экземпляр настроек
settings = Settings()