from django.core.management.base import BaseCommand
from foro_juegos.models import Game, Category
from foro_juegos.services.rawg_service import RawgService

class Command(BaseCommand):
    help = 'Actualiza todos los juegos existentes con los datos oficiales de RAWG usando su slug.'

    def handle(self, *args, **kwargs):
        games = Game.objects.all()
        self.stdout.write(f"Iniciando actualización de {games.count()} juegos...")
        
        for game in games:
            self.stdout.write(f"Buscando '{game.name}' (slug: {game.slug}) en RAWG...")
            try:
                game_data = RawgService.get_game_details(game.slug)
                if not game_data:
                    self.stderr.write(self.style.WARNING(f"  [!] No se encontró '{game.slug}' en RAWG. Asegúrate de que el slug sea idéntico al de RAWG."))
                    continue
                    
                # Update game
                game.name = game_data['name']
                game.description = game_data['description']
                game.image_url = game_data['image_url']
                game.save()
                
                # Update genres
                for genre_data in game_data.get('genres', []):
                    category, _ = Category.objects.get_or_create(
                        slug=genre_data['slug'],
                        defaults={
                            'name': genre_data['name'],
                            'description': f"Género oficial de RAWG: {genre_data['name']}"
                        }
                    )
                    game.genres.add(category)
                    
                self.stdout.write(self.style.SUCCESS(f"  [OK] '{game.name}' actualizado correctamente."))
            except Exception as e:
                self.stderr.write(self.style.ERROR(f"  [ERROR] Fallo al procesar '{game.slug}': {str(e)}"))
                
        self.stdout.write(self.style.SUCCESS("\nSincronización finalizada."))
