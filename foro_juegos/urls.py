from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    UserViewSet,
    CategoryViewSet,
    GameViewSet,
    PostViewSet,
    CommentViewSet,
    ImageViewSet,
    ReportViewSet,
    LogoutView
)

from .views_rawg import RawgSearchView, RawgImportView

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'games', GameViewSet)
router.register(r'posts', PostViewSet)
router.register(r'comments', CommentViewSet)
router.register(r'images', ImageViewSet)
router.register(r'reports', ReportViewSet)

urlpatterns = [
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', LogoutView.as_view(), name='token_logout'),
    path('rawg/search/', RawgSearchView.as_view(), name='rawg-search'),
    path('rawg/import/', RawgImportView.as_view(), name='rawg-import'),
    path('', include(router.urls)),
]
