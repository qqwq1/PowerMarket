"""
Endpoints для предобработки и индексации лотов
"""
from fastapi import APIRouter, HTTPException
from typing import List
from app.models.schemas import (
    PreprocessRequest, 
    PreprocessResponse, 
    IndexRequest,
    IndexResponse
)
from app.services.preprocessor import preprocess_text
from app.services.typesense_client import index_lot, delete_lot
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=PreprocessResponse)
def preprocess_lot_text(request: PreprocessRequest):
    """
    Предобработка текста лота.
    
    **Использование:**
    Java-бэкенд вызывает этот endpoint перед сохранением лота в PostgreSQL,
    чтобы получить нормализованные версии полей.
    
    **Процесс:**
    1. Лемматизация
    2. Удаление стоп-слов
    3. Приведение к нижнему регистру
    """
    try:
        normalized_title = preprocess_text(request.title)
        normalized_description = preprocess_text(request.description)
        normalized_keywords = preprocess_text(request.keywords or "")
        
        return PreprocessResponse(
            normalized_title=" ".join(normalized_title),
            normalized_description=" ".join(normalized_description),
            normalized_keywords=" ".join(normalized_keywords)
        )
        
    except Exception as e:
        logger.error(f"Preprocessing error: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Ошибка предобработки: {str(e)}"
        )

@router.post("/index", response_model=IndexResponse)
def index_lot_endpoint(request: IndexRequest):
    """
    Индексация лота в Typesense.
    
    **Использование:**
    Java-бэкенд вызывает после успешного сохранения лота в PostgreSQL.
    
    **Требования:**
    - Лот должен быть уже сохранён в БД
    - Поля normalized_* должны быть заполнены
    """
    try:
        lot_data = request.dict()
        success = index_lot(lot_data)
        
        if not success:
            raise HTTPException(
                status_code=500, 
                detail="Failed to index lot in Typesense"
            )
        
        logger.info(f"Successfully indexed lot: {lot_data['id']}")
        
        return IndexResponse(
            success=True,
            lot_id=lot_data['id'],
            message="Lot indexed successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Indexing error: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Ошибка индексации: {str(e)}"
        )

@router.delete("/index/{lot_id}", response_model=IndexResponse)
def delete_lot_endpoint(lot_id: int):
    """
    Удаление лота из поискового индекса.
    
    **Использование:**
    Java-бэкенд вызывает при удалении лота из PostgreSQL.
    """
    try:
        success = delete_lot(str(lot_id))
        
        if not success:
            raise HTTPException(
                status_code=404, 
                detail=f"Lot {lot_id} not found in index"
            )
        
        return IndexResponse(
            success=True,
            lot_id=lot_id,
            message="Lot deleted from index"
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
    Пакетная предобработка (для массовой загрузки лотов).
    
    **Использование:**
    При миграции существующих данных или импорте из внешних систем.
    """
    results = []
    
    for req in requests:
        try:
            normalized_title = preprocess_text(req.title)
            normalized_description = preprocess_text(req.description)
            normalized_keywords = preprocess_text(req.keywords or "")
            
            results.append(PreprocessResponse(
                normalized_title=" ".join(normalized_title),
                normalized_description=" ".join(normalized_description),
                normalized_keywords=" ".join(normalized_keywords)
            ))
        except Exception as e:
            logger.warning(f"Error preprocessing item: {e}")
            # Пропускаем проблемные записи
            continue
    
    return results