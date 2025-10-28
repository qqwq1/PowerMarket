import time

import typesense
from typesense.exceptions import ObjectNotFound, TypesenseClientError
from app.config import settings
import logging
from typing import List, Dict, Any, Optional


logger = logging.getLogger(__name__)

# Инициализация клиента
try:
    client = typesense.Client({
        'nodes': [{
            'host': settings.TYPESENSE_HOST,
            'port': settings.TYPESENSE_PORT,
            'protocol': settings.TYPESENSE_PROTOCOL
        }],
        'api_key': settings.TYPESENSE_API_KEY,
        'connection_timeout_seconds': 5
    })
except Exception as e:
    logger.error(f"Failed to initialize Typesense client: {e}")
    raise

COLLECTION_NAME = 'services'

def init_collection():
    """Инициализация коллекции services при запуске"""
    schema = {
        'name': COLLECTION_NAME,
        'fields': [
            {'name': 'title', 'type': 'string'},
            {'name': 'description', 'type': 'string'},
            {'name': 'category', 'type': 'string', 'facet': True},
            {'name': 'location', 'type': 'string', 'facet': True},
            {'name': 'price_per_day', 'type': 'float'},
            {'name': 'capacity', 'type': 'string', 'optional': True},
            {'name': 'technical_specs', 'type': 'string', 'optional': True},
            {'name': 'is_active', 'type': 'bool'},
            {'name': 'supplier_id', 'type': 'int32'},
            {'name': 'created_at', 'type': 'int64'}
        ]
    }

    max_retries = 10
    retry_delay = 2

    for attempt in range(max_retries):
        try:
            # Проверяем существование коллекции
            try:
                client.collections[COLLECTION_NAME].retrieve()
                logger.info(f"Collection '{COLLECTION_NAME}' already exists")
                return
            except ObjectNotFound:
                pass

            # Создаем коллекцию
            client.collections.create(schema)
            logger.info(f"Created collection: {COLLECTION_NAME}")
            init_synonyms()
            return

        except Exception as e:
            if attempt < max_retries - 1:
                logger.warning(f"Failed to connect to Typesense (attempt {attempt + 1}/{max_retries}): {e}")
                time.sleep(retry_delay)
            else:
                logger.error(f"Failed to initialize collection after {max_retries} attempts")
                raise


def init_synonyms():
    """Загрузка синонимов из PostgreSQL в Typesense"""
    from app.database.connection import get_db
    from app.database.queries import get_all_synonyms
    
    try:
        with get_db() as conn:
            synonyms_data = get_all_synonyms(conn)
            
            if not synonyms_data:
                logger.warning("No synonyms found in database")
                return
            
            # Группируем по основному слову
            synonym_groups = {}
            for word, synonym in synonyms_data:
                if word not in synonym_groups:
                    synonym_groups[word] = set([word])
                synonym_groups[word].add(synonym)
            
            # Загружаем в Typesense
            for word, synonyms in synonym_groups.items():
                synonym_config = {
                    'synonyms': list(synonyms)
                }
                
                try:
                    client.collections[COLLECTION_NAME].synonyms.upsert(
                        f'synonym-{word}',
                        synonym_config
                    )
                except Exception as e:
                    logger.warning(f"Error adding synonym for '{word}': {e}")
        
        logger.info(f"Loaded {len(synonym_groups)} synonym groups")
        
    except Exception as e:
        logger.error(f"Error loading synonyms: {e}")

def index_service(service_data: Dict[str, Any]) -> bool:
    """
    Индексация услуги в Typesense.
    
    Args:
        service_data: словарь с данными услуги
        
    Returns:
        True если успешно
    """
    try:
        # Валидация обязательных полей
        required_fields = ['id', 'title']
        for field in required_fields:
            if field not in service_data:
                logger.error(f"Service data missing '{field}' field")
                return False
        
        document = {
            'id': str(service_data['id']),
            'title': service_data.get('title', ''),
            'description': service_data.get('description', ''),
            'category': service_data.get('category', ''),
            'location': service_data.get('location', ''),
            'price_per_day': float(service_data.get('price_per_day', 0)),
            'capacity': service_data.get('capacity', ''),
            'technical_specs': service_data.get('technical_specs', ''),
            'is_active': service_data.get('is_active', True),
            'supplier_id': int(service_data.get('supplier_id', 0)),
            'created_at': int(service_data.get('created_at', 0))
        }
        
        client.collections[COLLECTION_NAME].documents.upsert(document)
        logger.info(f"Indexed service: {document['id']}")
        return True
        
    except TypesenseClientError as e:
        logger.error(f"Typesense error indexing service: {e}")
        return False
    except Exception as e:
        logger.error(f"Error indexing service {service_data.get('id')}: {e}")
        return False

def search_services(
    query: str,
    limit: int = 20,
    offset: int = 0,
    filters: Optional[str] = None
) -> Dict[str, Any]:
    """
    Поиск услуг через Typesense.
    
    Args:
        query: поисковой запрос
        limit: количество результатов
        offset: смещение для пагинации
        filters: фильтры (например: "location:Екатеринбург && category:Металлообработка")
        
    Returns:
        Результаты поиска
    """
    try:
        search_params = {
            'q': query,
            'query_by': 'title,description,category,technical_specs',
            'query_by_weights': '4,3,2,1',
            'prefix': 'true',
            'num_typos': 2,
            'typo_tokens_threshold': 1,
            'per_page': limit,
            'page': (offset // limit) + 1 if limit > 0 else 1,
            'filter_by': 'is_active:true'  # Показываем только активные
        }
        
        # Добавляем дополнительные фильтры
        if filters:
            search_params['filter_by'] += f' && {filters}'
        
        results = client.collections[COLLECTION_NAME].documents.search(search_params)
        
        return {
            'hits': [hit['document'] for hit in results['hits']],
            'found': results['found'],
            'page': results['page']
        }
        
    except TypesenseClientError as e:
        logger.error(f"Typesense search error: {e}")
        return {'hits': [], 'found': 0, 'page': 1}
    except Exception as e:
        logger.error(f"Error searching: {e}")
        return {'hits': [], 'found': 0, 'page': 1}

def delete_service(service_id: str) -> bool:
    """Удаление услуги из индекса"""
    try:
        client.collections[COLLECTION_NAME].documents[str(service_id)].delete()
        logger.info(f"Deleted service: {service_id}")
        return True
    except ObjectNotFound:
        logger.warning(f"Service {service_id} not found in index")
        return False
    except Exception as e:
        logger.error(f"Error deleting service {service_id}: {e}")
        return False