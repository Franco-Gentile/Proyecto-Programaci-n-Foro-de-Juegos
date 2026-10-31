import { API_URL, fetchWithAuth } from './authService';

/**
 * Normaliza las respuestas paginadas de DRF (con 'results')
 * o respuestas en forma de array directo.
 */
function extractResults(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}

/* ==========================================================================
   CATEGORÍAS / JUEGOS
   ========================================================================== */

export async function getCategories({ search, page_size = 100 } = {}) {
  const params = new URLSearchParams();
  if (search) {
    params.append('search', search);
  }
  if (page_size) {
    params.append('page_size', page_size);
  }
  const url = `${API_URL}/categories/${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetchWithAuth(url);
  if (!response.ok) {
    throw new Error('Error al cargar las categorías');
  }
  const data = await response.json();
  return extractResults(data);
}

export async function createCategory({ name, description = '', image_url = '' }) {
  const response = await fetchWithAuth(`${API_URL}/categories/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description, image_url }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.name?.[0] || errorData.detail || 'Error al crear la categoría');
  }
  return await response.json();
}

export async function updateCategory(id, { name, description = '', image_url }) {
  const payload = { name, description };
  if (image_url !== undefined) payload.image_url = image_url;

  const response = await fetchWithAuth(`${API_URL}/categories/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.name?.[0] || errorData.detail || 'Error al actualizar la categoría');
  }
  return await response.json();
}

export async function deleteCategory(id) {
  const response = await fetchWithAuth(`${API_URL}/categories/${id}/`, {
    method: 'DELETE',
  });
  if (!response.ok && response.status !== 204) {
    throw new Error('Error al eliminar la categoría');
  }
  return true;
}

/* ==========================================================================
   PUBLICACIONES / POSTS
   ========================================================================== */

export async function getPosts({ category, game, search, user, mentioned, page } = {}) {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (game) params.append('game', game);
  if (search) params.append('search', search);
  if (user) params.append('user', user);
  if (mentioned) params.append('mentioned', mentioned);
  if (page) params.append('page', page);

  const url = `${API_URL}/posts/${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetchWithAuth(url);
  if (!response.ok) {
    throw new Error('Error al cargar las publicaciones');
  }
  const data = await response.json();
  return {
    results: extractResults(data),
    count: data.count || (Array.isArray(data) ? data.length : 0),
    next: data.next || null,
    previous: data.previous || null,
  };
}

export async function getPostById(id) {
  const response = await fetchWithAuth(`${API_URL}/posts/${id}/`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Publicación no encontrada');
    }
    throw new Error('Error al cargar el detalle de la publicación');
  }
  return await response.json();
}

export async function createPost(postData) {
  let options;
  if (postData instanceof FormData) {
    options = {
      method: 'POST',
      body: postData,
    };
  } else {
    const payload = {
      title: postData.title,
      content: postData.content,
    };
    if (postData.category_id) payload.category_id = postData.category_id;
    if (postData.game_id) payload.game_id = postData.game_id;
    if (postData.youtube_url) payload.youtube_url = postData.youtube_url;
    if (postData.media_urls) payload.media_urls = postData.media_urls;

    options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    };
  }

  const response = await fetchWithAuth(`${API_URL}/posts/`, options);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let msg = 'Error al crear la publicación';
    if (errorData.title) msg = errorData.title[0];
    else if (errorData.content) msg = errorData.content[0];
    else if (errorData.category_id) msg = 'Categoría inválida';
    else if (errorData.game_id) msg = 'Juego inválido';
    else if (errorData.non_field_errors) msg = errorData.non_field_errors[0];
    else if (errorData.detail) msg = errorData.detail;
    throw new Error(msg);
  }
  return await response.json();
}

export async function searchUsers(query) {
  if (!query || !query.trim()) return [];
  const response = await fetchWithAuth(`${API_URL}/users/search/?q=${encodeURIComponent(query.trim())}`);
  if (!response.ok) return [];
  return await response.json();
}

export async function getMyProfile() {
  const response = await fetchWithAuth(`${API_URL}/users/me/`);
  if (!response.ok) {
    throw new Error('Error al cargar la información del perfil');
  }
  return await response.json();
}

export async function updateProfile(data) {
  let options;
  if (data instanceof FormData) {
    options = {
      method: 'PATCH',
      body: data,
    };
  } else {
    options = {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
  }
  const response = await fetchWithAuth(`${API_URL}/users/me/`, options);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const msg = errorData.detail || errorData.bio?.[0] || errorData.avatar?.[0] || 'Error al actualizar el perfil';
    throw new Error(msg);
  }
  return await response.json();
}

