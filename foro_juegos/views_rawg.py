import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, throttling
from django.utils.text import slugify

from .models import Game, Category
from .services.rawg_service import RawgService

logger = logging.getLogger(__name__)


class RawgSearchView(APIView):
    """
    Busca juegos en la API de RAWG con rate limiting.
    Disponible para todos los usuarios con rate limiting.
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = [throttling.AnonRateThrottle, throttling.UserRateThrottle]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if not query or len(query) < 2:
            return Response({"error": "Debe proveer un parámetro de búsqueda 'q' con al menos 2 caracteres."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            results = RawgService.search_games(query)
            return Response({"results": results}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error("Error en RawgSearchView: %s", e)
            return Response({"error": "Error al comunicarse con el servicio de RAWG."}, status=status.HTTP_502_BAD_GATEWAY)


class RawgImportView(APIView):
    """
    Importa un juego de la API de RAWG y lo guarda en la base de datos local.
    Habilitado para cualquier usuario autenticado para que puedan crear posts sobre juegos nuevos.
    """
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [throttling.UserRateThrottle]

    def post(self, request):
        slug = request.data.get('slug')
        if not slug:
            return Response({"error": "Debe proveer un 'slug' en el cuerpo de la petición."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            game_data = RawgService.get_game_details(slug)
            if not game_data:
                return Response({"error": f"Juego con slug '{slug}' no encontrado en RAWG."}, status=status.HTTP_404_NOT_FOUND)

            game_slug = (game_data.get('slug') or slugify(game_data.get('name', 'juego')))[:150]
            game_name = (game_data.get('name') or game_slug)[:100]

            # Buscar por slug o por nombre (case-insensitive) para evitar errores de unicidad
            game = Game.objects.filter(slug=game_slug).first() or Game.objects.filter(name__iexact=game_name).first()
            created = False
            if game:
                if game_data.get('description'):
                    game.description = game_data['description']
                if game_data.get('image_url'):
                    game.image_url = game_data['image_url']
                game.save()
            else:
                game = Game.objects.create(
                    slug=game_slug,
                    name=game_name,
                    description=game_data.get('description', ''),
                    image_url=game_data.get('image_url', '')
                )
                created = True

            # Crear o actualizar los géneros (Categorías) de forma segura contra colisiones de name/slug
            for genre_data in game_data.get('genres', []):
                genre_slug = (genre_data.get('slug') or slugify(genre_data.get('name', 'genero')))[:150]
                genre_name = (genre_data.get('name') or genre_slug)[:100]

                # Buscar primero por name para respetar el unique=True en Category.name
                category = Category.objects.filter(name__iexact=genre_name).first()
                if not category:
                    category = Category.objects.filter(slug=genre_slug).first()
                if not category:
                    category = Category.objects.create(
                        slug=genre_slug,
                        name=genre_name,
                        description=f"Género: {genre_name}"
                    )
                game.genres.add(category)

            from .serializers import GameSerializer
            serializer = GameSerializer(game)

            return Response({
                "message": "Juego importado exitosamente",
                "game": serializer.data
            }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

        except Exception as e:
            logger.error("Error en RawgImportView: %s", e)
            return Response({"error": "Error interno al importar juego de RAWG."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
