import os
from rest_framework import serializers
from .models import User, Category, Game, Post, Comment, Image, PostMedia, Report


class PublicUserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'role', 'avatar', 'avatar_url']
        read_only_fields = ['id', 'username', 'role', 'avatar', 'avatar_url']

    def get_avatar_url(self, obj):
        request = self.context.get('request')
        if obj.avatar_image:
            if request:
                return request.build_absolute_uri(obj.avatar_image.url)
            return obj.avatar_image.url
        return obj.avatar or '👾'


class UserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    favorite_games_details = serializers.SerializerMethodField()
    favorite_games = serializers.PrimaryKeyRelatedField(
        queryset=Game.objects.all(),
        many=True,
        required=False
    )

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'role', 'bio', 'avatar',
            'avatar_image', 'avatar_url', 'banner_color', 'banner_url',
            'platforms', 'steam_id', 'discord_tag', 'favorite_games',
            'favorite_games_details', 'is_active', 'is_staff', 'date_joined'
        ]
        read_only_fields = [
            'username', 'email', 'role', 'is_active', 'is_staff',
            'date_joined', 'avatar_url', 'favorite_games_details'
        ]

    def get_avatar_url(self, obj):
        request = self.context.get('request')
        if obj.avatar_image:
            if request:
                return request.build_absolute_uri(obj.avatar_image.url)
            return obj.avatar_image.url
        return obj.avatar or '👾'

    def get_favorite_games_details(self, obj):
        return [
            {'id': g.id, 'name': g.name, 'slug': g.slug, 'image_url': g.image_url}
            for g in obj.favorite_games.all()
        ]

    def validate_platforms(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Platforms debe ser una lista.")
        allowed = {'PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Switch', 'Mobile'}
        if len(value) > 10:
            raise serializers.ValidationError("Máximo 10 plataformas permitidas.")
        for item in value:
            if not isinstance(item, str) or item not in allowed:
                raise serializers.ValidationError(
                    f"Plataforma '{item}' no válida. Opciones permitidas: {', '.join(sorted(allowed))}"
                )
        return value

    def validate_banner_color(self, value):
        if value:
            import re
            if not re.match(r'^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$', value.strip()):
                raise serializers.ValidationError("El color del banner debe ser un código hexadecimal válido (ej: #1e1b4b).")
        return value

    def validate_banner_url(self, value):
        if value:
            from urllib.parse import urlparse
            parsed = urlparse(value.strip())
            if parsed.scheme not in ('http', 'https'):
                raise serializers.ValidationError("La URL del banner debe usar HTTP o HTTPS.")
            ext = os.path.splitext(parsed.path)[1].lower()
            if ext and ext not in {'.jpg', '.jpeg', '.png', '.webp', '.gif'}:
                raise serializers.ValidationError("La URL del banner debe apuntar a una imagen válida (.jpg, .png, .webp, .gif).")
        return value

    def validate_avatar_image(self, value):
        if value:
            from .services.media_validator import validate_uploaded_file
            validate_uploaded_file(value, is_avatar=True)
        return value


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("La contraseña actual es incorrecta.")
        return value

    def validate_new_password(self, value):
        from django.contrib.auth.password_validation import validate_password
        validate_password(value, self.context['request'].user)
        return value


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def validate_email(self, value):
        if User.objects.filter(email=value, is_deleted=False).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=User.Role.USER
        )
        return user


class CategorySerializer(serializers.ModelSerializer):
    post_count = serializers.IntegerField(source='posts.count', read_only=True)

    class Meta:
        model = Category
        fields = '__all__'


class GameSerializer(serializers.ModelSerializer):
    post_count = serializers.IntegerField(source='posts.count', read_only=True)
    categories = CategorySerializer(source='genres', many=True, read_only=True)

    class Meta:
        model = Game
        fields = '__all__'


class PostMediaSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = PostMedia
        fields = ['id', 'media_type', 'file', 'media_url', 'url', 'order', 'created_at']
        read_only_fields = ['id', 'created_at', 'url']

    def get_url(self, obj):
        request = self.context.get('request')
        if obj.file:
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return obj.media_url or ''

    def validate_media_url(self, value):
        if value:
            from .services.media_validator import validate_media_url
            return validate_media_url(value)
        return value


class PostSerializer(serializers.ModelSerializer):
    user = PublicUserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True,
        required=False,
        allow_null=True
    )
    game = GameSerializer(read_only=True)
    game_id = serializers.PrimaryKeyRelatedField(
        queryset=Game.objects.all(),
        source='game',
        write_only=True,
        required=False,
        allow_null=True
    )
    media_items = PostMediaSerializer(many=True, read_only=True)
    mentioned_users = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'title', 'content', 'user', 'category', 'category_id',
            'game', 'game_id', 'media_items', 'mentioned_users',
            'created_at', 'updated_at', 'is_deleted'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_mentioned_users(self, obj):
        return [{'id': u.id, 'username': u.username, 'role': u.role} for u in obj.mentioned_users.all()]

    def validate(self, attrs):
        if not attrs.get('category') and not attrs.get('game'):
            raise serializers.ValidationError("Un post debe pertenecer a un juego (game) o a un género (category).")
        return attrs


class PostListSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    category = serializers.StringRelatedField()
    game = serializers.StringRelatedField()
    category_id = serializers.IntegerField(source='category.id', read_only=True)
    category_image = serializers.CharField(source='category.image_url', read_only=True)
    game_id = serializers.IntegerField(source='game.id', read_only=True)
    game_image = serializers.CharField(source='game.image_url', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    user_role = serializers.CharField(source='user.role', read_only=True)
    media_items = PostMediaSerializer(many=True, read_only=True)
    mentioned_users = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'title', 'content', 'user', 'user_id', 'user_role',
            'game', 'game_id', 'game_image', 'category', 'category_id',
            'category_image', 'media_items', 'mentioned_users',
            'created_at', 'is_deleted'
        ]

    def get_mentioned_users(self, obj):
        return [{'id': u.id, 'username': u.username, 'role': u.role} for u in obj.mentioned_users.all()]


class CommentSerializer(serializers.ModelSerializer):
    user = PublicUserSerializer(read_only=True)
    post_id = serializers.PrimaryKeyRelatedField(
        queryset=Post.objects.all(),
        source='post',
        write_only=True
    )
    mentioned_users = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'post_id', 'user', 'content', 'mentioned_users', 'created_at', 'updated_at', 'is_deleted']
        read_only_fields = ['created_at', 'updated_at']

    def get_mentioned_users(self, obj):
        return [{'id': u.id, 'username': u.username, 'role': u.role} for u in obj.mentioned_users.all()]


class ImageSerializer(serializers.ModelSerializer):
    post = PostSerializer(read_only=True)
    post_id = serializers.PrimaryKeyRelatedField(
        queryset=Post.objects.all(),
        source='post',
        write_only=True
    )

    class Meta:
        model = Image
        fields = ['id', 'post', 'post_id', 'image_url', 'created_at']


class ReportSerializer(serializers.ModelSerializer):
    user = PublicUserSerializer(read_only=True)
    post = serializers.StringRelatedField(read_only=True)
    comment = serializers.StringRelatedField(read_only=True)

    post_id = serializers.PrimaryKeyRelatedField(
        queryset=Post.objects.all(),
        source='post',
        write_only=True,
        required=False,
        allow_null=True
    )
    comment_id = serializers.PrimaryKeyRelatedField(
        queryset=Comment.objects.all(),
        source='comment',
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = Report
        fields = [
            'id', 'user', 'post', 'post_id', 'comment', 'comment_id',
            'reason', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']

    def validate(self, data):
        post = data.get('post')
        comment = data.get('comment')

        if not post and not comment:
            raise serializers.ValidationError("Debe especificar una publicación o un comentario para reportar.")
        if post and comment:
            raise serializers.ValidationError("Solo puede reportar una publicación O un comentario, no ambos a la vez.")

        return data
