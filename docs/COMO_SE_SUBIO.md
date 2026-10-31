# Cómo se subió la aplicación

## Servicios utilizados
- **API y Base de Datos:** Render (con PostgreSQL administrado)
- **Frontend:** Vercel
- **Media (Imágenes y Multimedia):** Cloudinary (Sí)

---

## URLs Públicas del Proyecto
- **URL de la API:** https://proyecto-programaci-n-foro-de-juegos.onrender.com
- **Documentación Swagger / OpenAPI:** https://proyecto-programaci-n-foro-de-juegos.onrender.com/api/docs/
- **Health Check de la API:** https://proyecto-programaci-n-foro-de-juegos.onrender.com/api/health/
- **URL del Frontend:** https://proyecto-programaci-n-foro-de-juegos-git-tp10-franco-gentile.vercel.app
- **Cloudinary Media URL Base:** `https://res.cloudinary.com/orvlu9xb/image/upload/`

---

## Método de deploy API
- **Método:** Git (Deploy directo desde repositorio GitHub)
- **Rama:** `tp10`

---

## Pasos para la API y Base de Datos (Render)
1. Iniciar sesión en [Render](https://render.com) utilizando la cuenta de GitHub.
2. Hacer clic en **+ New** -> **Blueprint**.
3. Conectar el repositorio `Proyecto-Programaci-n-Foro-de-Juegos` y seleccionar la rama `tp10`.
4. Render detecta automáticamente el archivo `render.yaml` y configura:
   - Base de datos PostgreSQL gestionada (`forodb`).
   - Servicio Web (`foro-juegos-api`) con Python, Gunicorn y WhiteNoise.
   - Comandos automáticos de build y start:
     * Build: `pip install -r requirements.txt && python manage.py collectstatic --noinput`
     * Start: `python manage.py migrate --noinput && gunicorn foro.wsgi:application`
5. En las variables de entorno del servicio web, agregar `CLOUDINARY_URL` con el enlace obtenido de Cloudinary.
6. Hacer clic en **Apply**. Render compilará, migrará la base de datos y generará la URL pública (ej. `https://foro-juegos-api.onrender.com`).
7. Para crear el superusuario inicial:
   - En el dashboard del Web Service, ir a **Shell** y ejecutar:
     ```bash
     python manage.py createsuperuser
     ```
8. Verificar que los endpoints respondan correctamente:
   - `GET /api/health/` -> `{"status": "ok", "service": "api"}`
   - `GET /api/docs/` -> Swagger UI interactivo cargando estilos con WhiteNoise.

---

## Pasos para la API (Railway - Alternativa)
1. Iniciar sesión en [Railway](https://railway.com) utilizando la cuenta de GitHub.
2. Crear un nuevo proyecto (`+ New Project`) y seleccionar **Provision PostgreSQL** para instanciar la base de datos de producción.
3. Dentro del mismo proyecto, presionar **+ Create** -> **GitHub Repo**, seleccionar el repositorio `Proyecto-Programaci-n-Foro-de-Juegos` y elegir la rama `tp10`.
4. En la configuración del servicio del Backend en Railway:
   - Configurar **Variables de entorno** (Variables tab):
     * `DATABASE_URL`: Vinculada con `${{Postgres.DATABASE_URL}}` (Railway la autoinyecta).
     * `DJANGO_SECRET_KEY`: Una clave segura de producción.
     * `DJANGO_DEBUG`: `False`.
     * `DJANGO_ALLOWED_HOSTS`: `.up.railway.app,localhost,127.0.0.1`.
     * `CLOUDINARY_URL`: `cloudinary://<api_key>:<api_secret>@<cloud_name>`.
     * `RAWG_API_KEY`: *(Opcional)* Clave de la API de RAWG para catálogo y juegos.
   - En **Settings** -> **Networking**, hacer clic en **Generate Domain** para obtener la URL pública de la API (`https://<tu-subdominio>.up.railway.app`).
5. Railway detecta automáticamente el archivo `Procfile` / `railway.json` ejecutando las migraciones (`python manage.py migrate --noinput`), la recolección de estáticos (`collectstatic`) y levantando el servidor con `gunicorn foro.wsgi:application`.
6. En caso de requerir un usuario administrador inicial:
   - Abrir la pestaña **CLI** o **Exec** en Railway y ejecutar:
     ```bash
     python manage.py createsuperuser
     ```
7. Verificar que los endpoints respondan correctamente:
   - `GET /api/health/` -> `{"status": "ok", "service": "api"}`
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
4. En **Environment Variables**, agregar:
   - `VITE_API_URL` = `https://<tu-api-en-railway>.up.railway.app/api`
5. Presionar **Deploy**. Vercel compila el proyecto y genera un dominio público seguro SSL (ej. `https://<tu-proyecto>.vercel.app`).
6. Gracias a la configuración de `frontend/vercel.json`, la navegación directa y la recarga en rutas de la aplicación (SPA) redirigen correctamente a `index.html` sin errores 404.

---

## Pasos para Cloudinary
1. Crear una cuenta gratuita en [Cloudinary](https://cloudinary.com).
2. En el Dashboard inicial (o Settings -> API Keys), copiar el **API Environment variable**:
   `CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>`
3. Pegar este valor en las variables de entorno de Railway (`CLOUDINARY_URL`).
4. Al crear publicaciones con imágenes o subir fotos de perfil/avatar, Django transfiere el archivo automáticamente a Cloudinary.
5. Verificar en la pestaña **Media Library** de Cloudinary que las imágenes aparezcan bajo las carpetas `posts_media/` y `avatars/`.

---

## Variables de entorno usadas en Producción

### En Railway (Backend API):
| Variable | Descripción / Valor |
| :--- | :--- |
| `DATABASE_URL` | Inyectada automáticamente por Railway vinculando el servicio PostgreSQL |
| `DJANGO_SECRET_KEY` | Clave secreta criptográfica de producción |
| `DJANGO_DEBUG` | `False` |
| `DJANGO_ALLOWED_HOSTS` | `.up.railway.app,localhost,127.0.0.1` |
| `CLOUDINARY_URL` | `cloudinary://<api_key>:<api_secret>@<cloud_name>` |
| `CORS_ALLOWED_ORIGINS` | `https://<tu-app>.vercel.app` *(opcional, regex ya soporta `.vercel.app`)* |
| `CSRF_TRUSTED_ORIGINS` | `https://*.up.railway.app,https://*.vercel.app` |

### En Vercel (Frontend):
| Variable | Descripción / Valor |
| :--- | :--- |
| `VITE_API_URL` | `https://<tu-api-en-railway>.up.railway.app/api` |

---

## Problemas encontrados y soluciones aplicadas
1. **Archivos Estáticos en Producción con DEBUG=False:**
   * *Problema:* Al desactivar `DEBUG`, Django por defecto no sirve los archivos estáticos del panel de `/admin/` ni de Swagger UI `/api/docs/`.
   * *Solución:* Se integró `whitenoise` en el middleware de Django y se configuró `STATIC_ROOT = BASE_DIR / 'staticfiles'` con compresión de archivos estáticos.
2. **Archivos Multimedia Efímeros en PaaS:**
   * *Problema:* Los contenedores en la nube tienen un sistema de archivos efímero que borra las imágenes locales al redeployar.
   * *Solución:* Se integró `cloudinary-storage` en `STORAGES["default"]` para persistir los archivos en Cloudinary sin tocar el disco del contenedor.
3. **Error 404 al recargar páginas en el Frontend (SPA Routing):**
   * *Problema:* Al recargar directamente una URL como `/profile` o `/posts/12`, el servidor web estático busca un archivo físico con esa ruta y arroja 404.
   * *Solución:* Se configuró `frontend/vercel.json` con una regla de reescritura que redirige todas las solicitudes al `index.html`, permitiendo a React Router gestionar las rutas.
4. **CORS entre dominios distintos:**
   * *Problema:* El navegador bloquea peticiones de `https://<app>.vercel.app` hacia `https://<api>.up.railway.app`.
   * *Solución:* Se configuró `CORS_ALLOWED_ORIGIN_REGEXES` en `settings.py` para admitir dinámicamente cualquier subdominio seguro de Vercel y Railway con envío de credenciales JWT habilitado.

---

## Checklists de Capturas para la Entrega
- [ ] Swagger / Redoc (`/api/docs/`) abierto y con estilos en producción.
- [ ] Endpoint `/api/health/` respondiendo `{"status": "ok", "service": "api"}` con código 200 OK.
- [ ] Endpoint protegido respondiendo 401 Unauthorized sin token y 200 OK con credenciales válidas.
- [ ] Frontend en Vercel cargando publicaciones y juegos reales desde la API.
- [ ] Subida de imagen en un post funcionando y visible en la biblioteca de Cloudinary.
- [ ] Panel del proveedor (Railway/Render) mostrando el servicio y la base de datos en estado "Active" / "Running".
