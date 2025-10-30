from collections import defaultdict

from dateutil import parser
from typesense import Client
from app.config import settings
import logging
from typing import Dict, Optional

from app.database.queries import get_all_synonyms

logger = logging.getLogger(__name__)

# Инициализация клиента Typesense
client = Client({
    'nodes': [{
        'host': settings.TYPESENSE_HOST,
        'port': settings.TYPESENSE_PORT,
        'protocol': settings.TYPESENSE_PROTOCOL
    }],
    'api_key': settings.TYPESENSE_API_KEY,
    'connection_timeout_seconds': 2
})

COLLECTION_NAME = 'services'

# Обновленная схема, соответствующая базе данных [1]
COLLECTION_SCHEMA = {
    'name': COLLECTION_NAME,
    'fields': [
        {'name': 'title', 'type': 'string'},
        {'name': 'description', 'type': 'string', 'optional': True},
        {'name': 'category', 'type': 'string', 'facet': True},
        {'name': 'location', 'type': 'string', 'optional': True, 'facet': True},
        {'name': 'capacity', 'type': 'string', 'optional': True},
        {'name': 'technical_specs', 'type': 'string', 'optional': True},
        {'name': 'supplier_id', 'type': 'string', 'facet': True},
        {'name': 'supplier_name', 'type': 'string', 'optional': True},
        {'name': 'price_per_day', 'type': 'float', 'optional': True},
        {'name': 'created_at', 'type': 'int64'},
    ],
    'default_sorting_field': 'created_at'
}


def init_collection():
    """
    Создает коллекцию в Typesense, только если она не существует.
    Это предотвращает потерю данных при перезапуске сервиса.
    """
    try:
        # Пытаемся получить информацию о коллекции
        client.collections[COLLECTION_NAME].retrieve()
        logger.info(f"Collection '{COLLECTION_NAME}' already exists. Skipping creation.")
    except Exception:
        # Если получаем ошибку (например, 404 Not Found), значит коллекции нет
        logger.info(f"Collection '{COLLECTION_NAME}' not found. Creating...")
        try:
            # Создаем коллекцию с нашей схемой
            client.collections.create(COLLECTION_SCHEMA)
            logger.info(f"Collection '{COLLECTION_NAME}' created successfully.")
        except Exception as create_error:
            logger.error(f"Failed to create collection '{COLLECTION_NAME}': {create_error}")
            raise create_error


def sync_synonyms_with_typesense(db_connection):
    """
    Читает все синонимы из PostgreSQL и загружает их в Typesense.
    Эта операция перезаписывает существующие синонимы в Typesense.
    """
    logger.info("Starting synonym synchronization with Typesense...")
    try:
        # 1. Получаем все синонимы из базы данных
        synonym_tuples = get_all_synonyms(db_connection)
        if not synonym_tuples:
            logger.info("No synonyms found in the database. Skipping sync.")
            return

        # 2. Группируем синонимы по основному слову (root word)
        # defaultdict(list) - удобный способ создать словарь со списками
        # получится {'трактор': ['мтз', 'беларус'], 'станок': ['чпу']}
        grouped_synonyms = defaultdict(list)
        for word, synonym in synonym_tuples:
            grouped_synonyms[word].append(synonym)

        logger.info(f"Found {len(synonym_tuples)} synonym pairs, grouped into {len(grouped_synonyms)} root words.")
        # 3. Загружаем каждый набор синонимов в Typesense
        for root_word, synonyms_list in grouped_synonyms.items():
            synonym_id = f"syn-{root_word}"  # Уникальный ID для набора синонимов

            # Формируем тело запроса для Typesense API
            synonym_data = {
                "synonyms": [root_word] + synonyms_list  # [трактор, мтз, беларус]
            }
            # Для односторонних синонимов, если нужно:
            # synonym_data = {
            #     "root": root_word,
            #     "synonyms": synonyms_list
            # }

            logger.debug(f"Upserting synonym: {synonym_id} -> {synonym_data}")
            client.collections[COLLECTION_NAME].synonyms.upsert(synonym_id, synonym_data)

        logger.info("✅ Successfully synchronized synonyms with Typesense.")

    except Exception as e:
        logger.error(f"❌ Failed to synchronize synonyms with Typesense: {e}", exc_info=True)


def index_service(service_data: dict) -> bool:
    """Индексация услуги в Typesense"""
    try:
        # Преобразуем дату в Unix timestamp
        created_at_ts = 0
        if service_data.get('created_at'):
            created_at_ts = int(parser.isoparse(service_data['created_at']).timestamp())

        # Документ для Typesense. Поле `id` теперь берется из данных
        document = {
            'id': str(service_data['id']), # ID документа должен быть строкой
            'title': service_data.get('title', ''),
            'description': service_data.get('description', ''),
            'category': service_data.get('category', ''),
            'location': service_data.get('location', ''),
            'capacity': service_data.get('capacity', ''),
            'technical_specs': service_data.get('technical_specs', ''),
            'supplier_id': str(service_data.get('supplier_id', '')),
            'supplier_name': service_data.get('supplier_name', ''),
            'price_per_day': float(service_data.get('price_per_day', 0.0)) if service_data.get('price_per_day') else 0.0,
            'created_at': created_at_ts
        }

        logger.info(f"Indexing document: {document['id']}")
        client.collections[COLLECTION_NAME].documents.upsert(document)
        logger.info(f"Document {document['id']} indexed successfully.")
        return True

    except Exception as e:
        logger.error(f"Error indexing service: {e}", exc_info=True)
        return False


def delete_service(service_id: int) -> bool:
    """Удаление услуги из индекса"""
    try:
        client.collections[COLLECTION_NAME].documents[str(service_id)].delete()
        logger.info(f"Document {service_id} deleted from index")
        return True
    except Exception as e:
        logger.error(f"Error deleting service: {e}")
        return False


def search_services(
        query: str,
        page: int = 1,
        per_page: int = 20,
        filters: Optional[Dict] = None
):
    """Поиск услуг в Typesense."""
    try:
        search_parameters = {
            'q': query,
            'query_by': 'title,description,category,technical_specs,supplier_name',
            'page': page,
            'per_page': per_page,
            'sort_by': '_text_match:desc,created_at:desc'
        }

        if filters:
            filter_strings = []
            if filters.get('category'):
                filter_strings.append(f"category:={filters['category']}")
            if filters.get('location'):
                filter_strings.append(
                    f"location:='{filters['location']}'")  # Для строк лучше использовать точное совпадение
            if filters.get('min_price') is not None:
                filter_strings.append(f"price_per_day:>={filters['min_price']}")
            if filters.get('max_price') is not None:
                filter_strings.append(f"price_per_day:<={filters['max_price']}")

            if filter_strings:
                search_parameters['filter_by'] = ' && '.join(filter_strings)

        logger.info(f"Executing Typesense search: {search_parameters}")
        results = client.collections[COLLECTION_NAME].documents.search(search_parameters)
        return results
    except Exception as e:
        logger.error(f"Typesense search failed: {e}", exc_info=True)
        raise