# Plan de Implementación: Buscador Interactivo de Juegos/Géneros & Edición de Perfil

Este documento detalla la arquitectura, experiencia de usuario y plan de desarrollo para dos mejoras clave:
1. **Buscador interactivo de juegos y géneros al crear publicaciones** (reemplazando el selector clásico con la experiencia de búsqueda predictiva del foro).
2. **Sistema completo de configuración y edición de perfil gamer**.
3. **Propuestas e ideas adicionales para debatir**.

---

## 1. Mejora 1: Buscador Interactivo de Juegos/Géneros en Publicaciones

### El Problema Actual
Actualmente, `CreatePost.jsx` utiliza un `<select>` nativo de HTML que lista los juegos en un menú desplegable plano. A medida que el catálogo de juegos y géneros crece, encontrar un juego específico se vuelve lento e incómodo, y no permite diferenciar claramente entre juegos específicos y géneros generales.

### Solución Propuesta (`GameCategoryPicker.jsx`)
Inspirado en el buscador predictivo con cápsula y dropdown de dos secciones del `Navbar`:

1. **Estado Inicial / Cerrado**:
   - Muestra una cápsula de selección:
     - Placeholder: *"Escribí el nombre del juego o género (ej: Elden Ring, RPG, Terror, LoL...)"*.
     - Icono de lupa y botón para limpiar `✕`.
   - Si ya hay un elemento seleccionado, se muestra una tarjeta destacada:
     - Badge retro: `🎮 Juego: [Nombre]` o `🏷️ Género: [Nombre]`
     - Thumbnail/carátula miniatura del juego o género.
     - Botón `✕ Cambiar` para reabrir la búsqueda al instante.

2. **Menú Desplegable Flotante (`search-suggestions-dropdown`)**:
   - Se activa al hacer foco o al escribir (con debounce de 200ms).
   - Divide los resultados en **dos secciones bien diferenciadas**:
     - 🎮 **JUEGOS**: Muestra juegos coincidentes con carátula miniatura, nombre y descripción.
     - 🏷️ **GÉNEROS / CATEGORÍAS**: Muestra géneros coincidentes con su badge temático.
   - **Chips de Acceso Rápido**: Si el campo de búsqueda está vacío, muestra los 4 o 5 juegos y géneros más populares del foro para seleccionarlos con un solo clic sin necesidad de escribir.
   - Navegación con teclado (`↑`, `↓`, `Enter`, `Escape`) y cierre al hacer clic fuera.

---

## 2. Mejora 2: Edición y Configuración de Perfil Gamer

### El Problema Actual
El perfil actual (`Profile.jsx`) solo muestra datos de solo lectura (username, email, fecha de ingreso y cantidad de posts). No hay ninguna pantalla o modal de ajustes para que el jugador personalice su identidad en la comunidad o gestione su seguridad.

### Solución Propuesta (Panel / Modal de "⚙️ Editar Perfil & Configuración")

Dividido en **dos pestañas** dentro de un modal o vista de ajustes retro:

#### A. Pestaña: "🎮 Identidad Gamer"
1. **Avatar del Jugador**:
   - Selector rápido de **Avatares Pixel-Art Retro**: (👾, 🎮, 🕹️, 🧙‍♂️, 🤖, 🦊, ⚔️, 🥷, 🐉, 🚀, 💀, 🛡️).
   - Opción para subir **foto personalizada** o ingresar **URL de avatar**.
2. **Biografía Gamer**:
   - Campo de texto (hasta 180 caracteres) para que el usuario cuente qué juega, plataformas o rol (ej: *"Main Support en LoL, fanático de los Soulsborne y cazador de platinos en PlayStation"*).
3. **Plataformas de Juego**:
   - Checkboxes de selección múltiple con iconos retro:
     - 💻 PC Master Race
     - 🎮 PlayStation
     - 🟢 Xbox
     - 🔴 Nintendo Switch
     - 📱 Mobile
4. **Perfiles Sociales / Gamertags**:
   - Steam ID / Perfil de Steam
   - Discord Tag
   - Twitch / Kick
   - PlayStation Network / Xbox Gamertag

