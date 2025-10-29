"""
Endpoints для предобработки и индексации услуг (services)
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.models.schemas import (
    PreprocessRequest,
    PreprocessResponse,
    IndexRequest,
    IndexResponse
)
from app.services.preprocessor import preprocess_text
from app.services.typesense_client import index_service, delete_service
from app.api.dependencies import get_db
import logging
from app.database.queries import get_service_by_id

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=PreprocessResponse)
def preprocess_service_text(request: PreprocessRequest):
    """
    Предобработка текста услуги.

    **Использование:**
    Java-бэкенд вызывает этот endpoint перед сохранением услуги в PostgreSQL,
    чтобы получить обработанные версии полей.

    **Процесс:**
    1. Приведение к нижнему регистру
    2. Удаление лишних пробелов
    3. Базовая нормализация
    """
    try:
        processed_title = preprocess_text(request.title)
        processed_description = preprocess_text(request.description)

        return PreprocessResponse(
            processed_title=" ".join(processed_title),
            processed_description=" ".join(processed_description)
        )

    except Exception as e:
        logger.error(f"Preprocessing error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка предобработки: {str(e)}"
        )

@router.post("/index", response_model=IndexResponse)
def index_service_endpoint(request: IndexRequest, db=Depends(get_db)):
    """
    Индексация услуги в Typesense.

    **Использование:**
    Java-бэкенд отправляет только ID услуги после сохранения в PostgreSQL.
    Python-сервис сам получает данные из БД и индексирует их.

    **Пример запроса:**
    ```json
    {"id": 1}
    ```
    """
    try:
        # Получаем данные услуги из PostgreSQL
        service_data = get_service_by_id(db, request.id)

        if not service_data:
            raise HTTPException(
                status_code=404,
                detail=f"Service with id {request.id} not found in database or inactive"
            )

        # Индексируем в Typesense
        success = index_service(service_data)

        if not success:
            raise HTTPException(
                status_code=500,
                detail="Failed to index service in Typesense"
            )

        logger.info(f"Successfully indexed service: {request.id}")

        return IndexResponse(
            success=True,
            service_id=request.id,
            message="Service indexed successfully"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Indexing error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка индексации: {str(e)}"
        )

@router.delete("/{service_id}", response_model=IndexResponse)
def delete_service_endpoint(service_id: int):
    """
    Удаление услуги из поискового индекса.

    **Использование:**
    Java-бэкенд вызывает при удалении услуги из PostgreSQL.
    """
    try:
        success = delete_service(str(service_id))

        if not success:
            raise HTTPException(
                status_code=404,
                detail=f"Service {service_id} not found in index"
            )

        return IndexResponse(
            success=True,
            service_id=service_id,
            message="Service deleted from index"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка удаления: {str(e)}"
        )

@router.post("/batch", response_model=List[PreprocessResponse])
def preprocess_batch(requests: List[PreprocessRequest]):
    """
    Пакетная предобработка (для массовой загрузки услуг).

    **Использование:**
    При миграции существующих данных или импорте из внешних систем.
    """
    results = []

    for req in requests:
        try:
            processed_title = preprocess_text(req.title)
            processed_description = preprocess_text(req.description)

            results.append(PreprocessResponse(
                processed_title=" ".join(processed_title),
                processed_description=" ".join(processed_description)
            ))
        except Exception as e:
            logger.warning(f"Error preprocessing item: {e}")
            continue
    
    return results