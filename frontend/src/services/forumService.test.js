import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getCategories,
  createCategory,
  deleteCategory,
  getPosts,
  getPostById,
  createPost,
  deletePost,
  getComments,
  createComment,
  deleteComment,
  createReport,
  updateReportStatus,
  getUsers,
} from './forumService';

// Mock localStorage
class MemoryStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
}

beforeEach(() => {
  globalThis.localStorage = new MemoryStorage();
  globalThis.fetch = vi.fn();
});

describe('forumService - Categories', () => {
  it('obtiene lista de categorías correctamente', async () => {
    const mockCats = [{ id: 1, name: 'RPG' }, { id: 2, name: 'FPS' }];
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: mockCats }),
    });

    const result = await getCategories();
    expect(result).toEqual(mockCats);
  });

  it('crea una nueva categoría', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 3, name: 'Indie', description: 'Juegos indie' }),
    });

    const result = await createCategory({ name: 'Indie', description: 'Juegos indie' });
    expect(result.name).toBe('Indie');
  });

  it('elimina una categoría', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    const result = await deleteCategory(1);
    expect(result).toBe(true);
  });
});

describe('forumService - Posts', () => {
  it('obtiene posts con paginación y filtros', async () => {
    const mockPosts = [{ id: 1, title: 'Zelda' }];
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: mockPosts, count: 1 }),
    });

    const result = await getPosts({ category: 1, search: 'Zelda' });
    expect(result.results).toEqual(mockPosts);
    expect(result.count).toBe(1);
  });

  it('obtiene un post por id', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 5, title: 'Sekiro Review' }),
    });

    const result = await getPostById(5);
    expect(result.id).toBe(5);
    expect(result.title).toBe('Sekiro Review');
  });

  it('crea un nuevo post', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 10, title: 'Nuevo Post', content: 'Info', category: 1 }),
    });

    const result = await createPost({ title: 'Nuevo Post', content: 'Info', category_id: 1 });
    expect(result.id).toBe(10);
  });

  it('elimina un post (soft delete)', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
    });

    const result = await deletePost(10);
    expect(result).toBe(true);
  });
});

describe('forumService - Comments', () => {
  it('obtiene comentarios para un post', async () => {
    const mockComments = [{ id: 1, content: 'Buenísimo', post: 5 }];
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: mockComments }),
    });

    const result = await getComments(5);
    expect(result).toEqual(mockComments);
  });

  it('crea un comentario en un post', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 2, content: 'Comentario nuevo', post: 5 }),
    });

    const result = await createComment({ post_id: 5, content: 'Comentario nuevo' });
    expect(result.id).toBe(2);
  });

  it('elimina un comentario', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    const result = await deleteComment(2);
    expect(result).toBe(true);
  });
});

describe('forumService - Reports & Users', () => {
  it('crea un reporte sobre un post', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, reason: 'Spam', status: 'PENDING' }),
    });

    const result = await createReport({ post_id: 5, reason: 'Spam' });
    expect(result.status).toBe('PENDING');
  });

  it('actualiza el estado de un reporte', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, status: 'REVIEWED' }),
    });

    const result = await updateReportStatus(1, 'REVIEWED');
    expect(result.status).toBe('REVIEWED');
  });

  it('obtiene usuarios registrados', async () => {
    const mockUsers = [{ id: 1, username: 'admin', role: 'ADMIN' }];
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: mockUsers }),
    });

    const result = await getUsers();
    expect(result).toEqual(mockUsers);
  });
});
