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
