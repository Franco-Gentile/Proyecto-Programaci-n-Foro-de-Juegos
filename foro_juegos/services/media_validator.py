import os
import re
from urllib.parse import urlparse
from rest_framework.exceptions import ValidationError

ALLOWED_IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}
ALLOWED_IMAGE_MIMES = {'image/jpeg', 'image/png', 'image/webp', 'image/gif'}

ALLOWED_VIDEO_EXTENSIONS = {'.mp4', '.webm'}
ALLOWED_VIDEO_MIMES = {'video/mp4', 'video/webm'}

MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB
MAX_VIDEO_SIZE = 50 * 1024 * 1024  # 50 MB
MAX_AVATAR_SIZE = 5 * 1024 * 1024  # 5 MB

YOUTUBE_HOSTS = {'youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'}
YOUTUBE_ID_REGEX = re.compile(r'^[a-zA-Z0-9_-]{11}$')


def validate_uploaded_file(f, is_avatar=False):
    """
    Valida rigurosamente un archivo subido:
    - Extensión y MIME permitidos (rechaza html, svg, js, exe, etc.)
    - Límite de tamaño server-side
    - Validación de contenido real (magic bytes / Pillow)
    """
    if not f or not hasattr(f, 'name'):
        raise ValidationError("Archivo inválido.")

    ext = os.path.splitext(f.name)[1].lower()
    content_type = getattr(f, 'content_type', '').lower()
    file_size = getattr(f, 'size', 0)

    # Bloqueo explícito de extensiones peligrosas para prevenir Stored XSS
    dangerous_extensions = {'.html', '.htm', '.svg', '.xml', '.js', '.json', '.php', '.sh', '.py', '.exe'}
    if ext in dangerous_extensions or 'html' in content_type or 'svg' in content_type:
        raise ValidationError(f"Tipo de archivo no permitido por razones de seguridad ({ext}).")

    if is_avatar:
        if ext not in ALLOWED_IMAGE_EXTENSIONS:
            raise ValidationError(f"El avatar debe ser una imagen válida ({', '.join(ALLOWED_IMAGE_EXTENSIONS)}).")
        if file_size > MAX_AVATAR_SIZE:
            raise ValidationError(f"El avatar no puede superar los {MAX_AVATAR_SIZE // (1024*1024)} MB.")
        _verify_image_content(f, ext)
        return 'IMAGE'

    # Validar imágenes o videos para publicaciones
    is_image = ext in ALLOWED_IMAGE_EXTENSIONS and (not content_type or content_type in ALLOWED_IMAGE_MIMES)
    is_video = ext in ALLOWED_VIDEO_EXTENSIONS and (not content_type or content_type in ALLOWED_VIDEO_MIMES)

    if not is_image and not is_video:
        raise ValidationError(
            f"Formato no permitido para '{f.name}'. Solo se permiten imágenes ({', '.join(ALLOWED_IMAGE_EXTENSIONS)}) "
            f"o videos ({', '.join(ALLOWED_VIDEO_EXTENSIONS)})."
        )

    if is_image:
        if file_size > MAX_IMAGE_SIZE:
            raise ValidationError(f"La imagen '{f.name}' excede el tamaño máximo permitido de 10 MB.")
        _verify_image_content(f, ext)
        return 'IMAGE'

    if is_video:
        if file_size > MAX_VIDEO_SIZE:
            raise ValidationError(f"El video '{f.name}' excede el tamaño máximo permitido de 50 MB.")
        _verify_video_content(f, ext)
        return 'VIDEO'


def _verify_image_content(f, ext):
    """Verifica que el encabezado del archivo coincida con una imagen real."""
    f.seek(0)
    header = f.read(512)
    f.seek(0)

    # Rechazar si contiene etiquetas web disfrazadas
    header_lower = header.lower()
    if b'<script' in header_lower or b'<html' in header_lower or b'<!doctype' in header_lower or b'<svg' in header_lower:
        raise ValidationError("El archivo contiene contenido web no permitido.")

    # Verificar magic bytes
    if ext in {'.jpg', '.jpeg'}:
        if not header.startswith(b'\xff\xd8\xff'):
            raise ValidationError("El archivo no es una imagen JPEG válida.")
    elif ext == '.png':
        if not header.startswith(b'\x89PNG\r\n\x1a\n'):
            raise ValidationError("El archivo no es una imagen PNG válida.")
    elif ext == '.gif':
        if not (header.startswith(b'GIF87a') or header.startswith(b'GIF89a')):
            raise ValidationError("El archivo no es una imagen GIF válida.")
    elif ext == '.webp':
        if not (header.startswith(b'RIFF') and b'WEBP' in header[:16]):
            raise ValidationError("El archivo no es una imagen WEBP válida.")

    # Si Pillow está instalado, verificar integridad de imagen
    try:
        from PIL import Image
        img = Image.open(f)
        img.verify()
        f.seek(0)
    except ImportError:
        pass
    except Exception:
        raise ValidationError("El archivo de imagen está corrupto o no es válido.")


def _verify_video_content(f, ext):
    """Verifica que el archivo no contenga scripts y sea un video válido."""
    f.seek(0)
    header = f.read(512)
    f.seek(0)

    header_lower = header.lower()
    if b'<script' in header_lower or b'<html' in header_lower or b'<svg' in header_lower:
        raise ValidationError("El archivo de video contiene contenido no permitido.")

    if ext == '.webm':
        if not header.startswith(b'\x1a\x45\xdf\xa3'):
            raise ValidationError("El archivo no es un video WEBM válido.")


def validate_youtube_url(url):
    """Valida que una URL pertenezca estrictamente a YouTube con un video ID válido."""
    if not url or not isinstance(url, str):
        raise ValidationError("URL de YouTube inválida.")

    parsed = urlparse(url.strip())
    if parsed.scheme not in ('http', 'https'):
        raise ValidationError("La URL de YouTube debe usar el protocolo HTTP o HTTPS.")

    netloc = parsed.netloc.lower().split(':')[0]
    if netloc not in YOUTUBE_HOSTS:
        raise ValidationError("La URL no pertenece a un dominio válido de YouTube.")

    video_id = None
    if 'youtu.be' in netloc:
        video_id = parsed.path.lstrip('/')
    else:
        from urllib.parse import parse_qs
        qs = parse_qs(parsed.query)
        if 'v' in qs and qs['v']:
            video_id = qs['v'][0]
        elif parsed.path.startswith('/shorts/'):
            video_id = parsed.path.split('/shorts/')[1].split('/')[0]

    if not video_id or not YOUTUBE_ID_REGEX.match(video_id):
        raise ValidationError("No se pudo extraer un ID de video válido de YouTube.")

    return url.strip()


def validate_media_url(url):
    """Valida URLs de medios externos para prevenir javascript:, data: y esquemas no seguros."""
    if not url or not isinstance(url, str):
        raise ValidationError("URL de medio inválida.")

    parsed = urlparse(url.strip())
    if parsed.scheme not in ('http', 'https'):
        raise ValidationError("La URL de medio debe usar el protocolo HTTP o HTTPS.")

    host = parsed.netloc.lower().split(':')[0]
    # Protección básica SSRF contra localhost e IPs privadas
    if host in {'localhost', '127.0.0.1', '0.0.0.0', '::1'} or host.startswith('192.168.') or host.startswith('10.'):
        raise ValidationError("La URL no puede apuntar a direcciones locales o privadas.")

    return url.strip()
