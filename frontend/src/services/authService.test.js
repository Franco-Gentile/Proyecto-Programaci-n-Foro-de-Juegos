import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  login,
  register,
  logout,
  getSession,
  SESSION_KEY,
  TOKEN_KEY,
  REFRESH_TOKEN_KEY
} from './authService';

// Stub de localStorage para test environment
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

describe('login', () => {
  it('hace login correctamente, obtiene datos del usuario y guarda tokens', async () => {
    // Mock login endpoint
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access: 'fake-access', refresh: 'fake-refresh' }),
    });
    // Mock me endpoint
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, username: 'admin', email: 'admin@test.com' }),
    });

    const result = await login('admin', 'admin123');

    expect(result.success).toBe(true);
    expect(result.user).toEqual({
      id: 1,
      username: 'admin',
      email: 'admin@test.com',
    });
    
    expect(localStorage.getItem(TOKEN_KEY)).toBe('fake-access');
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe('fake-refresh');
    expect(getSession()).toEqual(result.user);
  });

  it('devuelve error si las credenciales son incorrectas (401)', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: 'No active account found with the given credentials' }),
    });

    const result = await login('admin', 'wrong');

    expect(result.success).toBe(false);
    expect(result.error).toBe('No active account found with the given credentials');
    expect(getSession()).toBeNull();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it('no guarda tokens si falla la obtención del usuario', async () => {
    // Mock login endpoint
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access: 'fake-access', refresh: 'fake-refresh' }),
    });
    // Mock me endpoint falla
    fetch.mockResolvedValueOnce({
      ok: false,
    });

    const result = await login('admin', 'admin123');

    expect(result.success).toBe(false);
    expect(result.error).toBe('No se pudo obtener la información del usuario');
    expect(getSession()).toBeNull();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });
});

describe('register', () => {
  it('registra correctamente a un nuevo usuario', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}), // El backend suele devolver el user pero no lo usamos
    });

    const result = await register('nuevo', 'nuevo@test.com', 'secreta123');

    expect(result.success).toBe(true);
  });

  it('maneja errores de validación del backend', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ username: ['A user with that username already exists.'] }),
    });

    const result = await register('duplicado', 'test@test.com', '12345678');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Usuario: A user with that username already exists.');
  });
});

describe('logout / sesión', () => {
  it('elimina todas las claves locales de sesión', async () => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ id: 1 }));
    localStorage.setItem(TOKEN_KEY, 'fake');
    localStorage.setItem(REFRESH_TOKEN_KEY, 'fake');

    fetch.mockResolvedValueOnce({ ok: true }); // Mock logout request

    await logout();

    expect(getSession()).toBeNull();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
  });

  it('devuelve null si la sesión guardada está corrupta', () => {
    localStorage.setItem(SESSION_KEY, '{corrupto');

    expect(() => getSession()).not.toThrow();
    expect(getSession()).toBeNull();
    // Además limpia la clave corrupta.
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });
});
