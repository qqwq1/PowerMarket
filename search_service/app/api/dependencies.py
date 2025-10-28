"""
Зависимости для dependency injection
"""
from typing import Generator
from app.database.connection import get_db_connection
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

def get_db() -> Generator:
    """
    Dependency для получения соединения с БД.
    Автоматически закрывает соединение после использования.
    """
    conn = None
    try:
        conn = get_db_connection()
        yield conn
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        raise HTTPException(status_code=500, detail="Database connection error")
    finally:
        if conn:
            from app.database.connection import return_db_connection
            return_db_connection(conn)