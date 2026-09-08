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

export async function getCategories() {
  const response = await fetchWithAuth(`${API_URL}/categories/`);
  if (!response.ok) {
    throw new Error('Error al cargar las categorías');
  }
  const data = await response.json();
  return extractResults(data);
}

export async function createCategory({ name, description = '' }) {
  const response = await fetchWithAuth(`${API_URL}/categories/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.name?.[0] || errorData.detail || 'Error al crear la categoría');
  }
  return await response.json();
}

export async function updateCategory(id, { name, description = '' }) {
  const response = await fetchWithAuth(`${API_URL}/categories/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
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

export async function getPosts({ category, search, user, page } = {}) {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (search) params.append('search', search);
  if (user) params.append('user', user);
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

export async function createPost({ title, content, category_id }) {
  const response = await fetchWithAuth(`${API_URL}/posts/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content, category_id }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let msg = 'Error al crear la publicación';
    if (errorData.title) msg = errorData.title[0];
    else if (errorData.content) msg = errorData.content[0];
    else if (errorData.category_id) msg = 'Categoría inválida';
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
