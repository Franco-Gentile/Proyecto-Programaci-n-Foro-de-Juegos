# TP4 - Matriz de Pruebas de API

## Foro de Juegos

---

## 1. CRUD por Roles

### 1.1 Categorías (solo ADMIN/MODERATOR)

| # | Endpoint | Método | Rol | Acción | Esperado | ¿Pasó? |
|---|----------|--------|-----|--------|----------|--------|
| 1.1.1 | `/api/categories/` | POST | ADMIN | Crear categoría | **201 Created** | |
| 1.1.2 | `/api/categories/` | POST | MODERATOR | Crear categoría | **201 Created** | |
| 1.1.3 | `/api/categories/` | POST | USER | Crear categoría | **403 Forbidden** | |
| 1.1.4 | `/api/categories/{id}/` | PUT | ADMIN | Editar categoría | **200 OK** | |
| 1.1.5 | `/api/categories/{id}/` | PUT | USER | Editar categoría | **403 Forbidden** | |
| 1.1.6 | `/api/categories/{id}/` | DELETE | ADMIN | Borrar categoría | **204 No Content** | |
| 1.1.7 | `/api/categories/{id}/` | DELETE | USER | Borrar categoría | **403 Forbidden** | |
| 1.1.8 | `/api/categories/` | GET | USER | Listar categorías | **200 OK** | |

### 1.2 Posts (propio user o ADMIN/MODERATOR)

| # | Endpoint | Método | Rol | Acción | Esperado | ¿Pasó? |
|---|----------|--------|-----|--------|----------|--------|
| 1.2.1 | `/api/posts/` | POST | USER | Crear post propio | **201 Created** | |
| 1.2.2 | `/api/posts/{id}/` | PUT | USER (dueño) | Editar post propio | **200 OK** | |
| 1.2.3 | `/api/posts/{id}/` | PUT | USER (otro) | Editar post ajeno | **403 Forbidden** | |
| 1.2.4 | `/api/posts/{id}/` | DELETE | USER (dueño) | Borrar post propio | **204 No Content** | |
| 1.2.5 | `/api/posts/{id}/` | DELETE | USER (otro) | Borrar post ajeno | **403 Forbidden** | |
| 1.2.6 | `/api/posts/{id}/` | DELETE | ADMIN | Borrar cualquier post | **204 No Content** | |
| 1.2.7 | `/api/posts/{id}/` | DELETE | MODERATOR | Borrar cualquier post | **204 No Content** | |
| 1.2.8 | `/api/posts/` | GET | USER | Listar posts | **200 OK** | |

### 1.3 Comentarios (propio user o ADMIN/MODERATOR)

| # | Endpoint | Método | Rol | Acción | Esperado | ¿Pasó? |
|---|----------|--------|-----|--------|----------|--------|
| 1.3.1 | `/api/comments/` | POST | USER | Crear comentario | **201 Created** | |
| 1.3.2 | `/api/comments/{id}/` | DELETE | USER (dueño) | Borrar comentario propio | **204 No Content** | |
| 1.3.3 | `/api/comments/{id}/` | DELETE | USER (otro) | Borrar comentario ajeno | **403 Forbidden** | |
| 1.3.4 | `/api/comments/{id}/` | DELETE | ADMIN | Borrar cualquier comentario | **204 No Content** | |

### 1.4 Reportes (solo ADMIN/MODERATOR ven todos)

| # | Endpoint | Método | Rol | Acción | Esperado | ¿Pasó? |
|---|----------|--------|-----|--------|----------|--------|
| 1.4.1 | `/api/reports/` | POST | USER | Crear reporte | **201 Created** | |
| 1.4.2 | `/api/reports/` | GET | USER | Listar reportes | **403 Forbidden** | |
| 1.4.3 | `/api/reports/` | GET | ADMIN | Listar reportes | **200 OK** | |
| 1.4.4 | `/api/reports/{id}/` | PATCH | ADMIN | Actualizar estado reporte | **200 OK** | |

