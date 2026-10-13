import os
import logging
import requests
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)


class RawgService:
    BASE_URL = 'https://api.rawg.io/api'
    TIMEOUT = (3, 5)  # (connect timeout, read timeout)

    @classmethod
    def get_api_key(cls):
        api_key = os.environ.get('API_RAWG_KEY')
        if not api_key:
            raise ValueError("API_RAWG_KEY no está configurada en el entorno.")
        return api_key

    @classmethod
    def search_games(cls, query):
        """Busca juegos en RAWG y devuelve una lista resumida con cache y timeout."""
        if not query or not query.strip():
            return []

        cleaned_query = query.strip()
        cache_key = f"rawg_search_{cleaned_query.lower()[:40]}"
        cached_result = cache.get(cache_key)
        if cached_result is not None:
            return cached_result

        params = {
            'key': cls.get_api_key(),
            'search': cleaned_query,
            'page_size': 10
        }
        try:
            response = requests.get(f"{cls.BASE_URL}/games", params=params, timeout=cls.TIMEOUT)
            response.raise_for_status()
            data = response.json()
        except requests.exceptions.RequestException as e:
            logger.error("Error al consultar RAWG search: %s", type(e).__name__)
            raise RuntimeError("Error al comunicarse con el servicio externo de RAWG.")

        results = []
        for item in data.get('results', []):
            results.append({
                'id': item.get('id'),
                'name': item.get('name'),
                'slug': item.get('slug'),
                'image_url': item.get('background_image')
            })

        # Cachear por 10 minutos (600 segundos)
        cache.set(cache_key, results, 600)
        return results

    @classmethod
    def get_game_details(cls, slug_or_id):
        """Devuelve todos los detalles de un juego, incluyendo géneros y descripción."""
        params = {
            'key': cls.get_api_key()
        }
        try:
            response = requests.get(f"{cls.BASE_URL}/games/{slug_or_id}", params=params, timeout=cls.TIMEOUT)
            if response.status_code == 404:
                return None
            response.raise_for_status()
            data = response.json()
        except requests.exceptions.RequestException as e:
            logger.error("Error al consultar RAWG details: %s", type(e).__name__)
            raise RuntimeError("Error al comunicarse con el servicio externo de RAWG.")

        return {
            'id': data.get('id'),
            'name': data.get('name'),
            'slug': data.get('slug'),
            'description': data.get('description_raw') or data.get('description', ''),
            'image_url': data.get('background_image'),
            'genres': [
                {
                    'id': g.get('id'),
                    'name': g.get('name'),
                    'slug': g.get('slug')
                } for g in data.get('genres', [])
            ]
        }
