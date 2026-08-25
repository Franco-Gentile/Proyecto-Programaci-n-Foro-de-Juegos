# Foro de Juegos - Frontend

Cliente React para el proyecto Foro de Juegos.

## Pre-requisitos

- Node.js >= 18
- npm

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

El servidor de desarrollo corre en http://localhost:3000

## Conexión con el Backend

El frontend se comunica con la API de Django en http://localhost:8000.
Se configura automáticamente un proxy en desarrollo para evitar problemas de CORS.

La variable de entorno `VITE_API_URL` define la URL del backend.
Ver `.env.example` para más detalles.

## Scripts

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run preview` - Preview del build
- `npm run lint` - Linting con oxlint
- `npm run format` - Formateo con Prettier
- `npm test` - Tests unitarios con Vitest

## Autenticación (mock del TP7)

La autenticación es un mock hardcodeado aislado en `src/services/authService.js`.
El contexto (`AuthContext`) y las vistas solo consumen esa interfaz
(`login`, `register`, `logout`, `getSession`): conectar la API real debería
requerir cambios únicamente en ese archivo.

### Credenciales demo

| Usuario | Contraseña |
| ------- | ---------- |
| admin   | admin123   |
| user    | user123    |

### Limitaciones conocidas (a resolver al conectar el backend)

- **El control de acceso es solo del lado cliente.** `ProtectedRoute` confía en
  lo que haya en `localStorage.user`; cualquiera con DevTools puede falsificar
  una sesión (`localStorage.setItem('user', JSON.stringify({...}))`) y entrar a
  rutas "protegidas". Valida presencia de datos, no validez de sesión. La
  autorización real debe vivir en el servidor validando el JWT que emite
  `/api/auth/login/` en cada request.
- **Las contraseñas no se guardan en texto plano**, pero el hash usado es un
  mock determinista sin valor de seguridad real. El hasheo verdadero
  (bcrypt/Argon2) debe hacerse en el backend.
- La unicidad de usuario/email se normaliza a minúsculas para acercarse al
  comportamiento esperado del backend; las reglas definitivas las define la API.
