from rest_framework import serializers
from .models import User, Category, Post, Comment, Image, Report


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'is_active', 'is_staff', 'date_joined']
        read_only_fields = ['role', 'is_active', 'is_staff', 'date_joined']


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=User.Role.USER
        )
        return user


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class PostSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True
    )

    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'user', 'category', 'category_id', 'created_at', 'updated_at', 'is_deleted']
        read_only_fields = ['created_at', 'updated_at']


class PostListSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    category = serializers.StringRelatedField()

    class Meta:
        model = Post
        fields = ['id', 'title', 'user', 'category', 'created_at', 'is_deleted']


class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    post = PostSerializer(read_only=True)
    post_id = serializers.PrimaryKeyRelatedField(
        queryset=Post.objects.all(),
        source='post',
        write_only=True
    )

    class Meta:
        model = Comment
        fields = ['id', 'post', 'post_id', 'user', 'content', 'created_at', 'updated_at', 'is_deleted']
        read_only_fields = ['created_at', 'updated_at']


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
        read_only_fields = ['created_at']


class ReportSerializer(serializers.ModelSerializer):
    reported_by = UserSerializer(read_only=True)
    post = PostSerializer(read_only=True)
    comment = CommentSerializer(read_only=True)
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
        fields = ['id', 'reported_by', 'post', 'post_id', 'comment', 'comment_id', 'reason', 'status', 'created_at']
        read_only_fields = ['created_at']

    def validate(self, attrs):
        post = attrs.get('post', self.instance.post if self.instance else None)
        comment = attrs.get('comment', self.instance.comment if self.instance else None)
        if not post and not comment:
            raise serializers.ValidationError('A report must reference a post or a comment.')
        return attrs
