import io
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from foro_juegos.models import User, Category, Game, Post, Comment


class SecurityReviewTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='regulargamer',
            email='private_email@example.com',
            password='OldPassword123!',
            role=User.Role.USER
        )
        self.admin = User.objects.create_user(
            username='superadmin',
            email='admin@example.com',
            password='AdminPassword123!',
            role=User.Role.ADMIN,
            is_staff=True
        )
        self.category = Category.objects.create(name='RPG', description='Role playing games')
        self.post = Post.objects.create(
            user=self.user,
            title='Public Post',
            content='This is public content for everyone',
            category=self.category
        )
        self.comment = Comment.objects.create(
            user=self.user,
            post=self.post,
            content='A public comment'
        )

    # 🚨 U1. Uploads rechazados por tipo y extensión peligrosa
    def test_upload_rejected_dangerous_file(self):
        self.client.force_authenticate(user=self.user)
        evil_file = SimpleUploadedFile(
            'evil.html',
            b'<script>alert("XSS")</script>',
            content_type='text/html'
        )
        response = self.client.post(
            '/api/posts/',
            {
                'title': 'Test Evil Upload',
                'content': 'Attempting to upload html',
                'category_id': self.category.id,
                'media_files': [evil_file]
            },
            format='multipart'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('seguridad', str(response.data).lower())

    def test_upload_rejected_fake_image_with_script(self):
        self.client.force_authenticate(user=self.user)
        fake_jpg = SimpleUploadedFile(
            'avatar.jpg',
            b'<script>alert("hacked")</script>',
            content_type='image/jpeg'
        )
        response = self.client.post(
            '/api/posts/',
            {
                'title': 'Test Fake JPG',
                'content': 'Attempting to upload fake jpg',
                'category_id': self.category.id,
                'media_files': [fake_jpg]
            },
            format='multipart'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # 🚨 U3. PII: email NO debe estar expuesto en endpoints públicos
    def test_public_endpoints_do_not_leak_user_email(self):
        self.client.logout()  # Lectura anónima
        # 1. Post list
        res_list = self.client.get('/api/posts/')
        self.assertEqual(res_list.status_code, status.HTTP_200_OK)
        self.assertNotIn('private_email@example.com', str(res_list.data))

        # 2. Post detail
        res_detail = self.client.get(f'/api/posts/{self.post.id}/')
        self.assertEqual(res_detail.status_code, status.HTTP_200_OK)
        self.assertNotIn('private_email@example.com', str(res_detail.data))
        # Verificar que el objeto user contiene solo campos públicos
        user_in_post = res_detail.data.get('user', {})
        self.assertNotIn('email', user_in_post)
        self.assertIn('username', user_in_post)

        # 3. Comments list
        res_comments = self.client.get(f'/api/comments/?post={self.post.id}')
        self.assertEqual(res_comments.status_code, status.HTTP_200_OK)
        self.assertNotIn('private_email@example.com', str(res_comments.data))

    # 🚨 U4. Validación de URLs de YouTube y medios
    def test_media_urls_validation_rejects_malicious_schemes(self):
        self.client.force_authenticate(user=self.user)
        # Javascript scheme en youtube_url
        res1 = self.client.post(
            '/api/posts/',
            {
                'title': 'Test Malicious URL',
                'content': 'Attempting javascript url',
                'category_id': self.category.id,
                'youtube_url': 'javascript:alert(1)'
            },
            format='json'
        )
        self.assertEqual(res1.status_code, status.HTTP_400_BAD_REQUEST)

        # Dominio no perteneciente a YouTube
        res2 = self.client.post(
            '/api/posts/',
            {
                'title': 'Test Fake YT Domain',
                'content': 'Attempting fake domain',
                'category_id': self.category.id,
                'youtube_url': 'https://evil.com/watch?v=12345678901'
            },
            format='json'
        )
        self.assertEqual(res2.status_code, status.HTTP_400_BAD_REQUEST)

    # 🟡 M1. USER común no puede importar de RAWG (403 Forbidden)
    def test_regular_user_cannot_import_rawg(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/rawg/import/', {'slug': 'elden-ring'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # 🟡 M4. Cambio de contraseña invalida tokens emitidos previamente
    def test_change_password_invalidates_jwt_refresh_token(self):
        self.client.force_authenticate(user=self.user)
        refresh = RefreshToken.for_user(self.user)
        refresh_str = str(refresh)

        # Cambiar contraseña
        change_res = self.client.post('/api/users/change-password/', {
            'current_password': 'OldPassword123!',
            'new_password': 'BrandNewPassword123!'
        })
        self.assertEqual(change_res.status_code, status.HTTP_200_OK)

        # Intentar usar el refresh token emitido antes del cambio
        refresh_res = self.client.post('/api/auth/refresh/', {'refresh': refresh_str})
        self.assertEqual(refresh_res.status_code, status.HTTP_401_UNAUTHORIZED)

    # 🟡 M5. /me/ no permite modificar username ni email
    def test_me_endpoint_cannot_modify_username_or_email(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.patch('/api/users/me/', {
            'username': 'impersonator',
            'email': 'hacked@example.com',
            'bio': 'Nueva bio gamer legítima'
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        # Recargar de la base de datos
        self.user.refresh_from_db()
        self.assertEqual(self.user.username, 'regulargamer')
        self.assertEqual(self.user.email, 'private_email@example.com')
        self.assertEqual(self.user.bio, 'Nueva bio gamer legítima')

    # 🔵 L2. Colisión de slug en Category y Game no da 500
    def test_category_and_game_slug_collision_handled_gracefully(self):
        cat1 = Category.objects.create(name='Accion Aventura')
        cat2 = Category.objects.create(name='Acción Aventura!')
        self.assertNotEqual(cat1.slug, cat2.slug)
        self.assertTrue(cat2.slug.startswith('accion-aventura-'))

        game1 = Game.objects.create(name='Doom Eternal')
        game2 = Game.objects.create(name='Doom Eternal!')
        self.assertNotEqual(game1.slug, game2.slug)
        self.assertTrue(game2.slug.startswith('doom-eternal-'))
