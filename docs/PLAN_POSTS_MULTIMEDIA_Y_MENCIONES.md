# Plan de Implementación: Posts Multimedia (Estilo X) y Menciones (@)

Este documento detalla la arquitectura, especificaciones técnicas y pasos de ejecución para incorporar publicaciones con contenido multimedia (fotos y videos estilo X/Twitter) y sistema de menciones interactivas al foro.

---

## 1. Funcionamiento Multimedia (Inspirado en X / Twitter)

### A. Reglas de Contenido
- Cada publicación puede contener:
  - **Solo texto**.
  - **Texto + hasta 4 imágenes**.
  - **Texto + 1 video** (subida directa de archivo MP4/WebM o enlace de YouTube).
- No se mezclan múltiples imágenes con videos en una misma publicación para mantener la coherencia visual.

### B. Cuadrícula de Imágenes (Layout Adaptativo)
- **1 imagen**: Ancho completo con altura contenida y bordes redondeados.
- **2 imágenes**: 2 columnas simétricas lado a lado (50% / 50%).
- **3 imágenes**: 1 imagen destacada a la izquierda (50%) y 2 imágenes apiladas a la derecha.
- **4 imágenes**: Cuadrícula simétrica 2x2.
- **Visor Lightbox**: Clic en cualquier imagen para abrirla en pantalla completa con fondo oscuro y navegación entre imágenes adjuntas.

### C. Reproductor de Video
- Videos subidos (MP4/WebM): reproductor HTML5 con controles nativos (play/pause, volumen, barra de progreso y pantalla completa).
- Videos externos (YouTube): embed responsivo de alta definición integrado en la tarjeta del post.

### D. Creador de Publicaciones (`CreatePost`)
- Barra de herramientas inferior con botones de adjuntos:
  - 🖼️ **Imágenes**: subida de hasta 4 archivos o URLs.
  - 🎬 **Video**: subida de archivo de video (hasta 50 MB) o enlace de YouTube.
- **Previsualización interactiva**: miniaturas previas al envío con botón `✕` para remover cada archivo.

---

## 2. Sistema de Menciones (@usuario)

### A. Editor con Autocompletado (Posts y Comentarios)
- Al ingresar el caracter `@`, se despliega un popover flotante que busca usuarios en tiempo real según el texto escrito.
- Soporte para navegación con teclado (flechas y Enter) o clic para insertar `@usuario`.

### B. Parser y Visualización
- En el feed (`PostCard`), detalle del post (`PostDetail`) y comentarios:
  - Detección de patrones `@usuario`.
  - Conversión a etiquetas estilizadas retro/violeta clickeables que dirigen a la vista del perfil de ese usuario.

### C. Persistencia y Consultas en Backend
- Extracción automática de menciones existentes al guardar post o comentario.
- Asociación mediante relación `ManyToManyField` (`mentioned_users`).
- Endpoint filtrable: `/api/posts/?mentioned=usuario` para alimentar la sección de menciones en el perfil.

---

## 3. Plan de Cambios Técnicos

### Backend (Django REST Framework)
1. **Configuración de Media**:
   - `MEDIA_URL = '/media/'` y `MEDIA_ROOT = BASE_DIR / 'media'` en `foro/settings.py`.
   - Servicio estático de media en `foro/urls.py` para entorno de desarrollo.
2. **Modelos**:
   - `PostMedia`: campos `post`, `media_type` (`IMAGE`, `VIDEO`, `YOUTUBE`), `file`, `media_url`, `order`, `created_at`.
   - `Post`: relación `mentioned_users = ManyToManyField(User, related_name='mentioned_in_posts', blank=True)`.
   - `Comment`: relación `mentioned_users = ManyToManyField(User, related_name='mentioned_in_comments', blank=True)`.
3. **Servicio de Menciones** (`foro_juegos/services/mentions.py`):
   - Regex `@([a-zA-Z0-9_]{1,30})` para extraer menciones y sincronizarlas con la base de datos.
4. **Búsqueda de Usuarios**:
   - Acción `GET /api/users/search/?q=...` en `UserViewSet` para autocompletado rápido y seguro.
5. **Serializadores**:
   - `PostMediaSerializer` con URL resuelta para archivos locales o remotos.
   - Inclusión de `media_items` y `mentioned_users` en `PostSerializer`, `PostListSerializer` y `CommentSerializer`.
6. **Vistas**:
   - `PostViewSet`: soporte de creación con archivos adjuntos (`multipart/form-data`) o URLs, y filtro por `mentioned`.
   - `CommentViewSet`: sincronización de menciones en comentarios.

### Frontend (React + Vite)
1. **Nuevos Componentes**:
   - `src/components/MediaGrid.jsx`: cuadrícula flexible 1-4 imágenes y reproductor de video / YouTube.
   - `src/components/MediaLightbox.jsx`: visor modal de pantalla completa.
   - `src/components/FormattedContent.jsx`: parser de `@menciones` a enlaces interactivos.
   - Autocomplete flotante ante el caracter `@`.
2. **Vistas Actualizadas**:
   - `src/views/CreatePost.jsx`: barra de adjuntos, previews de imágenes/video y validaciones de límites.
   - `src/components/PostCard.jsx`: integración de `MediaGrid` y `FormattedContent`.
   - `src/views/PostDetail.jsx`: integración de `MediaGrid`, `FormattedContent` y soporte de menciones en comentarios.
   - `src/views/Profile.jsx`: pestaña/sección de publicaciones donde el usuario fue mencionado.
   - `src/services/forumService.js`: soporte para creación de post con archivos/URLs y búsqueda de usuarios.

---

## 4. Fases de Ejecución

1. **Fase 1**: Configuración de media en Django, modelos `PostMedia` y `mentioned_users`, migraciones, servicio de menciones y endpoints API.
2. **Fase 2**: Componentes frontend de visualización (`MediaGrid`, `MediaLightbox`, `FormattedContent`) y estilos CSS adaptativos.
3. **Fase 3**: Creador de posts multimedia (`CreatePost`) con previews, subida de archivos y enlaces de YouTube.
4. **Fase 4**: Autocompletado de menciones `@` en editor de posts y comentarios, y sección de menciones en `Profile`.
5. **Fase 5**: Pruebas completas de integración y validación.
