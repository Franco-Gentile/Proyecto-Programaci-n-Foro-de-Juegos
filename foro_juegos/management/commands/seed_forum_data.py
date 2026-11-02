from django.core.management.base import BaseCommand
from foro_juegos.models import Category, Game


class Command(BaseCommand):
    help = (
        'Carga datos iniciales del catálogo del foro (categorías y juegos base) '
        'de forma segura e idempotente. Para crear un administrador, usar: '
        'python manage.py createsuperuser'
    )

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Iniciando seed de catálogo para el foro..."))

        # 1. Categorías / Géneros
        categories_data = [
            {"name": "Acción", "slug": "action", "description": "Juegos de combate rápido, adrenalina y desafíos intensos."},
            {"name": "Aventura", "slug": "adventure", "description": "Historias inmersivas, exploración y resolución de enigmas."},
            {"name": "RPG", "slug": "role-playing-games-rpg", "description": "Juegos de rol con progresión de personajes e historias épicas."},
            {"name": "Shooter", "slug": "shooter", "description": "Disparos en primera y tercera persona, competitivos y cooperativos."},
            {"name": "Estrategia", "slug": "strategy", "description": "Tácticas en tiempo real y por turnos, gestión y toma de decisiones."},
            {"name": "Deportes", "slug": "sports", "description": "Simuladores deportivos y competencias atléticas."},
            {"name": "Simulación", "slug": "simulation", "description": "Simulación de vida, vehículos, negocios y mundos virtuales."},
            {"name": "Terror & Survival", "slug": "terror-survival", "description": "Atmósfera opresiva, supervivencia y horror."},
            {"name": "Indie", "slug": "indie", "description": "Joyas independientes, propuestas originales y arte creativo."},
        ]

        categories_map = {}
        for c in categories_data:
            cat = (
                Category.objects.filter(name__iexact=c['name']).first()
                or Category.objects.filter(slug=c['slug']).first()
            )
            if not cat:
                cat = Category.objects.create(
                    name=c['name'],
                    slug=c['slug'],
                    description=c['description'],
                )
            categories_map[c['name']] = cat
        self.stdout.write(self.style.SUCCESS(f"  Categorías listas ({len(categories_map)} registradas)."))

        # 2. Juegos destacados
        games_data = [
            {
                "name": "Counter-Strike 2",
                "slug": "counter-strike-2",
                "description": "El shooter táctico competitivo por excelencia de Valve.",
                "image_url": "https://media.rawg.io/media/games/736/736190922797705184be81363e773c08.jpg",
                "genre": "Shooter",
            },
            {
                "name": "League of Legends",
                "slug": "league-of-legends",
                "description": "MOBA estratégico de Riot Games donde compiten dos equipos de 5 campeones.",
                "image_url": "https://media.rawg.io/media/games/78b/78bc81e247fc7e163ade52728f91e24c.jpg",
                "genre": "Estrategia",
            },
            {
                "name": "The Witcher 3: Wild Hunt",
                "slug": "the-witcher-3-wild-hunt",
                "description": "Sigue a Geralt de Rivia en un mundo abierto de fantasía y monstruos.",
                "image_url": "https://media.rawg.io/media/games/618/618c2031a0709f735dd814e1300a53b6.jpg",
                "genre": "RPG",
            },
            {
                "name": "Elden Ring",
                "slug": "elden-ring",
                "description": "Obra maestra de acción y rol creada por FromSoftware y Hidetaka Miyazaki.",
                "image_url": "https://media.rawg.io/media/games/b29/b2960c74f56f64fb107ad46f47314522.jpg",
                "genre": "RPG",
            },
            {
                "name": "Minecraft",
                "slug": "minecraft",
                "description": "Explora mundos infinitos y construye cualquier cosa que imagines.",
                "image_url": "https://media.rawg.io/media/games/cc4/cc49527ec5bb08e14631620a8ff0f81d.jpg",
                "genre": "Aventura",
            },
            {
                "name": "Grand Theft Auto V",
                "slug": "grand-theft-auto-v",
                "description": "Acción en mundo abierto en la vibrante ciudad de Los Santos.",
                "image_url": "https://media.rawg.io/media/games/456/456dea5e1c7e3cd070250266b81a7a21.jpg",
                "genre": "Acción",
            },
        ]

        games_map = {}
        for g in games_data:
            game = (
                Game.objects.filter(name__iexact=g['name']).first()
                or Game.objects.filter(slug=g['slug']).first()
            )
            if not game:
                game = Game.objects.create(
                    name=g['name'],
                    slug=g['slug'],
                    description=g['description'],
                    image_url=g['image_url'],
                )
            if g['genre'] in categories_map:
                game.genres.add(categories_map[g['genre']])
            games_map[g['name']] = game
        self.stdout.write(self.style.SUCCESS(f"  Juegos listos ({len(games_map)} registrados)."))
        self.stdout.write(self.style.SUCCESS("Seeding completado exitosamente."))
