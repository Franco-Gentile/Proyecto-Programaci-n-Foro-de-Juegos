from unittest.mock import patch
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from foro_juegos.models import User, Category, Game, Post, Comment, Report


class SecurityReviewTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='regulargamer',
            email='private_email@example.com',
            password='OldPassword123!',
            role=User.Role.USER
        )
        self.other_user = User.objects.create_user(
            username='othergamer',
            email='other@example.com',
            password='OtherPassword123!',
            role=User.Role.USER
        )
        self.moderator = User.objects.create_user(
            username='modgamer',
            email='mod@example.com',
            password='ModPassword123!',
            role=User.Role.MODERATOR,
            is_staff=True
        )
        self.other_moderator = User.objects.create_user(
            username='modgamer2',
            email='mod2@example.com',
            password='ModPassword123!',
            role=User.Role.MODERATOR,
            is_staff=True
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
            user=self.other_user,
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
        self.client.logout()
        # 1. Post list
        res_list = self.client.get('/api/posts/')
        self.assertEqual(res_list.status_code, status.HTTP_200_OK)
        self.assertNotIn('private_email@example.com', str(res_list.data))

        # 2. Post detail
        res_detail = self.client.get(f'/api/posts/{self.post.id}/')
        self.assertEqual(res_detail.status_code, status.HTTP_200_OK)
        self.assertNotIn('private_email@example.com', str(res_detail.data))
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

    # 🔴 Punto 7: RAWG search e import requieren autenticación
    def test_anonymous_user_cannot_search_or_import_rawg(self):
        self.client.logout()
        search_res = self.client.get('/api/rawg/search/?q=elden')
        self.assertEqual(search_res.status_code, status.HTTP_401_UNAUTHORIZED)

        import_res = self.client.post('/api/rawg/import/', {'slug': 'elden-ring'})
        self.assertEqual(import_res.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch('foro_juegos.services.rawg_service.RawgService.search_games')
    def test_authenticated_user_can_search_rawg(self, mock_search):
        mock_search.return_value = [{'id': 1, 'name': 'Elden Ring', 'slug': 'elden-ring', 'image_url': ''}]
        self.client.force_authenticate(user=self.user)
        res = self.client.get('/api/rawg/search/?q=elden')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data['results']), 1)

    # 🟡 M4. Cambio de contraseña invalida tokens emitidos previamente
    def test_change_password_invalidates_jwt_refresh_token(self):
        self.client.force_authenticate(user=self.user)
        refresh = RefreshToken.for_user(self.user)
        refresh_str = str(refresh)

        change_res = self.client.post('/api/users/change-password/', {
            'current_password': 'OldPassword123!',
            'new_password': 'BrandNewPassword123!'
        })
        self.assertEqual(change_res.status_code, status.HTTP_200_OK)

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

    # 🔴 Punto 6: Escalada de privilegios en change-role
    def test_moderator_and_regular_user_cannot_change_role(self):
        # Moderador (incluso con is_staff=True) NO puede cambiar roles ni promoverse a ADMIN
        self.client.force_authenticate(user=self.moderator)
        res_self = self.client.patch(
            f'/api/users/{self.moderator.id}/change-role/',
            {'role': User.Role.ADMIN},
            format='json'
        )
        self.assertEqual(res_self.status_code, status.HTTP_403_FORBIDDEN)
        self.moderator.refresh_from_db()
        self.assertEqual(self.moderator.role, User.Role.MODERATOR)

        res_other = self.client.patch(
            f'/api/users/{self.user.id}/change-role/',
            {'role': User.Role.MODERATOR},
            format='json'
        )
        self.assertEqual(res_other.status_code, status.HTTP_403_FORBIDDEN)

        # Usuario común tampoco puede cambiar roles
        self.client.force_authenticate(user=self.user)
        res_user = self.client.patch(
            f'/api/users/{self.user.id}/change-role/',
            {'role': User.Role.ADMIN},
            format='json'
        )
        self.assertEqual(res_user.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_change_other_user_role_but_not_own_role(self):
        self.client.force_authenticate(user=self.admin)
        # Admin no puede cambiarse el rol a sí mismo
        res_self = self.client.patch(
            f'/api/users/{self.admin.id}/change-role/',
            {'role': User.Role.USER},
            format='json'
        )
        self.assertEqual(res_self.status_code, status.HTTP_400_BAD_REQUEST)

        # Admin sí puede promover a un usuario a MODERATOR
        res_ok = self.client.patch(
            f'/api/users/{self.user.id}/change-role/',
            {'role': User.Role.MODERATOR},
            format='json'
        )
        self.assertEqual(res_ok.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.role, User.Role.MODERATOR)
        self.assertTrue(self.user.is_staff)

    # 🔴/🟢 Permisos y jerarquía de baneo
    def test_ban_permissions_and_hierarchy(self):
        # Moderador NO puede banear a un ADMIN
        self.client.force_authenticate(user=self.moderator)
        res_ban_admin = self.client.post(f'/api/users/{self.admin.id}/ban/', {}, format='json')
        self.assertEqual(res_ban_admin.status_code, status.HTTP_403_FORBIDDEN)
        self.admin.refresh_from_db()
        self.assertTrue(self.admin.is_active)

        # Moderador NO puede banear a otro MODERATOR
        res_ban_mod = self.client.post(f'/api/users/{self.other_moderator.id}/ban/', {}, format='json')
        self.assertEqual(res_ban_mod.status_code, status.HTTP_403_FORBIDDEN)
        self.other_moderator.refresh_from_db()
        self.assertTrue(self.other_moderator.is_active)

        # Moderador SÍ puede banear a un USER común e invalidar su refresh token
        refresh = RefreshToken.for_user(self.other_user)
        res_ban_user = self.client.post(f'/api/users/{self.other_user.id}/ban/', {}, format='json')
        self.assertEqual(res_ban_user.status_code, status.HTTP_200_OK)
        self.other_user.refresh_from_db()
        self.assertFalse(self.other_user.is_active)

        # El refresh token del usuario baneado queda en blacklist
        refresh_res = self.client.post('/api/auth/refresh/', {'refresh': str(refresh)})
        self.assertEqual(refresh_res.status_code, status.HTTP_401_UNAUTHORIZED)

    # 🟡 Punto 12: Permisos de fijar comentarios (pin) y límite de 2 fijados
    def test_pin_comment_permissions_and_limit(self):
        c2 = Comment.objects.create(user=self.other_user, post=self.post, content='Second comment')
        c3 = Comment.objects.create(user=self.other_user, post=self.post, content='Third comment')

        # Usuario que NO es el creador del post no puede fijar comentarios
        self.client.force_authenticate(user=self.other_user)
        res_forbidden = self.client.post(f'/api/comments/{self.comment.id}/pin/')
        self.assertEqual(res_forbidden.status_code, status.HTTP_403_FORBIDDEN)

        # El creador del post sí puede fijar hasta 2 comentarios
        self.client.force_authenticate(user=self.user)
        res1 = self.client.post(f'/api/comments/{self.comment.id}/pin/')
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        self.assertTrue(res1.data['is_pinned'])

        res2 = self.client.post(f'/api/comments/{c2.id}/pin/')
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertTrue(res2.data['is_pinned'])

        # Intentar fijar un 3er comentario devuelve 400
        res3 = self.client.post(f'/api/comments/{c3.id}/pin/')
        self.assertEqual(res3.status_code, status.HTTP_400_BAD_REQUEST)

    # 🟡 Punto 12: Likes en posts y comentarios
    def test_like_post_and_comment_toggle(self):
        self.client.logout()
        anon_res = self.client.post(f'/api/posts/{self.post.id}/like/')
        self.assertEqual(anon_res.status_code, status.HTTP_401_UNAUTHORIZED)

        self.client.force_authenticate(user=self.other_user)
        like_res = self.client.post(f'/api/posts/{self.post.id}/like/')
        self.assertEqual(like_res.status_code, status.HTTP_200_OK)
        self.assertTrue(like_res.data['is_liked'])
        self.assertEqual(like_res.data['likes_count'], 1)

        unlike_res = self.client.post(f'/api/posts/{self.post.id}/like/')
        self.assertEqual(unlike_res.status_code, status.HTTP_200_OK)
        self.assertFalse(unlike_res.data['is_liked'])
        self.assertEqual(unlike_res.data['likes_count'], 0)

        c_like = self.client.post(f'/api/comments/{self.comment.id}/like/')
        self.assertEqual(c_like.status_code, status.HTTP_200_OK)
        self.assertTrue(c_like.data['is_liked'])
        self.assertEqual(c_like.data['likes_count'], 1)

    # 🟡 Puntos 9 y 12: Reportes con estados RESOLVED / DISMISSED y serializer limpio
    def test_report_creation_and_moderation_statuses(self):
        self.client.force_authenticate(user=self.user)
        create_res = self.client.post(
            '/api/reports/',
            {'post_id': self.post.id, 'reason': 'Spam en el foro'},
            format='json'
        )
        self.assertEqual(create_res.status_code, status.HTTP_201_CREATED)
        report_id = create_res.data['id']
        self.assertIn('reported_by', create_res.data)
        self.assertNotIn('user', create_res.data)
        self.assertNotIn('reporter', create_res.data)
        self.assertNotIn('post_id', create_res.data)

        # Usuario común no puede listar ni cambiar estado del reporte
        list_forbidden = self.client.get('/api/reports/')
        self.assertEqual(list_forbidden.status_code, status.HTTP_403_FORBIDDEN)
        patch_forbidden = self.client.patch(
            f'/api/reports/{report_id}/',
            {'status': 'RESOLVED'},
            format='json'
        )
        self.assertEqual(patch_forbidden.status_code, status.HTTP_403_FORBIDDEN)

        # Moderador sí puede resolver y descartar reportes
        self.client.force_authenticate(user=self.moderator)
        resolve_res = self.client.patch(
            f'/api/reports/{report_id}/',
            {'status': 'RESOLVED'},
            format='json'
        )
        self.assertEqual(resolve_res.status_code, status.HTTP_200_OK)
        self.assertEqual(resolve_res.data['status'], 'RESOLVED')

        dismiss_res = self.client.patch(
            f'/api/reports/{report_id}/',
            {'status': 'DISMISSED'},
            format='json'
        )
        self.assertEqual(dismiss_res.status_code, status.HTTP_200_OK)
        self.assertEqual(dismiss_res.data['status'], 'DISMISSED')
