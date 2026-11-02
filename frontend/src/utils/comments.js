/**
 * Ordena una lista de comentarios priorizando:
 * 1. Comentarios fijados (`is_pinned`)
 * 2. Mayor cantidad de Me gusta (`likes_count`)
 * 3. Más recientes (`created_at`)
 */
export function sortCommentsList(list) {
  if (!Array.isArray(list)) return [];
  return [...list].sort((a, b) => {
    if (Boolean(b.is_pinned) !== Boolean(a.is_pinned)) {
      return b.is_pinned ? 1 : -1;
    }
    const likesDiff = (b.likes_count || 0) - (a.likes_count || 0);
    if (likesDiff !== 0) return likesDiff;
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });
}

/**
 * Calcula una etiqueta legible de tiempo relativo a partir de una fecha ISO.
 */
export function getTimeAgo(dateString) {
  if (!dateString) return 'Hace un momento';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Hace un momento';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} hs`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `Hace ${days} d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `Hace ${months} meses`;
  const years = Math.floor(days / 365);
  return `Hace ${years} años`;
}
