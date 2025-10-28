"""
Endpoint для поиска лотов через Typesense
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from app.models.schemas import SearchResponse
from app.services.typesense_client import search_services
from app.services.preprocessor import preprocess_text
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/", response_model=SearchResponse)
def search(
    q: str = Query(..., min_length=2, max_length=200, description="Поисковой запрос"),
    limit: int = Query(20, ge=1, le=100, description="Количество результатов"),
    offset: int = Query(0, ge=0, description="Смещение для пагинации"),
    location: Optional[str] = Query(None, description="Фильтр по местоположению")
):
    """
    Поиск лотов производственных мощностей.
    
    **Возможности:**
    - Поиск с опечатками (до 2 символов)
    - Поддержка синонимов
    - Морфологический анализ
    - Фильтрация по местоположению
    
    **Примеры запросов:**
    - "трактор МТЗ"
    - "фрезерный станок ЧПУ"
    - "упаковочная линия"
    """
    try:
        # Предобработка для логирования и аналитики
        normalized_terms = preprocess_text(q)
        
        if not normalized_terms:
            raise HTTPException(
                status_code=400, 
                detail="Запрос пустой после нормализации"
            )
        
        # Формируем фильтры
        filters = None
        if location:
            filters = f"location:={location}"
        
        # Поиск через Typesense
        results = search_services(q, limit, offset, filters)
        
        logger.info(f"Search query: '{q}', found: {results['found']}")
        
        return SearchResponse(
            query=q,
            normalized_query=" ".join(normalized_terms),
            total=results['found'],
            results=results['hits'],
            search_method="typesense"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Search error: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Ошибка поиска: {str(e)}"
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