"""
Endpoint для поиска услуг через Typesense
"""
from fastapi import APIRouter, Query, status, HTTPException
from typing import Optional
from app.models.schemas import SearchResponse
from app.services.typesense_client import search_services
from app.services.preprocessor import preprocess_text
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/") # response_model=SearchResponse
def search(
    q: str = Query(..., min_length=2, max_length=200, description="Поисковой запрос"),
    page: int = Query(1, ge=1, description="Номер страницы"),
    per_page: int = Query(20, ge=1, le=100, description="Количество результатов на странице"),
    location: Optional[str] = Query(None, description="Фильтр по местоположению"),
    category: Optional[str] = Query(None, description="Фильтр по категории (SOLAR, WIND и т.д.)"),
    min_price: Optional[float] = Query(None, ge=0, description="Минимальная цена в день"),
    max_price: Optional[float] = Query(None, ge=0, description="Максимальная цена в день")
):
    """Поиск услуг производственных мощностей."""
    try:
        # 1. Формируем словарь для фильтров
        filters = {}
        if location:
            filters['location'] = location
        if category:
            # Важно: категории в базе и Typesense хранятся в верхнем регистре [1]
            filters['category'] = category.upper()
        if min_price is not None:
            filters['min_price'] = min_price
        if max_price is not None:
            filters['max_price'] = max_price
            # 2. Вызываем search_services с правильными именами аргументов
            results = search_services(
                query=q,
                page=page,
                per_page=per_page,
                filters=filters if filters else None
            )

            logger.info(f"Search query: '{q}', filters: {filters}, found: {results['found']}")

            return {
                "query": q,
                "total": results['found'],
                "results": results['hits'],
                "page": results['page'],
                "search_method": "typesense"
            }


    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Search error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Произошла ошибка во время поиска."
        )


@router.get("/suggest")
def suggest(
    q: str = Query(..., min_length=1, description="Префикс для автодополнения"),
    limit: int = Query(5, ge=1, le=10)
):
    """
    Автодополнение поисковых запросов.
    Используется для поисковой строки.
    """
    try:
        results = search_services(q, limit=limit, offset=0)
        
        # Возвращаем только уникальные заголовки
        suggestions = list(set([
            hit.get('title', '') 
            for hit in results['hits']
        ]))[:limit]
        
        return {
            "query": q,
            "suggestions": suggestions
        }
        
    except Exception as e:
        logger.error(f"Suggest error: {e}")
        return {"query": q, "suggestions": []}