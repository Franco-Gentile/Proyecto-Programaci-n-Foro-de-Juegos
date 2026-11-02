# Cómo se subió la aplicación

## Servicios utilizados
- **API y Base de Datos (Producción Principal):** Render (con PostgreSQL administrado)
- **Frontend:** Vercel
- **Media (Imágenes y Multimedia):** Cloudinary (Sí)

> **Nota sobre archivos de despliegue en el repositorio (`render.yaml`, `Procfile`, `railway.json`):**
> - **`render.yaml` es la fuente de verdad principal** para el despliegue en producción sobre **Render** (Blueprint con Web Service + PostgreSQL).
> - `Procfile` y `railway.json` se mantienen únicamente como soporte de compatibilidad opcional en caso de querer levantar una instancia alternativa en Railway u otro PaaS compatible con Nixpacks/Buildpacks.

---

## URLs Públicas del Proyecto
- **URL de la API (Render):** https://proyecto-programaci-n-foro-de-juegos.onrender.com
- **Documentación Swagger / OpenAPI:** https://proyecto-programaci-n-foro-de-juegos.onrender.com/api/docs/
- **Health Check de la API:** https://proyecto-programaci-n-foro-de-juegos.onrender.com/api/health/
- **URL del Frontend (Vercel):** https://proyecto-programaci-n-foro-de-juego.vercel.app
- **Cloudinary Media URL Base:** `https://res.cloudinary.com/<cloud_name>/image/upload/`

---

## Método de deploy API
- **Método:** Git (Deploy directo desde repositorio GitHub mediante Render Blueprint `render.yaml`)
- **Rama:** `tp10`

---

