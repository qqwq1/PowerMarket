from typing import List, Dict, Any, Optional, Tuple
from psycopg2.extras import RealDictCursor
import logging

logger = logging.getLogger(__name__)

def get_synonyms_for_word(connection, word: str) -> List[str]:
    """Получение синонимов для слова"""
    try:
        cursor = connection.cursor()
        cursor.execute(
            "SELECT synonym FROM synonyms WHERE LOWER(word) = LOWER(%s)",
            (word,)
        )
        synonyms = [row[0] for row in cursor.fetchall()]
        cursor.close()
        return synonyms
    except Exception as e:
        logger.error(f"Error fetching synonyms for '{word}': {e}")
        return []

def get_all_synonyms(connection) -> List[Tuple[str, str]]:
    """
    Получение всех синонимов для загрузки в Typesense.
    Возвращает список кортежей (word, synonym).
    """
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT word, synonym FROM synonyms ORDER BY word")
        results = cursor.fetchall()
        cursor.close()
        return results
    except Exception as e:
        logger.error(f"Error fetching all synonyms: {e}")
        return []

def get_all_synonyms_query(connection) -> List[Tuple[str, str]]:
    """Алиас для get_all_synonyms (для совместимости с API)"""
    return get_all_synonyms(connection)

def add_synonym_query(connection, word: str, synonym: str) -> bool:
    """Добавление синонима с проверкой дубликатов"""
    try:
        cursor = connection.cursor()
        
        # Проверка на существование
        cursor.execute(
            "SELECT 1 FROM synonyms WHERE LOWER(word) = LOWER(%s) AND LOWER(synonym) = LOWER(%s)",
            (word, synonym)
        )
        
        if cursor.fetchone():
            cursor.close()
            logger.info(f"Synonym already exists: {word} -> {synonym}")
            return False
        
        # Добавление
        cursor.execute(
            "INSERT INTO synonyms (word, synonym) VALUES (LOWER(%s), LOWER(%s))",
            (word, synonym)
        )
        connection.commit()
        cursor.close()
        
        logger.info(f"Added synonym: {word} -> {synonym}")
        return True
        
    except Exception as e:
        connection.rollback()
        logger.error(f"Error adding synonym: {e}")
        return False

def get_lot_by_id(connection, lot_id: int) -> Optional[Dict[str, Any]]:
    """Получение лота по ID"""
    try:
        cursor = connection.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            "SELECT * FROM lots WHERE id = %s",
            (lot_id,)
        )
        result = cursor.fetchone()
        cursor.close()
        
        return dict(result) if result else None
        
    except Exception as e:
        logger.error(f"Error fetching lot {lot_id}: {e}")
        return None

def get_all_services(connection, limit: int = 100) -> List[Dict[str, Any]]:
    """Получение всех активных услуг для индексации"""
    try:
        cursor = connection.cursor(cursor_factory=RealDictCursor)
        cursor.execute(
            """
            SELECT 
                s.id, s.title, s.description, s.category, s.location,
                s.price_per_day, s.capacity, s.technical_specs,
                s.is_active, s.supplier_id,
                EXTRACT(EPOCH FROM s.created_at)::bigint as created_at
            FROM services s
            WHERE s.is_active = TRUE
            ORDER BY s.id DESC
            LIMIT %s
            """,
            (limit,)
        )
        results = cursor.fetchall()
        cursor.close()
        
        return [dict(row) for row in results]
        
    except Exception as e:
        logger.error(f"Error fetching services: {e}")
        return []