# Proyecto: Plataforma web de foro gamer y comunidad de videojuegos

## Descripción
Este proyecto consiste en una aplicación web tipo foro orientada a la comunidad gamer, donde los usuarios pueden registrarse, iniciar sesión y participar en distintos espacios de discusión sobre videojuegos.

La plataforma permite a los jugadores interactuar entre sí para:

- ayudar a otros usuarios (principiantes o avanzados),
- compartir experiencias,
- socializar dentro de la comunidad,
- publicar contenido como imágenes o aportes relacionados a juegos.

Además, el sistema cuenta con moderadores que supervisan el contenido para garantizar un ambiente seguro y organizado, evitando spam, contenido inapropiado o fuera de tema.

---

## Objetivos del proyecto

### Objetivo general
Desarrollar una plataforma web que permita a los usuarios interactuar en una comunidad gamer mediante publicaciones, comentarios y contenido multimedia.

### Objetivos específicos
- Implementar registro e inicio de sesión de usuarios.
- Permitir la creación de publicaciones (posts).
- Permitir comentar en publicaciones.
- Permitir subir imágenes en los posts.
- Crear un sistema de moderación de contenido.
- Clasificar publicaciones por juegos o categorías.
- Permitir interacción social entre usuarios.
- Garantizar una experiencia amigable tanto para principiantes como jugadores avanzados.

---

## Alcance del sistema

### Funcionalidades principales
- Registro de usuario  
- Inicio de sesión  
- Cierre de sesión  
- Crear publicación (post)  
- Editar publicación  
- Eliminar publicación  
- Ver listado de publicaciones  
- Comentar en publicaciones  
- Subir imágenes a los posts  
- Sistema de categorías (por juego o temática)  
- Sistema de moderación (reportes / eliminación de contenido)  
- Dashboard básico del usuario (sus publicaciones, actividad)  

---

## Tipos de contenido posibles
- Texto (preguntas, guías, opiniones)  
- Imágenes (screenshots, memes, ayudas visuales)  
- Enlaces externos (videos, tutoriales, etc.)  

---

## Modelo de datos

### Entidades principales

### 1. User
Representa al usuario registrado en el sistema.

**Atributos sugeridos:**
- id  
- username  
- email  
- password_hash  
- role (USER / MODERATOR / ADMIN)  
- created_at  
- updated_at  

---

### 2. Post
Representa una publicación dentro del foro.

**Atributos sugeridos:**
- id  
- user_id  
- title  
- content  
- category_id  
- created_at  
- updated_at  
- is_deleted  

---

### 3. Comment
Representa los comentarios dentro de una publicación.

**Atributos sugeridos:**
- id  
- post_id  
- user_id  
- content  
- created_at  
- updated_at  
- is_deleted  

---

### 4. Category
Representa una categoría o juego dentro del foro.

**Atributos sugeridos:**
- id  
- name  
- description  

**Ejemplos:**
- Counter Strike  
- League of Legends  
- Fortnite  
- General  

---

### 5. Image
Representa imágenes subidas por los usuarios.

**Atributos sugeridos:**
- id  
- post_id  
- image_url  
- created_at  

---

### 6. Report
Representa denuncias hechas por usuarios o moderadores.

**Atributos sugeridos:**
- id  
- reported_by (user_id)  
- post_id (opcional)  
- comment_id (opcional)  
- reason  
- created_at  
- status (PENDING / REVIEWED / DELETED)  

---

## Relaciones entre entidades

### Relación conceptual

- Un **User** puede tener muchos **Post**  
- Un **User** puede tener muchos **Comment**  
- Un **Post** puede tener muchos **Comment**  
- Un **Post** pertenece a una **Category**  
- Un **Post** puede tener muchas **Image**  
- Un **Report** puede estar asociado a un **Post** o a un **Comment**  

---

## Diagrama simple de relaciones
User
├── 1:N ── Post
│ ├── 1:N ── Comment
│ └── 1:N ── Image
│
├── 1:N ── Comment
│
└── 1:N ── Report

Category
└── 1:N ── Post

---

## Roles del sistema

### Usuario
- Crear publicaciones  
- Comentar  
- Subir imágenes  
- Reportar contenido  

### Moderador
- Eliminar publicaciones o comentarios  
- Revisar reportes  
- Controlar contenido inapropiado  

### Administrador (opcional)
- Gestionar usuarios  
- Asignar roles  
- Configurar categorías  

---

## Posible implementación

### Tecnologías sugeridas

**Frontend:**
- HTML, CSS, JavaScript  
- React (opcional)

**Backend:**
- Node.js + Express  
- o Python + Django  
- o Java + Spring Boot  

**Base de datos:**
- MySQL / PostgreSQL  

**Almacenamiento de imágenes:**
- Cloudinary / Firebase Storage / servidor propio  

---

## Flujo básico del sistema

1. El usuario se registra o inicia sesión.  
2. Puede navegar por categorías o juegos.  
3. Crea una publicación o responde a otras.  
4. Puede subir imágenes en sus posts.  
5. Otros usuarios interactúan (comentarios).  
6. Moderadores controlan el contenido.  

---

## About
Plataforma web orientada a la comunidad gamer para compartir conocimiento, experiencias y socializar dentro del mundo de los videojuegos.