export async function changePassword({ current_password, new_password }) {
  const response = await fetchWithAuth(`${API_URL}/users/change-password/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ current_password, new_password }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let msg = 'Error al cambiar la contraseña';
    if (errorData.current_password) msg = errorData.current_password[0];
    else if (errorData.new_password) msg = errorData.new_password[0];
    else if (errorData.detail) msg = errorData.detail;
    throw new Error(msg);
  }
  return await response.json();
}


export async function deletePost(id) {
  const response = await fetchWithAuth(`${API_URL}/posts/${id}/`, {
    method: 'DELETE',
  });
  if (!response.ok && response.status !== 200 && response.status !== 204) {
    throw new Error('Error al eliminar la publicación');
  }
  return true;
}

export async function togglePostLike(postId) {
  const response = await fetchWithAuth(`${API_URL}/posts/${postId}/like/`, {
    method: 'POST',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al procesar el Me gusta');
  }
  return await response.json();
}

/* ==========================================================================
   COMENTARIOS
   ========================================================================== */

export async function getComments(postId) {
  const url = postId
    ? `${API_URL}/comments/?post=${postId}`
    : `${API_URL}/comments/`;
  const response = await fetchWithAuth(url);
  if (!response.ok) {
    throw new Error('Error al cargar los comentarios');
  }
  const data = await response.json();
  return extractResults(data);
}

export async function createComment({ post_id, content }) {
  const response = await fetchWithAuth(`${API_URL}/comments/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ post_id, content }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let msg = 'Error al enviar el comentario';
    if (errorData.content) msg = errorData.content[0];
    else if (errorData.detail) msg = errorData.detail;
    throw new Error(msg);
  }
  return await response.json();
}

export async function deleteComment(id) {
  const response = await fetchWithAuth(`${API_URL}/comments/${id}/`, {
    method: 'DELETE',
  });
  if (!response.ok && response.status !== 200 && response.status !== 204) {
    throw new Error('Error al eliminar el comentario');
  }
  return true;
}

export async function toggleCommentLike(commentId) {
  const response = await fetchWithAuth(`${API_URL}/comments/${commentId}/like/`, {
    method: 'POST',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al procesar el Me gusta en el comentario');
  }
  return await response.json();
}

export async function toggleCommentPin(commentId) {
  const response = await fetchWithAuth(`${API_URL}/comments/${commentId}/pin/`, {
    method: 'POST',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al fijar o desfijar el comentario');
  }
  return await response.json();
}

/* ==========================================================================
   REPORTES / MODERACIÓN
   ========================================================================== */

export async function getReports() {
  const response = await fetchWithAuth(`${API_URL}/reports/`);
  if (!response.ok) {
    throw new Error('Error al cargar los reportes de moderación');
  }
  const data = await response.json();
  return extractResults(data);
}

export async function createReport({ post_id = null, comment_id = null, reason }) {
  const payload = { reason };
  if (post_id) payload.post_id = post_id;
  if (comment_id) payload.comment_id = comment_id;

  const response = await fetchWithAuth(`${API_URL}/reports/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let msg = 'Error al enviar el reporte';
    if (errorData.reason) msg = errorData.reason[0];
    else if (errorData.non_field_errors) msg = errorData.non_field_errors[0];
    else if (errorData.detail) msg = errorData.detail;
    throw new Error(msg);
  }
  return await response.json();
}

export async function updateReportStatus(id, status) {
  const response = await fetchWithAuth(`${API_URL}/reports/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    throw new Error('Error al actualizar el estado del reporte');
  }
  return await response.json();
}

/* ==========================================================================
   USUARIOS
   ========================================================================== */

export async function getUsers() {
  const response = await fetchWithAuth(`${API_URL}/users/`);
  if (!response.ok) {
    throw new Error('Error al cargar los usuarios');
  }
  const data = await response.json();
  return extractResults(data);
}

/* ==========================================================================
   GAMES & RAWG
   ========================================================================== */

export async function getGames({ search, page_size = 100 } = {}) {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (page_size) params.append('page_size', page_size);

  const url = `${API_URL}/games/${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetchWithAuth(url);
  if (!response.ok) {
    throw new Error('Error al cargar los juegos');
  }
  const data = await response.json();
  return extractResults(data);
}

export async function searchRawg(query) {
  const response = await fetchWithAuth(`${API_URL}/rawg/search/?q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error('Error al buscar en RAWG');
  const data = await response.json();
  return data.results || [];
}

export async function importRawgGame(slug) {
  const response = await fetchWithAuth(`${API_URL}/rawg/import/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al importar de RAWG');
  }
  return await response.json();
}

export async function deleteGame(id) {
  const response = await fetchWithAuth(`${API_URL}/games/${id}/`, {
    method: 'DELETE',
  });
  if (!response.ok && response.status !== 204) {
    throw new Error('Error al eliminar el juego');
  }
  return true;
}

export async function updateGame(id, { name, description = '', image_url }) {
  const payload = { name, description };
  if (image_url !== undefined) payload.image_url = image_url;
  const response = await fetchWithAuth(`${API_URL}/games/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Error al actualizar el juego');
  return await response.json();
}
