# Diagrama de Diseno Inicial - Foro de Juegos

> **Nota:** Este diagrama es el diseño planificado. Los componentes se implementarán en PRs siguientes.

## Estructura del Proyecto (Dos Capas)

```
┌─────────────────────────────────────────────────────────────┐
│                    NAVEGADOR (Cliente)                       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  React App (SPA)                     │   │
│  │                    Puerto 3000                       │   │
│  │                                                     │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐      │   │
│  │  │   Home    │  │  Login    │  │ Register  │      │   │
│  │  │ Component │  │ Component │  │ Component │      │   │
│  │  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘      │   │
│  │        │              │              │              │   │
│  │        └──────────────┼──────────────┘              │   │
│  │                       │                             │   │
│  │              ┌────────▼────────┐                    │   │
│  │              │   API Service   │                    │   │
│  │              │   (fetch/axios) │                    │   │
│  │              └────────┬────────┘                    │   │
│  └───────────────────────┼─────────────────────────────┘   │
│                          │                                  │
└──────────────────────────┼──────────────────────────────────┘
                           │ HTTP/JSON
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                    SERVIDOR (Backend)                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Django REST API                          │   │
│  │              Puerto 8000                              │   │
│  │                                                      │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │
│  │  │  Users   │  │  Posts   │  │Categories│          │   │
│  │  │ Endpoint │  │ Endpoint │  │ Endpoint │          │   │
│  │  └──────────┘  └──────────┘  └──────────┘          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Estructura de Componentes React (Home)

```
App.jsx
├── Header.jsx
│   ├── Logo
│   ├── Navbar (Home, Login, Register)
│   └── UserStatus
├── HomePage.jsx
│   ├── HeroSection.jsx
│   │   ├── Titulo Principal
│   │   └── Descripcion
│   ├── CategoriesSection.jsx
│   │   └── CategoryCard.jsx (x N)
│   └── RecentPostsSection.jsx
│       └── PostCard.jsx (x N)
└── Footer.jsx
```

## Flujo de Datos

```
1. Usuario visita Home
       │
       ▼
2. React carga HomePage
       │
       ▼
3. useEffect llama a API Service
       │
       ▼
4. API Service hace fetch a Django API
       │
       ▼
5. Django retorna JSON (posts, categorias)
       │
       ▼
6. React actualiza estado y renderiza
```

## Rutas Planeadas

| Ruta              | Componente      | Descripcion              |
|-------------------|-----------------|--------------------------|
| `/`               | HomePage        | Pagina principal         |
| `/login`          | LoginPage       | Inicio de sesion         |
| `/register`       | RegisterPage    | Registro de usuario      |
| `/posts/:id`      | PostPage        | Detalle de un post       |
| `/categories`     | CategoriesPage  | Lista de categorias      |

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Django REST Framework
- **Comunicacion**: HTTP + JSON (fetch API)
- **Puertos**: Frontend 3000 | Backend 8000
