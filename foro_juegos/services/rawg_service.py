import os
import requests
from django.conf import settings

class RawgService:
    BASE_URL = 'https://api.rawg.io/api'

    @classmethod
    def get_api_key(cls):
        api_key = os.environ.get('API_RAWG_KEY')
        if not api_key:
            raise ValueError("API_RAWG_KEY no está configurada en el entorno.")
        return api_key

    @classmethod
    def search_games(cls, query):
        """Busca juegos en RAWG y devuelve una lista resumida."""
        params = {
            'key': cls.get_api_key(),
            'search': query,
            'page_size': 10
        }
        response = requests.get(f"{cls.BASE_URL}/games", params=params)
        response.raise_for_status()
        data = response.json()
        
        results = []
        for item in data.get('results', []):
            results.append({
                'id': item.get('id'),
                'name': item.get('name'),
                'slug': item.get('slug'),
                'image_url': item.get('background_image')
            })
        return results

    @classmethod
    def get_game_details(cls, slug_or_id):
        """Devuelve todos los detalles de un juego, incluyendo géneros y descripción."""
        params = {
            'key': cls.get_api_key()
        }
        response = requests.get(f"{cls.BASE_URL}/games/{slug_or_id}", params=params)
        
        if response.status_code == 404:
            return None
            
        response.raise_for_status()
        data = response.json()
        
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