## Pasos para la API y Base de Datos en Render (Fuente de Verdad)
1. Iniciar sesión en [Render](https://render.com) utilizando la cuenta de GitHub.
2. Hacer clic en **+ New** -> **Blueprint**.
3. Conectar el repositorio `Proyecto-Programaci-n-Foro-de-Juegos` y seleccionar la rama `tp10`.
4. Render detecta automáticamente el archivo `render.yaml` y configura:
   - Base de datos PostgreSQL gestionada (`forodb`).
   - Servicio Web (`foro-juegos-api`) con Python, Gunicorn y WhiteNoise.
   - Comandos automáticos de build y start:
     * Build: `pip install -r requirements.txt && python manage.py collectstatic --noinput`
     * Start: `python manage.py migrate --noinput && gunicorn foro.wsgi:application`
5. En las variables de entorno del servicio web en el Dashboard de Render (`sync: false` en `render.yaml`), cargar de forma privada:
   - `CLOUDINARY_URL`: `cloudinary://<api_key>:<api_secret>@<cloud_name>`
   - `RAWG_API_KEY`: `<tu_api_key_de_rawg>`
6. Hacer clic en **Apply**. Render compilará, ejecutará las migraciones de esquema y publicará el servicio en `https://proyecto-programaci-n-foro-de-juegos.onrender.com`.
7. Para poblar el catálogo base (categorías y juegos iniciales) y crear el superusuario administrador, abrir la pestaña **Shell** del Web Service en Render y ejecutar manualmente una única vez:
   ```bash
   python manage.py seed_forum_data
   python manage.py createsuperuser
   ```
8. Verificar que los endpoints respondan correctamente:
   - `GET /api/health/` -> `{"status": "ok", "service": "api", "database": "ok"}`
   - `GET /api/docs/` -> Swagger UI interactivo cargando estilos con WhiteNoise.

---

## Pasos para el Frontend (Vercel)
1. Iniciar sesión en [Vercel](https://vercel.com) vinculando la cuenta de GitHub.
2. Hacer clic en **Add New...** -> **Project** e importar el repositorio del Foro.
3. Configuración del proyecto en el asistente de Vercel:
   - **Framework Preset:** Vite
   - **Root Directory:** Editar y seleccionar `frontend`
   - **Build Command:** `npm run build` (detectado por defecto)
   - **Output Directory:** `dist` (detectado por defecto)
4. En **Environment Variables** (y en `frontend/.env.production`), configurar la URL de la API en Render:
   - `VITE_API_URL` = `https://proyecto-programaci-n-foro-de-juegos.onrender.com/api`
5. Presionar **Deploy**. Vercel compila el proyecto y genera el dominio público con HTTPS (`https://proyecto-programaci-n-foro-de-juego.vercel.app`).
6. Gracias a la configuración de `frontend/vercel.json`, la navegación directa y la recarga en rutas de la aplicación (SPA) redirigen correctamente a `index.html` sin errores 404.

---

## Pasos para Cloudinary
1. Crear una cuenta gratuita en [Cloudinary](https://cloudinary.com).
2. En el Dashboard (Settings -> API Keys), copiar el **API Environment variable**:
   `CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>`
3. Configurar este valor como variable de entorno secreta en el Dashboard de **Render** (`CLOUDINARY_URL`).
4. Al crear publicaciones con imágenes o subir fotos de perfil/avatar, Django transfiere el archivo automáticamente a Cloudinary.
5. Verificar en la pestaña **Media Library** de Cloudinary que las imágenes aparezcan bajo las carpetas configuradas.

---

## Variables de entorno usadas en Producción

### En Render (Backend API):
| Variable | Descripción / Valor |
| :--- | :--- |
| `DATABASE_URL` | Inyectada automáticamente por Render desde la base PostgreSQL `forodb` |
| `DJANGO_SECRET_KEY` | Generada automáticamente por Render (`generateValue: true`) |
| `DJANGO_DEBUG` | `False` |
| `DJANGO_ALLOWED_HOSTS` | `.onrender.com,localhost,127.0.0.1` |
| `CLOUDINARY_URL` | Configurada en el Dashboard de Render (`sync: false`) |
| `RAWG_API_KEY` | Configurada en el Dashboard de Render (`sync: false`) |
| `CORS_ALLOWED_ORIGINS` | `https://<tu-app>.vercel.app` *(opcional, regex ya soporta `.vercel.app`)* |
| `CSRF_TRUSTED_ORIGINS` | `https://*.onrender.com,https://*.vercel.app` |

### En Vercel (Frontend):
| Variable | Descripción / Valor |
| :--- | :--- |
| `VITE_API_URL` | `https://proyecto-programaci-n-foro-de-juegos.onrender.com/api` |

---

## Alternativa Opcional: Despliegue en Railway (`Procfile` / `railway.json`)
Si se desea desplegar el backend en [Railway](https://railway.com) en lugar de Render:
1. Crear un proyecto en Railway con el plugin **PostgreSQL** y conectar el repositorio GitHub.
2. Railway utilizará `railway.json` y `Procfile` para correr `migrate`, `collectstatic` y `gunicorn foro.wsgi:application`.
3. Definir las mismas variables de entorno (`DATABASE_URL`, `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=False`, `DJANGO_ALLOWED_HOSTS=.up.railway.app`, `CLOUDINARY_URL`, `RAWG_API_KEY`) en el panel de Railway y apuntar `VITE_API_URL` al dominio generado.

---

## Problemas encontrados y soluciones aplicadas
1. **Archivos Estáticos en Producción con DEBUG=False:**
   * *Problema:* Al desactivar `DEBUG`, Django por defecto no sirve los archivos estáticos del panel de `/admin/` ni de Swagger UI `/api/docs/`.
   * *Solución:* Se integró `whitenoise` en el middleware de Django y se configuró `STATIC_ROOT = BASE_DIR / 'staticfiles'` con compresión de archivos estáticos.
2. **Archivos Multimedia Efímeros en PaaS:**
   * *Problema:* Los contenedores en Render tienen un sistema de archivos efímero que borra las imágenes locales al redeployar.
   * *Solución:* Se integró `cloudinary-storage` en `STORAGES["default"]` para persistir los archivos en Cloudinary sin tocar el disco del contenedor.
3. **Error 404 al recargar páginas en el Frontend (SPA Routing):**
   * *Problema:* Al recargar directamente una URL como `/profile` o `/posts/12`, el servidor web estático busca un archivo físico con esa ruta y arroja 404.
   * *Solución:* Se configuró `frontend/vercel.json` con una regla de reescritura que redirige todas las solicitudes al `index.html`, permitiendo a React Router gestionar las rutas.
4. **CORS y Cabeceras de Seguridad HTTPS detrás del Proxy de Render:**
   * *Problema:* El navegador bloquea peticiones cross-origin entre Vercel y Render, y Django detrás del proxy inverso de Render necesita detectar HTTPS para cookies seguras.
   * *Solución:* Se configuró `CORS_ALLOWED_ORIGIN_REGEXES` en `settings.py` para admitir subdominios de Vercel/Render, y con `DEBUG=False` se activaron `SECURE_PROXY_SSL_HEADER`, `SECURE_SSL_REDIRECT`, `SECURE_HSTS_SECONDS`, `SESSION_COOKIE_SECURE` y `CSRF_COOKIE_SECURE`.

---

## Checklists de Capturas para la Entrega
- [ ] Swagger / Redoc (`/api/docs/`) abierto y con estilos en producción.
- [ ] Endpoint `/api/health/` respondiendo `{"status": "ok", "service": "api", "database": "ok"}` con código 200 OK.
- [ ] Endpoint protegido respondiendo 401 Unauthorized sin token y 200 OK con credenciales válidas.
- [ ] Frontend en Vercel cargando publicaciones y juegos reales desde la API en Render.
- [ ] Subida de imagen en un post funcionando y visible en la biblioteca de Cloudinary.
- [ ] Panel de Render mostrando el servicio web y la base de datos PostgreSQL en estado "Active" / "Available".
