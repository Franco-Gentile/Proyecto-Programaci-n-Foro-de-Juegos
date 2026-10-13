from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status
from foro_juegos.models import User, Category, Game, Post, Comment, PostMedia
from foro_juegos.services.mentions import extract_mentions, sync_mentions


class MediaAndMentionsTests(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            username='gamer_one',
            email='gamer1@example.com',
            password='Password123!',
            role=User.Role.USER
        )
        self.user2 = User.objects.create_user(
            username='streamer_pro',
            email='streamer@example.com',
            password='Password123!',
            role=User.Role.USER
        )
        self.game = Game.objects.create(name='Cyberpunk 2077', slug='cyberpunk-2077')
        self.category = Category.objects.create(name='RPG', slug='rpg')

        self.client = APIClient()
        self.client.force_authenticate(user=self.user1)

    def test_extract_mentions(self):
        text = "Hola @streamer_pro, mirá este clip de @inexistente y @gamer_one!"
        mentions = extract_mentions(text)
        self.assertIn('streamer_pro', mentions)
        self.assertIn('gamer_one', mentions)
        self.assertIn('inexistente', mentions)
        self.assertEqual(len(mentions), 3)

    def test_sync_mentions_links_existing_users(self):
        post = Post.objects.create(
            user=self.user1,
            game=self.game,
            title='Mención test',
            content='Hola @streamer_pro y @fantasma!'
        )
        sync_mentions(post, post.content)
        self.assertEqual(post.mentioned_users.count(), 1)
        self.assertTrue(post.mentioned_users.filter(username='streamer_pro').exists())

    def test_user_search_endpoint(self):
        response = self.client.get('/api/users/search/?q=streamer')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        usernames = [u['username'] for u in response.data]
        self.assertIn('streamer_pro', usernames)
        self.assertNotIn('gamer_one', usernames)  # exclude self

    def test_create_post_with_media_urls_and_youtube(self):
        payload = {
            'title': 'Gameplay increíble',
            'content': 'Miren este video @streamer_pro',
            'game_id': self.game.id,
            'youtube_url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'media_urls': ['https://images.unsplash.com/photo-1542751371-adc38448a05e']
        }
        response = self.client.post('/api/posts/', data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        post_id = response.data['id']
        post = Post.objects.get(id=post_id)

        self.assertEqual(post.media_items.count(), 2)
        media_types = list(post.media_items.values_list('media_type', flat=True))
        self.assertIn(PostMedia.MediaType.YOUTUBE, media_types)
        self.assertIn(PostMedia.MediaType.IMAGE, media_types)
        self.assertTrue(post.mentioned_users.filter(username='streamer_pro').exists())

    def test_create_post_with_uploaded_file(self):
        dummy_image = SimpleUploadedFile(
            name='screenshot.jpg',
            content=b'\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00\x05\x04\x04\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x44\x01\x00\x3b',
            content_type='image/jpeg'
        )
        response = self.client.post(
            '/api/posts/',
            data={
                'title': 'Captura de pantalla',
                'content': 'Hermoso paisaje en Cyberpunk',
                'game_id': self.game.id,
                'media_files': [dummy_image]
            },
            format='multipart'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        post = Post.objects.get(id=response.data['id'])
        self.assertEqual(post.media_items.count(), 1)
        self.assertEqual(post.media_items.first().media_type, PostMedia.MediaType.IMAGE)
        self.assertTrue(bool(post.media_items.first().file))

    def test_filter_posts_by_mentioned_user(self):
        post = Post.objects.create(
            user=self.user1,
            game=self.game,
            title='Post con etiqueta',
            content='Aviso para @streamer_pro'
        )
        sync_mentions(post, post.content)

        response = self.client.get('/api/posts/?mentioned=streamer_pro')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        post_ids = [p['id'] for p in results]
        self.assertIn(post.id, post_ids)

    def test_update_user_profile(self):
        payload = {
            'bio': 'Gamer retro de corazón.',
            'avatar': '🧙‍♂️',
            'banner_color': '#10b981',
            'platforms': ['PC', 'PlayStation'],
            'discord_tag': 'gamer#1234',
            'steam_id': 'gamer_pro_steam'
        }
        response = self.client.patch('/api/users/me/', data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user1.refresh_from_db()
        self.assertEqual(self.user1.bio, 'Gamer retro de corazón.')
        self.assertEqual(self.user1.avatar, '🧙‍♂️')
        self.assertIn('PC', self.user1.platforms)
        self.assertEqual(self.user1.discord_tag, 'gamer#1234')

    def test_change_password(self):
        payload = {
            'current_password': 'Password123!',
            'new_password': 'NewSecurePassword456!'
        }
        response = self.client.post('/api/users/change-password/', data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user1.refresh_from_db()
        self.assertTrue(self.user1.check_password('NewSecurePassword456!'))

