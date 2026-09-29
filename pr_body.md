Este PR introduce una refactorización profunda en la gestión de juegos y categorías, integrando de forma nativa la API de RAWG tanto en backend como en frontend para optimizar la carga de contenido. Se solucionaron problemas visuales críticos y se centralizó la administración del foro.

#### ✨ Nuevas Funcionalidades y Mejoras
* **Buscador Interactivo de RAWG (Admin):** Se implementó un endpoint de búsqueda en el backend (/api/rawg/search/) conectado a una nueva UI en el Panel de Administrador. Ahora se pueden buscar juegos por nombre en tiempo real y agregarlos al foro con un solo clic.
* **Flujo de Auto-Edición y Vista Previa:** Al importar un juego de RAWG, el panel abre automáticamente el modo de Edición Manual precargando los datos. Se agregó una previsualización dinámica de la portada (URL de imagen) para validar y ajustar la metadata oficial antes de confirmarla.
* **Sincronización Automática (Backend):** Se creó un script de migración (sync_with_rawg.py) que vinculó los juegos legacy del servidor a la base de datos de RAWG, trayendo portadas en HD, descripciones oficiales y asignando géneros automáticos. Se corrigieron los *slugs* antiguos.
* **Buscador Global Actualizado:** Se modificó la vista PostViewSet del backend para que el buscador principal del foro detecte correctamente los posteos asociados al *Nombre del Juego*, unificando la búsqueda.

#### 🐛 Correcciones (Bugfixes) y Limpieza
* **Refactor de AdminDashboard.jsx:** Se reescribió por completo el código corrupto del panel. Ahora el panel cuenta con pestañas limpias e independientes (Géneros, Juegos, Reportes, Usuarios) con todo el ruteo de edición/eliminación funcionando perfecto y sin errores de estilos CSS.
* **Reparación del Sidebar.jsx (UI de Categorías):** Se reparó el bug que rompía la estructura de la lista. Se restablecieron las clases base (.sidebar-games-list, etc.) logrando recuperar el diseño retro de burbujas, colores activos y bordes redondeados.
* **Limpieza del Catálogo de Juegos (GamesCatalog.jsx):** Se eliminaron los botones y lógicas de administrador (CRUD) de la vista de usuarios. El catálogo ahora funciona como una galería de vista pura y *read-only*.

---

### 🚀 Funcionalidades para el siguiente PR (Roadmap)
Para mantener este PR enfocado y limpio, los siguientes objetivos quedarán para la próxima iteración:
- **Refactorización del apartado de Posts:** Rediseñar la vista, interacción y flujos de publicación para que sean más intuitivos.
- **Dinámica Géneros-Juegos:** Construir una relación más interactiva en el frontend (ej: poder filtrar el catálogo de juegos clickeando géneros desde el sidebar, relacionando y cruzando mejor estos dos modelos).