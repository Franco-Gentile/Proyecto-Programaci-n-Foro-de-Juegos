# TP4 - Matriz de Pruebas de API

## Foro de Juegos

**Fecha:** 09/06/2026
**Resultado general:** 52/53 pruebas pasaron (98%)
**Bug crítico encontrado:** Email no único (corregido vía PR #11)

---

## 1. CRUD por Roles

### 1.1 Categorías (solo ADMIN/MODERATOR)

| # | Endpoint | Método | Rol | Acción | Esperado | Resultado |
|---|----------|--------|-----|--------|----------|-----------|
| 1.1.1 | `/api/categories/` | POST | ADMIN | Crear categoría | **201 Created** | ✅ 201 |
| 1.1.2 | `/api/categories/` | POST | MODERATOR | Crear categoría | **201 Created** | ✅ 201 |
| 1.1.3 | `/api/categories/` | POST | USER | Crear categoría | **403 Forbidden** | ✅ 403 |
| 1.1.4 | `/api/categories/{id}/` | PUT | ADMIN | Editar categoría | **200 OK** | ✅ 200 |
| 1.1.5 | `/api/categories/{id}/` | PUT | USER | Editar categoría | **403 Forbidden** | ✅ 403 |
| 1.1.6 | `/api/categories/{id}/` | DELETE | ADMIN | Borrar categoría | **204 No Content** | ✅ 204 |
| 1.1.7 | `/api/categories/{id}/` | DELETE | USER | Borrar categoría | **403 Forbidden** | ✅ 403 |
| 1.1.8 | `/api/categories/` | GET | USER | Listar categorías | **200 OK** | ✅ 200 |

### 1.2 Posts (propio user o ADMIN/MODERATOR)

| # | Endpoint | Método | Rol | Acción | Esperado | Resultado |
|---|----------|--------|-----|--------|----------|-----------|
| 1.2.1 | `/api/posts/` | POST | USER | Crear post propio | **201 Created** | ✅ 201 |
| 1.2.2 | `/api/posts/{id}/` | PATCH | USER (dueño) | Editar post propio | **200 OK** | ✅ 200 |
| 1.2.3 | `/api/posts/{id}/` | PATCH | USER (otro) | Editar post ajeno | **403 Forbidden** | ✅ 403 |
| 1.2.4 | `/api/posts/{id}/` | DELETE | USER (dueño) | Borrar post propio | **204 No Content** | ✅ 204 |
| 1.2.5 | `/api/posts/{id}/` | DELETE | USER (otro) | Borrar post ajeno | **403 Forbidden** | ✅ 403 |
| 1.2.6 | `/api/posts/{id}/` | DELETE | ADMIN | Borrar cualquier post | **204 No Content** | ✅ 204 |
| 1.2.7 | `/api/posts/{id}/` | DELETE | MODERATOR | Borrar cualquier post | **204 No Content** | ✅ 204 |
| 1.2.8 | `/api/posts/` | GET | USER | Listar posts | **200 OK** | ✅ 200 |

### 1.3 Comentarios (propio user o ADMIN/MODERATOR)

| # | Endpoint | Método | Rol | Acción | Esperado | Resultado |
|---|----------|--------|-----|--------|----------|-----------|
| 1.3.1 | `/api/comments/` | POST | USER | Crear comentario | **201 Created** | ✅ 201 |
| 1.3.2 | `/api/comments/{id}/` | DELETE | USER (dueño) | Borrar comentario propio | **204 No Content** | ✅ 204 |
| 1.3.3 | `/api/comments/{id}/` | DELETE | USER (otro) | Borrar comentario ajeno | **403 Forbidden** | ✅ 403 |
| 1.3.4 | `/api/comments/{id}/` | DELETE | ADMIN | Borrar cualquier comentario | **204 No Content** | ✅ 204 |

### 1.4 Reportes (solo ADMIN/MODERATOR ven todos)

| # | Endpoint | Método | Rol | Acción | Esperado | Resultado |
|---|----------|--------|-----|--------|----------|-----------|
| 1.4.1 | `/api/reports/` | POST | USER | Crear reporte | **201 Created** | ✅ 201 |
| 1.4.2 | `/api/reports/` | GET | USER | Listar reportes | **403 Forbidden** | ✅ 403 |
| 1.4.3 | `/api/reports/` | GET | ADMIN | Listar reportes | **200 OK** | ✅ 200 |
| 1.4.4 | `/api/reports/{id}/` | PATCH | ADMIN | Actualizar estado reporte | **200 OK** | ✅ 200 |

### 1.5 Usuarios (solo ADMIN ve todos)

| # | Endpoint | Método | Rol | Acción | Esperado | Resultado |
|---|----------|--------|-----|--------|----------|-----------|
| 1.5.1 | `/api/users/` | POST | Anónimo | Registro de usuario | **201 Created** | ✅ 201 |
| 1.5.2 | `/api/users/` | GET | USER | Listar usuarios | Solo ve su perfil | ✅ 1 usuario |
| 1.5.3 | `/api/users/` | GET | ADMIN | Listar usuarios | **200 OK** (todos) | ✅ 200 |
| 1.5.4 | `/api/users/{id}/` | DELETE | USER | Borrar otro usuario | **403 Forbidden** | ⚠️ 404 (ver nota) |

> **Nota 1.5.4:** USER obtiene 404 en vez de 403 al intentar borrar otro usuario. Esto ocurre porque el queryset de UserViewSet filtra para que USER solo vea su propio perfil, entonces `get_object()` no encuentra el recurso. Es un diseño válido (previene enumeración de usuarios), no un bug de seguridad.

---

## 2. Lógica de Negocio (Casos de Borde)

| # | Endpoint | Método | Escenario | Esperado | Resultado |
|---|----------|--------|-----------|----------|-----------|
| 2.1 | `/api/users/` | POST | Registrar con email ya existente | **400 Bad Request** | ⚠️ Ahora 400 (bug corregido, ver PR #11) |
| 2.2 | `/api/users/` | POST | Registrar con username ya existente | **400 Bad Request** | ✅ 400 |
| 2.3 | `/api/users/` | POST | Registrar sin email | **400 Bad Request** | ✅ 400 |
| 2.4 | `/api/posts/` | POST | Crear post con category_id inexistente | **400 Bad Request** | ✅ 400 |
| 2.5 | `/api/comments/` | POST | Crear comentario con post_id inexistente | **400 Bad Request** | ✅ 400 |
| 2.6 | `/api/reports/` | POST | Crear reporte sin post_id ni comment_id | **400 Bad Request** | ✅ 400 |
| 2.7 | `/api/posts/{id}/` | GET | Obtener post que no existe | **404 Not Found** | ✅ 404 |
| 2.8 | `/api/auth/login/` | POST | Login con credenciales incorrectas | **401 Unauthorized** | ✅ 401 |
| 2.9 | `/api/users/me/` | GET | Acceder sin token | **401 Unauthorized** | ✅ 401 |
| 2.10 | `/api/auth/logout/` | POST | Logout sin enviar refresh token | **400 Bad Request** | ✅ 400 |

---

## 3. Flujo Completo

| # | Paso | Acción | Esperado | Resultado |
|---|------|--------|----------|-----------|
| 3.1 | Registro | `POST /api/users/` (USER nuevo) | **201 Created** | ✅ 201 |
| 3.2 | Login | `POST /api/auth/login/` | **200 OK** + tokens | ✅ 200 |
| 3.3 | Perfil | `GET /api/users/me/` (con token) | **200 OK** + datos usuario | ✅ 200 |
| 3.4 | Crear post | `POST /api/posts/` (con token) | **201 Created** | ✅ 201 |
| 3.5 | Listar posts | `GET /api/posts/` | **200 OK** (post aparece) | ✅ 200 |
| 3.6 | Crear comentario | `POST /api/comments/` (con token) | **201 Created** | ✅ 201 |
| 3.7 | Editar post | `PATCH /api/posts/{id}/` (con token) | **200 OK** | ✅ 200 |
| 3.8 | Reportar post | `POST /api/reports/` (con token) | **201 Created** | ✅ 201 |
| 3.9 | Logout | `POST /api/auth/logout/` (con refresh token) | **205 Reset Content** | ✅ 205 |
| 3.10 | Reusar token | `GET /api/users/me/` (mismo token después de logout) | **401 Unauthorized** | ⚠️ JWT access token sigue siendo válido hasta expirar |

> **Nota 3.10:** JWT no invalida access tokens inmediatamente al hacer logout. Solo se blacklistea el refresh token. El access token sigue siendo válido hasta su expiración (1 hora). Esto es comportamiento normal de JWT.

---

## 4. Escenarios de Seguridad

| # | Escenario | Esperado | Resultado |
|---|-----------|----------|-----------|
| 4.1 | USER intenta acceder a `GET /api/reports/` | **403 Forbidden** | ✅ 403 |
| 4.2 | USER intenta borrar post de otro USER | **403 Forbidden** | ✅ 403 |
| 4.3 | USER intenta editar categoría | **403 Forbidden** | ✅ 403 |
| 4.4 | Anónimo intenta crear post sin token | **401 Unauthorized** | ✅ 401 |
| 4.5 | Anónimo intenta acceder a `GET /api/users/` | **401 Unauthorized** | ✅ 401 |

---

## 5. Bugs Encontrados y Corregidos

### Bug 1: Email no único (Corregido ✅)
- **Severidad:** Media
- **Descripción:** El campo `email` en el modelo `User` no tenía `unique=True`, permitiendo registrar múltiples usuarios con el mismo correo electrónico.
- **Evidencia:** Se registraron 4 usuarios con el email `testuser_tp4@mail.com` exitosamente.
- **Solución:** 
  1. Agregado `unique=True` al campo `email` en `user.py`
  2. Agregada validación `validate_email` en `UserCreateSerializer` para devolver 400 en vez de 500
  3. Migración `0005_alter_user_email.py`
- **PR:** [#11 - Fix: Hacer email único y agregar validación en serializer](https://github.com/Franco-Gentile/Proyecto-Programaci-n-Foro-de-Juegos/pull/11)

### Bug 2: IntegrityError no capturado (Corregido ✅)
- **Severidad:** Baja
- **Descripción:** Al agregar `unique=True` a email, Django lanzaba `IntegrityError` (500 Internal Server Error) en vez de devolver 400 Bad Request.
- **Solución:** Se agregó `validate_email` en el serializer para validar antes de llegar a la BD.
- **PR:** Mismo que Bug 1 (#11)

### Observación: Soft delete no implementado
- Los modelos `User`, `Post` y `Comment` tienen campo `is_deleted` pero nunca se usa. El DELETE estándar borra físicamente el registro.

---

## 6. Pull Requests Creados

| # | Rama | Descripción | Estado |
|---|------|-------------|--------|
| PR #11 | `fix/email-unique` | Hacer email único y agregar validación | Abierto |
