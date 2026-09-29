from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils.text import slugify

from .models import Game, Category
from .views import IsAdminOrModerator
from .services.rawg_service import RawgService


class RawgSearchView(APIView):
    """
    Busca juegos en la API de RAWG.
    Solo para uso de Administradores/Moderadores.
    """
    permission_classes = [IsAdminOrModerator]

    def get(self, request):
        query = request.query_params.get('q', '')
        if not query:
            return Response({"error": "Debe proveer un parámetro de búsqueda 'q'."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            results = RawgService.search_games(query)
            return Response({"results": results}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RawgImportView(APIView):
    """
    Importa un juego de la API de RAWG y lo guarda en la base de datos local.
    También importa y enlaza sus géneros.
    Solo para uso de Administradores/Moderadores.
    """
    permission_classes = [IsAdminOrModerator]

    def post(self, request):
        slug = request.data.get('slug')
        if not slug:
            return Response({"error": "Debe proveer un 'slug' en el cuerpo de la petición."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            game_data = RawgService.get_game_details(slug)
            if not game_data:
                return Response({"error": f"Juego con slug '{slug}' no encontrado en RAWG."}, status=status.HTTP_404_NOT_FOUND)
            
            # Crear o actualizar el juego principal
            game, created = Game.objects.update_or_create(
                slug=game_data['slug'],
                defaults={
                    'name': game_data['name'],
                    'description': game_data['description'],
                    'image_url': game_data['image_url']
                }
            )
            
            # Crear o actualizar los géneros (Categorías)
            for genre_data in game_data.get('genres', []):
                genre_slug = genre_data['slug']
                genre_name = genre_data['name']
                
                category, _ = Category.objects.get_or_create(
                    slug=genre_slug,
                    defaults={
                        'name': genre_name,
                        'description': f"Género: {genre_name}"
                    }
                )
                # Enlazarlos
                game.genres.add(category)
            
            from .serializers import GameSerializer
            serializer = GameSerializer(game)
            
            return Response({
                "message": "Juego importado exitosamente",
                "game": serializer.data
            }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