### 1.5 Usuarios (solo ADMIN ve todos)

| # | Endpoint | Método | Rol | Acción | Esperado | ¿Pasó? |
|---|----------|--------|-----|--------|----------|--------|
| 1.5.1 | `/api/users/` | POST | Anónimo | Registro de usuario | **201 Created** | |
| 1.5.2 | `/api/users/` | GET | USER | Listar usuarios | Solo ve su propio perfil | |
| 1.5.3 | `/api/users/` | GET | ADMIN | Listar usuarios | **200 OK** (todos) | |
| 1.5.4 | `/api/users/{id}/` | DELETE | USER | Borrar otro usuario | **403 Forbidden** | |
| 1.5.5 | `/api/users/{id}/` | DELETE | ADMIN | Borrar cualquier usuario | **204 No Content** | |

---

## 2. Lógica de Negocio (Casos de Borde)

| # | Endpoint | Método | Escenario | Esperado | ¿Pasó? |
|---|----------|--------|-----------|----------|--------|
| 2.1 | `/api/users/` | POST | Registrar con email ya existente | **400 Bad Request** | |
| 2.2 | `/api/users/` | POST | Registrar con username ya existente | **400 Bad Request** | |
| 2.3 | `/api/users/` | POST | Registrar sin email (campo requerido) | **400 Bad Request** | |
| 2.4 | `/api/posts/` | POST | Crear post con category_id inexistente | **400 Bad Request** | |
| 2.5 | `/api/comments/` | POST | Crear comentario con post_id inexistente | **400 Bad Request** | |
| 2.6 | `/api/reports/` | POST | Crear reporte sin post_id ni comment_id | **400 Bad Request** | |
| 2.7 | `/api/posts/{id}/` | GET | Obtener post que no existe | **404 Not Found** | |
| 2.8 | `/api/auth/login/` | POST | Login con credenciales incorrectas | **401 Unauthorized** | |
| 2.9 | `/api/users/me/` | GET | Acceder sin token | **401 Unauthorized** | |
| 2.10 | `/api/auth/logout/` | POST | Logout sin enviar refresh token | **400 Bad Request** | |

---

## 3. Flujo Completo

| # | Paso | Acción | Esperado | ¿Pasó? |
|---|------|--------|----------|--------|
| 3.1 | Registro | `POST /api/users/` (USER nuevo) | **201 Created** | |
| 3.2 | Login | `POST /api/auth/login/` | **200 OK** + tokens | |
| 3.3 | Perfil | `GET /api/users/me/` (con token) | **200 OK** + datos usuario | |
| 3.4 | Crear post | `POST /api/posts/` (con token) | **201 Created** | |
| 3.5 | Listar posts | `GET /api/posts/` | **200 OK** (post aparece) | |
| 3.6 | Crear comentario | `POST /api/comments/` (con token) | **201 Created** | |
| 3.7 | Editar post | `PATCH /api/posts/{id}/` (con token) | **200 OK** | |
| 3.8 | Reportar post | `POST /api/reports/` (con token) | **201 Created** | |
| 3.9 | Logout | `POST /api/auth/logout/` (con refresh token) | **205 Reset Content** | |
| 3.10 | Reusar token | `GET /api/users/me/` (mismo token después de logout) | **401 Unauthorized** | |

---

## 4. Escenarios de Seguridad

| # | Escenario | Esperado | ¿Pasó? |
|---|-----------|----------|--------|
| 4.1 | USER intenta acceder a `GET /api/reports/` | **403 Forbidden** | |
| 4.2 | USER intenta borrar post de otro USER | **403 Forbidden** | |
| 4.3 | USER intenta editar categoría | **403 Forbidden** | |
| 4.4 | Anónimo intenta crear post sin token | **401 Unauthorized** | |
| 4.5 | Anónimo intenta acceder a `GET /api/users/` | **401 Unauthorized** | |