#### B. Pestaña: "🔒 Cuenta y Seguridad"
1. **Actualizar Email**.
2. **Cambiar Contraseña**:
   - Contraseña actual.
   - Nueva contraseña y confirmación con validación de requisitos.
3. **Zona de Peligro**:
   - Desactivar o cerrar sesión en todos los dispositivos.

---

## 3. Ideas Adicionales para Debatir

A continuación te presento 4 ideas que sumarían mucho valor a estas dos funcionalidades para que me digas cuáles te interesan:

1. **Integración con RAWG en el Buscador de Posts**:
   - Si un usuario busca un juego que todavía no está en la base de datos del foro (ej: *"Hollow Knight Silksong"*), el buscador podría consultar la API de RAWG y ofrecer: *"¿No encontrás tu juego? Importarlo desde RAWG con 1 clic"*.
2. **Banner / Fondo de Perfil Personalizado**:
   - Permitir a cada usuario elegir un tema de color retro (Neon Cyberpunk, GameBoy Verde, 8-Bit Sunset, Dark Souls) o subir una imagen de portada/banner para su perfil.
3. **Juegos Favoritos en el Perfil**:
   - Un estante virtual con los *"Top 3 Juegos Favoritos"* del usuario mostrados en su perfil con las carátulas del catálogo.
4. **Insignias y Logros de Perfil**:
   - Badges automáticas según la actividad: *"Primer Post"*, *"Debatidor Frecuente"*, *"Cazador de Memes"*, *"Veterano del Foro"*.

---

## 4. Plan de Cambios Técnicos

### Backend (Django)
1. **Modelo `User`** ([foro_juegos/models/user.py](file:///c:/Users/frava/Desktop/Ing%20Informatica/2026/Programacion%201/Proyecto-Programaci-n-Foro-de-Juegos/foro_juegos/models/user.py)):
   - Agregar campos:
     - `bio = models.CharField(max_length=200, blank=True, default='')`
     - `avatar = models.CharField(max_length=100, default='👾')` (soporta emoji o URL)
     - `avatar_image = models.ImageField(upload_to='avatars/', null=True, blank=True)`
     - `banner_color = models.CharField(max_length=20, default='#6366f1')`
     - `platforms = models.JSONField(default=list, blank=True)`
     - `discord_tag = models.CharField(max_length=50, blank=True, default='')`
     - `steam_id = models.CharField(max_length=50, blank=True, default='')`
2. **Endpoints en `UserViewSet`**:
   - `PATCH /api/users/me/`: Permite al usuario logueado actualizar su perfil (`bio`, `avatar`, `platforms`, etc.).
   - `POST /api/users/change-password/`: Endpoint seguro para validar contraseña vieja y setear la nueva.
3. **Migraciones**:
   - `python manage.py makemigrations foro_juegos` y `python manage.py migrate`.

### Frontend (React)
1. **Nuevo Componente `GameCategoryPicker.jsx`**:
   - Componente reutilizable con la misma estética de la cápsula de búsqueda de `Navbar`.
   - Búsqueda concurrente de juegos (`/api/games/?search=...`) y categorías (`/api/categories/?search=...`).
   - Reemplaza el select actual en `CreatePost.jsx`.
2. **Nuevo Componente `ProfileEditModal.jsx`**:
   - Modal con las dos pestañas ("Identidad Gamer" y "Seguridad").
   - Selector visual de avatares pixel, inputs para bio, plataformas y enlaces.
3. **Actualización de `Profile.jsx`**:
   - Botón `⚙️ Editar Perfil` junto al nombre.
   - Mostrar la biografía, plataformas y enlaces sociales en la tarjeta de perfil.
   - Mostrar el avatar seleccionado en el Navbar, en los posts del feed y en los comentarios.

---

## 5. Preguntas de Decisión para Vos

1. **Buscador de CreatePost**: ¿Preferís que el post se asocie a un **Juego O a un Género** (como está ahora), o te gustaría que pueda tener **ambos** (ej: Juego: *Elden Ring* + Género: *RPG*)?
2. **Avatares**: ¿Te gusta la idea de tener una galería de avatares retro predeterminados (emojis/pixel-art) + opción de subir foto propia?
3. **¿Qué te parece la idea de los "Top 3 Juegos Favoritos" en el perfil?**
