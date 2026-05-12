from rest_framework import viewsets, permissions
from rest_framework.pagination import PageNumberPagination
from .models import User, Category, Post, Comment, Image, Report
from .serializers import (
    UserSerializer, UserCreateSerializer,
    CategorySerializer,
    PostSerializer, PostListSerializer,
    CommentSerializer,
    ImageSerializer,
    ReportSerializer
)


class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = StandardPagination

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    pagination_class = StandardPagination


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = StandardPagination

    def get_serializer_class(self):
        if self.action == 'list':
            return PostListSerializer
        return PostSerializer


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = StandardPagination


class ImageViewSet(viewsets.ModelViewSet):
    queryset = Image.objects.all()
    serializer_class = ImageSerializer
    pagination_class = StandardPagination


class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    pagination_class = StandardPagination