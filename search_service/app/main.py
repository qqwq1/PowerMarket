"""
Точка входа для Python-микросервиса поиска PowerMarket
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import api_router
from app.database.connection import init_db_pool, close_db_pool
from app.services.typesense_client import init_collection
import logging

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Создание FastAPI приложения
app = FastAPI(
    title="PowerMarket Search API",
    description="Поисковый микросервис для маркетплейса производственных мощностей",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В production укажите конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# События жизненного цикла приложения
@app.on_event("startup")
async def startup():
    """Инициализация при запуске"""
    logger.info("Starting PowerMarket Search Service...")
    try:
        # Инициализация пула соединений с БД
        init_db_pool()
        logger.info("Database connection pool initialized")

        # Инициализация Typesense коллекции
        init_collection()
        logger.info("Typesense collection initialized")

        logger.info("Service started successfully")
    except Exception as e:
        logger.error(f"Startup error: {e}")
        raise


@app.on_event("shutdown")
async def shutdown():
    """Очистка при остановке"""
    logger.info("Shutting down...")
    close_db_pool()
    logger.info("Service stopped")


# Подключение роутеров
app.include_router(api_router, prefix="/api")


# Health check endpoint
@app.get("/health")
def health_check():
    """Проверка здоровья сервиса"""
    return {
        "status": "ok",
        "service": "search-service",
        "version": "1.0.0"
    }


@app.get("/")
def root():
    """Корневой endpoint"""
    return {
        "message": "PowerMarket Search API",
        "docs": "/docs",
        "health": "/health"
    }