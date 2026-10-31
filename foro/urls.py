from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from django.http import JsonResponse
from django.conf import settings

def health_check(request):
    return JsonResponse({"status": "ok", "service": "api"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health-check'),
    path('api/', include('foro_juegos.urls')),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]

if settings.DEBUG:
    from django.urls import re_path
    from django.views.static import serve

    def secure_media_serve(request, path, document_root=None, show_indexes=False):
        response = serve(request, path, document_root, show_indexes)
        response['X-Content-Type-Options'] = 'nosniff'
        content_type = response.get('Content-Type', '')
        if not (content_type.startswith('image/') or content_type.startswith('video/')):
            response['Content-Disposition'] = 'attachment'
        return response

    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', secure_media_serve, {'document_root': settings.MEDIA_ROOT}),
    ]
