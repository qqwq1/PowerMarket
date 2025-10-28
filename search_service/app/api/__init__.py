"""
API роутеры для поискового сервиса (MVP)
"""
from fastapi import APIRouter
from app.api import search, preprocess

api_router = APIRouter()

# Подключаем только необходимые для MVP роутеры
api_router.include_router(search.router, tags=["search"])
api_router.include_router(preprocess.router, tags=["preprocess"])